export interface CalculatorInputs {
  currentAge: number; // integer years (e.g., 25)
  currentAgeMonths: number; // additional months (0-11)
  currentSavings: number;
  retirementAge: number;
  lifeExpectancy: number;
  livingExpensePerMonth: number;
  roiRate: number; // annual ROI rate as percentage (e.g., 4 for 4%)
  incomePerMonthAfterRetirement: number;
  livingExpensePerMonthAfterRetirement: number;
}

export interface YearlyWealth {
  age: number;
  wealth: number;
}

export interface CalculationResults {
  totalEarningsNeeded: number;
  yearlyEarningsNeeded: number;
  monthlyEarningsNeeded: number;
  wealthChart: YearlyWealth[];
  isAchievable: boolean;
  message?: string;
}

/** small epsilon for floating comparisons */
const EPS = 1e-12;

/** Calculate the exact current age in decimal years */
function getExactAge(years: number, months: number): number {
  return years + months / 12;
}

/** Calculate future value with compound interest */
function futureValue(presentValue: number, rate: number, periods: number): number {
  return presentValue * Math.pow(1 + rate, periods);
}

/** Calculate present value */
function presentValue(futureValue: number, rate: number, periods: number): number {
  return futureValue / Math.pow(1 + rate, periods);
}

/** Present value of an annuity-immediate (payments at end of each period) */
function presentValueAnnuity(payment: number, rate: number, periods: number): number {
  if (periods <= 0) return 0;
  if (Math.abs(rate) < EPS) return payment * periods;
  return (payment * (1 - Math.pow(1 + rate, -periods))) / rate;
}

/** Future value of an annuity-immediate (payments at end of each period) */
function futureValueAnnuity(payment: number, rate: number, periods: number): number {
  if (periods <= 0) return 0;
  if (Math.abs(rate) < EPS) return payment * periods;
  return (payment * (Math.pow(1 + rate, periods) - 1)) / rate;
}

/**
 * Main calculation function (corrected)
 */
export function calculateDieWithZero(inputs: CalculatorInputs): CalculationResults {
  const {
    currentAge,
    currentAgeMonths,
    currentSavings,
    retirementAge,
    lifeExpectancy,
    livingExpensePerMonth,
    roiRate,
    incomePerMonthAfterRetirement,
    livingExpensePerMonthAfterRetirement,
  } = inputs;

  // exact age in years (decimal)
  const exactCurrentAge = getExactAge(currentAge, currentAgeMonths);

  // convert annual roi percent into decimal
  const annualRate = roiRate / 100;

  // use *effective* monthly rate consistent with compounding:
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  // months until retirement and months in retirement
  const monthsUntilRetirement = Math.max(0, Math.round((retirementAge - exactCurrentAge) * 12));
  const monthsInRetirement = Math.max(0, Math.round((lifeExpectancy - retirementAge) * 12));

  // net monthly withdrawal during retirement (what must be funded each month)
  const netMonthlyRetirement = livingExpensePerMonthAfterRetirement - incomePerMonthAfterRetirement;

  // required wealth at retirement (PV at retirement of the retirement withdrawals)
  const wealthNeededAtRetirement = presentValueAnnuity(netMonthlyRetirement, monthlyRate, monthsInRetirement);

  // future value of current savings at retirement
  const futureValueOfSavings = futureValue(currentSavings, monthlyRate, monthsUntilRetirement);

  // additional wealth needed from earnings/savings before retirement
  const additionalWealthNeeded = Math.max(0, wealthNeededAtRetirement - futureValueOfSavings);

  // special-cases:
  if (additionalWealthNeeded <= 0) {
    // already sufficient
    const wealthChart = generateWealthChart(inputs, 0, exactCurrentAge);
    return {
      totalEarningsNeeded: 0,
      yearlyEarningsNeeded: 0,
      monthlyEarningsNeeded: 0,
      wealthChart,
      isAchievable: true,
      message: "You already have enough savings to fund retirement and die with (approximately) zero.",
    };
  }

  // if no months to save (already at/after retirement), user needs a lump sum now
  if (monthsUntilRetirement === 0) {
    const wealthChart = generateWealthChart(inputs, 0, exactCurrentAge); // show path without extra saving
    return {
      totalEarningsNeeded: additionalWealthNeeded,
      yearlyEarningsNeeded: additionalWealthNeeded, // one-time lump shown as yearly for convenience
      monthlyEarningsNeeded: Number.POSITIVE_INFINITY,
      wealthChart,
      isAchievable: false,
      message:
        `You are at (or past) retirement: you need an immediate lump sum of ${additionalWealthNeeded.toFixed(
          2
        )} to fund the plan. Monthly-savings plan is not possible because there are 0 months until retirement.`,
    };
  }

  // compute monthly savings needed to reach 'additionalWealthNeeded' by retirement:
  let monthlySavingsNeeded: number;
  if (Math.abs(monthlyRate) < EPS) {
    monthlySavingsNeeded = additionalWealthNeeded / monthsUntilRetirement;
  } else {
    const denom = Math.pow(1 + monthlyRate, monthsUntilRetirement) - 1;
    monthlySavingsNeeded = (additionalWealthNeeded * monthlyRate) / denom;
  }

  // monthly gross income needed = living expense + monthly savings (savings is net of expense)
  const monthlyEarningsNeeded = livingExpensePerMonth + monthlySavingsNeeded;
  const yearlyEarningsNeeded = monthlyEarningsNeeded * 12;
  const totalEarningsNeeded = monthlyEarningsNeeded * monthsUntilRetirement;

  // create wealth chart by simulating month-by-month (then sample yearly)
  const wealthChart = generateWealthChart(inputs, monthlySavingsNeeded, exactCurrentAge);

  // sanity / achievability check: if monthlyEarningsNeeded is NaN or Infinity -> not achievable
  const isFiniteIncome = Number.isFinite(monthlyEarningsNeeded) && monthlyEarningsNeeded > 0 && monthlyEarningsNeeded < 1e12;

  return {
    totalEarningsNeeded,
    yearlyEarningsNeeded,
    monthlyEarningsNeeded,
    wealthChart,
    isAchievable: isFiniteIncome,
    message: isFiniteIncome ? undefined : "Required monthly income is unrealistic.",
  };
}

/**
 * Generate yearly wealth projection using exact monthly simulation and then
 * extract balances nearest to integer ages.
 */
function generateWealthChart(
  inputs: CalculatorInputs,
  monthlySavingsNeeded: number,
  exactCurrentAge: number
): YearlyWealth[] {
  const {
    currentSavings,
    retirementAge,
    lifeExpectancy,
    roiRate,
    incomePerMonthAfterRetirement,
    livingExpensePerMonthAfterRetirement,
  } = inputs;

  const annualRate = roiRate / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  const netMonthlyRetirement = livingExpensePerMonthAfterRetirement - incomePerMonthAfterRetirement;

  // total months from exactCurrentAge until death
  const totalMonths = Math.max(0, Math.round((lifeExpectancy - exactCurrentAge) * 12));

  // simulate month-by-month
  const balances: number[] = new Array(totalMonths + 1);
  let balance = currentSavings;
  for (let t = 0; t <= totalMonths; t++) {
    balances[t] = balance;
    // determine cashflow next month (if still pre-retirement): monthlySavingsNeeded is the net deposit after monthly living expense
    const currentAge = exactCurrentAge + t / 12;
    const isRetired = currentAge + 1e-9 >= retirementAge;
    const cashflow = isRetired ? -netMonthlyRetirement : monthlySavingsNeeded;
    // move to next month
    balance = balance * (1 + monthlyRate) + cashflow;
  }

  // produce yearly snapshot array for integer ages from floor(exactCurrentAge) .. floor(lifeExpectancy)
  const startYear = Math.floor(exactCurrentAge);
  const endYear = Math.floor(lifeExpectancy);
  const result: YearlyWealth[] = [];

  for (let year = startYear; year <= endYear; year++) {
    // target age = year (exact integer). find the month index with age closest to that integer
    const monthsFromStart = Math.round((year - exactCurrentAge) * 12);
    const idx = Math.max(0, Math.min(totalMonths, monthsFromStart));
    // clamp negative and >totalMonths
    result.push({
      age: year,
      wealth: Math.max(0, balances[idx]), // avoid negative values in the chart
    });
  }

  return result;
}
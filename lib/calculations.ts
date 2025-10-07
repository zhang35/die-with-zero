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

function getExactAge(years: number, months: number): number {
  return years + months / 12;
}

function futureValue(presentValue: number, rate: number, periods: number): number {
  return presentValue * Math.pow(1 + rate, periods);
}

function presentValueAnnuity(payment: number, rate: number, periods: number): number {
  if (periods <= 0) return 0;
  if (Math.abs(rate) < EPS) return payment * periods;
  return (payment * (1 - Math.pow(1 + rate, -periods))) / rate;
}

export function calculateDieWithZero(inputs: CalculatorInputs): CalculationResults {
  const {
    currentAge, currentAgeMonths, currentSavings, retirementAge, lifeExpectancy,
    livingExpensePerMonth, roiRate, incomePerMonthAfterRetirement,
    livingExpensePerMonthAfterRetirement
  } = inputs;

  const exactCurrentAge = getExactAge(currentAge, currentAgeMonths);
  const annualRate = roiRate / 100;
  // use effective monthly rate
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  const monthsUntilRetirement = Math.max(0, Math.round((retirementAge - exactCurrentAge) * 12));
  const monthsInRetirement = Math.max(0, Math.round((lifeExpectancy - retirementAge) * 12));

  const netMonthlyRetirement = livingExpensePerMonthAfterRetirement - incomePerMonthAfterRetirement;

  // required wealth at retirement (PV at retirement of retirement withdrawals)
  const wealthNeededAtRetirement = presentValueAnnuity(netMonthlyRetirement, monthlyRate, monthsInRetirement);

  // future value of current savings at retirement
  const futureValueOfSavings = futureValue(currentSavings, monthlyRate, monthsUntilRetirement);

  // DO NOT clamp this to 0 — it can be negative (surplus)
  const additionalWealthNeeded = wealthNeededAtRetirement - futureValueOfSavings;

  // Edge-case: no months to save: immediate lump sum needed (or immediate surplus)
  if (monthsUntilRetirement === 0) {
    if (Math.abs(additionalWealthNeeded) < EPS) {
      // exactly matched
      const chart = generateWealthChart(inputs, 0, exactCurrentAge);
      return {
        totalEarningsNeeded: 0,
        yearlyEarningsNeeded: 0,
        monthlyEarningsNeeded: 0,
        wealthChart: chart,
        isAchievable: true,
        message: "You are at retirement now and your current savings exactly match the plan."
      };
    } else {
      // Need an immediate lump-sum (positive -> need money; negative -> have surplus to spend now)
      const chart = generateWealthChart(inputs, 0, exactCurrentAge);
      return {
        totalEarningsNeeded: additionalWealthNeeded > 0 ? additionalWealthNeeded : 0,
        yearlyEarningsNeeded: additionalWealthNeeded > 0 ? additionalWealthNeeded : 0,
        monthlyEarningsNeeded: additionalWealthNeeded > 0 ? Number.POSITIVE_INFINITY : 0,
        wealthChart: chart,
        isAchievable: false,
        message: additionalWealthNeeded > 0
          ? `You need an immediate lump sum of ${additionalWealthNeeded.toFixed(2)} to fund the plan.`
          : `You currently have a surplus of ${(-additionalWealthNeeded).toFixed(2)} available to spend/gift immediately.`
      };
    }
  }

  // Solve for monthly savings needed (I_b - E_b). This can be negative (dissaving).
  let monthlySavingsNeeded: number;
  if (Math.abs(monthlyRate) < EPS) {
    // zero interest case
    monthlySavingsNeeded = additionalWealthNeeded / monthsUntilRetirement;
  } else {
    const denom = Math.pow(1 + monthlyRate, monthsUntilRetirement) - 1;
    monthlySavingsNeeded = (additionalWealthNeeded * monthlyRate) / denom;
  }

  // monthly gross earnings required = living expense + monthlySavingsNeeded (savings can be negative)
  const monthlyEarningsNeeded = livingExpensePerMonth + monthlySavingsNeeded;
  const yearlyEarningsNeeded = monthlyEarningsNeeded * 12;
  const totalEarningsNeeded = monthlyEarningsNeeded * monthsUntilRetirement;

  // build chart (month-by-month simulation inside function)
  const wealthChart = generateWealthChart(inputs, monthlySavingsNeeded, exactCurrentAge);

  const isFiniteIncome =
    Number.isFinite(monthlyEarningsNeeded) && monthlyEarningsNeeded > -1e9 && monthlyEarningsNeeded < 1e12;

  return {
    totalEarningsNeeded,
    yearlyEarningsNeeded,
    monthlyEarningsNeeded,
    wealthChart,
    isAchievable: isFiniteIncome,
    message: isFiniteIncome ? undefined : "Required monthly income is not finite/realistic."
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
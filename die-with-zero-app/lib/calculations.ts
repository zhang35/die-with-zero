export interface CalculatorInputs {
  currentAge: number; // in years
  currentAgeMonths: number; // additional months (0-11)
  currentSavings: number;
  retirementAge: number;
  lifeExpectancy: number;
  livingExpensePerMonth: number;
  roiRate: number; // annual ROI rate as percentage
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

/**
 * Calculate the exact current age in decimal years
 */
function getExactAge(years: number, months: number): number {
  return years + months / 12;
}

/**
 * Calculate future value with compound interest
 */
function futureValue(
  presentValue: number,
  rate: number,
  periods: number
): number {
  return presentValue * Math.pow(1 + rate, periods);
}

/**
 * Calculate present value
 */
function presentValue(
  futureValue: number,
  rate: number,
  periods: number
): number {
  return futureValue / Math.pow(1 + rate, periods);
}

/**
 * Calculate the present value of an annuity (series of equal payments)
 */
function presentValueAnnuity(
  payment: number,
  rate: number,
  periods: number
): number {
  if (rate === 0) return payment * periods;
  return (payment * (1 - Math.pow(1 + rate, -periods))) / rate;
}

/**
 * Calculate future value of an annuity
 */
function futureValueAnnuity(
  payment: number,
  rate: number,
  periods: number
): number {
  if (rate === 0) return payment * periods;
  return (payment * (Math.pow(1 + rate, periods) - 1)) / rate;
}

/**
 * Main calculation function
 */
export function calculateDieWithZero(
  inputs: CalculatorInputs
): CalculationResults {
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

  // Convert to exact decimal age
  const exactCurrentAge = getExactAge(currentAge, currentAgeMonths);

  // Annual and monthly ROI rates
  const annualRate = roiRate / 100;
  const monthlyRate = annualRate / 12;

  // Years and months until retirement
  const yearsUntilRetirement = retirementAge - exactCurrentAge;
  const monthsUntilRetirement = Math.round(yearsUntilRetirement * 12);

  // Years and months in retirement
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const monthsInRetirement = Math.round(yearsInRetirement * 12);

  // Calculate net monthly expense during retirement (expense - income)
  const netMonthlyExpenseRetirement =
    livingExpensePerMonthAfterRetirement - incomePerMonthAfterRetirement;

  // Calculate required wealth at retirement
  // This is the present value of all retirement expenses at retirement age
  const wealthNeededAtRetirement = presentValueAnnuity(
    netMonthlyExpenseRetirement,
    monthlyRate,
    monthsInRetirement
  );

  // Calculate future value of current savings at retirement
  const futureValueOfSavings = futureValue(
    currentSavings,
    monthlyRate,
    monthsUntilRetirement
  );

  // Calculate additional wealth needed from earnings
  const additionalWealthNeeded =
    wealthNeededAtRetirement - futureValueOfSavings;

  // If additional wealth is negative or zero, person already has enough
  if (additionalWealthNeeded <= 0) {
    const wealthChart = generateWealthChart(
      inputs,
      0, // no additional monthly savings needed
      exactCurrentAge
    );

    return {
      totalEarningsNeeded: 0,
      yearlyEarningsNeeded: 0,
      monthlyEarningsNeeded: 0,
      wealthChart,
      isAchievable: true,
      message:
        "You already have enough savings! You don't need to earn any additional money.",
    };
  }

  // Calculate monthly savings needed (after living expenses)
  // This is the payment needed for an annuity that grows to additionalWealthNeeded
  const monthlySavingsNeeded =
    (additionalWealthNeeded * monthlyRate) /
    (Math.pow(1 + monthlyRate, monthsUntilRetirement) - 1);

  // Total monthly earnings needed = living expenses + savings
  const monthlyEarningsNeeded = livingExpensePerMonth + monthlySavingsNeeded;

  // Calculate yearly and total earnings
  const yearlyEarningsNeeded = monthlyEarningsNeeded * 12;
  const totalEarningsNeeded = monthlyEarningsNeeded * monthsUntilRetirement;

  // Generate wealth chart
  const wealthChart = generateWealthChart(
    inputs,
    monthlySavingsNeeded,
    exactCurrentAge
  );

  return {
    totalEarningsNeeded,
    yearlyEarningsNeeded,
    monthlyEarningsNeeded,
    wealthChart,
    isAchievable: true,
  };
}

/**
 * Generate yearly wealth projection chart
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

  const monthlyRate = roiRate / 100 / 12;
  const netMonthlyExpenseRetirement =
    livingExpensePerMonthAfterRetirement - incomePerMonthAfterRetirement;

  const chart: YearlyWealth[] = [];
  let wealth = currentSavings;

  // Start from current age (rounded down to nearest year)
  const startAge = Math.floor(exactCurrentAge);

  // Add current year
  chart.push({ age: startAge, wealth });

  // Accumulation phase (until retirement)
  for (let age = startAge + 1; age <= retirementAge; age++) {
    // Calculate months in this year
    let monthsInYear = 12;
    if (age === Math.ceil(exactCurrentAge) && exactCurrentAge % 1 !== 0) {
      // First partial year
      monthsInYear = Math.ceil((1 - (exactCurrentAge % 1)) * 12);
    }

    // Accumulate wealth with monthly savings and compound interest
    for (let month = 0; month < monthsInYear; month++) {
      wealth = wealth * (1 + monthlyRate) + monthlySavingsNeeded;
    }

    chart.push({ age, wealth });
  }

  // Decumulation phase (retirement to death)
  for (let age = retirementAge + 1; age <= lifeExpectancy; age++) {
    // Withdraw monthly expenses and apply growth
    for (let month = 0; month < 12; month++) {
      wealth = wealth * (1 + monthlyRate) - netMonthlyExpenseRetirement;
    }

    chart.push({ age, wealth: Math.max(0, wealth) });
  }

  return chart;
}

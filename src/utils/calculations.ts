export interface SpendCurvePoint {
  age: number;
  spend: number;
  netWorth: number;
}

export function calculateSpendCurve(
  currentAge: number,
  lifeExpectancy: number,
  annualSpend: number,
  netWorth: number,
  investmentReturn: number,
  inflation: number,
  retirementAge: number,
  postRetirementBenefits: number,
  annualIncome: number
): SpendCurvePoint[] {
  const curve: SpendCurvePoint[] = [];
  const remainingYears = lifeExpectancy - currentAge;
  const realReturn = (1 + investmentReturn) / (1 + inflation) - 1;

  // Calculate the optimal annual spend that will deplete the net worth at life expectancy
  const numerator = netWorth * (1 + realReturn);
  const denominator =
    (1 - Math.pow((1 + inflation) / (1 + realReturn), remainingYears)) /
    (1 - (1 + inflation) / (1 + realReturn));
  const optimalAnnualSpend = numerator / denominator;

  // Use the minimum of the user's desired annual spend and the optimal spend
  const adjustedAnnualSpend = Math.min(annualSpend, optimalAnnualSpend);

  let currentNetWorth = netWorth;

  for (let age = currentAge; age <= lifeExpectancy; age++) {
    // Calculate spend for this year with inflation
    let spend = adjustedAnnualSpend * Math.pow(1 + inflation, age - currentAge);

    // Add post-retirement benefits if retired
    if (age >= retirementAge) {
      spend -=
        postRetirementBenefits * Math.pow(1 + inflation, age - retirementAge);
    }

    // Update net worth
    let incomeContribution = 0;
    if (age < retirementAge) {
      // Add income contribution before retirement
      incomeContribution =
        annualIncome * Math.pow(1 + inflation, age - currentAge);
    }

    currentNetWorth =
      (currentNetWorth - spend + incomeContribution) * (1 + realReturn);

    curve.push({
      age,
      spend: Math.round(spend),
      netWorth: Math.max(0, Math.round(currentNetWorth)), // Ensure net worth never goes negative
    });
  }

  return curve;
}

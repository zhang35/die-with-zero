# Die With Zero Calculator

A modern web application that calculates how much money you need to earn to "die with zero" - meaning you spend all your money when you die.

## Philosophy

Don't waste your life overearning money that you don't actually need. Give money to your children when you're alive, so they don't have to wait for you to die.

## Features

- **Comprehensive Input Form**: Enter your current financial situation including age, savings, retirement plans, and expenses
- **Smart Calculations**: Uses compound interest formulas to project your wealth trajectory
- **Visual Wealth Chart**: See how your wealth grows during working years and depletes during retirement
- **Precise Results**: Shows exactly how much you need to earn monthly, yearly, and in total before retirement

## Input Fields

- **Current Age**: Years and months
- **Current Savings**: Your total savings in dollars
- **Retirement Age**: When you plan to retire
- **Life Expectancy**: Expected age at death
- **Living Expense Per Month**: Current monthly expenses
- **Annual ROI Rate**: Expected return on investment (%)
- **Income After Retirement**: Monthly income during retirement (pension, social security, etc.)
- **Living Expense After Retirement**: Monthly expenses during retirement

## Output

The calculator provides:
- **Total Earnings Needed**: Total amount to earn before retirement
- **Yearly Earnings Needed**: Annual earning requirement
- **Monthly Earnings Needed**: Monthly earning requirement (includes living expenses + savings)
- **Wealth Projection Chart**: Visual representation of your wealth from now until death, showing it reaching zero at life expectancy

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, utility-first CSS framework
- **Custom SVG Charts**: Beautiful, responsive wealth visualization

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

The calculator uses financial formulas to:

1. Calculate the present value of your retirement expenses
2. Project the future value of your current savings
3. Determine the additional wealth needed from earnings
4. Compute monthly savings required to reach your goal
5. Generate a year-by-year wealth projection showing accumulation and decumulation phases

The wealth projection shows:
- **Accumulation Phase**: Your wealth grows as you save and invest
- **Decumulation Phase**: Your wealth decreases as you spend during retirement
- **Zero Point**: Wealth reaches $0 at your life expectancy

## Example Scenario

Default inputs show a 25.5-year-old with $100,000 in savings who:
- Plans to retire at 50
- Expects to live until 80
- Spends $3,000/month currently and in retirement
- Expects 4% annual ROI
- Will receive $500/month income after retirement

The calculator determines exactly how much to earn monthly to achieve "die with zero" by age 80.

## License

MIT

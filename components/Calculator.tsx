"use client";

import { useState } from "react";
import {
  calculateDieWithZero,
  CalculatorInputs,
  CalculationResults,
} from "@/lib/calculations";
import WealthChart from "./WealthChart";

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentAge: 25,
    currentAgeMonths: 6,
    currentSavings: 100000,
    retirementAge: 50,
    lifeExpectancy: 80,
    livingExpensePerMonth: 3000,
    roiRate: 4,
    incomePerMonthAfterRetirement: 500,
    livingExpensePerMonthAfterRetirement: 3000,
  });

  const [results, setResults] = useState<CalculationResults | null>(null);

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleCalculate = () => {
    const calculationResults = calculateDieWithZero(inputs);
    setResults(calculationResults);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Die With Zero Calculator
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Calculate how much you need to earn to spend all your money by the
            time you die. Don't waste your life overearning money you don't
            actually need.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              Your Information
            </h2>

            <div className="space-y-6">
              {/* Current Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Current Age (Years)
                  </label>
                  <input
                    type="number"
                    value={inputs.currentAge}
                    onChange={(e) =>
                      handleInputChange("currentAge", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Months (0-11)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={inputs.currentAgeMonths}
                    onChange={(e) =>
                      handleInputChange("currentAgeMonths", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Current Savings */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Current Savings ($)
                </label>
                <input
                  type="number"
                  value={inputs.currentSavings}
                  onChange={(e) =>
                    handleInputChange("currentSavings", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Retirement Age */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Retirement Age
                </label>
                <input
                  type="number"
                  value={inputs.retirementAge}
                  onChange={(e) =>
                    handleInputChange("retirementAge", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Life Expectancy */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Life Expectancy
                </label>
                <input
                  type="number"
                  value={inputs.lifeExpectancy}
                  onChange={(e) =>
                    handleInputChange("lifeExpectancy", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Living Expense Per Month */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Living Expense Per Month ($)
                </label>
                <input
                  type="number"
                  value={inputs.livingExpensePerMonth}
                  onChange={(e) =>
                    handleInputChange("livingExpensePerMonth", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ROI Rate */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Annual ROI Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.roiRate}
                  onChange={(e) => handleInputChange("roiRate", e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Income After Retirement */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Income Per Month After Retirement ($)
                </label>
                <input
                  type="number"
                  value={inputs.incomePerMonthAfterRetirement}
                  onChange={(e) =>
                    handleInputChange(
                      "incomePerMonthAfterRetirement",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Living Expense After Retirement */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Living Expense Per Month After Retirement ($)
                </label>
                <input
                  type="number"
                  value={inputs.livingExpensePerMonthAfterRetirement}
                  onChange={(e) =>
                    handleInputChange(
                      "livingExpensePerMonthAfterRetirement",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-8">
            {results && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6">
                  {results.message ? (
                    <div className="bg-green-500/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-green-500/30">
                      <p className="text-2xl font-bold text-green-300 text-center">
                        {results.message}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
                        <h3 className="text-sm font-medium text-slate-300 mb-2">
                          Total Earnings Needed
                        </h3>
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(results.totalEarningsNeeded)}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
                        <h3 className="text-sm font-medium text-slate-300 mb-2">
                          Yearly Earnings Needed
                        </h3>
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(results.yearlyEarningsNeeded)}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
                        <h3 className="text-sm font-medium text-slate-300 mb-2">
                          Monthly Earnings Needed
                        </h3>
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(results.monthlyEarningsNeeded)}
                        </p>
                        <p className="text-sm text-slate-400 mt-2">
                          Includes living expenses +{" "}
                          {formatCurrency(
                            results.monthlyEarningsNeeded -
                              inputs.livingExpensePerMonth
                          )}{" "}
                          savings
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Wealth Chart */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Wealth Projection Over Time
                  </h3>
                  <WealthChart data={results.wealthChart} />
                </div>
              </>
            )}

            {!results && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20 flex items-center justify-center">
                <p className="text-xl text-slate-300 text-center">
                  Enter your information and click Calculate to see your
                  personalized plan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

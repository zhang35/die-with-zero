"use client";

import { useState, useEffect } from "react";
import {
  calculateDieWithZero,
  CalculatorInputs,
  CalculationResults,
} from "@/lib/calculations";
import WealthChart from "./WealthChart";

// Translation type
type Language = "zh" | "en";

interface Translations {
  title: string;
  subtitle: string;
  titleTooltip: string;
  learnMore: string;
  yourInfo: string;
  currency: string;
  currentAgeYears: string;
  currentAgeMonths: string;
  currentSavings: string;
  currentSavingsTooltip: string;
  retirementAge: string;
  retirementAgeTooltip: string;
  lifeExpectancy: string;
  lifeExpectancyTooltip: string;
  livingExpensePerMonth: string;
  annualROI: string;
  annualROITooltip: string;
  incomeAfterRetirement: string;
  incomeAfterRetirementTooltip: string;
  livingExpenseAfterRetirement: string;
  totalEarningsNeeded: string;
  totalEarningsNeededTooltip: string;
  yearlyEarningsNeeded: string;
  monthlyEarningsNeeded: string;
  includesLivingExpenses: string;
  savings: string;
  wealthProjection: string;
  working: string;
  retirement: string;
  projectedWealth: string;
}

const translations: Record<Language, Translations> = {
  zh: {
    title: "生前花光计算器",
    subtitle: "合理规划财富，避免过度积累，计算你真正需要赚多少钱",
    titleTooltip: "基于「Die With Zero」理念，计算到预期寿命时刚好花完所有钱所需的收入。最大化人生体验，而非死后遗产。",
    learnMore: "了解更多关于 Die With Zero",
    yourInfo: "个人信息",
    currency: "货币",
    currentAgeYears: "当前年龄（岁）",
    currentAgeMonths: "月份（0-11）",
    currentSavings: "当前储蓄",
    currentSavingsTooltip: "目前用于退休的储蓄总额",
    retirementAge: "退休年龄",
    retirementAgeTooltip: "计划停止工作并开始使用储蓄的年龄",
    lifeExpectancy: "预期寿命",
    lifeExpectancyTooltip: "预计能活到的年龄。计算器将确保在此年龄前刚好花完所有钱。",
    livingExpensePerMonth: "每月生活费",
    annualROI: "年化收益率（%）",
    annualROITooltip: "储蓄的预期年化投资回报率（考虑复利效应）",
    incomeAfterRetirement: "退休后每月收入",
    incomeAfterRetirementTooltip: "退休后的被动收入（如养老金、社保、房租等）",
    livingExpenseAfterRetirement: "退休后每月生活费",
    totalEarningsNeeded: "所需总收入",
    totalEarningsNeededTooltip: "从现在到退休，需要赚取的总金额",
    yearlyEarningsNeeded: "所需年收入",
    monthlyEarningsNeeded: "所需月收入",
    includesLivingExpenses: "包含生活费 +",
    savings: "储蓄",
    wealthProjection: "财富走势图",
    working: "工作期",
    retirement: "退休期",
    projectedWealth: "财富预测",
  },
  en: {
    title: "Die With Zero Calculator",
    subtitle: "Don't waste your life overearning money you don't actually need.",
    titleTooltip: "Calculate the exact amount you need to earn to spend all your money by your life expectancy. Based on the philosophy that the goal is to maximize life experiences, not die with the most money.",
    learnMore: "Learn more about Die With Zero",
    yourInfo: "Your Information",
    currency: "Currency",
    currentAgeYears: "Current Age (Years)",
    currentAgeMonths: "Months (0-11)",
    currentSavings: "Current Savings",
    currentSavingsTooltip: "Total amount of money you currently have saved for retirement.",
    retirementAge: "Retirement Age",
    retirementAgeTooltip: "Age at which you plan to stop working and start living off your savings.",
    lifeExpectancy: "Life Expectancy",
    lifeExpectancyTooltip: "The age you expect to live until. The calculator ensures you spend all your money by this age.",
    livingExpensePerMonth: "Living Expense Per Month",
    annualROI: "Annual ROI Rate (%)",
    annualROITooltip: "Expected annual return on investment for your savings. This accounts for compound interest over time.",
    incomeAfterRetirement: "Income Per Month After Retirement",
    incomeAfterRetirementTooltip: "Passive income you'll receive during retirement (e.g., pension, social security, rental income).",
    livingExpenseAfterRetirement: "Living Expense Per Month After Retirement",
    totalEarningsNeeded: "Total Earnings Needed",
    totalEarningsNeededTooltip: "Total amount you need to earn from now until retirement to achieve your Die With Zero goal.",
    yearlyEarningsNeeded: "Yearly Earnings Needed",
    monthlyEarningsNeeded: "Monthly Earnings Needed",
    includesLivingExpenses: "Includes living expenses +",
    savings: "savings",
    wealthProjection: "Wealth Projection Over Time",
    working: "Working",
    retirement: "Retirement",
    projectedWealth: "Projected Wealth",
  },
};

// Tooltip component
function Tooltip({
  text,
  children,
  position = "top",
}: {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="cursor-help text-slate-400 hover:text-slate-200 ml-1 touch-manipulation"
      >
        {children}
      </span>
      {show && (
        <>
          <div
            className="fixed inset-0 z-10 md:hidden"
            onClick={() => setShow(false)}
          />
          <div className={`absolute z-20 left-1/2 transform -translate-x-1/2 w-64 max-w-[calc(100vw-2rem)] px-3 py-2 text-sm text-white bg-slate-900 rounded-lg shadow-lg border border-slate-700 ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}>
            {text}
            {position === "top" ? (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
            ) : (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-900"></div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const STORAGE_KEY = "die-with-zero-calculator";

export default function Calculator() {
  // Load saved data from localStorage or use defaults
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.inputs || {
            currentAge: 30,
            currentAgeMonths: 0,
            currentSavings: 200000,
            retirementAge: 50,
            lifeExpectancy: 80,
            livingExpensePerMonth: 10000,
            roiRate: 4,
            incomePerMonthAfterRetirement: 2000,
            livingExpensePerMonthAfterRetirement: 10000,
          };
        } catch (e) {
          console.error("Failed to parse saved data:", e);
        }
      }
    }
    return {
      currentAge: 30,
      currentAgeMonths: 0,
      currentSavings: 200000,
      retirementAge: 50,
      lifeExpectancy: 80,
      livingExpensePerMonth: 10000,
      roiRate: 4,
      incomePerMonthAfterRetirement: 2000,
      livingExpensePerMonthAfterRetirement: 10000,
    };
  });

  const [results, setResults] = useState<CalculationResults | null>(null);

  const [currency, setCurrency] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.currency || "CNY";
        } catch (e) {
          console.error("Failed to parse saved data:", e);
        }
      }
    }
    return "CNY";
  });

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.language || "zh";
        } catch (e) {
          console.error("Failed to parse saved data:", e);
        }
      }
    }
    return "zh";
  });

  const t = translations[language];

  // Save to localStorage whenever inputs, currency, or language change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            inputs,
            currency,
            language,
          })
        );
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    }
  }, [inputs, currency, language]);

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    // Remove commas before parsing
    const cleanValue = value.replace(/,/g, "");
    // Allow empty string, otherwise parse to number
    const numValue = cleanValue === "" ? 0 : parseFloat(cleanValue) || 0;
    setInputs((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when focusing, especially useful when value is 0
    event.target.select();
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  // Auto-calculate results whenever inputs change
  useEffect(() => {
    const calculationResults = calculateDieWithZero(inputs);
    setResults(calculationResults);
  }, [inputs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-2 sm:py-4 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-3 sm:mb-4">
          {/* Language Switch */}
          <div className="flex justify-center sm:justify-end mb-2 sm:mb-0 sm:absolute sm:right-0 sm:top-0">
            <div className="relative inline-flex items-center bg-white/10 rounded-full p-1 border border-white/20">
              {/* Sliding background */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-blue-500/80 rounded-full transition-all duration-300 ease-in-out ${
                  language === "zh" ? "left-1" : "left-[calc(50%+0.125rem)]"
                }`}
              />
              {/* Chinese option */}
              <button
                onClick={() => setLanguage("zh")}
                className={`relative z-10 px-3 py-1 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 ${
                  language === "zh" ? "text-white" : "text-slate-400"
                }`}
              >
                中文
              </button>
              {/* English option */}
              <button
                onClick={() => setLanguage("en")}
                className={`relative z-10 px-3 py-1 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 ${
                  language === "en" ? "text-white" : "text-slate-400"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2">
            {t.title}
            <Tooltip text={t.titleTooltip} position="bottom">
              <span className="text-base sm:text-lg">ⓘ</span>
            </Tooltip>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto px-2 mb-2">
            {t.subtitle}
          </p>
          <a
            href="https://www.diewithzerobook.com/welcome"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            {t.learnMore} →
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Input Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-3 sm:p-4 border border-white/20">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
              {t.yourInfo}
            </h2>

            <div className="space-y-2 sm:space-y-3">
              {/* Currency Selector */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  {t.currency}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD" className="bg-slate-800">
                    USD - US Dollar ($)
                  </option>
                  <option value="CNY" className="bg-slate-800">
                    CNY - Chinese Yuan (¥)
                  </option>
                </select>
              </div>

              {/* Current Age */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                    {t.currentAgeYears}
                  </label>
                  <input
                    type="number"
                    value={inputs.currentAge || ""}
                    onChange={(e) =>
                      handleInputChange("currentAge", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                    {t.currentAgeMonths}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={inputs.currentAgeMonths || ""}
                    onChange={(e) =>
                      handleInputChange("currentAgeMonths", e.target.value)
                    }
                    onFocus={handleInputFocus}
                    className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Current Savings */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 flex items-center">
                  {t.currentSavings}
                  <Tooltip text={t.currentSavingsTooltip}>
                    <span className="text-xs">ⓘ</span>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={inputs.currentSavings ? formatNumber(inputs.currentSavings) : ""}
                  onChange={(e) =>
                    handleInputChange("currentSavings", e.target.value)
                  }
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Retirement Age */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 flex items-center">
                  {t.retirementAge}
                  <Tooltip text={t.retirementAgeTooltip}>
                    <span className="text-xs">ⓘ</span>
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.retirementAge || ""}
                  onChange={(e) =>
                    handleInputChange("retirementAge", e.target.value)
                  }
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Life Expectancy */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 flex items-center">
                  {t.lifeExpectancy}
                  <Tooltip text={t.lifeExpectancyTooltip}>
                    <span className="text-xs">ⓘ</span>
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.lifeExpectancy || ""}
                  onChange={(e) =>
                    handleInputChange("lifeExpectancy", e.target.value)
                  }
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Living Expense Per Month */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  {t.livingExpensePerMonth}
                </label>
                <input
                  type="text"
                  value={inputs.livingExpensePerMonth ? formatNumber(inputs.livingExpensePerMonth) : ""}
                  onChange={(e) =>
                    handleInputChange("livingExpensePerMonth", e.target.value)
                  }
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ROI Rate */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 flex items-center">
                  {t.annualROI}
                  <Tooltip text={t.annualROITooltip}>
                    <span className="text-xs">ⓘ</span>
                  </Tooltip>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.roiRate || ""}
                  onChange={(e) => handleInputChange("roiRate", e.target.value)}
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Income After Retirement */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1 flex items-center">
                  {t.incomeAfterRetirement}
                  <Tooltip text={t.incomeAfterRetirementTooltip}>
                    <span className="text-xs">ⓘ</span>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={inputs.incomePerMonthAfterRetirement ? formatNumber(inputs.incomePerMonthAfterRetirement) : ""}
                  onChange={(e) =>
                    handleInputChange(
                      "incomePerMonthAfterRetirement",
                      e.target.value
                    )
                  }
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Living Expense After Retirement */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  {t.livingExpenseAfterRetirement}
                </label>
                <input
                  type="text"
                  value={inputs.livingExpensePerMonthAfterRetirement ? formatNumber(
                    inputs.livingExpensePerMonthAfterRetirement
                  ) : ""}
                  onChange={(e) =>
                    handleInputChange(
                      "livingExpensePerMonthAfterRetirement",
                      e.target.value
                    )
                  }
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3 sm:space-y-4">
            {results && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {results.message ? (
                    <div className="bg-green-500/20 backdrop-blur-lg rounded-xl shadow-2xl p-3 sm:p-4 border border-green-500/30">
                      <p className="text-base sm:text-lg font-bold text-green-300 text-center">
                        {results.message}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-2.5 sm:p-3 border border-white/20">
                        <h3 className="text-xs font-medium text-slate-300 mb-1 flex items-center">
                          {t.totalEarningsNeeded}
                          <Tooltip text={t.totalEarningsNeededTooltip}>
                            <span className="text-xs">ⓘ</span>
                          </Tooltip>
                        </h3>
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {formatCurrency(results.totalEarningsNeeded)}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-2.5 sm:p-3 border border-white/20">
                        <h3 className="text-xs font-medium text-slate-300 mb-1">
                          {t.yearlyEarningsNeeded}
                        </h3>
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {formatCurrency(results.yearlyEarningsNeeded)}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-2.5 sm:p-3 border border-white/20">
                        <h3 className="text-xs font-medium text-slate-300 mb-1">
                          {t.monthlyEarningsNeeded}
                        </h3>
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {formatCurrency(results.monthlyEarningsNeeded)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {t.includesLivingExpenses}{" "}
                          {formatCurrency(
                            results.monthlyEarningsNeeded -
                              inputs.livingExpensePerMonth
                          )}{" "}
                          {t.savings}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Wealth Chart */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-3 sm:p-4 border border-white/20">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">
                    {t.wealthProjection}
                  </h3>
                  <WealthChart
                    data={results.wealthChart}
                    currency={currency}
                    inputs={inputs}
                    results={results}
                    language={language}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

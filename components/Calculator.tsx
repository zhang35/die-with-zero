"use client";

import { useState, useEffect, useRef } from "react";
import {
  calculateDieWithZero,
  CalculatorInputs,
  CalculationResults,
} from "@/lib/calculations";
import WealthChart from "./WealthChart";
import domtoimage from "dom-to-image-more";
import { QRCodeSVG } from "qrcode.react";

// Translation type
type Language = "zh" | "en";

interface Translations {
  title: string;
  subtitle: string;
  learnMore: string;
  yourInfo: string;
  currency: string;
  currentAgeYears: string;
  currentAgeMonths: string;
  currentSavings: string;
  retirementAge: string;
  lifeExpectancy: string;
  livingExpensePerMonth: string;
  annualROI: string;
  incomeAfterRetirement: string;
  livingExpenseAfterRetirement: string;
  totalEarningsNeeded: string;
  yearlyEarningsNeeded: string;
  monthlyEarningsNeeded: string;
  includesLivingExpenses: string;
  savings: string;
  wealthProjection: string;
  working: string;
  retirement: string;
  projectedWealth: string;
  shareAsImage: string;
  sharingImage: string;
  scanToTry: string;
}

const translations: Record<Language, Translations> = {
  zh: {
    title: "生前花光计算器",
    subtitle:
      "基于「Die With Zero」理念，计算到预期寿命时刚好花完所有钱所需的收入。最大化人生体验，避免过度积累财富。",
    learnMore: "了解更多关于 Die With Zero",
    yourInfo: "个人信息",
    currency: "货币",
    currentAgeYears: "当前年龄（岁）",
    currentAgeMonths: "月份（0-11）",
    currentSavings: "当前储蓄",
    retirementAge: "退休年龄",
    lifeExpectancy: "预期寿命",
    livingExpensePerMonth: "每月生活费",
    annualROI: "年化收益率（%）- 储蓄投资回报率",
    incomeAfterRetirement: "退休后每月收入（养老金、兼职等）",
    livingExpenseAfterRetirement: "退休后每月生活费",
    totalEarningsNeeded: "所需总收入",
    yearlyEarningsNeeded: "所需年收入",
    monthlyEarningsNeeded: "所需月收入",
    includesLivingExpenses: "包含生活费 +",
    savings: "储蓄",
    wealthProjection: "财富走势图",
    working: "工作期",
    retirement: "退休期",
    projectedWealth: "财富预测",
    shareAsImage: "分享为图片",
    sharingImage: "生成图片中...",
    scanToTry: "扫码试试",
  },
  en: {
    title: "Die With Zero Calculator",
    subtitle:
      "Calculate exactly how much you need to earn to spend all your money by your life expectancy. Based on the philosophy of maximizing life experiences, not wealth accumulation.",
    learnMore: "Learn more about Die With Zero",
    yourInfo: "Your Information",
    currency: "Currency",
    currentAgeYears: "Current Age (Years)",
    currentAgeMonths: "Months (0-11)",
    currentSavings: "Current Savings",
    retirementAge: "Retirement Age",
    lifeExpectancy: "Life Expectancy",
    livingExpensePerMonth: "Living Expense Per Month",
    annualROI: "Annual ROI Rate (%) - Investment Return",
    incomeAfterRetirement:
      "Income Per Month After Retirement (Pension, Part-time, etc.)",
    livingExpenseAfterRetirement: "Living Expense Per Month After Retirement",
    totalEarningsNeeded: "Total Earnings Needed",
    yearlyEarningsNeeded: "Yearly Earnings Needed",
    monthlyEarningsNeeded: "Monthly Earnings Needed",
    includesLivingExpenses: "Includes living expenses +",
    savings: "savings",
    wealthProjection: "Wealth Projection Over Time",
    working: "Working",
    retirement: "Retirement",
    projectedWealth: "Projected Wealth",
    shareAsImage: "Share as Image",
    sharingImage: "Generating image...",
    scanToTry: "Scan to try",
  },
};

const STORAGE_KEY = "die-with-zero-calculator";

export default function Calculator() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Load saved data from localStorage or use defaults
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return (
            data.inputs || {
              currentAge: 30,
              currentAgeMonths: 0,
              currentSavings: 200000,
              retirementAge: 50,
              lifeExpectancy: 80,
              livingExpensePerMonth: 10000,
              roiRate: 4,
              incomePerMonthAfterRetirement: 2000,
              livingExpensePerMonthAfterRetirement: 10000,
            }
          );
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

  const handleShareAsImage = async () => {
    if (!resultsRef.current) return;

    setIsGeneratingImage(true);

    try {
      // Create a style element to fix rendering issues
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        * {
          border: none !important;
          border-color: transparent !important;
          outline: none !important;
          outline-color: transparent !important;
          box-shadow: none !important;
          overflow: visible !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        a {
          border: none !important;
          outline: none !important;
          text-decoration: underline !important;
        }
        .flex.items-center.gap-2 span,
        .flex.items-center.gap-4 span,
        .flex.items-center.gap-6 span {
          white-space: nowrap !important;
        }
      `;
      document.head.appendChild(styleEl);

      const blob = await domtoimage.toBlob(resultsRef.current, {
        bgcolor: "#0f172a",
        quality: 1,
        scale: 2,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      // Clean up style element
      document.head.removeChild(styleEl);

      const fileName = `die-with-zero-plan-${new Date().getTime()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // Try Web Share API first (better for mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: t.title,
            text: t.subtitle,
          });
          setIsGeneratingImage(false);
          return;
        } catch (shareError) {
          // User cancelled or share failed, fall through to download
          console.log("Share cancelled or failed:", shareError);
        }
      }

      // Fallback: Download the image
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setIsGeneratingImage(false);
    } catch (error) {
      console.error("Error generating image:", error);
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-2 sm:py-4 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Language Switch */}
        <div className="flex justify-center sm:justify-end mb-3 sm:mb-4">
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

        <div ref={resultsRef}>
        <div className="text-center mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
            {t.title}
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
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  {t.currentSavings}
                </label>
                <input
                  type="text"
                  value={
                    inputs.currentSavings
                      ? formatNumber(inputs.currentSavings)
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("currentSavings", e.target.value)
                  }
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Retirement Age */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  {t.retirementAge}
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
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  {t.lifeExpectancy}
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
                  value={
                    inputs.livingExpensePerMonth
                      ? formatNumber(inputs.livingExpensePerMonth)
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("livingExpensePerMonth", e.target.value)
                  }
                  onFocus={handleInputFocus}
                  className="w-full px-2 sm:px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ROI Rate */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  {t.annualROI}
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
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  {t.incomeAfterRetirement}
                </label>
                <input
                  type="text"
                  value={
                    inputs.incomePerMonthAfterRetirement
                      ? formatNumber(inputs.incomePerMonthAfterRetirement)
                      : ""
                  }
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
                  value={
                    inputs.livingExpensePerMonthAfterRetirement
                      ? formatNumber(
                          inputs.livingExpensePerMonthAfterRetirement
                        )
                      : ""
                  }
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
                        <h3 className="text-xs font-medium text-slate-300 mb-1">
                          {t.totalEarningsNeeded}
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

        {/* QR Code Footer - Only shown when results exist */}
        {results && (
          <div className="mt-4 flex items-center justify-center gap-3 bg-white/5 backdrop-blur-lg rounded-xl p-3 border border-white/10">
            <QRCodeSVG
              value="https://zero.dailybetter.cn/"
              size={80}
              level="M"
              bgColor="transparent"
              fgColor="#ffffff"
            />
            <div className="text-slate-300 text-xs sm:text-sm">
              <div className="font-semibold">{t.scanToTry}</div>
              <div className="text-slate-400 mt-0.5">zero.dailybetter.cn</div>
            </div>
          </div>
        )}
        </div>

        {/* Share Button - Below the captured area */}
        {results && (
          <div className="mt-4 mb-6 sm:mb-8 flex justify-center">
            <button
              onClick={handleShareAsImage}
              disabled={isGeneratingImage}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-blue-400 disabled:to-purple-400 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a 3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{isGeneratingImage ? t.sharingImage : t.shareAsImage}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

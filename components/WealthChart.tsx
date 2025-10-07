"use client";

import { YearlyWealth, CalculatorInputs, CalculationResults } from "@/lib/calculations";
import { useState, useRef, MouseEvent, TouchEvent } from "react";

type Language = "zh" | "en";

interface ChartTranslations {
  working: string;
  retirement: string;
  projectedWealth: string;
  age: string;
  wealth: string;
  yearlyIncome: string;
  roiIncome: string;
  yearlyExpense: string;
  net: string;
}

const chartTranslations: Record<Language, ChartTranslations> = {
  zh: {
    working: "工作期",
    retirement: "退休期",
    projectedWealth: "财富预测",
    age: "年龄",
    wealth: "财富",
    yearlyIncome: "年收入",
    roiIncome: "投资收益",
    yearlyExpense: "年支出",
    net: "结余",
  },
  en: {
    working: "Working",
    retirement: "Retirement",
    projectedWealth: "Projected Wealth",
    age: "Age",
    wealth: "Wealth",
    yearlyIncome: "Yearly Income",
    roiIncome: "ROI Income",
    yearlyExpense: "Yearly Expense",
    net: "Net",
  },
};

interface WealthChartProps {
  data: YearlyWealth[];
  currency: string;
  inputs: CalculatorInputs;
  results: CalculationResults;
  language: Language;
}

export default function WealthChart({ data, currency, inputs, results, language }: WealthChartProps) {
  const ct = chartTranslations[language];
  const [hoverData, setHoverData] = useState<{
    point: YearlyWealth;
    x: number;
    y: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return <div className="text-slate-400">No data to display</div>;
  }

  const maxWealth = Math.max(...data.map((d) => d.wealth));
  const minAge = Math.min(...data.map((d) => d.age));
  const maxAge = Math.max(...data.map((d) => d.age));
  const ageRange = maxAge - minAge;

  const getCurrencySymbol = () => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const parts = formatter.formatToParts(0);
    const symbol = parts.find(part => part.type === 'currency')?.value || currency;
    return symbol;
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol();
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}K`;
    }
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Calculate chart dimensions - responsive
  const chartHeight = 400;
  const chartWidth = 800;
  const padding = { top: 20, right: 40, bottom: 60, left: 70 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Create path for the wealth line
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (d.wealth / maxWealth) * innerHeight;
    return { x, y, age: d.age, wealth: d.wealth };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Create area fill path
  const areaPathD =
    pathD +
    ` L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;

  // Y-axis labels
  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: maxWealth * ratio,
    y: padding.top + innerHeight - ratio * innerHeight,
  }));

  // X-axis labels (every 5 years)
  const xAxisLabels = data
    .filter((d, i) => i === 0 || i === data.length - 1 || d.age % 5 === 0)
    .map((d, i, arr) => {
      const index = data.findIndex((item) => item.age === d.age);
      return {
        age: d.age,
        x: padding.left + (index / (data.length - 1)) * innerWidth,
      };
    });

  // Handle mouse move to show hover details
  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    // Convert screen coordinates to SVG coordinates
    const scaleX = chartWidth / rect.width;
    const scaleY = chartHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Check if mouse is within chart bounds
    if (
      mouseX < padding.left ||
      mouseX > padding.left + innerWidth ||
      mouseY < padding.top ||
      mouseY > padding.top + innerHeight
    ) {
      setHoverData(null);
      return;
    }

    // Find closest data point
    const relativeX = mouseX - padding.left;
    const index = Math.round((relativeX / innerWidth) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    const point = points[clampedIndex];

    setHoverData({
      point: data[clampedIndex],
      x: point.x,
      y: point.y,
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const handleTouchMove = (e: TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || e.touches.length === 0) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const touch = e.touches[0];

    // Convert screen coordinates to SVG coordinates
    const scaleX = chartWidth / rect.width;
    const scaleY = chartHeight / rect.height;
    const touchX = (touch.clientX - rect.left) * scaleX;
    const touchY = (touch.clientY - rect.top) * scaleY;

    // Check if touch is within chart bounds
    if (
      touchX < padding.left ||
      touchX > padding.left + innerWidth ||
      touchY < padding.top ||
      touchY > padding.top + innerHeight
    ) {
      setHoverData(null);
      return;
    }

    // Find closest data point
    const relativeX = touchX - padding.left;
    const index = Math.round((relativeX / innerWidth) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    const point = points[clampedIndex];

    setHoverData({
      point: data[clampedIndex],
      x: point.x,
      y: point.y,
    });
  };

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getYearlyDetails = (age: number, wealth: number) => {
    const isRetired = age >= inputs.retirementAge;
    const roiIncome = wealth * (inputs.roiRate / 100);

    if (isRetired) {
      return {
        income: inputs.incomePerMonthAfterRetirement * 12,
        expense: inputs.livingExpensePerMonthAfterRetirement * 12,
        roiIncome: roiIncome,
        phase: 'Retirement'
      };
    } else {
      return {
        income: results.monthlyEarningsNeeded * 12,
        expense: inputs.livingExpensePerMonth * 12,
        roiIncome: roiIncome,
        phase: 'Working'
      };
    }
  };

  return (
    <div className="w-full overflow-x-auto relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        style={{ minWidth: "320px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
      >
        {/* Grid lines */}
        {yAxisLabels.map((label, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={label.y}
            x2={padding.left + innerWidth}
            y2={label.y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path
          d={areaPathD}
          fill="url(#gradient)"
          opacity="0.3"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Wealth line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Line gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#fff"
              stroke="#3b82f6"
              strokeWidth="2"
              className="transition-all cursor-pointer"
            />
          </g>
        ))}

        {/* Hover effects */}
        {hoverData && (() => {
          const yearDetails = getYearlyDetails(hoverData.point.age, hoverData.point.wealth);
          const tooltipWidth = 180;
          const tooltipHeight = 135;
          const tooltipX = hoverData.x > chartWidth / 2
            ? hoverData.x - tooltipWidth - 15
            : hoverData.x + 15;
          const tooltipY = Math.max(padding.top, Math.min(
            hoverData.y - tooltipHeight / 2,
            padding.top + innerHeight - tooltipHeight
          ));

          return (
            <>
              {/* Vertical line */}
              <line
                x1={hoverData.x}
                y1={padding.top}
                x2={hoverData.x}
                y2={padding.top + innerHeight}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
                strokeDasharray="4,4"
              />

              {/* Highlighted point */}
              <circle
                cx={hoverData.x}
                cy={hoverData.y}
                r="6"
                fill="#fff"
                stroke="#3b82f6"
                strokeWidth="3"
              />

              {/* Tooltip background */}
              <g>
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="1.5"
                  rx="8"
                />

                {/* Age header */}
                <text
                  x={tooltipX + tooltipWidth / 2}
                  y={tooltipY + 18}
                  textAnchor="middle"
                  fill="#3b82f6"
                  fontSize="13"
                  fontFamily="system-ui"
                  fontWeight="700"
                >
                  {ct.age} {hoverData.point.age} ({yearDetails.phase === "Working" ? ct.working : ct.retirement})
                </text>

                {/* Wealth */}
                <text
                  x={tooltipX + 10}
                  y={tooltipY + 38}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="system-ui"
                  fontWeight="600"
                >
                  {ct.wealth}:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 10}
                  y={tooltipY + 38}
                  textAnchor="end"
                  fill="#fff"
                  fontSize="11"
                  fontFamily="system-ui"
                  fontWeight="700"
                >
                  {formatFullCurrency(hoverData.point.wealth)}
                </text>

                {/* Divider */}
                <line
                  x1={tooltipX + 10}
                  y1={tooltipY + 45}
                  x2={tooltipX + tooltipWidth - 10}
                  y2={tooltipY + 45}
                  stroke="rgba(148, 163, 184, 0.3)"
                  strokeWidth="1"
                />

                {/* Income */}
                <text
                  x={tooltipX + 10}
                  y={tooltipY + 62}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="system-ui"
                  fontWeight="600"
                >
                  {ct.yearlyIncome}:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 10}
                  y={tooltipY + 62}
                  textAnchor="end"
                  fill="#10b981"
                  fontSize="11"
                  fontFamily="system-ui"
                  fontWeight="700"
                >
                  {formatFullCurrency(yearDetails.income)}
                </text>

                {/* ROI Income */}
                <text
                  x={tooltipX + 10}
                  y={tooltipY + 77}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="system-ui"
                  fontWeight="600"
                >
                  {ct.roiIncome}:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 10}
                  y={tooltipY + 77}
                  textAnchor="end"
                  fill="#10b981"
                  fontSize="11"
                  fontFamily="system-ui"
                  fontWeight="700"
                >
                  {formatFullCurrency(yearDetails.roiIncome)}
                </text>

                {/* Expense */}
                <text
                  x={tooltipX + 10}
                  y={tooltipY + 92}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="system-ui"
                  fontWeight="600"
                >
                  {ct.yearlyExpense}:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 10}
                  y={tooltipY + 92}
                  textAnchor="end"
                  fill="#ef4444"
                  fontSize="11"
                  fontFamily="system-ui"
                  fontWeight="700"
                >
                  {formatFullCurrency(yearDetails.expense)}
                </text>

                {/* Net */}
                <text
                  x={tooltipX + 10}
                  y={tooltipY + 109}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="system-ui"
                  fontWeight="600"
                >
                  {ct.net}:
                </text>
                <text
                  x={tooltipX + tooltipWidth - 10}
                  y={tooltipY + 109}
                  textAnchor="end"
                  fill={yearDetails.income + yearDetails.roiIncome - yearDetails.expense >= 0 ? "#10b981" : "#ef4444"}
                  fontSize="11"
                  fontFamily="system-ui"
                  fontWeight="700"
                >
                  {formatFullCurrency(yearDetails.income + yearDetails.roiIncome - yearDetails.expense)}
                </text>
              </g>
            </>
          );
        })()}

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        {yAxisLabels.map((label, i) => (
          <text
            key={i}
            x={padding.left - 10}
            y={label.y}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize="12"
            fontFamily="system-ui"
          >
            {formatCurrency(label.value)}
          </text>
        ))}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={padding.left + innerWidth}
          y2={padding.top + innerHeight}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />

        {/* X-axis labels */}
        {xAxisLabels.map((label, i) => (
          <g key={i}>
            <line
              x1={label.x}
              y1={padding.top + innerHeight}
              x2={label.x}
              y2={padding.top + innerHeight + 6}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <text
              x={label.x}
              y={padding.top + innerHeight + 25}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
              fontFamily="system-ui"
            >
              {label.age}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text
          x={padding.left + innerWidth / 2}
          y={chartHeight - 10}
          textAnchor="middle"
          fill="#cbd5e1"
          fontSize="14"
          fontFamily="system-ui"
          fontWeight="600"
        >
          {ct.age}
        </text>

        <text
          x={-chartHeight / 2}
          y={20}
          textAnchor="middle"
          fill="#cbd5e1"
          fontSize="14"
          fontFamily="system-ui"
          fontWeight="600"
          transform={`rotate(-90, 20, ${chartHeight / 2})`}
        >
          {ct.wealth} ({getCurrencySymbol()})
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <span className="text-slate-300">{ct.projectedWealth}</span>
        </div>
      </div>
    </div>
  );
}

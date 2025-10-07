"use client";

import { YearlyWealth } from "@/lib/calculations";

interface WealthChartProps {
  data: YearlyWealth[];
}

export default function WealthChart({ data }: WealthChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-slate-400">No data to display</div>;
  }

  const maxWealth = Math.max(...data.map((d) => d.wealth));
  const minAge = Math.min(...data.map((d) => d.age));
  const maxAge = Math.max(...data.map((d) => d.age));
  const ageRange = maxAge - minAge;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Calculate chart dimensions
  const chartHeight = 400;
  const chartWidth = 800;
  const padding = { top: 20, right: 60, bottom: 60, left: 80 };
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

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        style={{ minWidth: "600px" }}
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
              className="hover:r-6 transition-all cursor-pointer"
            />
            <title>
              Age {point.age}: {formatCurrency(point.wealth)}
            </title>
          </g>
        ))}

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
          Age
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
          Wealth ($)
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <span className="text-slate-300">Projected Wealth</span>
        </div>
      </div>
    </div>
  );
}

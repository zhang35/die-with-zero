import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  Plugin,
} from 'chart.js';
import { calculateSpendCurve } from '../utils/calculations';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

// Custom plugin for vertical line
const verticalLinePlugin: Plugin = {
  id: 'verticalLine',
  afterDraw: (chart) => {
    const tooltip = chart.tooltip;
    if (tooltip?.getActiveElements().length) {
      const ctx = chart.ctx;
      const activeElement = tooltip.getActiveElements()[0];
      const x = activeElement.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#666';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();
    }
  }
};

export default function Calculator() {
  const { t } = useTranslation();
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(90);
  const [annualSpend, setAnnualSpend] = useState<number>(60000);
  const [netWorth, setNetWorth] = useState<number>(100000);
  const [investmentReturn, setInvestmentReturn] = useState<number>(0.03);
  const [inflation, setInflation] = useState<number>(0.03);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [postRetirementBenefits, setPostRetirementBenefits] = useState<number>(20000);
  const [annualIncome, setAnnualIncome] = useState<number>(120000);

  // Helper function to format currency numbers
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
  };

  // Helper function to parse currency strings back to numbers
  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/,/g, ''));
  };

  const dataPoints = calculateSpendCurve(
    currentAge,
    lifeExpectancy,
    annualSpend,
    netWorth,
    investmentReturn,
    inflation,
    retirementAge,
    postRetirementBenefits,
    annualIncome
  );

  const chartData = {
    labels: dataPoints.map((d) => d.age),
    datasets: [
      {
        label: "Annual Spend",
        data: dataPoints.map((d) => d.spend),
        fill: true,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: "Net Worth",
        data: dataPoints.map((d) => d.netWorth),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function(context: { dataset: { label?: string }, parsed: { y: number | null } }) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      crosshair: {
        line: {
          color: '#666',
          width: 1,
          dashPattern: [5, 5]
        },
        sync: {
          enabled: true
        },
        zoom: {
          enabled: false
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t('ageLabel'),
        },
        grid: {
          drawOnChartArea: true,
          color: function(context: { tick?: { major?: boolean } }) {
            if (context.tick && context.tick.major) {
              return '#666';
            }
            return '#ddd';
          }
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: t('annualSpendLabel'),
        },
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: t('netWorthLabel'),
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Age-related inputs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('currentAge')}</label>
            <input
              type="text"
              value={formatCurrency(currentAge)}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setCurrentAge(Math.floor(value));
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('retirementAge')}</label>
            <input
              type="text"
              value={formatCurrency(retirementAge)}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                if (!isNaN(value) && value >= currentAge && value <= lifeExpectancy) {
                  setRetirementAge(Math.floor(value));
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min={currentAge}
              max={lifeExpectancy}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('lifeExpectancy')}</label>
            <input
              type="text"
              value={formatCurrency(lifeExpectancy)}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                if (!isNaN(value) && value >= currentAge) {
                  setLifeExpectancy(Math.floor(value));
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min={currentAge}
            />
          </div>

          {/* Financial inputs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('annualIncome')}</label>
            <input
              type="text"
              value={formatCurrency(annualIncome)}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setAnnualIncome(Math.floor(value));
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('annualSpend')}</label>
            <input
              type="text"
              value={formatCurrency(annualSpend)}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setAnnualSpend(Math.floor(value));
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('netWorth')}</label>
            <input
              type="text"
              value={formatCurrency(netWorth)}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setNetWorth(Math.floor(value));
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>

          {/* Investment-related inputs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('investmentReturn')}</label>
            <input
              type="number"
              value={Number((investmentReturn * 100).toFixed(2))}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  setInvestmentReturn(value / 100);
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              max="100"
              step="0.01"
              pattern="^\d+(\.\d{1,2})?$"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('inflation')}</label>
            <input
              type="number"
              value={Number((inflation * 100).toFixed(2))}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  setInflation(value / 100);
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              max="100"
              step="0.01"
              pattern="^\d+(\.\d{1,2})?$"
            />
          </div>

          {/* Retirement-related inputs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{t('postRetirementBenefits')}</label>
            <input
              type="text"
              value={formatCurrency(postRetirementBenefits)}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setPostRetirementBenefits(Math.floor(value));
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full">
          <Line 
            data={chartData} 
            options={{
              ...options,
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: {
                  left: 0,
                  right: 0
                }
              }
            }}
            plugins={[verticalLinePlugin]}
          />
        </div>
      </div>
    </>
  );
} 
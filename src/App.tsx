// App.tsx
import { useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

function calculateSpendCurve(
  age: number,
  retirementAge: number,
  savings: number
): { age: number; spend: number }[] {
  const years = retirementAge - age;
  const curve = [];
  for (let i = 0; i <= years; i++) {
    const spend = savings * Math.exp(-i / years);
    curve.push({ age: age + i, spend: Math.round(spend) });
  }
  return curve;
}

export default function App() {
  const [age, setAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [savings, setSavings] = useState<number>(1000000);

  const dataPoints = calculateSpendCurve(age, retirementAge, savings);

  const chartData = {
    labels: dataPoints.map((d) => d.age),
    datasets: [
      {
        label: "Estimated Spend",
        data: dataPoints.map((d) => d.spend),
        fill: true,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Age",
        },
      },
      y: {
        title: {
          display: true,
          text: "Spend ($)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 font-sans max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Spend Curve Visualizer</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Current Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(+e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Retirement Age:</label>
          <input
            type="number"
            value={retirementAge}
            onChange={(e) => setRetirementAge(+e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Savings:</label>
          <input
            type="number"
            value={savings}
            onChange={(e) => setSavings(+e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="h-64 md:h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

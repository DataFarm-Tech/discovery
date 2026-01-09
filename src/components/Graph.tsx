"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";

import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface DataPoint {
  x: string;
  y: number;
}

interface GraphProps {
  title: string;
  data: DataPoint[];
  timePeriod?: "week" | "month" | "6months" | "year" | "all";
}

export default function Graph({ title, data, timePeriod = "all" }: GraphProps) {
  const gradientBg = (ctx: any) => {
    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(255, 179, 71, 0.45)");
    gradient.addColorStop(1, "rgba(255, 179, 71, 0)");
    return gradient;
  };

  // Format x-axis labels based on time period
  const formatXAxisLabel = (value: string) => {
    const date = new Date(value);

    if (timePeriod === "week") {
      // For weekly view: Show day name and time
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[date.getDay()];
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${dayName} ${displayHours}:${minutes} ${ampm}`;
    }

    if (timePeriod === "month") {
      // For monthly view: Show date and short month
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthName = months[date.getMonth()];
      const day = date.getDate();
      return `${monthName} ${day}`;
    }

    if (timePeriod === "6months") {
      // For 6 months view: Show date and month
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthName = months[date.getMonth()];
      const day = date.getDate();
      return `${monthName} ${day}`;
    }

    if (timePeriod === "year") {
      // For yearly view: Show month and year
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return `${monthName} ${year}`;
    }

    // Default formatting for 'all' time
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${monthName} ${day}, ${year}`;
  };

  const chartData = {
    datasets: [
      {
        label: title,
        data,
        borderColor: "#ffb347",
        borderWidth: 3,
        backgroundColor: gradientBg,
        fill: true,
        tension: 0.45,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: "#ffb347",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 16,
            weight: "bold" as const,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: {
          size: 16,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },

    scales: {
      x: {
        type: "category" as const,
        grid: { color: "rgba(255,255,255,0.25)" },
        ticks: {
          color: "white",
          font: { size: 12 },
          maxRotation: timePeriod === "week" ? 45 : 45,
          minRotation: timePeriod === "week" ? 45 : 45,
          callback: function (value: string | number): string {
            const label: string =
              typeof value === "number"
                ? (this as any).getLabelForValue(value)
                : value;
            return formatXAxisLabel(label);
          },
        },
      },

      y: {
        grid: { color: "rgba(255,255,255,0.25)" },
        ticks: {
          color: "white",
          font: { size: 12 },
        },
      },
    },
  } as const;

  return (
    <div className="w-full max-w-4xl mx-auto h-80 p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}

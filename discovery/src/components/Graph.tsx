'use client';

import { Line } from 'react-chartjs-2';
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
} from 'chart.js';

import 'chartjs-adapter-date-fns';

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
}

export default function Graph({ title, data }: GraphProps) {
  const gradientBg = (ctx: any) => {
    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 179, 71, 0.45)');
    gradient.addColorStop(1, 'rgba(255, 179, 71, 0)');
    return gradient;
  };

  const chartData = {
    datasets: [
      {
        label: title,
        data,
        borderColor: '#ffb347',
        borderWidth: 3,
        backgroundColor: gradientBg,
        fill: true,
        tension: 0.45,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: '#ffb347',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 16,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 16,
          weight: 'bold' as const,
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
        type: 'category',
        grid: { color: 'rgba(255,255,255,0.25)' },
        ticks: {
          color: 'white',
          font: { size: 12 },
        },
      },

      y: {
        grid: { color: 'rgba(255,255,255,0.25)' },
        ticks: {
          color: 'white',
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

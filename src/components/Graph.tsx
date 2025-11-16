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
} from 'chart.js';

import 'chartjs-adapter-date-fns'; // import the adapter to support time scale

// Register the required chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

interface DataPoint {
  x: string; // timestamp string (ISO)
  y: number;
  type?: string; // optional if needed for filtering or display
}

interface GraphProps {
  title: string;
  data: DataPoint[];
}

export default function Graph({ title, data }: GraphProps) {
  const chartData = {
    datasets: [
      {
        label: title,
        data: data,
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
  plugins: {
    legend: {
      labels: {
        color: 'white',
        font: { size: 18 },
      },
    },
  },
  scales: {
    x: {
      type: 'time' as const,
      time: {
        unit: 'hour',  // adjust based on your data granularity
        displayFormats: {
          hour: 'h a',  // e.g., 1 PM
          minute: 'h:mm a',  // fallback
        },
        tooltipFormat: 'PPpp',
      },
      grid: { color: 'white' },
      ticks: {
        color: 'white',
        maxRotation: 45,
        minRotation: 30,
        autoSkip: true,
        maxTicksLimit: 10, // reduce number of ticks shown
        align: 'center',
        padding: 10,
      },
    },
    y: {
      grid: { color: 'white' },
      ticks: { color: 'white' },
    },
  },
};


  return (
    <div className="w-full h-72">
      <Line data={chartData} options={options} />
    </div>
  );
}

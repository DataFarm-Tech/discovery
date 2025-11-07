'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the required chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface GraphProps {
  title: string;
  data: number[];
}

export default function Graph({ title, data }: GraphProps) {
  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => `${i + 1}`), // Create labels (1, 2, 3, ...)
    datasets: [
      {
        label: title,
        data: data,
        borderColor: '#ffffff', // White color for graph line
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Lighter background for the graph
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: 'white', // Set legend text color to white
          font: {
            size: 18, // Increase font size of legend text
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'white', // Set x-axis grid lines to white
        },
        ticks: {
          color: 'white', // Set x-axis ticks to white
        },
      },
      y: {
        grid: {
          color: 'white', // Set y-axis grid lines to white
        },
        ticks: {
          color: 'white', // Set y-axis ticks to white
        },
      },
    },
  };

  return (
    <div className="w-full h-72">
      <Line data={chartData} options={options} />
    </div>
  );
}

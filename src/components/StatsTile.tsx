'use client';

import { useEffect, useState } from 'react';

interface StatsTileProps {
  title: string;
  value: string | number;
  unit?: string;
  className?: string;  // Add this line to accept `className`
}

export default function StatsTile({ title, value, unit, className }: StatsTileProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const targetValue = Number(value); // Ensure the value is treated as a number
    let counter = 0;
    
    // Update the counter at 50ms intervals until it reaches the target value
    const intervalId = setInterval(() => {
      if (counter < targetValue) {
        counter += 1;
        setCount(counter);
      } else {
        clearInterval(intervalId); // Stop the interval once the target value is reached
      }
    }, 200);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [value]);

  return (
    <div className={`bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-6 w-full lg:w-1/4 ${className}`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-white flex justify-between items-baseline">
        <span>{count}</span>
        {unit && <span className="text-sm">{unit}</span>}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface StatsTileProps {
  title: string;
  value: string | number;
  unit?: string;
  className?: string; // Add this line to accept `className`
}

export default function StatsTile({
  title,
  value,
  unit,
  className,
}: StatsTileProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const targetValue = Number(value);
    const isDecimal = targetValue % 1 !== 0;

    if (isDecimal) {
      // For decimal values, animate smoothly to the target
      const duration = 800; // milliseconds
      const steps = 20;
      const increment = targetValue / steps;
      let currentStep = 0;

      const intervalId = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayValue(increment * currentStep);
        } else {
          setDisplayValue(targetValue);
          clearInterval(intervalId);
        }
      }, duration / steps);

      return () => clearInterval(intervalId);
    } else {
      // For whole numbers, count up by 1
      let counter = 0;
      const intervalId = setInterval(() => {
        if (counter < targetValue) {
          counter += 1;
          setDisplayValue(counter);
        } else {
          clearInterval(intervalId);
        }
      }, 200);

      return () => clearInterval(intervalId);
    }
  }, [value]);

  const formattedValue = Number(displayValue).toFixed(2);

  return (
    <div
      className={`bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-5 w-full ${className}`}
    >
      <h3 className="text-sm font-semibold text-white/80 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-[#00be64] flex items-baseline gap-2">
        <span>{formattedValue}</span>
        {unit && <span className="text-lg text-[#00be64]">{unit}</span>}
      </p>
    </div>
  );
}

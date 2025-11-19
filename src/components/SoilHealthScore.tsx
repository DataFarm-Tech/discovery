'use client';

import { useEffect, useState } from 'react';


interface Props {
  score: number; // 0–100
}

export default function SoilHealthScore({ score }: Props) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score from 0 → value
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(score / 40); // speed control
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 30);

    return () => clearInterval(interval);
  }, [score]);

  const circleRadius = 60;
  const circumference = 2 * Math.PI * circleRadius;
  const progress = (displayScore / 100) * circumference;

  return (
    <div className="bg-[#11172b] border border-[#00be64] rounded-2xl p-6 shadow-[0_0_18px_#00be6444] flex flex-col items-center justify-center">
      <h3 className="text-white/80 font-semibold mb-4">Soil Health Score</h3>

      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Outer glow */}
        <div className="absolute w-full h-full rounded-full blur-xl bg-[#00be64]/20"></div>

        {/* Circular progress ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={circleRadius}
            stroke="#1f2937"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r={circleRadius}
            stroke="#00be64"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Score number */}
        <div className="absolute text-center">
          <p className="text-4xl font-bold text-[#00be64]">{displayScore}</p>
          <p className="text-sm text-white/60 mt-1">/ 100</p>
        </div>
      </div>

      <p className="text-white/70 text-sm mt-4 text-center px-2">
        Higher scores indicate healthier, more balanced soil conditions.
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";

interface InfoPopupProps {
  title: string;
  description: string;
  ariaLabel?: string;
}

export default function InfoPopup({
  title,
  description,
  ariaLabel = "More information",
}: InfoPopupProps) {
  const [showInfo, setShowInfo] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowInfo(false);
      }
    };

    if (showInfo) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInfo]);

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="w-4 h-4 rounded-full border-2 border-gray-400 text-gray-400 hover:border-[#00be64] hover:text-[#00be64] transition-all flex items-center justify-center text-sm font-bold"
        aria-label={ariaLabel}
      >
        ?
      </button>
      {showInfo && (
        <div className="absolute top-8 left-0 z-50 w-80 bg-[#0f1419] border border-[#00be64] rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-[#00be64]">{title}</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
}

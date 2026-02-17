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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showInfo]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowInfo(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowInfo(false);
    }, 200);
  };

  const handleClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className="relative" ref={popupRef}>
      {/* Grey circle with italic "i" */}
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-5 h-5 rounded-full bg-gray-500 text-white flex items-center justify-center text-sm italic font-bold hover:bg-gray-400 transition-all"
        aria-label={ariaLabel}
      >
        i
      </button>

      {showInfo && (
        <div
          className="absolute top-8 left-0 z-50 w-80 bg-[#0f1419] border border-[#00be64] rounded-lg shadow-xl p-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
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

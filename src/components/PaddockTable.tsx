"use client";

import Link from "next/link";
import { cropType } from "@/lib/paddock";
import InfoPopup from "./InfoPopup";

export interface Paddock {
  paddock_id?: number;
  paddock_name: string;
  crop_type?: cropType;
  area?: number;
  plant_date: string;
}

export default function PaddockTable({
  paddocks,
  onAddPaddock,
}: {
  paddocks: Paddock[];
  onAddPaddock: () => void;
}) {
  const handlePaddockClick = (paddock: Paddock) => {
    sessionStorage.setItem(
      "paddockData",
      JSON.stringify({
        paddockId: paddock.paddock_id,
        paddockName: paddock.paddock_name,
        cropType: paddock.crop_type,
        area: paddock.area,
        plant_date: paddock.plant_date
      })
    );
  };

  return (
    <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative hover:border-[#00be64]/40 transition-all duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00be64]/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00be64]/10 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#00be64]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-xl font-bold text-white">My Zones</h2>
                <p className="text-gray-400 text-sm">Manage your farm areas</p>
              </div>
              <InfoPopup
                title="What is a Zone?"
                description="A zone is a designated area on your farm where you monitor soil health. Multiple devices can be placed within a zone to track moisture, temperature, pH, and nutrient levels. You can freely move devices between zones as your monitoring needs change."
                ariaLabel="What is a zone?"
              />
            </div>
          </div>
          <button
            onClick={onAddPaddock}
            className="px-4 py-1.5 text-sm text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
          >
            + Add Zone
          </button>
        </div>

        {/* Empty State */}
        {paddocks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#00be64]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#00be64]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Zones Yet
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Create your first zone to start monitoring soil health
            </p>
            <button
              onClick={onAddPaddock}
              className="px-6 py-2 text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
            >
              Create Your First Zone
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 pb-4 border-b border-white/10">
              <p className="text-sm text-gray-400">
                Total Zones:{" "}
                <span className="text-[#00be64] font-semibold">
                  {paddocks.length}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paddocks.map((paddock, index) => (
                <Link
                  key={paddock.paddock_id || index}
                  href="/paddock/view"
                  onClick={() => handlePaddockClick(paddock)}
                  className="bg-[#0f1318] border border-[#00be64]/10 rounded-xl p-5 hover:border-[#00be64]/30 hover:bg-[#121520] transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00be64]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00be64]/20 transition-all">
                      <svg
                        className="w-6 h-6 text-[#00be64]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white group-hover:text-[#00be64] transition-colors">
                        {paddock.paddock_name}
                      </h3>
                      {paddock.crop_type && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {paddock.crop_type}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
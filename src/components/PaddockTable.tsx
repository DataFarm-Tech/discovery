"use client";

import Link from "next/link";

export interface Paddock {
  paddock_id?: number;
  paddock_name: string;
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
      })
    );
  };

  return (
    <div className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow-lg p-6 flex-1 w-full">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Paddocks</h2>
        <button
          onClick={onAddPaddock}
          className="px-5 py-2.5 bg-[#00be64] text-white font-semibold rounded-lg hover:bg-[#009e53] transition-all transform hover:scale-105 shadow-md"
        >
          + Add Paddock
        </button>
      </div>

      {/* Empty State */}
      {paddocks.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-white mb-2">
            No Paddocks Yet
          </h3>
          <button
            onClick={onAddPaddock}
            className="px-6 py-3 bg-[#00be64] text-white font-semibold rounded-lg hover:bg-[#009e53] transition-all transform hover:scale-105 shadow-lg"
          >
            Create Your First Paddock
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Total Paddocks:{" "}
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
                className="bg-[#0f1419] border border-gray-700 rounded-lg p-5 hover:border-[#00be64] hover:shadow-lg transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00be64]/20 rounded-lg flex items-center justify-center">
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
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#00be64] transition-colors">
                      {paddock.paddock_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Paddock #{paddock.paddock_id || index + 1}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

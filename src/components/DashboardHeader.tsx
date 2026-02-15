"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";

interface DashboardHeaderProps {
  userName: string | null;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  paddocks?: Array<{
    paddock_id?: number;
    id?: number;
    paddock_name?: string;
    name?: string;
  }>;
  devices?: Array<{ node_id: string; node_name: string }>;
  onSearchItemSelect?: (item: any) => void;
}

export default function DashboardHeader({
  userName,
  menuOpen,
  setMenuOpen,
  searchQuery,
  setSearchQuery,
  paddocks = [],
  devices = [],
  onSearchItemSelect,
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="mb-8 flex justify-between items-center border-b border-white/20 pb-4">
      <div className="flex items-center gap-3">
        <button
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
          title="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-white">Discovery</h1>
      </div>

      {/* Use the SearchBar Component with data */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        paddocks={paddocks}
        devices={devices}
        onItemSelect={onSearchItemSelect}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/");
          }}
          className="px-4 py-1.5 text-sm text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
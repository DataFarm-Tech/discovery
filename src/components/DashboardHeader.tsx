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
          className="text-white/80 hover:text-white transition"
          title="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
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
          className="px-3 py-1 bg-[#00be64] text-white font-semibold rounded hover:bg-[#009e53] transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import StatsTile from "@/components/StatsTile";
import PaddockTable from "@/components/PaddockTable";
import { Device } from "@/components/DeviceTable";
import { Paddock } from "@/components/PaddockTable";
import { getPaddocks } from "@/lib/paddock";
import SoilHealthScore from "@/components/SoilHealthScore";
import CreatePaddockModal from "@/components/modals/CreatePaddockModal";
import WeatherWidget from "@/components/WeatherWidget";

// Load DeviceMap dynamically (Leaflet needs browser APIs)
const DeviceMap = dynamic(() => import("@/components/DeviceMap"), {
  ssr: false,
});

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatePaddockModalOpen, setIsCreatePaddockModalOpen] =
    useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first!");
      router.push("/");
    } else {
      setUserName("Lucas");
      setDevices([]);
      fetchPaddocks(token);
    }
  }, [router]);

  const fetchPaddocks = async (token: string) => {
    setLoading(true);
    try {
      const result = await getPaddocks(token);
      if (result.success) {
        setPaddocks(result.paddocks);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching paddocks:", error);
      toast.error("Failed to load paddocks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaddock = () => {
    setIsCreatePaddockModalOpen(true);
  };

  // Handler for when a search item is clicked
  const handleSearchItemSelect = (item: any) => {
    console.log("Selected search item:", item);

    // Handle Paddock
    if (item.paddock_id || item.id) {
      const paddockId = item.paddock_id || item.id;
      const paddockName = item.paddock_name || item.name || "Unnamed Paddock";

      sessionStorage.setItem(
        "paddockData",
        JSON.stringify({
          paddockId,
          paddockName,
        }),
      );
      router.push("/paddock/view");
      setSearchQuery(""); // Optional: clear search after selection
      return;
    }

    // Handle Device
    if (item.node_id) {
      sessionStorage.setItem(
        "selectedDevice",
        JSON.stringify({
          node_id: item.node_id,
          node_name: item.node_name || item.node_id,
        }),
      );
      router.push(`/device/view?nodeId=${item.node_id}`);
      setSearchQuery(""); // Optional: clear search
      return;
    }

    // Fallback (shouldn't happen)
    toast.error("Unable to navigate to selected item");
  };

  // Filter paddocks by search query
  const filteredPaddocks = paddocks.filter((p) =>
    (p.paddock_name || p.paddock_name || "")
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      {/* Header */}
      <DashboardHeader
        userName={userName}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Sidebar */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
        {/* Welcome + What's New Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative overflow-hidden group hover:border-[#00be64]/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00be64]/5 rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:bg-[#00be64]/10 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00be64]/10 border border-[#00be64]/30 rounded-full mb-4">
                <span className="w-2 h-2 bg-[#00be64] rounded-full animate-pulse" />
                <span className="text-xs font-medium text-[#00be64]">LIVE PLATFORM</span>
              </div>

              <h1 className="text-3xl font-bold mb-3">
                Welcome to Discovery
              </h1>

              <p className="text-gray-300 text-base leading-relaxed mb-4">
                Your all-in-one soil intelligence platform. Monitor soil health, track zone performance, and make data-driven decisions with real-time insights from your on-ground sensors.
              </p>

              <p className="text-gray-400 text-sm leading-relaxed">
                Analyze moisture, temperature, and nutrient trends to farm smarter—not harder.
              </p>

              {/* App Store Badges - Mobile Only */}
              <div className="flex gap-3 mt-6 lg:hidden">
                <img
                  src="/appstore.png"
                  alt="App Store"
                  className="h-10 opacity-70 hover:opacity-100 transition cursor-pointer"
                />
                <img
                  src="/googleplay.png"
                  alt="Google Play"
                  className="h-10 opacity-70 hover:opacity-100 transition cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* What's New Card */}
          <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative overflow-hidden hover:border-[#00be64]/40 transition-all duration-300">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00be64]/5 rounded-full blur-3xl translate-y-24 -translate-x-24" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#00be64]/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <h2 className="text-xl font-bold">What's New</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-[#00be64] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium text-sm mb-1">Enhanced Zone Management</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">Create and organize zones with an intuitive interface</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-[#00be64] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium text-sm mb-1">Real-Time Search</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">Quickly find zones and devices with smart search</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-[#00be64] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium text-sm mb-1">Enhanced Zone Information</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">Understand more about your soil with added context</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500">Version 0.0.2 • More updates coming soon</p>
              </div>
            </div>
          </div>
        </section>
        
        
        
        {/* Search Bar Section */}
        <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative hover:border-[#00be64]/40 transition-all duration-300">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#00be64]/5 rounded-full blur-3xl -translate-y-32 -translate-x-32 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#00be64]/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#00be64]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Quick Search</h2>
                <p className="text-gray-400 text-sm">Find zones and devices instantly</p>
              </div>
            </div>

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              paddocks={paddocks}
              devices={devices}
              onItemSelect={handleSearchItemSelect}
            />
          </div>
        </section>

        <WeatherWidget />
        
        {/* Paddock Table */}
        <section className="pb-6">
          {loading ? (
            <div className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-8">
              <div className="flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <p className="text-white ml-2">Loading zones...</p>
              </div>
            </div>
          ) : (
            <PaddockTable
              paddocks={filteredPaddocks}
              onAddPaddock={handleAddPaddock}
            />
          )}
        </section>
      </div>

      <CreatePaddockModal
        isOpen={isCreatePaddockModalOpen}
        onClose={() => setIsCreatePaddockModalOpen(false)}
        onSuccess={() => {
          const token = localStorage.getItem("token");
          if (token) {
            fetchPaddocks(token);
          }
        }}
      />
    </main>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import StatsTile from "@/components/StatsTile";
import PaddockTable from "@/components/PaddockTable";
import { Device } from "@/components/DeviceTable";
import { Paddock } from "@/components/PaddockTable";
import { getPaddocks } from "@/lib/paddock";
import SoilHealthScore from "@/components/SoilHealthScore";
import CreatePaddockModal from "@/components/CreatePaddockModal";

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
  const [searchQuery, setSearchQuery] = useState('');
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
  console.log('Selected search item:', item);

  // Handle Paddock
  if (item.paddock_id || item.id) {
    const paddockId = item.paddock_id || item.id;
    const paddockName = item.paddock_name || item.name || 'Unnamed Paddock';

    sessionStorage.setItem(
      "paddockData",
      JSON.stringify({
        paddockId,
        paddockName,
      })
    );
    router.push("/paddock/view");
    setSearchQuery(''); // Optional: clear search after selection
    return;
  }

  // Handle Device
  if (item.node_id) {
    sessionStorage.setItem(
      "selectedDevice",
      JSON.stringify({
        node_id: item.node_id,
        node_name: item.node_name || item.node_id,
      })
    );
    router.push(`/device/view?nodeId=${item.node_id}`);
    setSearchQuery(''); // Optional: clear search
    return;
  }

  // Fallback (shouldn't happen)
  toast.error("Unable to navigate to selected item");
};

  // Filter paddocks by search query
  const filteredPaddocks = paddocks.filter(p =>
    (p.paddock_name || p.paddock_name || '')?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      {/* Header */}
      <DashboardHeader
        userName={userName}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        paddocks={paddocks}
        devices={devices}
        onSearchItemSelect={handleSearchItemSelect}
      />

      {/* Sidebar */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto space-y-10">
        {/* 🌱 Welcome + Soil Score Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Welcome */}
          <div className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-8 relative overflow-hidden col-span-2">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00be64]/10 to-transparent pointer-events-none" />

            <h1 className="text-3xl font-bold mb-3 relative z-10">
              Welcome to <span className="text-[#00be64]">Discovery</span>
            </h1>

            <p className="text-gray-300 max-w-3xl text-lg leading-relaxed relative z-10">
              Discovery is your all-in-one{" "}
              <span className="text-white font-semibold">
                Soil Intelligence Platform
              </span>
              , helping you monitor soil health, track paddock performance, and
              make data-driven decisions with real-time insights from your
              on-ground sensors.
            </p>

            <p className="mt-3 text-gray-400 max-w-2xl relative z-10">
              Whether you're analysing moisture, temperature, or nutrient
              trends, Discovery gives you the tools to farm smarter — not
              harder.
            </p>

            {/* Mobile hint to get the app */}
            <div className="flex gap-4 mt-6 relative z-10 lg:hidden">
              <img
                src="/appstore.png"
                alt="App Store"
                className="h-10 opacity-80 hover:opacity-100 transition"
              />
              <img
                src="/googleplay.png"
                alt="Google Play"
                className="h-10 opacity-80 hover:opacity-100 transition"
              />
            </div>
          </div>
        </section>

        {/* 🌾 Product Education Section */}
        <section className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00be64]/5 to-transparent pointer-events-none" />

          <h2 className="text-2xl font-bold mb-4 relative z-10">
            Learn How to Get the Most From{" "}
            <span className="text-[#00be64]">Discovery</span>
          </h2>

          <p className="text-gray-300 mb-8 max-w-3xl relative z-10">
            Whether you're new to soil monitoring or looking to sharpen your
            agronomy skills, these guides will help you get more value from your
            sensors, paddocks, and soil intelligence data.
          </p>

          {/* Education Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Card 1 */}
            <div className="bg-[#0f1525] border border-[#00be64]/20 rounded-xl p-6 hover:border-[#00be64]/40 transition shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                📡 Understanding Your Sensors
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Learn how your Discovery probes capture soil moisture, pH, and
                temperature data.
              </p>
              <button className="text-[#00be64] hover:text-[#00d978] font-medium text-sm">
                Read more →
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0f1525] border border-[#00be64]/20 rounded-xl p-6 hover:border-[#00be64]/40 transition shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                🌱 Improving Soil Health
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Practical steps to increase microbial activity, fertility, and
                long-term soil resilience.
              </p>
              <button className="text-[#00be64] hover:text-[#00d978] font-medium text-sm">
                Learn how →
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0f1525] border border-[#00be64]/20 rounded-xl p-6 hover:border-[#00be64]/40 transition shadow-lg">
              <h3 className="text-xl font-semibold mb-2">
                📊 Using Data for Better Decisions
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Turn your real-time measurements into meaningful farm insights
                and crop strategies.
              </p>
              <button className="text-[#00be64] hover:text-[#00d978] font-medium text-sm">
                Start learning →
              </button>
            </div>
          </div>
        </section>

        {/* Paddock Table */}
        <section className="flex flex-col lg:flex-row gap-4 mb-4">
          {loading ? (
            <div className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-4 flex-1 w-full">
              <p className="text-white text-center">Loading paddocks...</p>
            </div>
          ) : (
            <PaddockTable paddocks={filteredPaddocks} onAddPaddock={handleAddPaddock} />
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


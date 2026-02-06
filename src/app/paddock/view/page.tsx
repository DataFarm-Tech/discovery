"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import DeviceTable, { Device } from "@/components/DeviceTable";
import SoilHealthScore from "@/components/SoilHealthScore";
import { MdDelete, MdEdit, MdArrowBack } from "react-icons/md";
import {
  getPaddockDevices,
  updatePaddockName,
  deletePaddock,
  PaddockType,
  getPaddockSensorAverages,
} from "@/lib/paddock";
import toast from "react-hot-toast";
import RegisterDeviceModal from "@/components/modals/RegisterDeviceModal";
import EditPaddockModal from "@/components/modals/EditPaddockModal";
import DeletePaddockModal from "@/components/modals/DeletePaddockModal";
import RecentAverages from "@/components/RecentAverages";

// Lazy-load map component
const DeviceMap = dynamic(() => import("@/components/DeviceMap"), {
  ssr: false,
});

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [nodeLocations, setNodeLocations] = useState<
    Array<{ node_id: string; node_name: string; lat: number; lon: number }>
  >([]);
  const [sensorAverages, setSensorAverages] = useState<{
    [key: string]: number;
  }>({});
  const [soilHealthScore, setSoilHealthScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [paddockId, setPaddockId] = useState<string | null>(null);
  const [paddockName, setPaddockName] = useState<string>("");
  const [paddockType, setPaddockType] = useState<PaddockType>("default");
  const [newPaddockType, setNewPaddockType] = useState<PaddockType>("default");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("paddockData");
    if (data) {
      const { paddockId, paddockName, paddockType } = JSON.parse(data);
      setPaddockId(paddockId?.toString() || null);
      setPaddockName(paddockName || "");
      setPaddockType(paddockType || "default");
    }
  }, []);

  // Function to compute soil health score from sensor averages
  const computeSoilHealthScore = (averages: {
    [key: string]: number;
  }): number => {
    let score = 0;
    let weightSum = 0;

    // Temperature contribution (optimal range 15-25°C)
    if (averages.temperature !== undefined) {
      const temp = averages.temperature;
      let tempScore = 0;
      if (temp >= 15 && temp <= 25) {
        tempScore = 100;
      } else if (temp >= 10 && temp < 15) {
        tempScore = 50 + (temp - 10) * 10;
      } else if (temp > 25 && temp <= 30) {
        tempScore = 100 - (temp - 25) * 20;
      } else {
        tempScore = Math.max(0, 50 - Math.abs(temp - 20) * 5);
      }
      score += tempScore * 0.35;
      weightSum += 0.35;
    }

    // pH contribution (optimal range 6-7)
    if (averages.ph !== undefined) {
      const ph = averages.ph;
      let phScore = 0;
      if (ph >= 6 && ph <= 7) {
        phScore = 100;
      } else if (ph >= 5.5 && ph < 6) {
        phScore = 50 + (ph - 5.5) * 100;
      } else if (ph > 7 && ph <= 7.5) {
        phScore = 100 - (ph - 7) * 20;
      } else {
        phScore = Math.max(0, 50 - Math.abs(ph - 6.5) * 10);
      }
      score += phScore * 0.35;
      weightSum += 0.35;
    }

    // Moisture contribution (optimal range 40-60%)
    if (averages.moisture !== undefined) {
      const moisture = averages.moisture;
      let moistureScore = 0;
      if (moisture >= 40 && moisture <= 60) {
        moistureScore = 100;
      } else if (moisture >= 30 && moisture < 40) {
        moistureScore = 50 + (moisture - 30) * 5;
      } else if (moisture > 60 && moisture <= 80) {
        moistureScore = 100 - (moisture - 60) * 2;
      } else {
        moistureScore = Math.max(0, 50 - Math.abs(moisture - 50) * 2);
      }
      score += moistureScore * 0.3;
      weightSum += 0.3;
    }

    // Normalize score if we have some data
    if (weightSum > 0) {
      return Math.round(score / weightSum);
    }

    return 0;
  };

  const fetchDevices = async () => {
    if (!paddockId) return;

    try {
      const token = localStorage.getItem("token") || "";
      const result = await getPaddockDevices(paddockId, token);
      if (result.success) {
        const mapped: Device[] = result.devices.map((d: any) => ({
          node_id: d.node_id,
          node_name: d.node_name || "",
          battery: d.battery,
          lat: d.lat,
          lon: d.lon,
        }));
        setDevices(mapped);

        // Update node locations with mock GPS data
        const locations = mapped.map((device, index) => ({
          node_id: device.node_id,
          node_name: device.node_name,
          lat: device.lat || 37.7749 + index * 0.001,
          lon: device.lon || -122.4194 + index * 0.001,
        }));
        setNodeLocations(locations);
      }
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    }
  };

  useEffect(() => {
    if (!paddockId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token") || "";

        // Fetch devices
        await fetchDevices();

        // Fetch sensor averages
        const averagesResult = await getPaddockSensorAverages(paddockId, token);
        if (averagesResult.success && averagesResult.sensor_averages) {
          setSensorAverages(averagesResult.sensor_averages);
          const computedScore = computeSoilHealthScore(
            averagesResult.sensor_averages,
          );
          setSoilHealthScore(computedScore);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paddockId]);

  const handleAddDevice = () => {
    if (paddockId) {
      setIsModalOpen(true);
    }
  };

  const handleEditPaddock = async (newName: string, newType: PaddockType) => {
    if (!paddockId) throw new Error("No paddock selected");

    const token = localStorage.getItem("token") || "";
    const result = await updatePaddockName(paddockId, newName, newType, token);

    if (result.success) {
      sessionStorage.setItem(
        "paddockData",
        JSON.stringify({
          paddockId: paddockId,
          paddockName: newName,
          paddockType: newType,
        }),
      );

      setPaddockName(newName);
      setPaddockType(newType);
      setIsEditModalOpen(false);
    } else {
      throw new Error(result.message);
    }
  };

  const handleDeviceClick = (device: Device) => {
    router.push(`/device/view?nodeId=${device.node_id}`);
  };

  const handleDeletePaddock = async () => {
    if (!paddockId) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const result = await deletePaddock(paddockId, token);

      if (result.success) {
        toast.success(result.message);
        sessionStorage.removeItem("paddockData");
        setIsDeleteModalOpen(false);
        router.push("/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error("Failed to delete paddock");
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchItemSelect = (item: any) => {
    console.log("Selected item:", item);
    if (item.node_id) {
      router.push(`/device/view?nodeId=${item.node_id}`);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      <DashboardHeader
        userName="Lucas"
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        paddocks={[]}
        devices={devices}
        onSearchItemSelect={handleSearchItemSelect}
      />

      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-6">
        {paddockId ? (
          <div className="w-full max-w-7xl space-y-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-lg"
            >
              <MdArrowBack
                size={24}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back to Dashboard</span>
            </button>

            <section className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">
                  {paddockName || `Paddock #${paddockId}`}
                  {paddockType && (
                    <span className="ml-3 text-xl text-gray-400 font-normal">
                      ({paddockType})
                    </span>
                  )}
                </h1>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2.5 bg-[#00be64]/20 hover:bg-[#00be64]/30 rounded-lg transition-all group"
                    title="Edit paddock"
                  >
                    <MdEdit
                      size={20}
                      color="#00be64"
                      className="group-hover:scale-110 transition-transform"
                    />
                  </button>

                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all group"
                    title="Delete paddock"
                  >
                    <MdDelete
                      size={20}
                      color="#ef4444"
                      className="group-hover:scale-110 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00be64]/10 to-transparent pointer-events-none" />
              <h2 className="text-2xl font-semibold mb-6 relative z-10">
                Soil Health Overview
              </h2>
              <div className="flex justify-center">
                <SoilHealthScore score={soilHealthScore} />
              </div>
              <p className="text-gray-400 text-center mt-6 max-w-xl mx-auto relative z-10">
                Soil health is calculated using microbial activity, organic
                matter, moisture balance, and nutrient availability from your
                active sensors.
              </p>
            </section>

            <RecentAverages paddockId={paddockId} />

            {loading && <p className="text-gray-400">Loading devices...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* DEVICE TABLE */}
                <div className="w-full">
                  <DeviceTable
                    devices={devices}
                    onAddDevice={handleAddDevice}
                    onDeviceClick={handleDeviceClick}
                  />
                </div>

                {/* DEVICE MAP */}
                {nodeLocations.length > 0 && (
                  <section className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-6 w-full relative z-0">
                    <h2 className="text-2xl font-semibold mb-6">
                      Device Locations
                    </h2>
                    <div className="rounded-xl overflow-hidden h-[500px] w-full relative z-0">
                      <DeviceMap nodes={nodeLocations} />
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">No paddock selected.</p>
        )}
      </div>

      {paddockId && (
        <RegisterDeviceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          paddockId={Number(paddockId)}
          devices={devices}
          onSuccess={fetchDevices}
        />
      )}

      <EditPaddockModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={paddockName}
        currentType={paddockType}
        onSave={handleEditPaddock}
      />

      <DeletePaddockModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        paddockName={paddockName}
        paddockId={paddockId || ""}
        onDelete={handleDeletePaddock}
        loading={deleteLoading}
      />
    </main>
  );
}

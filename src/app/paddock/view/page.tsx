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
  updatePaddockName,
  deletePaddock,
  cropType,
  getPaddockSensorAverages,
} from "@/lib/paddock";
import { getDeviceData } from "@/lib/device";
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
  const [nodeLocations, setNodeLocations] = useState<Array<{ node_id: string; node_name: string; lat: number; lon: number }>>([]);
  const [sensorAverages, setSensorAverages] = useState<{
    [key: string]: number;
  }>({});
  const [soilHealthScore, setSoilHealthScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [paddockId, setPaddockId] = useState<string | null>(null);
  const [paddockName, setPaddockName] = useState<string>("");
  const [cropType, setcropType] = useState<cropType>("default");
  const [paddockArea, setPaddockArea] = useState<string>("");
  const [plantDate, setPlantDate] = useState<string>("");
  const [newcropType, setNewcropType] = useState<cropType>("default");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("paddockData");
    if (data) {
      const { paddockId, paddockName, cropType, area, plant_date } = JSON.parse(data);
      setPaddockId(paddockId?.toString() || null);
      setPaddockName(paddockName || "");
      setcropType(cropType || "default");
      setPaddockArea(area?.toString() || "");
      setPlantDate(plant_date || "");
    }
  }, []);

  // Format date for display
  const formatPlantDate = (dateString: string) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Calculate days since planting (can be negative for future dates)
  const getDaysSincePlanting = (dateString: string) => {
    if (!dateString) return null;
    try {
      const plantDate = new Date(dateString);
      const today = new Date();
      const diffTime = today.getTime() - plantDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  // Format the days message
  const formatDaysMessage = (days: number | null) => {
    if (days === null) return null;
    if (days === 0) return "Today";
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    return `in ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  };

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

  type StoredDevice = {
    node_id: string;
    node_name?: string;
    paddock_id?: number | string;
    gps?: string;
    battery?: number;
    lat?: number;
    lon?: number;
  };

  const parseGps = (gps?: string): { lat: number; lon: number } | null => {
    if (!gps) return null;
    const parts = gps.split(",").map((part) => part.trim());
    if (parts.length !== 2) return null;
    const lat = Number(parts[0]);
    const lon = Number(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  };

  const loadDevicesFromStorage = () => {
    if (!paddockId) return;

    const stored = sessionStorage.getItem("deviceList");
    if (!stored) {
      setDevices([]);
      setNodeLocations([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredDevice[];
      const filtered = parsed.filter(
        (device) => String(device.paddock_id) === String(paddockId),
      );

      const mapped: Device[] = filtered.map((device) => {
        const gps = parseGps(device.gps);
        return {
          node_id: device.node_id,
          node_name: device.node_name || "",
          battery: device.battery,
          lat: device.lat ?? gps?.lat,
          lon: device.lon ?? gps?.lon,
        };
      });

      setDevices(mapped);

      const locations = mapped.map((device, index) => ({
        node_id: device.node_id,
        node_name: device.node_name,
        lat: device.lat ?? 37.7749 + index * 0.001,
        lon: device.lon ?? -122.4194 + index * 0.001,
      }));
      setNodeLocations(locations);
    } catch (err) {
      console.error("Failed to parse stored devices:", err);
      setDevices([]);
      setNodeLocations([]);
    }
  };

  const handleDeviceAdded = (device?: {
    node_id: string;
    node_name?: string;
    paddock_id: number;
  }) => {
    if (!device) {
      loadDevicesFromStorage();
      return;
    }

    try {
      const stored = sessionStorage.getItem("deviceList");
      const list = stored ? (JSON.parse(stored) as StoredDevice[]) : [];
      const exists = list.some((item) => item.node_id === device.node_id);

      if (!exists) {
        list.push({
          node_id: device.node_id,
          node_name: device.node_name,
          paddock_id: device.paddock_id,
        });
        sessionStorage.setItem("deviceList", JSON.stringify(list));
      }
    } catch (err) {
      console.error("Failed to update stored devices:", err);
    }

    loadDevicesFromStorage();
  };

  useEffect(() => {
    if (!paddockId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token") || "";
        // Fetch devices for this paddock from session storage
        loadDevicesFromStorage();

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

  const handleEditPaddock = async (newName: string, newType: cropType, newArea: string) => {
    if (!paddockId) throw new Error("No paddock selected");

    // Convert string to number
    const areaValue = parseFloat(newArea);
    
    // Validate that it's a valid number
    if (isNaN(areaValue)) {
      throw new Error("Area must be a valid number");
    }

    const token = localStorage.getItem("token") || "";
    const result = await updatePaddockName(paddockId, newName, newType, areaValue, token);

    if (result.success) {
      sessionStorage.setItem(
        "paddockData",
        JSON.stringify({
          paddockId: paddockId,
          paddockName: newName,
          cropType: newType,
          area: areaValue,
          plant_date: plantDate,
        }),
      );

      setPaddockName(newName);
      setcropType(newType);
      setPaddockArea(newArea);
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

  const handleExportPaddockCsv = async () => {
    if (!paddockId) {
      toast.error("No zone selected");
      return;
    }

    if (!devices.length) {
      toast.error("No devices available in this zone");
      return;
    }

    setExportLoading(true);

    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        toast.error("You must be logged in to export data");
        return;
      }

      const readingTypes = [
        "moisture",
        "ph",
        "temperature",
        "nitrogen",
        "potassium",
        "phosphorus",
      ] as const;

      const cacheTtlMs = 5 * 60 * 1000;

      const getSensorUnit = (sensorType: string): string => {
        const units: Record<string, string> = {
          moisture: "%",
          ph: "pH",
          temperature: "°C",
          nitrogen: "ppm",
          potassium: "ppm",
          phosphorus: "ppm",
        };
        return units[sensorType] || "";
      };

      const getSensorStatus = (
        sensorType: string,
        value: number,
      ): "ok" | "low" | "high" | "critical" => {
        const ranges: Record<string, { min: number; max: number }> = {
          moisture: { min: 40, max: 60 },
          ph: { min: 6.0, max: 7.0 },
          temperature: { min: 15, max: 25 },
          nitrogen: { min: 80, max: 120 },
          potassium: { min: 120, max: 180 },
          phosphorus: { min: 40, max: 60 },
        };

        const range = ranges[sensorType] || { min: 0, max: 100 };
        const span = range.max - range.min;
        const criticalMargin = span * 0.2;

        if (value < range.min - criticalMargin || value > range.max + criticalMargin) {
          return "critical";
        }
        if (value < range.min) return "low";
        if (value > range.max) return "high";
        return "ok";
      };

      const requests = devices.flatMap((device) =>
        readingTypes.map(async (readingType) => {
          const cacheKey = `paddockExport:${paddockId}:${device.node_id}:${readingType}`;

          let response: Awaited<ReturnType<typeof getDeviceData>> | null = null;

          try {
            const cachedRaw = sessionStorage.getItem(cacheKey);
            if (cachedRaw) {
              const cached = JSON.parse(cachedRaw) as {
                fetchedAt: number;
                response: Awaited<ReturnType<typeof getDeviceData>>;
              };
              if (
                cached?.fetchedAt &&
                Date.now() - cached.fetchedAt <= cacheTtlMs &&
                cached?.response
              ) {
                response = cached.response;
              }
            }
          } catch {
            // Ignore cache parsing issues and continue with live fetch.
          }

          if (!response) {
            response = await getDeviceData(
              { nodeId: device.node_id, readingType },
              token,
            );

            try {
              if (response.success) {
                sessionStorage.setItem(
                  cacheKey,
                  JSON.stringify({ fetchedAt: Date.now(), response }),
                );
              }
            } catch {
              // Ignore cache write issues.
            }
          }

          if (!response?.success || !response.node?.readings?.length) {
            return [] as Array<{
              zone_name: string;
              device_name: string;
              sensor_type: string;
              reading_value: string | number;
              unit: string;
              timestamp_local: string;
              status: "ok" | "low" | "high" | "critical";
              timestamp_ms: number;
            }>;
          }

          return response.node.readings.map((reading) => {
            const parsedDate = new Date(reading.timestamp);
            const readingValue = Number(reading.reading_val);
            const timestampMs = parsedDate.getTime();

            return {
              zone_name: paddockName || `Zone ${paddockId}`,
              device_name: response.node?.node_name || device.node_name || device.node_id,
              sensor_type: readingType,
              reading_value: reading.reading_val,
              unit: getSensorUnit(readingType),
              timestamp_local: Number.isNaN(timestampMs)
                ? reading.timestamp
                : parsedDate.toLocaleString(),
              status: Number.isFinite(readingValue)
                ? getSensorStatus(readingType, readingValue)
                : "ok",
              timestamp_ms: Number.isNaN(timestampMs) ? Number.MAX_SAFE_INTEGER : timestampMs,
            };
          });
        }),
      );

      const responses = await Promise.allSettled(requests);
      const rows = responses.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      );

      if (!rows.length) {
        toast.error("No sensor readings found to export for this zone");
        return;
      }

      rows.sort(
        (a, b) => a.timestamp_ms - b.timestamp_ms,
      );

      const escapeCsv = (value: string | number | null | undefined) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

      const headers = [
        "zone_name",
        "device_name",
        "sensor_type",
        "reading_value",
        "unit",
        "timestamp_local",
        "status",
      ];

      const csvBody = rows.map((row) =>
        [
          escapeCsv(row.zone_name),
          escapeCsv(row.device_name),
          escapeCsv(row.sensor_type),
          escapeCsv(row.reading_value),
          escapeCsv(row.unit),
          escapeCsv(row.timestamp_local),
          escapeCsv(row.status),
        ].join(","),
      );

      const csv = `\uFEFF${headers.join(",")}\n${csvBody.join("\n")}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safePaddockId = String(paddockId).replace(/[^a-zA-Z0-9-_]/g, "_");
      const safeZoneName = (paddockName || `Zone_${paddockId}`).replace(/[^a-zA-Z0-9-_]/g, "_");
      const dateStamp = new Date().toISOString().slice(0, 10);
      link.download = `${safeZoneName}_${safePaddockId}_all_sensors_v2_${dateStamp}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Zone data exported successfully");
    } catch (err) {
      console.error("Failed to export paddock data:", err);
      toast.error("Failed to export zone data");
    } finally {
      setExportLoading(false);
    }
  };

  const daysSincePlanting = getDaysSincePlanting(plantDate);

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      <DashboardHeader
        userName="Lucas"
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
  <div className="mx-auto w-full max-w-6xl space-y-8 pb-6">

        {paddockId ? (
          <div className="space-y-8 pb-6">
            {/* Back Button */}
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95 group"
            >
              <MdArrowBack
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back</span>
            </button>

            {/* Zone Header */}
            <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative overflow-hidden hover:border-[#00be64]/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00be64]/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00be64]/10 border border-[#00be64]/30 rounded-full mb-4">
                      <svg className="w-4 h-4 text-[#00be64]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-xs font-medium text-[#00be64]">ZONE DETAILS</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {paddockName || `Zone #${paddockId}`}
                    </h1>
                    {cropType && cropType !== "default" && (
                      <p className="text-gray-400 text-lg">{cropType}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPaddockCsv}
                      disabled={exportLoading || devices.length === 0}
                      className="p-2.5 text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-white/80 disabled:hover:border-white/20 disabled:hover:bg-transparent"
                      title="Export zone CSV"
                    >
                      {exportLoading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="p-2.5 text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-lg transition-all duration-200 active:scale-95 group"
                      title="Edit zone"
                    >
                      <MdEdit size={20} />
                    </button>

                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="p-2.5 text-white/80 hover:text-red-400 border border-white/20 hover:border-red-400/50 hover:bg-white/5 rounded-lg transition-all duration-200 active:scale-95 group"
                      title="Delete zone"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Area Card */}
                  <div className="bg-[#0f1318] border border-[#00be64]/10 rounded-xl p-4 flex items-center gap-4 hover:border-[#00be64]/30 transition-all">
                    <div className="bg-[#00be64]/10 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-[#00be64]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Area</p>
                      <p className="text-white text-xl font-bold">
                        {paddockArea ? `${paddockArea} ha` : "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Crop Type Card */}
                  <div className="bg-[#0f1318] border border-[#00be64]/10 rounded-xl p-4 flex items-center gap-4 hover:border-[#00be64]/30 transition-all">
                    <div className="bg-[#00be64]/10 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-[#00be64]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Crop Type</p>
                      <p className="text-white text-xl font-bold">
                        {cropType && cropType !== "default" ? cropType : "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Plant Date Card */}
                  <div className="bg-[#0f1318] border border-[#00be64]/10 rounded-xl p-4 flex items-center gap-4 hover:border-[#00be64]/30 transition-all">
                    <div className="bg-[#00be64]/10 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-[#00be64]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Planted</p>
                      <p className="text-white text-base font-semibold">
                        {formatPlantDate(plantDate)}
                      </p>
                      {daysSincePlanting !== null && (
                        <p className={`text-xs ${daysSincePlanting >= 0 ? 'text-[#00be64]' : 'text-blue-400'}`}>
                          {formatDaysMessage(daysSincePlanting)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Soil Health Section */}
            {/* <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative overflow-hidden hover:border-[#00be64]/40 transition-all duration-300">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00be64]/5 rounded-full blur-3xl translate-y-32 -translate-x-32" />
              
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Soil Health Overview</h2>
                  <p className="text-gray-400 text-sm">
                    Real-time soil health assessment from your active sensors
                  </p>
                </div>
                
                <div className="flex justify-center mb-6">
                  <SoilHealthScore score={soilHealthScore} />
                </div>
                
                <p className="text-gray-400 text-center text-sm max-w-2xl mx-auto">
                  Calculated using microbial activity, organic matter, moisture balance, and nutrient availability
                </p>
              </div>
            </section> */}

            {/* Recent Averages */}
            <RecentAverages paddockId={paddockId} />

            {/* Loading/Error States */}
            {loading && (
              <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#00be64] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <p className="text-white ml-2">Loading devices...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-red-500/20 rounded-2xl p-8">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Devices and Map */}
            {!loading && !error && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Device Table */}
    <DeviceTable
      devices={devices}
      onAddDevice={handleAddDevice}
      onDeviceClick={handleDeviceClick}
    />

    {/* Map or Placeholder */}
    <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative overflow-hidden hover:border-[#00be64]/40 transition-all duration-300">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#00be64]/5 rounded-full blur-3xl -translate-y-32 -translate-x-32" />

      <div className="relative z-10 h-[500px] flex flex-col">
  {/* Header aligned top-left */}
  <div className="flex items-center gap-3 mb-4">
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
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </div>
    <div>
      <h2 className="text-xl font-bold text-white">Device Locations</h2>
      <p className="text-gray-400 text-sm">View all devices on the map</p>
    </div>
  </div>

  {/* Map */}
  {/* Map */}
<div className="flex-1 rounded-xl overflow-hidden border border-white/5 relative">
  {nodeLocations.length > 0 ? (
    <DeviceMap nodes={nodeLocations} />
  ) : (
    <div className="flex flex-col items-center justify-center h-full w-full border border-white/10 rounded-xl bg-[#0f1318] text-gray-400 text-center p-4 relative">
      <svg
        className="w-12 h-12 mb-4 text-[#00be64]/50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <p className="text-gray-400 mb-4">No map data available</p>

      {/* Add Device Button (copied from DeviceTable) */}
      <button
        onClick={handleAddDevice}
        className="flex items-center gap-2 px-4 py-1.5 text-sm text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
      >
        + Add Device
      </button>
    </div>
  )}
</div>

</div>

    </section>
  </div>
)}

          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-16 text-center">
            <p className="text-gray-400 text-lg">No zone selected.</p>
          </div>
        )}
      </div>

      {paddockId && (
        <RegisterDeviceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          paddockId={Number(paddockId)}
          devices={devices}
          onSuccess={handleDeviceAdded}
        />
      )}

      <EditPaddockModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={paddockName}
        currentType={cropType}
        currentArea={paddockArea}
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

      </div>
    </main>
  );
}
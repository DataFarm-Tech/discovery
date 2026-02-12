"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Graph from "@/components/Graph";
import {
  getDeviceData,
  DeviceDataResponse,
  editDeviceName,
} from "@/lib/device";
import InfoPopup from "@/components/InfoPopup";
import { MdDelete, MdEdit, MdArrowBack } from "react-icons/md";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import EditDeviceNameModal from "@/components/modals/EditDeviceNameModal";
import DeleteDeviceModal from "@/components/modals/DeleteDeviceModal";

// Hard-coded battery level
const BATTERY_PERCENT = 87;

function DeviceViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nodeId = searchParams.get("nodeId");

  const [moistureData, setMoistureData] = useState<
    DeviceDataResponse["node"] | null
  >(null);
  const [phData, setPhData] = useState<DeviceDataResponse["node"] | null>(null);
  const [temperatureData, setTemperatureData] = useState<
    DeviceDataResponse["node"] | null
  >(null);
  const [nitrogenData, setNitrogenData] = useState<
    DeviceDataResponse["node"] | null
  >(null);
  const [potassiumData, setPotassiumData] = useState<
    DeviceDataResponse["node"] | null
  >(null);
  const [phosphorusData, setPhosphorusData] = useState<
    DeviceDataResponse["node"] | null
  >(null);
  const [selectedGraph, setSelectedGraph] = useState<
    "moisture" | "ph" | "temperature" | "nitrogen" | "potassium" | "phosphorus"
  >("moisture");
  const [timePeriod, setTimePeriod] = useState<
    "week" | "month" | "6months" | "year" | "all"
  >("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paddockType, setPaddockType] = useState<string>("default");
  const [paddockId, setPaddockId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [moistureTrend, setMoistureTrend] = useState<{
    trend: "up" | "down" | "stable" | "no-data";
    percentChange: number;
  }>({ trend: "no-data", percentChange: 0 });
  const [temperatureTrend, setTemperatureTrend] = useState<{
    trend: "up" | "down" | "stable" | "no-data";
    percentChange: number;
  }>({ trend: "no-data", percentChange: 0 });
  const [nitrogenTrend, setNitrogenTrend] = useState<{
    trend: "up" | "down" | "stable" | "no-data";
    percentChange: number;
  }>({ trend: "no-data", percentChange: 0 });
  const [phTrend, setPhTrend] = useState<{
    trend: "up" | "down" | "stable" | "no-data";
    percentChange: number;
  }>({ trend: "no-data", percentChange: 0 });
  const [potassiumTrend, setPotassiumTrend] = useState<{
    trend: "up" | "down" | "stable" | "no-data";
    percentChange: number;
  }>({ trend: "no-data", percentChange: 0 });
  const [phosphorusTrend, setPhosphorusTrend] = useState<{
    trend: "up" | "down" | "stable" | "no-data";
    percentChange: number;
  }>({ trend: "no-data", percentChange: 0 });

  function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function timeAgo(ts: string) {
    const now = Date.now();
    const then = new Date(ts).getTime();
    const diff = (now - then) / 1000;

    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function deviceStatus(ts: string | null) {
    if (!ts) return { label: "Unknown", color: "gray", online: false };

    const now = Date.now();
    const then = new Date(ts).getTime();
    const hours = (now - then) / 1000 / 3600;

    if (hours > 12) {
      return { label: "Offline", color: "red", online: false };
    }
    return { label: "Online", color: "green", online: true };
  }

  // Calculate trend by comparing recent readings to previous period
  function calculateTrend(readings: any[] | undefined): {
    trend: "up" | "down" | "stable" | "no-data";
    percentChange: number;
  } {
    if (!readings || readings.length < 2)
      return { trend: "no-data", percentChange: 0 };

    // Get average of last 3 readings (or less if not available)
    const recentCount = Math.min(3, readings.length);
    const recentReadings = readings
      .slice(-recentCount)
      .map((r: any) => Number(r.reading_val));
    const recentAvg =
      recentReadings.reduce((a: number, b: number) => a + b, 0) /
      recentReadings.length;

    // Get average of readings before that (previous 3-6 readings)
    const previousStart = Math.max(0, readings.length - 6);
    const previousEnd = Math.max(0, readings.length - 3);
    if (previousStart === previousEnd)
      return { trend: "no-data", percentChange: 0 };

    const previousReadings = readings
      .slice(previousStart, previousEnd)
      .map((r: any) => Number(r.reading_val));
    if (previousReadings.length === 0)
      return { trend: "no-data", percentChange: 0 };

    const previousAvg =
      previousReadings.reduce((a: number, b: number) => a + b, 0) /
      previousReadings.length;

    // Calculate percent change
    const percentChange = ((recentAvg - previousAvg) / previousAvg) * 100;
    const absPercentChange = Math.abs(percentChange);

    // Compare with threshold (0.5% difference)
    if (absPercentChange < 0.5) return { trend: "stable", percentChange: 0 };
    return {
      trend: recentAvg > previousAvg ? "up" : "down",
      percentChange: parseFloat(percentChange.toFixed(1)),
    };
  }

  // Get optimal sensor value based on crop type
  function getOptimalValue(
    sensorType:
      | "moisture"
      | "ph"
      | "temperature"
      | "nitrogen"
      | "potassium"
      | "phosphorus",
  ): number {
    const optimalValues: Record<string, Record<string, number>> = {
      default: {
        moisture: 50,
        ph: 6.5,
        temperature: 20,
        nitrogen: 100,
        potassium: 30,
        phosphorus: 50,
      },
      wheat: {
        moisture: 45,
        ph: 6.5,
        temperature: 18,
        nitrogen: 120,
        potassium: 30,
        phosphorus: 60,
      },
      barley: {
        moisture: 45,
        ph: 6.5,
        temperature: 18,
        nitrogen: 110,
        potassium: 30,
        phosphorus: 55,
      },
      fruit: {
        moisture: 55,
        ph: 6.8,
        temperature: 22,
        nitrogen: 90,
        potassium: 30,
        phosphorus: 70,
      },
      wine: {
        moisture: 40,
        ph: 7.0,
        temperature: 20,
        nitrogen: 80,
        potassium: 30,
        phosphorus: 45,
      },
      other: {
        moisture: 50,
        ph: 6.5,
        temperature: 20,
        nitrogen: 100,
        potassium: 30,
        phosphorus: 50,
      },
    };

    const cropOptimal = optimalValues[paddockType] || optimalValues["default"];
    return cropOptimal[sensorType] || 50;
  }

  // Get optimal ranges for sensor alerts
  function getOptimalRange(
    sensorType:
      | "moisture"
      | "ph"
      | "temperature"
      | "nitrogen"
      | "potassium"
      | "phosphorus",
  ): { min: number; max: number } {
    const ranges: Record<
      string,
      Record<string, { min: number; max: number }>
    > = {
      default: {
        moisture: { min: 40, max: 60 },
        ph: { min: 6.0, max: 7.0 },
        temperature: { min: 15, max: 25 },
        nitrogen: { min: 80, max: 120 },
        potassium: { min: 120, max: 180 },
        phosphorus: { min: 40, max: 60 },
      },
      wheat: {
        moisture: { min: 35, max: 55 },
        ph: { min: 6.0, max: 7.0 },
        temperature: { min: 15, max: 22 },
        nitrogen: { min: 100, max: 140 },
        potassium: { min: 150, max: 210 },
        phosphorus: { min: 50, max: 70 },
      },
      barley: {
        moisture: { min: 35, max: 55 },
        ph: { min: 6.0, max: 7.0 },
        temperature: { min: 15, max: 22 },
        nitrogen: { min: 90, max: 130 },
        potassium: { min: 140, max: 200 },
        phosphorus: { min: 45, max: 65 },
      },
      fruit: {
        moisture: { min: 50, max: 70 },
        ph: { min: 6.5, max: 7.5 },
        temperature: { min: 18, max: 26 },
        nitrogen: { min: 70, max: 110 },
        potassium: { min: 170, max: 230 },
        phosphorus: { min: 60, max: 80 },
      },
      wine: {
        moisture: { min: 30, max: 50 },
        ph: { min: 6.5, max: 7.5 },
        temperature: { min: 15, max: 25 },
        nitrogen: { min: 60, max: 100 },
        potassium: { min: 130, max: 190 },
        phosphorus: { min: 35, max: 55 },
      },
      other: {
        moisture: { min: 40, max: 60 },
        ph: { min: 6.0, max: 7.0 },
        temperature: { min: 15, max: 25 },
        nitrogen: { min: 80, max: 120 },
        potassium: { min: 120, max: 180 },
        phosphorus: { min: 40, max: 60 },
      },
    };

    const cropRange = ranges[paddockType] || ranges["default"];
    return cropRange[sensorType] || { min: 0, max: 100 };
  }

  // Check for critical alerts
  function getCriticalAlerts(): Array<{
    type: string;
    message: string;
    severity: "warning" | "critical";
  }> {
    const alerts: Array<{
      type: string;
      message: string;
      severity: "warning" | "critical";
    }> = [];

    // Convert recent values to numbers
    const moisture = recentMoisture ? Number(recentMoisture) : null;
    const temperature = recentTemperature ? Number(recentTemperature) : null;
    const ph = recentPh ? Number(recentPh) : null;
    const nitrogen = recentNitrogen ? Number(recentNitrogen) : null;
    const potassium = recentPotassium ? Number(recentPotassium) : null;
    const phosphorus = recentPhosphorus ? Number(recentPhosphorus) : null;

    // Moisture alerts
    if (moisture !== null) {
      const moistureRange = getOptimalRange("moisture");
      if (moisture < moistureRange.min) {
        alerts.push({
          type: "Moisture",
          message: `Soil moisture is critically low (${moisture}%). Irrigation needed.`,
          severity: moisture < moistureRange.min * 0.8 ? "critical" : "warning",
        });
      } else if (moisture > moistureRange.max) {
        alerts.push({
          type: "Moisture",
          message: `Soil moisture is too high (${moisture}%). Risk of waterlogging.`,
          severity: moisture > moistureRange.max * 1.2 ? "critical" : "warning",
        });
      }
    }

    // Temperature alerts
    if (temperature !== null) {
      const tempRange = getOptimalRange("temperature");
      if (temperature < tempRange.min) {
        alerts.push({
          type: "Temperature",
          message: `Temperature is below optimal (${temperature}°C).`,
          severity: temperature < tempRange.min * 0.9 ? "critical" : "warning",
        });
      } else if (temperature > tempRange.max) {
        alerts.push({
          type: "Temperature",
          message: `Temperature is above optimal (${temperature}°C). Heat stress risk.`,
          severity: temperature > tempRange.max * 1.1 ? "critical" : "warning",
        });
      }
    }

    // pH alerts
    if (ph !== null) {
      const phRange = getOptimalRange("ph");
      if (ph < phRange.min) {
        alerts.push({
          type: "pH Level",
          message: `Soil is too acidic (pH ${ph}). Consider liming.`,
          severity: ph < phRange.min - 0.5 ? "critical" : "warning",
        });
      } else if (ph > phRange.max) {
        alerts.push({
          type: "pH Level",
          message: `Soil is too alkaline (pH ${ph}). Consider acidification.`,
          severity: ph > phRange.max + 0.5 ? "critical" : "warning",
        });
      }
    }

    // Nitrogen alerts
    if (nitrogen !== null) {
      const nitrogenRange = getOptimalRange("nitrogen");
      if (nitrogen < nitrogenRange.min) {
        alerts.push({
          type: "Nitrogen",
          message: `Nitrogen levels are low (${nitrogen} ppm). Fertilizer recommended.`,
          severity: nitrogen < nitrogenRange.min * 0.7 ? "critical" : "warning",
        });
      } else if (nitrogen > nitrogenRange.max) {
        alerts.push({
          type: "Nitrogen",
          message: `Nitrogen levels are high (${nitrogen} ppm). Risk of nutrient runoff.`,
          severity: nitrogen > nitrogenRange.max * 1.3 ? "critical" : "warning",
        });
      }
    }

    // Potassium alerts
    if (potassium !== null) {
      const potassiumRange = getOptimalRange("potassium");
      if (potassium < potassiumRange.min) {
        alerts.push({
          type: "Potassium",
          message: `Potassium levels are low (${potassium} ppm). Supplement recommended.`,
          severity:
            potassium < potassiumRange.min * 0.7 ? "critical" : "warning",
        });
      } else if (potassium > potassiumRange.max) {
        alerts.push({
          type: "Potassium",
          message: `Potassium levels are high (${potassium} ppm). May affect soil balance.`,
          severity:
            potassium > potassiumRange.max * 1.3 ? "critical" : "warning",
        });
      }
    }

    // Phosphorus alerts
    if (phosphorus !== null) {
      const phosphorusRange = getOptimalRange("phosphorus");
      if (phosphorus < phosphorusRange.min) {
        alerts.push({
          type: "Phosphorus",
          message: `Phosphorus levels are low (${phosphorus} ppm). Consider phosphate fertilizer.`,
          severity:
            phosphorus < phosphorusRange.min * 0.7 ? "critical" : "warning",
        });
      } else if (phosphorus > phosphorusRange.max) {
        alerts.push({
          type: "Phosphorus",
          message: `Phosphorus levels are high (${phosphorus} ppm). Risk of eutrophication.`,
          severity:
            phosphorus > phosphorusRange.max * 1.3 ? "critical" : "warning",
        });
      }
    }

    return alerts;
  }

  const handleSearchItemSelect = (item: any) => {
    if (item.node_id) {
      router.push(`/device/view?nodeId=${item.node_id}`);
    }
  };

  const handleEditSubmit = async (newName: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("You must be logged in.");
    if (!nodeId) throw new Error("No device selected.");

    const result = await editDeviceName(
      { node_id: nodeId, node_name: newName },
      token,
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    await fetchDeviceData();
  };

  // Fetch device data - extracted for reuse
  const fetchDeviceData = async () => {
    if (!nodeId) {
      setError("No device selected.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in.");

      const moisture = await getDeviceData(
        { nodeId, readingType: "moisture" },
        token,
      );
      const ph = await getDeviceData({ nodeId, readingType: "ph" }, token);
      const temperature = await getDeviceData(
        { nodeId, readingType: "temperature" },
        token,
      );
      const nitrogen = await getDeviceData(
        { nodeId, readingType: "nitrogen" },
        token,
      );
      const potassium = await getDeviceData(
        { nodeId, readingType: "potassium" },
        token,
      );
      const phosphorus = await getDeviceData(
        { nodeId, readingType: "phosphorus" },
        token,
      );

      if (moisture.success && moisture.node) {
        setMoistureData(moisture.node);
        setMoistureTrend(calculateTrend(moisture.node.readings));
      }
      if (ph.success && ph.node) {
        setPhData(ph.node);
        setPhTrend(calculateTrend(ph.node.readings));
      }
      if (temperature.success && temperature.node) {
        setTemperatureData(temperature.node);
        setTemperatureTrend(calculateTrend(temperature.node.readings));
      }
      if (nitrogen.success && nitrogen.node) {
        setNitrogenData(nitrogen.node);
        setNitrogenTrend(calculateTrend(nitrogen.node.readings));
      }
      if (potassium.success && potassium.node) {
        setPotassiumData(potassium.node);
        setPotassiumTrend(calculateTrend(potassium.node.readings));
      }
      if (phosphorus.success && phosphorus.node) {
        setPhosphorusData(phosphorus.node);
        setPhosphorusTrend(calculateTrend(phosphorus.node.readings));
      }

      if (
        !moisture.success &&
        !ph.success &&
        !temperature.success &&
        !nitrogen.success
      )
        throw new Error("Failed to load readings.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    // Refresh the page data without full reload
    // fetchDeviceData();
  };

  const handleDeleteSuccess = () => {
    // Navigate back to previous page
    router.back();
  };

  // CSV EXPORTER
  const exportToCSV = () => {
    const data =
      selectedGraph === "moisture"
        ? moistureData?.readings || []
        : phData?.readings || [];

    if (!data.length) return;

    const csvRows = [
      "timestamp,value",
      ...data.map((r) => `${r.timestamp},${r.reading_val}`),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${nodeId}_${selectedGraph}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const lastUpdated = (() => {
    const all = [
      ...(moistureData?.readings || []),
      ...(phData?.readings || []),
      ...(temperatureData?.readings || []),
      ...(nitrogenData?.readings || []),
      ...(potassiumData?.readings || []),
      ...(phosphorusData?.readings || []),
    ];
    if (all.length === 0) return null;
    return all.reduce((a, b) =>
      new Date(a.timestamp) > new Date(b.timestamp) ? a : b,
    ).timestamp;
  })();

  const status = deviceStatus(lastUpdated);

  const recentMoisture = moistureData?.readings?.length
    ? Number(
        moistureData.readings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest,
        ).reading_val,
      ).toFixed(1)
    : null;

  const recentPh = phData?.readings?.length
    ? Number(
        phData.readings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest,
        ).reading_val,
      ).toFixed(1)
    : null;

  const recentTemperature = temperatureData?.readings?.length
    ? Number(
        temperatureData.readings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest,
        ).reading_val,
      ).toFixed(1)
    : null;

  const recentNitrogen = nitrogenData?.readings?.length
    ? Number(
        nitrogenData.readings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest,
        ).reading_val,
      ).toFixed(1)
    : null;

  const recentPotassium = potassiumData?.readings?.length
    ? Number(
        potassiumData.readings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest,
        ).reading_val,
      ).toFixed(1)
    : null;

  const recentPhosphorus = phosphorusData?.readings?.length
    ? Number(
        phosphorusData.readings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest,
        ).reading_val,
      ).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0c1220] text-white">
        <p className="text-xl animate-pulse">Loading device data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#0c1220] text-white">
        <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
      </div>
    );
  }

  // Filter data based on time period
  const filterDataByTimePeriod = (readings: any[] | undefined) => {
    if (!readings || readings.length === 0) return [];

    if (timePeriod === "all") return readings;

    const now = new Date();
    let cutoffDate: Date;

    switch (timePeriod) {
      case "week":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "6months":
        cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return readings;
    }

    return readings.filter((r) => new Date(r.timestamp) >= cutoffDate);
  };

  const graphData =
    selectedGraph === "moisture"
      ? filterDataByTimePeriod(moistureData?.readings)?.map((r) => ({
          x: r.timestamp,
          y: Number(r.reading_val),
        })) || []
      : selectedGraph === "ph"
        ? filterDataByTimePeriod(phData?.readings)?.map((r) => ({
            x: r.timestamp,
            y: Number(r.reading_val),
          })) || []
        : selectedGraph === "temperature"
          ? filterDataByTimePeriod(temperatureData?.readings)?.map((r) => ({
              x: r.timestamp,
              y: Number(r.reading_val),
            })) || []
          : selectedGraph === "nitrogen"
            ? filterDataByTimePeriod(nitrogenData?.readings)?.map((r) => ({
                x: r.timestamp,
                y: Number(r.reading_val),
              })) || []
            : selectedGraph === "potassium"
              ? filterDataByTimePeriod(potassiumData?.readings)?.map((r) => ({
                  x: r.timestamp,
                  y: Number(r.reading_val),
                })) || []
              : filterDataByTimePeriod(phosphorusData?.readings)?.map((r) => ({
                  x: r.timestamp,
                  y: Number(r.reading_val),
                })) || [];

  const graphTitle =
    selectedGraph === "moisture"
      ? "Moisture Levels"
      : selectedGraph === "ph"
        ? "pH Levels"
        : selectedGraph === "temperature"
          ? "Temperature"
          : selectedGraph === "nitrogen"
            ? "Nitrogen"
            : selectedGraph === "potassium"
              ? "Potassium"
              : "Phosphorus";

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
        <div className="w-full max-w-7xl space-y-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-lg"
          >
            <MdArrowBack
              size={24}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Paddock </span>
          </button>

          <section className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {moistureData?.node_name || phData?.node_name || "Device"}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Node ID:{" "}
                  <span className="font-mono text-[#00be64]">
                    {moistureData?.node_id || phData?.node_id || nodeId}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2.5 bg-[#00be64]/20 hover:bg-[#00be64]/30 rounded-lg transition-all group"
                  title="Edit device"
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
                  title="Remove device"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* CRITICAL ALERTS SECTION */}
              <div className="bg-gradient-to-br from-[#1a0f0f] to-[#0f0a0a] border border-red-500/30 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                  <span className="text-red-400">Alerts</span>
                </h2>
                {getCriticalAlerts().length > 0 ? (
                  <div className="space-y-3">
                    {getCriticalAlerts().map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                          alert.severity === "critical"
                            ? "bg-red-950/30 border-l-red-500 border border-red-500/20"
                            : "bg-orange-950/30 border-l-orange-500 border border-orange-500/20"
                        }`}
                      >
                        <div
                          className={`mt-0.5 text-lg font-bold flex-shrink-0 ${
                            alert.severity === "critical"
                              ? "text-red-400"
                              : "text-orange-400"
                          }`}
                        >
                          ⚠
                        </div>
                        <div className="flex-grow">
                          <p
                            className={`text-sm font-bold ${
                              alert.severity === "critical"
                                ? "text-red-300"
                                : "text-orange-300"
                            }`}
                          >
                            {alert.type}
                          </p>
                          <p className="text-xs text-gray-300 mt-1">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-green-950/20 border border-green-500/20 rounded-lg">
                    <div className="text-lg font-bold text-green-400">✓</div>
                    <div>
                      <p className="text-sm font-bold text-green-300">
                        All Systems Normal
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        All sensor readings are within optimal ranges for{" "}
                        {paddockType || "default"} crop.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* LATEST READINGS */}
              <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/30 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#00be64] rounded-full"></span>
                  Latest Readings
                  <InfoPopup
                    title="Latest Readings"
                    description="Shows the most recent sensor values from your device. The percentage indicates the change from the previous reading period, calculated by comparing the latest reading with the previous one."
                  />
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-colors">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Moisture
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <p className="text-3xl font-bold text-[#00be64]">
                        {recentMoisture ?? "--"}
                      </p>
                      {moistureTrend.trend === "up" && (
                        <span className="text-sm text-green-400 font-semibold">
                          ↑ +{moistureTrend.percentChange}%
                        </span>
                      )}
                      {moistureTrend.trend === "down" && (
                        <span className="text-sm text-orange-400 font-semibold">
                          ↓ {moistureTrend.percentChange}%
                        </span>
                      )}
                      {moistureTrend.trend === "stable" && (
                        <span className="text-sm text-gray-400 font-semibold">
                          → Stable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">%</p>
                  </div>
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-colors">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Temperature
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <p className="text-3xl font-bold text-[#00be64]">
                        {recentTemperature ?? "--"}
                      </p>
                      {temperatureTrend.trend === "up" && (
                        <span className="text-sm text-red-400 font-semibold">
                          ↑ +{temperatureTrend.percentChange}%
                        </span>
                      )}
                      {temperatureTrend.trend === "down" && (
                        <span className="text-sm text-blue-400 font-semibold">
                          ↓ {temperatureTrend.percentChange}%
                        </span>
                      )}
                      {temperatureTrend.trend === "stable" && (
                        <span className="text-sm text-gray-400 font-semibold">
                          → Stable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">°C</p>
                  </div>
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-colors">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Nitrogen
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <p className="text-3xl font-bold text-[#00be64]">
                        {recentNitrogen ?? "--"}
                      </p>
                      {nitrogenTrend.trend === "up" && (
                        <span className="text-sm text-green-400 font-semibold">
                          ↑ +{nitrogenTrend.percentChange}%
                        </span>
                      )}
                      {nitrogenTrend.trend === "down" && (
                        <span className="text-sm text-orange-400 font-semibold">
                          ↓ {nitrogenTrend.percentChange}%
                        </span>
                      )}
                      {nitrogenTrend.trend === "stable" && (
                        <span className="text-sm text-gray-400 font-semibold">
                          → Stable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ppm</p>
                  </div>
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-colors">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      pH Level
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <p className="text-3xl font-bold text-[#00be64]">
                        {recentPh ?? "--"}
                      </p>
                      {phTrend.trend === "up" && (
                        <span className="text-sm text-red-400 font-semibold">
                          ↑ +{phTrend.percentChange}%
                        </span>
                      )}
                      {phTrend.trend === "down" && (
                        <span className="text-sm text-blue-400 font-semibold">
                          ↓ {phTrend.percentChange}%
                        </span>
                      )}
                      {phTrend.trend === "stable" && (
                        <span className="text-sm text-gray-400 font-semibold">
                          → Stable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">pH</p>
                  </div>
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-colors">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Potassium
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <p className="text-3xl font-bold text-[#00be64]">
                        {recentPotassium ?? "--"}
                      </p>
                      {potassiumTrend.trend === "up" && (
                        <span className="text-sm text-green-400 font-semibold">
                          ↑ +{potassiumTrend.percentChange}%
                        </span>
                      )}
                      {potassiumTrend.trend === "down" && (
                        <span className="text-sm text-orange-400 font-semibold">
                          ↓ {potassiumTrend.percentChange}%
                        </span>
                      )}
                      {potassiumTrend.trend === "stable" && (
                        <span className="text-sm text-gray-400 font-semibold">
                          → Stable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ppm</p>
                  </div>
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-colors">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Phosphorus
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <p className="text-3xl font-bold text-[#00be64]">
                        {recentPhosphorus ?? "--"}
                      </p>
                      {phosphorusTrend.trend === "up" && (
                        <span className="text-sm text-green-400 font-semibold">
                          ↑ +{phosphorusTrend.percentChange}%
                        </span>
                      )}
                      {phosphorusTrend.trend === "down" && (
                        <span className="text-sm text-orange-400 font-semibold">
                          ↓ {phosphorusTrend.percentChange}%
                        </span>
                      )}
                      {phosphorusTrend.trend === "stable" && (
                        <span className="text-sm text-gray-400 font-semibold">
                          → Stable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ppm</p>
                  </div>
                </div>
              </div>

              {/* GRAPH SECTION */}
              <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/30 rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <span className="w-1 h-6 bg-[#00be64] rounded-full"></span>
                    {graphTitle}
                  </h2>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400">
                        Time Period:
                      </label>
                      <select
                        value={timePeriod}
                        onChange={(e) =>
                          setTimePeriod(e.target.value as typeof timePeriod)
                        }
                        className="px-3 py-2 text-sm bg-[#0c1220] border border-[#00be64]/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00be64] cursor-pointer hover:border-[#00be64] transition [&>option]:bg-[#0c1220] [&>option]:text-white"
                      >
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                        <option value="6months">Past 6 Months</option>
                        <option value="year">Past Year</option>
                        <option value="all">All Time</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400">
                        Graph Type:
                      </label>
                      <select
                        value={selectedGraph}
                        onChange={(e) =>
                          setSelectedGraph(
                            e.target.value as typeof selectedGraph,
                          )
                        }
                        className="px-3 py-2 text-sm bg-[#0c1220] border border-[#00be64]/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00be64] cursor-pointer hover:border-[#00be64] transition [&>option]:bg-[#0c1220] [&>option]:text-white"
                      >
                        <option value="moisture">Moisture</option>
                        <option value="temperature">Temperature</option>
                        <option value="nitrogen">Nitrogen</option>
                        <option value="ph">pH</option>
                        <option value="potassium">Potassium</option>
                        <option value="phosphorus">Phosphorus</option>
                      </select>
                      <button
                        onClick={exportToCSV}
                        className="px-4 py-2 text-sm bg-[#00be64] text-black font-semibold rounded-lg hover:bg-[#00d975] transition-colors shadow-lg shadow-[#00be64]/20"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[400px] rounded-xl overflow-hidden bg-[#0c1220]/50">
                  <Graph
                    title={graphTitle}
                    data={graphData}
                    timePeriod={timePeriod}
                    optimalValue={getOptimalValue(selectedGraph)}
                  />
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN - Summary Info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/30 rounded-2xl p-6 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  Device Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Node ID</p>
                    <p className="font-mono text-sm text-[#00be64] break-all">
                      {moistureData?.node_id || phData?.node_id || nodeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Paddock ID</p>
                    <p className="font-mono text-sm text-[#00be64]">
                      {moistureData?.paddock_id || phData?.paddock_id}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg border ${
                  status.color === "green"
                    ? "from-green-500/10 to-green-500/5 border-green-500/30"
                    : "from-red-500/10 to-red-500/5 border-red-500/30"
                }`}
              >
                <h3
                  className={`text-sm font-semibold uppercase tracking-wide mb-4 ${
                    status.color === "green" ? "text-green-300" : "text-red-300"
                  }`}
                >
                  Device Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Status</p>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block w-3 h-3 rounded-full animate-pulse ${
                          status.color === "green"
                            ? "bg-green-400"
                            : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`text-lg font-semibold ${
                          status.color === "green"
                            ? "text-green-400"
                            : "text-red-500"
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2">
                      Data Availability
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="text-sm text-gray-300">
                        Readings available
                      </span>
                    </div>
                  </div>

                  {lastUpdated && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400 mb-2">Last Updated</p>
                      <p className="text-base font-semibold text-[#00be64]">
                        {timeAgo(lastUpdated)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(lastUpdated)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditDeviceNameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={moistureData?.node_name || phData?.node_name || "Device"}
        onSubmit={handleEditSubmit}
      />

      <DeleteDeviceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        nodeId={nodeId || ""}
        nodeName={moistureData?.node_name || phData?.node_name || "Device"}
        onSuccess={handleDeleteSuccess}
      />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-[#0c1220] text-white">
          <p className="text-xl animate-pulse">Loading...</p>
        </div>
      }
    >
      <DeviceViewContent />
    </Suspense>
  );
}

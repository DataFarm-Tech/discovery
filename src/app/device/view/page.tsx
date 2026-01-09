"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Graph from "@/components/Graph";
import { getDeviceData, DeviceDataResponse } from "@/lib/device";

// Lazy-load map component
const DeviceMap = dynamic(() => import("@/components/DeviceMap"), {
  ssr: false,
});

// Temporary map coordinates
const DEFAULT_COORDS = {
  lat: 51.505,
  lng: -0.09,
};

// Hard-coded battery level
const BATTERY_PERCENT = 87;

function DeviceViewContent() {
  const searchParams = useSearchParams();
  const nodeId = searchParams.get("nodeId");

  const [moistureData, setMoistureData] = useState<
    DeviceDataResponse["node"] | null
  >(null);
  const [phData, setPhData] = useState<DeviceDataResponse["node"] | null>(null);
  const [selectedGraph, setSelectedGraph] = useState<"moisture" | "ph">(
    "moisture"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!nodeId) {
      setError("No device selected.");
      setLoading(false);
      return;
    }

    const fetchBoth = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You must be logged in.");

        const moisture = await getDeviceData(
          { nodeId, readingType: "moisture" },
          token
        );
        const ph = await getDeviceData({ nodeId, readingType: "ph" }, token);

        if (moisture.success) setMoistureData(moisture.node);
        if (ph.success) setPhData(ph.node);

        if (!moisture.success && !ph.success)
          throw new Error("Failed to load readings.");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoth();
  }, [nodeId]);

  const lastUpdated = (() => {
    const all = [
      ...(moistureData?.readings || []),
      ...(phData?.readings || []),
    ];
    if (all.length === 0) return null;
    return all.reduce((a, b) =>
      new Date(a.timestamp) > new Date(b.timestamp) ? a : b
    ).timestamp;
  })();

  const status = deviceStatus(lastUpdated);

  const recentMoisture = moistureData?.readings?.length
    ? Number(
        moistureData.readings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest
        ).reading_val
      ).toFixed(1)
    : null;

  const recentPh = phData?.readings?.length
    ? Number(
        phData.readings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest
        ).reading_val
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

  const graphData =
    selectedGraph === "moisture"
      ? moistureData?.readings?.map((r) => ({
          x: r.timestamp,
          y: Number(r.reading_val),
        })) || []
      : phData?.readings?.map((r) => ({
          x: r.timestamp,
          y: Number(r.reading_val),
        })) || [];

  const graphTitle =
    selectedGraph === "moisture" ? "Moisture Levels" : "pH Levels";

  return (
    <div className="min-h-screen bg-[#0c1220] text-white px-10 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full items-start">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-8">
          <button
            onClick={() => window.history.back()}
            className="w-fit bg-[#11172b] border border-[#00be64] px-4 py-2 rounded-xl hover:bg-[#00be64] hover:text-black transition shadow-[0_0_10px_#00be6455]"
          >
            ← Back to Devices
          </button>

          {/* HEADER WITH BATTERY ICON */}
          <div className="flex items-center justify-between w-full">
            <h1 className="text-4xl font-semibold tracking-wide">
              {moistureData?.node_name || phData?.node_name}
            </h1>

            {/* Battery Icon */}
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm font-medium">
                {BATTERY_PERCENT}%
              </span>

              <div className="relative w-12 h-6 border-2 border-[#00be64] rounded-md flex items-center px-1">
                {/* Battery fill */}
                <div
                  className="h-full bg-[#00be64] rounded-sm transition-all duration-300"
                  style={{
                    width: `${Math.max(0, Math.min(100, BATTERY_PERCENT))}%`,
                  }}
                />

                {/* Battery nub */}
                <div className="absolute right-[-6px] w-1.5 h-3 bg-[#00be64] rounded-sm" />
              </div>
            </div>
          </div>

          {/* STATUS TILE */}
          <div className="bg-[#11172b] border border-[#00be64] rounded-2xl p-6 shadow-[0_0_18px_#00be6444] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className={`inline-block w-4 h-4 rounded-full ${
                  status.color === "red"
                    ? "bg-red-500"
                    : status.color === "green"
                    ? "bg-green-400"
                    : "bg-gray-500"
                } shadow-[0_0_10px]`}
              />

              <div>
                <h3 className="text-lg font-semibold">Device Status</h3>
                <p
                  className={`text-xl ${
                    status.color === "red"
                      ? "text-red-500"
                      : status.color === "green"
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {status.label}
                </p>
              </div>
            </div>

            <div className="text-right">
              {lastUpdated && (
                <>
                  <h3 className="text-lg font-semibold">Last Updated</h3>
                  <p className="text-[#00be64] text-xl">
                    {timeAgo(lastUpdated)}
                  </p>
                  <p className="text-white/50 text-sm">
                    {formatTimestamp(lastUpdated)}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* LATEST READINGS SECTION */}
          <div className="bg-[#11172b] border border-[#00be64] rounded-2xl p-6 shadow-[0_0_18px_#00be6444]">
            <h2 className="text-2xl font-semibold mb-6">Latest Readings</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Moisture */}
              <div className="bg-[#0c1220] border border-[#00be64]/50 rounded-xl p-4 text-center">
                <h3 className="text-xs font-semibold text-white/80 mb-1">
                  Moisture
                </h3>
                <p className="text-[#00be64] text-2xl font-bold">
                  {recentMoisture ?? "--"}%
                </p>
              </div>

              {/* pH */}
              <div className="bg-[#0c1220] border border-[#00be64]/50 rounded-xl p-4 text-center">
                <h3 className="text-xs font-semibold text-white/80 mb-1">pH</h3>
                <p className="text-[#00be64] text-2xl font-bold">
                  {recentPh ?? "--"}
                </p>
              </div>
            </div>
          </div>

          {/* GRAPH + CSV EXPORT */}
          <section className="bg-[#11172b] border border-[#00be64] rounded-2xl shadow-[0_0_18px_#00be6444] p-6 w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">{graphTitle}</h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 text-sm bg-[#00be64] text-black font-semibold rounded-xl hover:bg-[#00d975] transition"
                >
                  Export CSV
                </button>

                <div className="flex bg-[#0c1220] border border-[#00be64] rounded-full overflow-hidden">
                  {(["moisture", "ph"] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedGraph(option)}
                      className={`px-4 py-2 text-sm ${
                        selectedGraph === option
                          ? "bg-[#00be64] text-black font-semibold"
                          : "text-white hover:bg-[#00be64]/20"
                      }`}
                    >
                      {option === "moisture" ? "Moisture" : "pH"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full h-[360px] rounded-xl overflow-hidden">
              <Graph title={graphTitle} data={graphData} />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN — MAP */}
        <div className="flex flex-col gap-8 items-start">
          <div className="bg-[#11172b] border border-[#00be64] rounded-2xl shadow-[0_0_18px_#00be6444] p-6 w-full">
            <div className="rounded-xl overflow-hidden h-[420px] w-full">
              <DeviceMap
                lat={DEFAULT_COORDS.lat}
                lng={DEFAULT_COORDS.lng}
                nodeName={
                  moistureData?.node_name ||
                  phData?.node_name ||
                  nodeId ||
                  "Device"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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

"use client";

import { useState, useEffect } from "react";
import { getPaddockSensorAverages } from "@/lib/paddock";
import StatsTile from "./StatsTile";
import InfoPopup from "./InfoPopup";

interface RecentAveragesProps {
  paddockId: string;
}

export default function RecentAverages({ paddockId }: RecentAveragesProps) {
  const [averages, setAverages] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodesInfo, setNodesInfo] = useState<{
    count: number;
    withReadings: number;
  } | null>(null);

  useEffect(() => {
    if (!paddockId) return;

    const fetchAverages = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token") || "";
        const result = await getPaddockSensorAverages(paddockId, token);

        if (!result.success) {
          throw new Error(result.message);
        }

        setAverages(result.sensor_averages || {});
        setNodesInfo({
          count: result.nodes_count || 0,
          withReadings: result.nodes_with_readings || 0,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAverages();
  }, [paddockId]);

  // Helper function to format sensor names
  const formatSensorName = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to get unit for sensor type
  const getSensorUnit = (key: string): string => {
    const units: { [key: string]: string } = {
      temperature: "°C",
      ph: "",
      moisture: "%",
      humidity: "%",
      nitrogen: "ppm",
      phosphorus: "ppm",
      potassium: "ppm",
    };
    return units[key.toLowerCase()] || "";
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative hover:border-[#00be64]/40 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00be64]/5 to-transparent pointer-events-none rounded-2xl" />
        <h2 className="text-2xl font-semibold mb-6 relative z-10">
          Recent Averages
        </h2>
        <p className="text-gray-400 relative z-10">Loading sensor data...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative hover:border-[#00be64]/40 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00be64]/5 to-transparent pointer-events-none rounded-2xl" />
        <h2 className="text-2xl font-semibold mb-6 relative z-10">
          Recent Averages
        </h2>
        <p className="text-red-500 relative z-10">{error}</p>
      </section>
    );
  }

  const hasData = Object.keys(averages).length > 0;

  return (
    <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 relative hover:border-[#00be64]/40 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00be64]/5 to-transparent pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">Recent Averages</h2>
            <InfoPopup
              title="What are Recent Averages?"
              description="Recent averages show the most recent average sensor readings from all active devices in this paddock. These values are calculated from the latest data collected across all your sensors."
              ariaLabel="What are recent averages?"
            />
          </div>
          {nodesInfo && (
            <p className="text-sm text-gray-400">
              {nodesInfo.withReadings} of {nodesInfo.count} devices reporting
            </p>
          )}
        </div>

        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(averages).map(([key, value]) => (
              <StatsTile
                key={key}
                title={formatSensorName(key)}
                value={value}
                unit={getSensorUnit(key)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">
            No sensor data available for this zone.
          </p>
        )}

        {hasData && (
          <p className="text-gray-400 text-sm mt-6">
            Values represent the most recent average readings from all active
            sensors in this zone.
          </p>
        )}
      </div>
    </section>
  );
}
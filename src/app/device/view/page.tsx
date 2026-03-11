"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Graph from "@/components/Graph";
import {
  getDeviceData,
  DeviceDataResponse,
  editDeviceName,
  getDeviceInsights,
  DeviceInsightsResponse,
  // getForecast,
} from "@/lib/device";
import InfoPopup from "@/components/InfoPopup";
import { MdDelete, MdEdit, MdArrowBack } from "react-icons/md";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import EditDeviceNameModal from "@/components/modals/EditDeviceNameModal";
import DeleteDeviceModal from "@/components/modals/DeleteDeviceModal";
import {
  calculateTrend,
  deviceStatus,
  filterReadingsByTimePeriod,
  formatTimestamp,
  getPlantAgeDays,
  normalizeCropType,
  normalizeSoilType,
  timeAgo,
  toTitleCaseWords,
} from "./deviceView.logic";

// Hard-coded battery level
const BATTERY_PERCENT = 87;
type SensorType =
  | "moisture"
  | "ph"
  | "temperature"
  | "nitrogen"
  | "potassium"
  | "phosphorus";

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
  const [activeDevicePage, setActiveDevicePage] = useState<
    "overview" | "graph" | "device"
  >("overview");
  const [showOptimalLine, setShowOptimalLine] = useState(true);
  const [timePeriod, setTimePeriod] = useState<
    "week" | "month" | "6months" | "year" | "all"
  >("all");
  // const [showForecastLine, setShowForecastLine] = useState(true);
  // const [forecastHorizonMonths, setForecastHorizonMonths] = useState<1 | 3 | 5>(3);
  // const [forecastData, setForecastData] = useState<Array<{ x: string; y: number }>>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cropType, setcropType] = useState<string>("default");
  const [soilType, setSoilType] = useState<string>("default");
  const [paddockId, setPaddockId] = useState<number | null>(null);
  const [paddockAreaHa, setPaddockAreaHa] = useState<number | null>(null);
  const [plantationDate, setPlantationDate] = useState<string | null>(null);
  const [deviceInsights, setDeviceInsights] =
    useState<DeviceInsightsResponse | null>(null);
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

  function getDynamicAlertRange(sensorType: SensorType): { min: number; max: number } {
    const baseRange = getOptimalRange(sensorType);
    let center = (baseRange.min + baseRange.max) / 2;
    let span = baseRange.max - baseRange.min;

    const soilKey = normalizeSoilType(soilType);
    const soilAdjustments: Record<
      string,
      Partial<Record<SensorType, { centerShift: number; spanFactor: number }>>
    > = {
      default: {},
      sandy: {
        moisture: { centerShift: -3, spanFactor: 1.12 },
        nitrogen: { centerShift: -8, spanFactor: 1.1 },
        potassium: { centerShift: -6, spanFactor: 1.08 },
      },
      clay: {
        moisture: { centerShift: 4, spanFactor: 0.92 },
        temperature: { centerShift: -1, spanFactor: 0.9 },
        phosphorus: { centerShift: 6, spanFactor: 0.9 },
      },
      loam: {
        moisture: { centerShift: 0, spanFactor: 0.95 },
      },
      silty: {
        moisture: { centerShift: 2, spanFactor: 1.0 },
        phosphorus: { centerShift: 3, spanFactor: 0.95 },
      },
      peaty: {
        ph: { centerShift: -0.2, spanFactor: 1.05 },
        potassium: { centerShift: -5, spanFactor: 1.1 },
      },
      chalky: {
        ph: { centerShift: 0.2, spanFactor: 1.05 },
        phosphorus: { centerShift: -4, spanFactor: 1.08 },
      },
    };

    const soilRule = soilAdjustments[soilKey]?.[sensorType];
    if (soilRule) {
      center += soilRule.centerShift;
      span *= soilRule.spanFactor;
    }

    const ageDays = getPlantAgeDays(plantationDate);
    if (ageDays !== null && ageDays >= 0) {
      const growthStage = ageDays < 45 ? "early" : ageDays < 140 ? "mid" : "late";
      const stageAdjustments: Record<
        string,
        Partial<Record<SensorType, { centerShift: number; spanFactor: number }>>
      > = {
        early: {
          moisture: { centerShift: 4, spanFactor: 0.9 },
          phosphorus: { centerShift: 5, spanFactor: 0.92 },
          temperature: { centerShift: 1, spanFactor: 0.95 },
        },
        mid: {
          nitrogen: { centerShift: 6, spanFactor: 0.9 },
          potassium: { centerShift: 3, spanFactor: 0.95 },
        },
        late: {
          moisture: { centerShift: -3, spanFactor: 1.05 },
          nitrogen: { centerShift: -8, spanFactor: 1.08 },
          potassium: { centerShift: 5, spanFactor: 1.0 },
        },
      };

      const stageRule = stageAdjustments[growthStage]?.[sensorType];
      if (stageRule) {
        center += stageRule.centerShift;
        span *= stageRule.spanFactor;
      }
    }

    if (paddockAreaHa !== null && paddockAreaHa > 0) {
      const areaSpanFactor = paddockAreaHa > 100 ? 1.12 : paddockAreaHa < 10 ? 0.92 : 1.0;
      span *= areaSpanFactor;
    }

    const min = center - span / 2;
    const max = center + span / 2;

    if (sensorType === "ph" || sensorType === "temperature") {
      return {
        min: Number(min.toFixed(1)),
        max: Number(max.toFixed(1)),
      };
    }

    return {
      min: Math.round(min),
      max: Math.round(max),
    };
  }

  // Get optimal sensor value based on crop type + soil type
  function getOptimalValue(sensorType: SensorType): number {
    const backendOptimal = deviceInsights?.optimal_values?.[sensorType];
    if (typeof backendOptimal === "number") {
      return backendOptimal;
    }

    const optimalValues: Record<string, Record<string, number>> = {
      default: {
        moisture: 50,
        ph: 6.5,
        temperature: 20,
        nitrogen: 100,
        potassium: 30,
        phosphorus: 50,
      },
      grains: {
        moisture: 45,
        ph: 6.5,
        temperature: 18,
        nitrogen: 120,
        potassium: 30,
        phosphorus: 60,
      },
      legumes: {
        moisture: 50,
        ph: 6.6,
        temperature: 20,
        nitrogen: 95,
        potassium: 30,
        phosphorus: 58,
      },
      fruit: {
        moisture: 55,
        ph: 6.8,
        temperature: 22,
        nitrogen: 90,
        potassium: 30,
        phosphorus: 70,
      },
      "oil seeds": {
        moisture: 43,
        ph: 6.6,
        temperature: 19,
        nitrogen: 105,
        potassium: 30,
        phosphorus: 52,
      },
      "root crops": {
        moisture: 58,
        ph: 6.4,
        temperature: 19,
        nitrogen: 110,
        potassium: 30,
        phosphorus: 62,
      },
      tropical: {
        moisture: 60,
        ph: 6.7,
        temperature: 20,
        nitrogen: 95,
        potassium: 30,
        phosphorus: 68,
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

    const soilAdjustments: Record<string, Partial<Record<SensorType, number>>> = {
      default: {},
      sandy: {
        moisture: 0.9,
        nitrogen: 0.9,
        potassium: 0.95,
      },
      clay: {
        moisture: 1.1,
        temperature: 0.95,
        phosphorus: 1.1,
      },
      loam: {
        moisture: 1.0,
      },
      silty: {
        moisture: 1.05,
        phosphorus: 1.05,
      },
      peaty: {
        ph: 0.95,
        potassium: 0.95,
      },
      chalky: {
        ph: 1.05,
        phosphorus: 0.95,
      },
    };

    const cropKey = normalizeCropType(cropType);
    const soilKey = normalizeSoilType(soilType);
    const cropOptimal = optimalValues[cropKey] || optimalValues["default"];
    const baseValue = cropOptimal[sensorType] || 50;
    const factor = soilAdjustments[soilKey]?.[sensorType] ?? 1;
    const adjustedValue = baseValue * factor;

    if (sensorType === "ph" || sensorType === "temperature") {
      return Number(adjustedValue.toFixed(1));
    }

    return Math.round(adjustedValue);
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
    const backendRange = deviceInsights?.dynamic_ranges?.[sensorType];
    if (
      backendRange &&
      typeof backendRange.min === "number" &&
      typeof backendRange.max === "number"
    ) {
      return backendRange;
    }

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
      grains: {
        moisture: { min: 35, max: 55 },
        ph: { min: 6.0, max: 7.0 },
        temperature: { min: 15, max: 22 },
        nitrogen: { min: 100, max: 140 },
        potassium: { min: 150, max: 210 },
        phosphorus: { min: 50, max: 70 },
      },
      legumes: {
        moisture: { min: 40, max: 60 },
        ph: { min: 6.1, max: 7.1 },
        temperature: { min: 16, max: 24 },
        nitrogen: { min: 80, max: 120 },
        potassium: { min: 140, max: 200 },
        phosphorus: { min: 48, max: 68 },
      },
      fruit: {
        moisture: { min: 50, max: 70 },
        ph: { min: 6.5, max: 7.5 },
        temperature: { min: 18, max: 26 },
        nitrogen: { min: 70, max: 110 },
        potassium: { min: 170, max: 230 },
        phosphorus: { min: 60, max: 80 },
      },
      "oil seeds": {
        moisture: { min: 35, max: 55 },
        ph: { min: 6.0, max: 7.0 },
        temperature: { min: 15, max: 23 },
        nitrogen: { min: 90, max: 130 },
        potassium: { min: 140, max: 200 },
        phosphorus: { min: 45, max: 65 },
      },
      "root crops": {
        moisture: { min: 45, max: 70 },
        ph: { min: 5.8, max: 6.8 },
        temperature: { min: 14, max: 23 },
        nitrogen: { min: 90, max: 140 },
        potassium: { min: 160, max: 230 },
        phosphorus: { min: 50, max: 75 },
      },
      tropical: {
        moisture: { min: 50, max: 75 },
        ph: { min: 6.2, max: 7.2 },
        temperature: { min: 20, max: 30 },
        nitrogen: { min: 75, max: 125 },
        potassium: { min: 170, max: 240 },
        phosphorus: { min: 55, max: 80 },
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

    const cropKey = normalizeCropType(cropType);
    const cropRange = ranges[cropKey] || ranges["default"];
    return cropRange[sensorType] || { min: 0, max: 100 };
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
      const insights = await getDeviceInsights(nodeId, token);

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

      const detectedPaddockId =
        moisture.node?.paddock_id ||
        ph.node?.paddock_id ||
        temperature.node?.paddock_id ||
        nitrogen.node?.paddock_id ||
        potassium.node?.paddock_id ||
        phosphorus.node?.paddock_id ||
        null;

      setPaddockId(detectedPaddockId);

      setPaddockAreaHa(null);
      setPlantationDate(null);

      if (insights.success) {
        setDeviceInsights(insights);
        setcropType(normalizeCropType(insights.profile?.crop_type || "default"));
        setSoilType(normalizeSoilType(insights.profile?.soil_type || "default"));
        setPaddockAreaHa(
          typeof insights.profile?.area_hectares === "number"
            ? insights.profile.area_hectares
            : null,
        );
        setPlantationDate(insights.profile?.plant_date || null);
      } else {
        setDeviceInsights(null);
      }
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

  const currentNode =
    moistureData ||
    phData ||
    temperatureData ||
    nitrogenData ||
    potassiumData ||
    phosphorusData ||
    null;

  const firmwareVersion = currentNode?.fw_ver || "--";
  const plantAgeDays = getPlantAgeDays(plantationDate);

  const exportPaddockId = currentNode?.paddock_id
    ? String(currentNode.paddock_id)
    : "";
  const exportZoneName = exportPaddockId ? `Zone ${exportPaddockId}` : "Zone";

  const selectedReadings = useMemo(
    () =>
      selectedGraph === "moisture"
        ? moistureData?.readings || []
        : selectedGraph === "ph"
          ? phData?.readings || []
          : selectedGraph === "temperature"
            ? temperatureData?.readings || []
            : selectedGraph === "nitrogen"
              ? nitrogenData?.readings || []
              : selectedGraph === "potassium"
                ? potassiumData?.readings || []
                : phosphorusData?.readings || [],
    [
      selectedGraph,
      moistureData?.readings,
      phData?.readings,
      temperatureData?.readings,
      nitrogenData?.readings,
      potassiumData?.readings,
      phosphorusData?.readings,
    ],
  );

  const exportableData = filterReadingsByTimePeriod(selectedReadings, timePeriod);

  // const forecastHistory = useMemo(
  //   () =>
  //     selectedReadings
  //       .map((reading) => ({
  //         timestamp: reading.timestamp,
  //         value: Number(reading.reading_val),
  //       }))
  //       .filter((reading) => Number.isFinite(reading.value)),
  //   [selectedReadings],
  // );

  // const hasEnoughDataForForecast = forecastHistory.length >= 2;

  // useEffect(() => {
  //   if (!hasEnoughDataForForecast && showForecastLine) {
  //     setShowForecastLine(false);
  //   }
  // }, [hasEnoughDataForForecast, showForecastLine]);

  const graphData = filterReadingsByTimePeriod(selectedReadings, timePeriod).map((r) => ({
    x: r.timestamp,
    y: Number(r.reading_val),
  }));

  // useEffect(() => {
  //   const runForecast = async () => {
  //     if (!showForecastLine) {
  //       setForecastData([]);
  //       return;
  //     }

  //     if (!hasEnoughDataForForecast) {
  //       setForecastData([]);
  //       return;
  //     }

  //     const forecastResult = await getForecast({
  //       sensor_type: selectedGraph,
  //       horizons_months: [forecastHorizonMonths],
  //       prediction_interval_hours: 6,
  //       readings: forecastHistory,
  //     });

  //     if (!forecastResult.success) {
  //       setForecastData([]);
  //       return;
  //     }

  //     const forecastSeries =
  //       forecastResult.data.forecast_points?.length
  //         ? forecastResult.data.forecast_points
  //         : forecastResult.data.monthly_predictions;

  //     const nextForecastData = forecastSeries.map(
  //       (point) => ({
  //         x: point.predicted_timestamp,
  //         y: Number(point.predicted_value),
  //       }),
  //     );

  //     setForecastData(nextForecastData);
  //   };

  //   void runForecast();
  // }, [
  //   showForecastLine,
  //   forecastHorizonMonths,
  //   hasEnoughDataForForecast,
  //   forecastHistory,
  //   selectedGraph,
  // ]);

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

  // CSV EXPORTER
  const exportToCSV = () => {
    const data = filterReadingsByTimePeriod(selectedReadings, timePeriod);

    if (!data.length) {
      alert(`No ${selectedGraph} data available for the selected time period.`);
      return;
    }

    const escapeCsv = (value: string | number | null | undefined) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const sortedData = [...data].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const getSensorUnit = (sensorType: typeof selectedGraph): string => {
      const units: Record<typeof selectedGraph, string> = {
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
      sensorType: typeof selectedGraph,
      value: number,
    ): "ok" | "low" | "high" | "critical" => {
      const range = getOptimalRange(sensorType);
      const span = range.max - range.min;
      const criticalMargin = span * 0.2;

      if (value < range.min - criticalMargin || value > range.max + criticalMargin) {
        return "critical";
      }
      if (value < range.min) return "low";
      if (value > range.max) return "high";
      return "ok";
    };

    const csvRows = [
      [
        "zone_name",
        "device_name",
        "sensor_type",
        "reading_value",
        "unit",
        "timestamp_local",
        "status",
      ].join(","),
      ...sortedData.map((reading) => {
        const numericValue = Number(reading.reading_val);
        const timestamp = new Date(reading.timestamp);
        return [
          escapeCsv(exportZoneName),
          escapeCsv(currentNode?.node_name || `Device ${nodeId || ""}`),
          escapeCsv(selectedGraph),
          escapeCsv(reading.reading_val),
          escapeCsv(getSensorUnit(selectedGraph)),
          escapeCsv(
            Number.isNaN(timestamp.getTime())
              ? reading.timestamp
              : timestamp.toLocaleString(),
          ),
          escapeCsv(
            Number.isFinite(numericValue)
              ? getSensorStatus(selectedGraph, numericValue)
              : "ok",
          ),
        ].join(",");
      }),
    ];

    const csvContent = `\uFEFF${csvRows.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const safeNodeId = (nodeId || "device").replace(/[^a-zA-Z0-9-_]/g, "_");
    const safeZoneName = exportZoneName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.download = `${safeZoneName}_${safeNodeId}_${selectedGraph}_${timePeriod}_v2_${dateStamp}.csv`;
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

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-b from-[#0c1220] via-[#0c1220] to-[#101828] px-4 py-4 sm:px-6 sm:py-6 text-white relative flex flex-col">
      <DashboardHeader
        userName="Lucas"
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-auto w-full max-w-7xl space-y-6 pt-4 pb-8">

          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors group text-sm border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-full px-4 py-2"
          >
            <MdArrowBack
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back</span>
          </button>

          <section className="bg-[#121829]/95 border border-[#00be64]/30 rounded-2xl shadow-xl p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {moistureData?.node_name || phData?.node_name || "Device"}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${status.online ? "bg-green-500/10 border-green-500/40 text-green-300" : "bg-red-500/10 border-red-500/40 text-red-300"}`}>
                    <span className={`w-2 h-2 rounded-full ${status.online ? "bg-green-400" : "bg-red-500"}`}></span>
                    {status.label}
                  </span>
                  {lastUpdated && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300">
                      Updated {timeAgo(lastUpdated)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2.5 bg-[#00be64]/20 hover:bg-[#00be64]/30 border border-[#00be64]/30 rounded-lg transition-all group"
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
                  className="p-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all group"
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDevicePage("overview")}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition ${
                activeDevicePage === "overview"
                  ? "border-[#00be64]/60 bg-[#00be64]/15 text-[#00be64]"
                  : "border-white/15 bg-white/5 text-gray-300 hover:text-white"
              }`}
            >
              Readings
            </button>
            <button
              type="button"
              onClick={() => setActiveDevicePage("graph")}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition ${
                activeDevicePage === "graph"
                  ? "border-[#00be64]/60 bg-[#00be64]/15 text-[#00be64]"
                  : "border-white/15 bg-white/5 text-gray-300 hover:text-white"
              }`}
            >
              Graph View
            </button>
            <button
              type="button"
              onClick={() => setActiveDevicePage("device")}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition ${
                activeDevicePage === "device"
                  ? "border-[#00be64]/60 bg-[#00be64]/15 text-[#00be64]"
                  : "border-white/15 bg-white/5 text-gray-300 hover:text-white"
              }`}
            >
              Device Info
            </button>
          </div>

          <div className="space-y-6">
            {/* LEFT COLUMN - Main Content */}
            <div className="space-y-6">
              {/* LATEST READINGS */}
              {activeDevicePage === "overview" && (
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
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-all hover:-translate-y-0.5">
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
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-all hover:-translate-y-0.5">
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
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-all hover:-translate-y-0.5">
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
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-all hover:-translate-y-0.5">
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
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-all hover:-translate-y-0.5">
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
                  <div className="bg-[#0c1220]/50 border border-[#00be64]/40 rounded-xl p-5 text-center hover:border-[#00be64] transition-all hover:-translate-y-0.5">
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
              )}

              {/* GRAPH SECTION */}
              {activeDevicePage === "graph" && (
              <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/30 rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <span className="w-1 h-6 bg-[#00be64] rounded-full"></span>
                    {graphTitle}
                  </h2>
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-[#00be64]/40 bg-[#00be64]/10 px-2.5 py-1 text-[#00be64] font-semibold">
                      Optimal Profile
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-300">
                      Crop: {toTitleCaseWords(cropType)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-300">
                      Soil: {toTitleCaseWords(soilType)}
                    </span>
                    {paddockId && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-300">
                        Zone {paddockId}
                      </span>
                    )}
                    {paddockAreaHa && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-300">
                        {paddockAreaHa} ha
                      </span>
                    )}
                    {plantAgeDays !== null && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-300">
                        {plantAgeDays >= 0
                          ? `${plantAgeDays} days since planting`
                          : `Planting starts in ${Math.abs(plantAgeDays)} days`}
                      </span>
                    )}
                  </div>

                  <div className="w-full rounded-xl border border-white/10 bg-[#0c1220]/40 p-3">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
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

                        <label className="flex items-center gap-2 px-2 py-1 rounded-md border border-white/10 bg-white/5 text-xs text-gray-300">
                          <input
                            type="checkbox"
                            checked={showOptimalLine}
                            onChange={(e) => setShowOptimalLine(e.target.checked)}
                            className="h-3.5 w-3.5 accent-[#00be64]"
                          />
                          Optimal
                        </label>
                        {/* <label
                          title={hasEnoughDataForForecast ? "" : "Not enough data to predict"}
                          className={`flex items-center gap-2 px-2 py-1 rounded-md border text-xs transition ${
                            hasEnoughDataForForecast
                              ? "border-white/10 bg-white/5 text-gray-300"
                              : "border-white/10 bg-white/5 text-gray-500 cursor-not-allowed opacity-70"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={showForecastLine}
                            onChange={(e) => setShowForecastLine(e.target.checked)}
                            disabled={!hasEnoughDataForForecast}
                            className="h-3.5 w-3.5 accent-[#60a5fa]"
                          />
                          Forecast
                        </label> */}

                        {/* <label className="text-sm text-gray-400">
                          Forecast Horizon:
                        </label>
                        <select
                          value={forecastHorizonMonths}
                          onChange={(e) =>
                            setForecastHorizonMonths(Number(e.target.value) as 1 | 3 | 5)
                          }
                          className="px-3 py-2 text-sm bg-[#0c1220] border border-[#60a5fa]/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#60a5fa] cursor-pointer hover:border-[#60a5fa] transition [&>option]:bg-[#0c1220] [&>option]:text-white"
                        >
                          <option value={1}>1 Month</option>
                          <option value={3}>3 Months</option>
                          <option value={5}>5 Months</option>
                        </select> */}
                      </div>

                      <div className="flex xl:justify-end">
                        <button
                          onClick={exportToCSV}
                          disabled={exportableData.length === 0}
                          className="px-4 py-1.5 text-sm text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-white/80 disabled:hover:border-white/20 disabled:hover:bg-transparent"
                        >
                          {exportableData.length > 0
                            ? `Export CSV (${exportableData.length})`
                            : "Export CSV"}
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="w-full h-[400px] rounded-xl overflow-hidden bg-[#0c1220]/50">
                  <Graph
                    title={graphTitle}
                    data={graphData}
                    // forecastData={forecastData}
                    timePeriod={timePeriod}
                    optimalValue={showOptimalLine ? getOptimalValue(selectedGraph) : undefined}
                  />
                </div>
              </section>
              )}
            </div>

            {/* RIGHT COLUMN - Summary Info */}
            {activeDevicePage === "device" && (
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
                    <p className="text-xs text-gray-500 mb-1">Zone ID</p>
                    <p className="font-mono text-sm text-[#00be64]">
                      {moistureData?.paddock_id || phData?.paddock_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Firmware Version</p>
                    <p className="font-mono text-sm text-[#00be64] break-all">
                      {firmwareVersion}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg border ${status.color === "green"
                    ? "from-green-500/10 to-green-500/5 border-green-500/30"
                    : "from-red-500/10 to-red-500/5 border-red-500/30"
                  }`}
              >
                <h3
                  className={`text-sm font-semibold uppercase tracking-wide mb-4 ${status.color === "green" ? "text-green-300" : "text-red-300"
                    }`}
                >
                  Device Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Status</p>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block w-3 h-3 rounded-full animate-pulse ${status.color === "green"
                            ? "bg-green-400"
                            : "bg-red-500"
                          }`}
                      />
                      <span
                        className={`text-lg font-semibold ${status.color === "green"
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
            )}
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

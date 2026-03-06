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
  getForecast,
} from "@/lib/device";
import InfoPopup from "@/components/InfoPopup";
import { MdDelete, MdEdit, MdArrowBack } from "react-icons/md";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import EditDeviceNameModal from "@/components/modals/EditDeviceNameModal";
import DeleteDeviceModal from "@/components/modals/DeleteDeviceModal";

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
  const [showOptimalLine, setShowOptimalLine] = useState(true);
  const [timePeriod, setTimePeriod] = useState<
    "week" | "month" | "6months" | "year" | "all"
  >("all");
  const [showForecastLine, setShowForecastLine] = useState(true);
  const [forecastData, setForecastData] = useState<Array<{ x: string; y: number }>>([]);

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
  const [isAlertsOpen, setIsAlertsOpen] = useState(true);
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

  function normalizeCropType(value: string | null | undefined): string {
    const raw = (value || "").trim().toLowerCase();
    if (!raw) return "default";

    const aliases: Record<string, string> = {
      grains: "grains",
      legumes: "legumes",
      fruit: "fruit",
      "oil seeds": "oil seeds",
      "root crops": "root crops",
      tropical: "tropical",
      other: "other",
    };

    return aliases[raw] || raw;
  }

  function normalizeSoilType(value: string | null | undefined): string {
    const raw = (value || "").trim().toLowerCase();
    if (!raw) return "default";

    if (raw.includes("sandy")) return "sandy";
    if (raw.includes("clay")) return "clay";
    if (raw.includes("loam")) return "loam";
    if (raw.includes("silt")) return "silty";
    if (raw.includes("peat")) return "peaty";
    if (raw.includes("chalk")) return "chalky";
    return "default";
  }

  function toTitleCaseWords(value: string | null | undefined): string {
    const text = (value || "default").trim();
    if (!text) return "Default";

    return text
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function getPlantAgeDays(): number | null {
    if (!plantationDate) return null;

    const plantedAt = new Date(plantationDate);
    if (Number.isNaN(plantedAt.getTime())) return null;

    const diffMs = Date.now() - plantedAt.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

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

    const ageDays = getPlantAgeDays();
    if (ageDays !== null) {
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

  // Check for critical alerts
  function getCriticalAlerts(): Array<{
    type: string;
    message: string;
    severity: "warning" | "critical";
    recommendation?: string;
  }> {
    if (deviceInsights?.alerts && deviceInsights.alerts.length > 0) {
      return deviceInsights.alerts.map((alert) => ({
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        recommendation: alert.recommendation,
      }));
    }

    const alerts: Array<{
      type: string;
      message: string;
      severity: "warning" | "critical";
      recommendation?: string;
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
      const moistureRange = getDynamicAlertRange("moisture");
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
      const tempRange = getDynamicAlertRange("temperature");
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
      const phRange = getDynamicAlertRange("ph");
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
      const nitrogenRange = getDynamicAlertRange("nitrogen");
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
      const potassiumRange = getDynamicAlertRange("potassium");
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
      const phosphorusRange = getDynamicAlertRange("phosphorus");
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

  const exportPaddockId = currentNode?.paddock_id
    ? String(currentNode.paddock_id)
    : "";
  const exportZoneName = exportPaddockId ? `Zone ${exportPaddockId}` : "Zone";

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

  const exportableData = filterDataByTimePeriod(selectedReadings);

  const graphData = filterDataByTimePeriod(selectedReadings).map((r) => ({
    x: r.timestamp,
    y: Number(r.reading_val),
  }));

  useEffect(() => {
    const runForecast = async () => {
      if (!showForecastLine) {
        setForecastData([]);
        return;
      }

      const history = selectedReadings
        .map((reading) => ({
          timestamp: reading.timestamp,
          value: Number(reading.reading_val),
        }))
        .filter((reading) => Number.isFinite(reading.value));

      if (history.length < 2) {
        setForecastData([]);
        return;
      }

      const forecastResult = await getForecast({
        sensor_type: selectedGraph,
        horizons_months: [1, 3, 5],
        readings: history,
      });

      if (!forecastResult.success) {
        setForecastData([]);
        return;
      }

      const nextForecastData = forecastResult.data.monthly_predictions.map(
        (point) => ({
          x: point.predicted_timestamp,
          y: Number(point.predicted_value),
        }),
      );

      setForecastData(nextForecastData);
    };

    void runForecast();
  }, [
    showForecastLine,
    selectedGraph,
    selectedReadings,
  ]);

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
    const data = filterDataByTimePeriod(selectedReadings);

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

  const criticalAlerts = getCriticalAlerts();

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
                <p className="text-gray-400 text-sm mt-1">
                  Node ID:{" "}
                  <span className="font-mono text-[#00be64]">
                    {moistureData?.node_id || phData?.node_id || nodeId}
                  </span>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${status.online ? "bg-green-500/10 border-green-500/40 text-green-300" : "bg-red-500/10 border-red-500/40 text-red-300"}`}>
                    <span className={`w-2 h-2 rounded-full ${status.online ? "bg-green-400" : "bg-red-500"}`}></span>
                    {status.label}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-[#00be64]/40 bg-[#00be64]/10 text-[#00be64] font-semibold">
                    Battery {BATTERY_PERCENT}%
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* LEFT COLUMN - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* CRITICAL ALERTS SECTION */}
              <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-green-500/30 rounded-2xl p-6 shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsAlertsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                    <span className="text-green-300">Alerts</span>
                    <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-[#00be64]/15 border border-[#00be64]/40 text-[#00be64] text-xs font-semibold">
                      {criticalAlerts.length}
                    </span>
                  </h2>
                  <span className="text-sm text-gray-300">
                    {isAlertsOpen ? "Hide" : "Show"} {isAlertsOpen ? "▲" : "▼"}
                  </span>
                </button>
                {isAlertsOpen && (
                  criticalAlerts.length > 0 ? (
                    <div className="space-y-3">
                      {criticalAlerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${alert.severity === "critical"
                              ? "bg-red-950/30 border-l-red-500 border border-red-500/20"
                              : "bg-orange-950/30 border-l-orange-500 border border-orange-500/20"
                            }`}
                        >
                          <div
                            className={`mt-0.5 text-lg font-bold flex-shrink-0 ${alert.severity === "critical"
                                ? "text-red-400"
                                : "text-orange-400"
                              }`}
                          >
                            ⚠
                          </div>
                          <div className="flex-grow">
                            <p
                              className={`text-sm font-bold ${alert.severity === "critical"
                                  ? "text-red-300"
                                  : "text-orange-300"
                                }`}
                            >
                              {alert.type}
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                              {alert.message}
                            </p>
                            {alert.recommendation && (
                              <p className="text-xs text-gray-400 mt-1.5">
                                Recommendation: {alert.recommendation}
                              </p>
                            )}
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
                          {toTitleCaseWords(cropType)} crop.
                        </p>
                      </div>
                    </div>
                  )
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

              {/* GRAPH SECTION */}
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
                    {getPlantAgeDays() !== null && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-300">
                        {getPlantAgeDays()} days since planting
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0c1220]/40 p-3">
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
                        <label className="flex items-center gap-2 px-2 py-1 rounded-md border border-white/10 bg-white/5 text-xs text-gray-300">
                          <input
                            type="checkbox"
                            checked={showForecastLine}
                            onChange={(e) => setShowForecastLine(e.target.checked)}
                            className="h-3.5 w-3.5 accent-[#60a5fa]"
                          />
                          Forecast (1/3/5m)
                        </label>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="w-full h-[400px] rounded-xl overflow-hidden bg-[#0c1220]/50">
                  <Graph
                    title={graphTitle}
                    data={graphData}
                    forecastData={forecastData}
                    timePeriod={timePeriod}
                    optimalValue={showOptimalLine ? getOptimalValue(selectedGraph) : undefined}
                  />
                </div>

                <div className="mt-4 flex justify-end">
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
                    <p className="text-xs text-gray-500 mb-1">Zone ID</p>
                    <p className="font-mono text-sm text-[#00be64]">
                      {moistureData?.paddock_id || phData?.paddock_id}
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

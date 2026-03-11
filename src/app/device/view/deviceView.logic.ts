export type TrendResult = {
  trend: "up" | "down" | "stable" | "no-data";
  percentChange: number;
};

export type DeviceStatusResult = {
  label: "Unknown" | "Offline" | "Online";
  color: "gray" | "red" | "green";
  online: boolean;
};

export type TimePeriod = "week" | "month" | "6months" | "year" | "all";

export function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function timeAgo(ts: string): string {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = (now - then) / 1000;

  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function deviceStatus(ts: string | null): DeviceStatusResult {
  if (!ts) return { label: "Unknown", color: "gray", online: false };

  const now = Date.now();
  const then = new Date(ts).getTime();
  const hours = (now - then) / 1000 / 3600;

  if (hours > 12) {
    return { label: "Offline", color: "red", online: false };
  }
  return { label: "Online", color: "green", online: true };
}

export function calculateTrend(
  readings: Array<{ reading_val: number | string }> | undefined,
): TrendResult {
  if (!readings || readings.length < 2) {
    return { trend: "no-data", percentChange: 0 };
  }

  const recentCount = Math.min(3, readings.length);
  const recentReadings = readings
    .slice(-recentCount)
    .map((reading) => Number(reading.reading_val));
  const recentAvg =
    recentReadings.reduce((acc, value) => acc + value, 0) / recentReadings.length;

  const previousStart = Math.max(0, readings.length - 6);
  const previousEnd = Math.max(0, readings.length - 3);
  if (previousStart === previousEnd) {
    return { trend: "no-data", percentChange: 0 };
  }

  const previousReadings = readings
    .slice(previousStart, previousEnd)
    .map((reading) => Number(reading.reading_val));
  if (previousReadings.length === 0) {
    return { trend: "no-data", percentChange: 0 };
  }

  const previousAvg =
    previousReadings.reduce((acc, value) => acc + value, 0) /
    previousReadings.length;

  const percentChange = ((recentAvg - previousAvg) / previousAvg) * 100;
  const absPercentChange = Math.abs(percentChange);

  if (absPercentChange < 0.5) return { trend: "stable", percentChange: 0 };

  return {
    trend: recentAvg > previousAvg ? "up" : "down",
    percentChange: parseFloat(percentChange.toFixed(1)),
  };
}

export function normalizeCropType(value: string | null | undefined): string {
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

export function normalizeSoilType(value: string | null | undefined): string {
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

export function toTitleCaseWords(value: string | null | undefined): string {
  const text = (value || "default").trim();
  if (!text) return "Default";

  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getPlantAgeDays(plantationDate: string | null): number | null {
  if (!plantationDate) return null;

  const plantedAt = new Date(plantationDate);
  if (Number.isNaN(plantedAt.getTime())) return null;

  const diffMs = Date.now() - plantedAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function filterReadingsByTimePeriod<T extends { timestamp: string }>(
  readings: T[] | undefined,
  timePeriod: TimePeriod,
): T[] {
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

  return readings.filter((reading) => new Date(reading.timestamp) >= cutoffDate);
}

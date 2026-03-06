// api/device.ts

/**
 * Base URL for API requests.
 * Pulled from NEXT_PUBLIC_API_URL.
 * Defaults to local backend in development and same-origin /api in production.
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "/api")
).replace(/\/+$/, "");

const FORECAST_API_BASE_URL = (
  process.env.NEXT_PUBLIC_FORECAST_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

/**
 * Request payload for updating/registering a device.
 */
export interface UpdateDeviceRequest {
  /** Unique identifier of the device (node). */
  node_id: string;

  /** Optional readable name for the device. */
  node_name?: string;

  /** Paddock the device belongs to. */
  paddock_id: number;

  /** SecretKey */
  secret_key: string;
}

/**
 * Response for device update/register requests.
 */
export interface UpdateDeviceResponse {
  success: boolean;
  message: string;
  node?: {
    node_id: string;
    node_name: string;
    paddock_id: number;
  };
}

/**
 * Request parameters to fetch device data.
 */
export interface DeviceDataRequest {
  /** Device Node ID. */
  nodeId: string;

  /** Reading type being requested – e.g., "temperature", "ph". */
  readingType: string;
}

/**
 * Response structure for device data queries.
 */
export interface DeviceDataResponse {
  success: boolean;
  message: string;
  node?: {
    node_id: string;
    node_name: string;
    paddock_id: number;
    fw_ver?: string | null;
    readings: {
      reading_type: string;
      reading_val: number | string;
      timestamp: string;
    }[];
  };
}

export interface DeviceInsightsResponse {
  success: boolean;
  message?: string;
  node_id?: string;
  paddock_id?: number | null;
  profile?: {
    crop_type?: string | null;
    soil_type?: string | null;
    crop_key?: string;
    soil_key?: string;
    area_hectares?: number | null;
    plant_date?: string | null;
    plant_age_days?: number | null;
  };
  latest_values?: Partial<Record<"moisture" | "ph" | "temperature" | "nitrogen" | "potassium" | "phosphorus", number | null>>;
  dynamic_ranges?: Partial<Record<"moisture" | "ph" | "temperature" | "nitrogen" | "potassium" | "phosphorus", { min: number; max: number }>>;
  optimal_values?: Partial<Record<"moisture" | "ph" | "temperature" | "nitrogen" | "potassium" | "phosphorus", number>>;
  alerts?: Array<{
    type: string;
    severity: "warning" | "critical";
    message: string;
    recommendation?: string;
    value?: number;
    range?: { min: number; max: number };
    direction?: "low" | "high";
  }>;
}

export interface ForecastReadingPoint {
  timestamp: string;
  value: number;
}

export interface ForecastRequest {
  sensor_type: string;
  horizons_months: number[];
  readings: ForecastReadingPoint[];
}

export interface ForecastResponse {
  sensor_type: string;
  model_name: string;
  monthly_predictions: Array<{
    month_ahead: number;
    predicted_timestamp: string;
    predicted_value: number;
  }>;
}

/**
 * Fetches sensor readings for a specific device and reading type.
 *
 * @param deviceDataReq - Object containing nodeId and readingType.
 * @param token - JWT authentication token.
 *
 * @returns A promise resolving to a DeviceDataResponse.
 *
 * The backend endpoint:
 *   GET /device/view/{nodeId}/{readingType}
 */
export async function getDeviceData(
  deviceDataReq: DeviceDataRequest,
  token: string
): Promise<DeviceDataResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/device/view/${deviceDataReq.nodeId}/${deviceDataReq.readingType}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || "Failed to fetch device data",
      };
    }

    return {
      success: true,
      message: "Device data fetched successfully",
      node: {
        node_id: data.node_id,
        node_name: data.node_name || "",
        paddock_id: data.paddock_id,
        fw_ver: data.fw_ver ?? null,
        readings: data.readings || [],
      },
    };
  } catch (error) {
    console.error("Error fetching device data:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

export async function getDeviceInsights(
  nodeId: string,
  token: string,
  profileOverride?: {
    cropType?: string;
    soilType?: string;
  }
): Promise<DeviceInsightsResponse> {
  try {
    const query = new URLSearchParams();
    if (profileOverride?.cropType) {
      query.set("crop_type", profileOverride.cropType);
    }
    if (profileOverride?.soilType) {
      query.set("soil_type", profileOverride.soilType);
    }

    const response = await fetch(
      `${API_BASE_URL}/device/insights/${nodeId}${query.toString() ? `?${query.toString()}` : ""}`,
      {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || "Failed to fetch device insights",
      };
    }

    return {
      success: true,
      message: "Device insights fetched successfully",
      node_id: data.node_id,
      paddock_id: data.paddock_id,
      profile: data.profile,
      latest_values: data.latest_values,
      dynamic_ranges: data.dynamic_ranges,
      optimal_values: data.optimal_values,
      alerts: data.alerts || [],
    };
  } catch (error) {
    console.error("Error fetching device insights:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

export async function getForecast(
  payload: ForecastRequest
): Promise<{ success: true; data: ForecastResponse } | { success: false; message: string }> {
  try {
    const response = await fetch(`${FORECAST_API_BASE_URL}/forecast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || data.message || "Failed to fetch forecast",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return {
      success: false,
      message: "Forecast service unavailable",
    };
  }
}


/**
 * Registers or updates a device in the backend.
 *
 * @param deviceData - Device registration/update payload.
 * @param token - JWT authentication token.
 *
 * @returns A promise resolving to an UpdateDeviceResponse.
 *
 * The backend endpoint:
 *   POST /device/register
 */
export async function updateDevice(
  deviceData: UpdateDeviceRequest,
  token: string
): Promise<UpdateDeviceResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/device/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(deviceData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || "Failed to update device",
      };
    }

    return {
      success: true,
      message: data.message || "Device updated successfully",
      node: {
        node_id: data.node.node_id,
        node_name: data.node.node_name || "",
        paddock_id: data.node.paddock_id,
      },
    };
  } catch (error) {
    console.error("Error updating device:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

/**
 * Request payload for editing a device name.
 */
export interface EditDeviceNameRequest {
  /** Unique identifier of the device (node). */
  node_id: string;

  /** New name for the device. */
  node_name: string;
}

/**
 * Response for device name edit requests.
 */
export interface EditDeviceNameResponse {
  success: boolean;
  message: string;
}

/**
 * Edits the name of a device.
 *
 * @param request - Object containing node_id and new node_name.
 * @param token - JWT authentication token.
 *
 * @returns A promise resolving to an EditDeviceNameResponse.
 *
 * The backend endpoint:
 *   PATCH /device/edit-name/{node_id}
 */
export async function editDeviceName(
  request: EditDeviceNameRequest,
  token: string
): Promise<EditDeviceNameResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/device/edit-name/${request.node_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ node_name: request.node_name }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || "Failed to update device name",
      };
    }

    return {
      success: true,
      message: data.message || "Device name updated successfully",
    };
  } catch (error) {
    console.error("Error updating device name:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

/**
 * Response for device unlink requests.
 */
export interface UnlinkDeviceResponse {
  success: boolean;
  message: string;
}

/**
 * Unlinks a device from the user's account.
 *
 * @param nodeId - Unique identifier of the device (node) to unlink.
 * @param token - JWT authentication token.
 *
 * @returns A promise resolving to an UnlinkDeviceResponse.
 *
 * The backend endpoint:
 *   PATCH /device/unlink/{node_id}
 */
export async function unlinkDevice(
  nodeId: string,
  token: string
): Promise<UnlinkDeviceResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/device/unlink/${nodeId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || "Failed to unlink device",
      };
    }

    return {
      success: true,
      message: data.message || "Device unlinked successfully",
    };
  } catch (error) {
    console.error("Error unlinking device:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

/**
 * Fetches all devices for the authenticated user.
 *
 * @param token - JWT authentication token.
 * @returns A promise resolving to the list of devices.
 */
export async function getDevices(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/device/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to fetch devices",
        devices: [],
      };
    }

    return {
      success: true,
      devices: data.devices || [],
    };
  } catch (error) {
    console.error("Error fetching devices:", error);
    return {
      success: false,
      message: "An error occurred while fetching devices.",
      devices: [],
    };
  }
}

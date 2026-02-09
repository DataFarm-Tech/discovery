// api/device.ts

/**
 * Base URL for API requests.
 * Pulled from NEXT_PUBLIC_API_URL or defaults to local server.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    readings: {
      reading_type: string;
      reading_val: number | string;
      timestamp: string;
    }[];
  };
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

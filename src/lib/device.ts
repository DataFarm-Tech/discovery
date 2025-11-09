const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UpdateDeviceRequest {
  node_id: string;
  node_name?: string; // always string
  paddock_id: number;
}

export interface UpdateDeviceResponse {
  success: boolean;
  message: string;
  node?: {
    node_id: string;
    node_name: string; // never null
    paddock_id: number;
  };
}

export async function updateDevice(
  deviceData: UpdateDeviceRequest,
  token: string
): Promise<UpdateDeviceResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(deviceData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || 'Failed to update device',
      };
    }

    return {
      success: true,
      message: data.message || 'Device updated successfully',
      node: {
        node_id: data.node.node_id,
        node_name: data.node.node_name || '', // ensure string
        paddock_id: data.node.paddock_id,
      },
    };
  } catch (error) {
    console.error('Error updating device:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    };
  }
}

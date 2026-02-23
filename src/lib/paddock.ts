const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

export type cropType = 'default' | 'Grains' | 'Legumes' | 'Fruit' |'Oil Seeds' |'Root Crops' | 'Tropical'| 'Other';

export interface CreatePaddockRequest {
  paddock_name: string | null;
  crop_type: cropType;
  area: number | null;
  plant_date: string;  // Required
}

export interface CreatePaddockResponse {
  success: boolean;
  message: string;
}

export interface PaddockApiError {
  success: false;
  message: string;
}

export interface UpdatePaddockRequest {
  paddock_name: string;
  crop_type: cropType;
  area: number;
}

export interface UpdatePaddockResponse {
  success: boolean;
  message: string;
  paddock?: {
    paddock_id: number;
    paddock_name: string;
    crop_type: cropType;
    area: number
  };
}

export interface GetDevicesPaddockResponse {
    success: boolean;
    message: string;
    devices: Array<{
      node_id: string;
      node_name: string;
      battery: number;
    }>;
}

export interface SensorAveragesResponse {
  success: boolean;
  message: string;
  paddock_id?: number;
  paddock_name?: string;
  nodes_count?: number;
  nodes_with_readings?: number;
  sensor_averages?: {
    [key: string]: number;
  };
  sensor_details?: {
    [key: string]: {
      average: number;
      min: number;
      max: number;
      count: number;
    };
  };
}

export async function getPaddockDevices(
    paddockId: string,
    token: string
  ): Promise<GetDevicesPaddockResponse | PaddockApiError> {
    try {
      const response = await fetch(`${API_BASE_URL}/paddock/${paddockId}/devices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch devices',
          devices: [],
        };
      }
        return {
        success: true,
        message: data.message || 'Devices fetched successfully',
        devices: data.devices || [],
      };

    } catch (error) {
      console.error('Error fetching paddock devices:', error);
      return {
        success: false,
        message: 'An error occurred while fetching devices',
        devices: [],
      };
    }
}

/**
 * Gets sensor averages for a paddock
 * @param paddockId - ID of the paddock
 * @param token - JWT authentication token
 * @returns Promise with sensor averages data
 */
export async function getPaddockSensorAverages(
  paddockId: string,
  token: string
): Promise<SensorAveragesResponse | PaddockApiError> {
  try {
    const response = await fetch(`${API_BASE_URL}/paddock/${paddockId}/sensor-averages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch sensor averages',
      };
    }

    return {
      success: true,
      message: data.message || 'Sensor averages fetched successfully',
      paddock_id: data.paddock_id,
      paddock_name: data.paddock_name,
      nodes_count: data.nodes_count,
      nodes_with_readings: data.nodes_with_readings,
      sensor_averages: data.sensor_averages || {},
      sensor_details: data.sensor_details || {},
    };
  } catch (error) {
    console.error('Error fetching sensor averages:', error);
    return {
      success: false,
      message: 'An error occurred while fetching sensor averages',
    };
  }
}

/**
 * Creates a new paddock
 * @param paddockName - Name of the paddock (optional)
 * @param cropType - Type of the paddock
 * @param area - Area in hectares (optional, as string from input)
 * @param plant_date - Plant date (REQUIRED, as string from datetime-local)
 * @param token - JWT authentication token
 * @returns Promise with the API response
 */
export async function createPaddock(
  paddockName: string | null,
  cropType: cropType,
  area: string,
  plant_date: string,
  soilType: string,
  token: string
): Promise<CreatePaddockResponse> {
  try {
    // Validate plant_date is not empty
    if (!plant_date || plant_date.trim() === '') {
      return {
        success: false,
        message: 'Plant date is required',
      };
    }

    // Convert area to number or null
    const areaValue = area && area.trim() !== '' ? parseInt(area, 10) : null;

    const response = await fetch(`${API_BASE_URL}/paddock/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        paddock_name: paddockName || null,
        crop_type: cropType,
        area: areaValue,
        date_plant: plant_date,  // Send as-is, required
        soil_type: soilType
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || 'Failed to create paddock',
      };
    }

    return {
      success: true,
      message: data.message || 'Paddock created successfully'
    };
  } catch (error) {
    console.error('Error creating paddock:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    };
  }
}

/**
 * Gets all paddocks for the current user
 * @param token - JWT authentication token
 * @returns Promise with array of paddocks
 */
export async function getPaddocks(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/paddock/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch paddocks',
        paddocks: [],
      };
    }

    return {
      success: true,
      paddocks: data.paddocks || [],
    };
  } catch (error) {
    console.error('Error fetching paddocks:', error);
    return {
      success: false,
      message: 'An error occurred while fetching paddocks',
      paddocks: [],
    };
  }
}

/**
 * Updates a paddock's name
 * @param paddockId - ID of the paddock to update
 * @param paddockName - New name for the paddock
 * @param cropType - Type of the paddock
 * @param area - Area in hectares
 * @param token - JWT authentication token
 * @returns Promise with the API response
 */
export async function updatePaddockName(
  paddockId: string,
  paddockName: string,
  cropType: cropType,
  area: number,
  token: string
): Promise<UpdatePaddockResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/paddock/${paddockId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        paddock_name: paddockName,
        crop_type: cropType,
        area: area
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || 'Failed to update paddock',
      };
    }

    return {
      success: true,
      message: data.message || 'Paddock updated successfully',
      paddock: data.paddock,
    };
  } catch (error) {
    console.error('Error updating paddock:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    };
  }
}

/**
 * Deletes a paddock
 * @param paddockId - ID of the paddock to delete
 * @param token - JWT authentication token
 * @returns Promise with the API response
 */
export async function deletePaddock(paddockId: string | number, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/paddock/${paddockId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting paddock:', error);
    return {
      success: false,
      message: 'Failed to delete paddock',
    };
  }
}
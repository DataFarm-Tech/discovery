const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CreatePaddockRequest {
  paddock_name: string | null;
}

export interface CreatePaddockResponse {
  success: boolean;
  message: string;
}

export interface PaddockApiError {
  success: false;
  message: string;
}

/**
 * Creates a new paddock
 * @param paddockName - Name of the paddock (optional)
 * @param token - JWT authentication token
 * @returns Promise with the API response
 */
export async function createPaddock(
  paddockName: string | null,
  token: string
): Promise<CreatePaddockResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/paddock/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        paddock_name: paddockName || null,
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
import { buildApiUrl } from "./auth/config";

export interface UserSettingsResponse {
  success: boolean;
  message?: string;
  data?: {
    alerts_enabled: boolean;
  };
}

export async function getUserSettings(token: string): Promise<UserSettingsResponse> {
  try {
    const response = await fetch(buildApiUrl("/auth/settings"), {
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
        message: data.message || data.detail || "Failed to load settings",
      };
    }

    return {
      success: true,
      data: {
        alerts_enabled: Boolean(data?.data?.alerts_enabled),
      },
    };
  } catch (error) {
    console.error("Error loading user settings:", error);
    return {
      success: false,
      message: "Unable to connect to the server.",
    };
  }
}

export async function updateUserSettings(
  token: string,
  alertsEnabled: boolean,
): Promise<UserSettingsResponse> {
  try {
    const response = await fetch(buildApiUrl("/auth/settings"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        alerts_enabled: alertsEnabled,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || "Failed to update settings",
      };
    }

    return {
      success: true,
      message: data.message,
      data: {
        alerts_enabled: Boolean(data?.data?.alerts_enabled),
      },
    };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return {
      success: false,
      message: "Unable to connect to the server.",
    };
  }
}

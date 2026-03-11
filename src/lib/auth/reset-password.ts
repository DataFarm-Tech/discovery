import { buildApiUrl } from './config';

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  try {
    const response = await fetch(buildApiUrl('/auth/reset-password-confirm'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || data.message || 'Failed to reset password.',
      };
    }

    return {
      success: true,
      message: data.message || 'Password has been reset successfully. You can now login.',
    };
  } catch (err) {
    console.error('Network error:', err);
    return {
      success: false,
      message: 'Unable to connect to the server. Please try again later.',
    };
  }
}
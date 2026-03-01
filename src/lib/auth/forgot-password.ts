import { buildApiUrl } from './config';

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  try {
    const response = await fetch(buildApiUrl('/auth/reset-password-request'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || data.message || 'Unable to process your request right now.',
      };
    }

    return {
      success: true,
      message: data.message || 'If an account exists, a reset link has been sent.',
    };
  } catch (err) {
    console.error('Network error:', err);
    return {
      success: false,
      message: 'Unable to connect to the server. Please try again later.',
    };
  }
}
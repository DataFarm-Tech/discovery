import { buildApiUrl } from './config';

export interface SignupResponse {
  success: boolean;
  message: string;
}

export async function signupUser(firstName: string, lastName: string, email: string, password: string): Promise<SignupResponse> {
  const body = {
    first_name: firstName,
    last_name: lastName,
    user_id: email,
    password,
  };

  try {
    const response = await fetch(buildApiUrl('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || data.message || 'Signup failed.',
      };
    }

    return {
      success: true,
      message: 'Signup successful!',
    };
  } catch (err) {
    console.error('Network error:', err);
    return {
      success: false,
      message: 'Unable to connect to the server. Please try again later.',
    };
  }
}

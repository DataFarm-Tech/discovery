export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
  };
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  try {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || 'Hmm… we couldn’t log you in. Please check your email and password and try again..',
      };
    }

    return {
      success: true,
      message: 'Login successful.',
      data,
    };
  } catch (err) {
    console.error('Network error:', err);
    return {
      success: false,
      message: 'Unable to connect to the server. Please try again later.',
    };
  }
}

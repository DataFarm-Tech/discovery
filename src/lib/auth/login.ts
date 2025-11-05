export interface LoginResponse {
  token: string;
  user?: any;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('https://your-backend.com/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
}

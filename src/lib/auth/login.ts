export interface LoginResponse {
  access_token: string;
  detail: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  // Create form data
  const formData = new URLSearchParams();
  formData.append("username", email); // OAuth2PasswordRequestForm expects 'username'
  formData.append("password", password);

  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // Important!
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
}

// src/lib/auth/signup.ts
export interface SignupResponse {
  detail: string;
}

export async function signupUser(firstName: string, lastName: string, email: string, password: string): Promise<SignupResponse> {
  const body = { first_name: firstName, last_name: lastName, user_id: email, password };

  const response = await fetch('http://localhost:8000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  console.log(response.status);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Signup failed');
  }

  return response.json();
}
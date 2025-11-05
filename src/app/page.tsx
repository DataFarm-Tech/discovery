'use client';

import { useState } from 'react';
import { loginUser } from '@/lib/auth/login';
import Link from 'next/link'; // <- import Link at the top

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const data = await loginUser(email, password);
    
    // Log token to console for development
    console.log("Access Token:", data.access_token);

    // Save token in localStorage
    localStorage.setItem('token', data.access_token);

    // Redirect to dashboard
    window.location.href = '/dashboard';
  } catch (error: any) {
    console.error("Login Error:", error);
    alert(error.message);
  }
};


  return (
    <main
      className="flex items-center justify-center min-h-screen bg-cover bg-center px-4"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-xl p-6 sm:p-8"
        style={{
          backgroundColor: 'rgba(20, 20, 20, 0.9)', // Dark translucent form
        }}
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
            Let’s Get Farming!
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block font-semibold mb-2 text-white"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full p-3 rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-semibold mb-2 text-white"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-3 rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-green-500 font-semibold text-white transition-colors hover:bg-green-600"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-white">
          Don’t have an account?{' '}
          <a
            href="/signup"
            className="text-green-500 font-semibold underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}

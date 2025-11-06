'use client';

import { useState } from 'react';
import { loginUser, LoginResponse } from '@/lib/auth/login';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result: LoginResponse = await loginUser(email, password);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    // ✅ Save token correctly
    const token = result.data?.access_token;
    if (token) {
      localStorage.setItem('token', token);
    }

    toast.success('Login successful! Redirecting...');

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
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
        style={{ backgroundColor: 'rgba(20, 20, 20, 0.9)' }}
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Let’s Get Farming!
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block font-semibold mb-2 text-white">
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
            <label htmlFor="password" className="block font-semibold mb-2 text-white">
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
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold text-white transition-colors ${
              loading ? 'bg-green-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-white">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-green-500 font-semibold underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

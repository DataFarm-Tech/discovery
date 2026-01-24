'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, LoginResponse } from '@/lib/auth/login';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result: LoginResponse = await loginUser(email, password);

      if (!result.success) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      // Save token
      const token = result.data?.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }

      toast.success('Login successful! Redirecting...');

      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
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
        style={{ backgroundColor: 'rgba(20, 20, 20, 0.9)' }}
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Let's Get Farming!
        </h1>

        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block font-semibold mb-2 text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              required
              placeholder="you@example.com"
              className="w-full p-3 rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-semibold mb-2 text-white">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
                placeholder="••••••••"
                className="w-full p-3 pr-12 rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold text-white transition-colors ${
              loading ? 'bg-green-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <p className="text-center text-sm mt-6 text-white">
          Don't have an account?{' '}
          <Link href="/signup" className="text-green-500 font-semibold underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
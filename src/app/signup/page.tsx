'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { signupUser } from '@/lib/auth/signup';
import Link from 'next/link';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    const result = await signupUser(firstName, lastName, email, password);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success('Signup successful! Redirecting...');

    setTimeout(() => {
      window.location.href = '/';
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
          Join the Farm Adventure!
        </h1>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block font-semibold mb-2 text-white">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
                className="w-full p-3 rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block font-semibold mb-2 text-white">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Doe"
                className="w-full p-3 rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

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

          <div>
            <label htmlFor="confirmPassword" className="block font-semibold mb-2 text-white">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-white">
          Already have an account?{' '}
          <Link href="/" className="text-green-500 font-semibold underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

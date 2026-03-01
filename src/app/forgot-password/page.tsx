'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '@/lib/auth/forgot-password';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#0c1220] px-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#00be64]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00be64]/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-gray-400">Enter your email and we’ll send a reset link.</p>
        </div>

        <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2 text-white">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00be64] hover:bg-[#00d470] text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00be64]/20 hover:shadow-xl hover:shadow-[#00be64]/30"
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Remembered your password?{' '}
            <Link href="/" className="text-[#00be64] hover:text-[#00d470] font-semibold transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
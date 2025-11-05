'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login submitted:', { email, password });
    // TODO: Add authentication API call here
  };

  return (
    <main
      className="flex h-screen items-center justify-center"
      style={{ backgroundColor: '#0c1220' }} // Solid dark background
    >
      <div
        className="w-full max-w-md rounded-xl shadow-xl p-8"
        style={{ backgroundColor: '#ffffff' }} // Form background is white
      >
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{ color: '#0c1220' }}
        >
          DataFarm
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              className="block font-semibold mb-2"
              htmlFor="email"
              style={{ color: '#0c1220' }}
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
              style={{
                width: '100%',
                border: '1px solid #00be64',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                outline: 'none',
                color: '#0c1220',
              }}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #00be64')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
            />
          </div>

          <div>
            <label
              className="block font-semibold mb-2"
              htmlFor="password"
              style={{ color: '#0c1220' }}
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
              style={{
                width: '100%',
                border: '1px solid #00be64',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                outline: 'none',
                color: '#0c1220',
              }}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #00be64')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#00be64', // Green button
              color: '#ffffff', // White text
              fontWeight: 600,
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#00a852') // Slightly darker green on hover
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#00be64')
            }
          >
            Login
          </button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: '#0c1220' }}
        >
          Don’t have an account?{' '}
          <a
            href="/signup"
            style={{ color: '#00be64', fontWeight: 600, textDecoration: 'underline' }}
          >
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}

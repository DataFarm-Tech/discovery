'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { signupUser } from '@/lib/auth/signup';
import Link from 'next/link';

// Simple password strength (0-4 score)
const getPasswordStrength = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(4, score);
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleSignup = async () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    if (passwordStrength < 2) {
      setPasswordError('Password is too weak');
      toast.error('Password is too weak');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      toast.error('Passwords do not match!');
      return;
    }

    if (!acceptedTerms) {
      toast.error('You must accept the Terms of Service and Privacy Policy to continue.');
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const strength = getPasswordStrength(value);
    setPasswordStrength(strength);
    setPasswordError(value && strength < 2 ? 'Password is too weak' : '');
  };

  // Real-time confirm password validation
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && password) {
      setConfirmPasswordError(value !== password ? 'Passwords do not match' : '');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Real-time email validation
  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <>
      <main
        className="flex items-center justify-center min-h-screen bg-cover bg-center px-4 py-8"
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

          <div className="space-y-5">
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
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  required
                  placeholder="John"
                  className="w-full p-3 rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
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
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  required
                  placeholder="Doe"
                  className="w-full p-3 rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
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
                onBlur={handleEmailBlur}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
                placeholder="you@example.com"
                className={`w-full p-3 rounded-md border ${emailError ? 'border-red-500' : 'border-green-500'} bg-gray-800 text-white outline-none focus:ring-2 ${emailError ? 'focus:ring-red-500' : 'focus:ring-green-500'} disabled:opacity-50`}
              />
              {emailError && (
                <p className="text-red-400 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block font-semibold mb-2 text-white">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
                placeholder="••••••••"
                className={`w-full p-3 rounded-md border ${passwordError ? 'border-red-500' : 'border-green-500'} bg-gray-800 text-white outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-500' : 'focus:ring-green-500'} disabled:opacity-50`}
              />
              
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? passwordStrength <= 1 ? 'bg-red-500'
                            : passwordStrength === 2 ? 'bg-yellow-500'
                            : passwordStrength === 3 ? 'bg-blue-500'
                            : 'bg-green-500'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength <= 1 ? 'text-red-400' :
                    passwordStrength === 2 ? 'text-yellow-400' :
                    passwordStrength === 3 ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
                  </p>
                </div>
              )}
              
              {passwordError && (
                <p className="text-red-400 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-semibold mb-2 text-white">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
                placeholder="••••••••"
                className={`w-full p-3 rounded-md border ${confirmPasswordError ? 'border-red-500' : 'border-green-500'} bg-gray-800 text-white outline-none focus:ring-2 ${confirmPasswordError ? 'focus:ring-red-500' : 'focus:ring-green-500'} disabled:opacity-50`}
              />
              {confirmPasswordError && (
                <p className="text-red-400 text-sm mt-1">{confirmPasswordError}</p>
              )}
              {!confirmPasswordError && confirmPassword && password === confirmPassword && (
                <p className="text-green-400 text-sm mt-1">✓ Passwords match</p>
              )}
            </div>

            {/* Password Requirements Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
              <p className="text-xs text-gray-400 font-semibold mb-2">Password tips:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className={password.length >= 8 ? 'text-green-400' : ''}>
                  {password.length >= 8 ? '✓' : '○'} At least 8 characters (12+ recommended)
                </li>
                <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-400' : ''}>
                  {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'} Mix of uppercase and lowercase
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
                  {/[0-9]/.test(password) ? '✓' : '○'} Include numbers
                </li>
                <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : ''}>
                  {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} Add symbols (!@#$%)
                </li>
              </ul>
            </div>

            {/* Legal Agreements */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={loading}
                  required
                  className="mt-1 h-4 w-4 rounded border-green-500 bg-gray-800 text-green-500 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="text-green-500 underline hover:text-green-400"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyModal(true);
                    }}
                    className="text-green-500 underline hover:text-green-400"
                  >
                    Privacy Policy
                  </button>
                  <span className="text-red-400">*</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className={`w-full py-3 rounded-md font-semibold text-white transition-colors ${
                loading ? 'bg-green-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>

          <p className="text-center text-sm mt-6 text-white">
            Already have an account?{' '}
            <Link href="/" className="text-green-500 font-semibold underline">
              Log in
            </Link>
          </p>
        </div>
      </main>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="bg-white/95 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Terms of Service</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-gray-700 space-y-5">
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p className="text-sm leading-relaxed">By accessing and using this Farm Adventure service, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">2. Use License</h3>
                <p className="text-sm leading-relaxed">Permission is granted to temporarily use this service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">3. User Account</h3>
                <p className="text-sm leading-relaxed">You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">4. Prohibited Uses</h3>
                <p className="text-sm leading-relaxed">You may not use the service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction when using our service.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">5. Limitation of Liability</h3>
                <p className="text-sm leading-relaxed">In no event shall Farm Adventure or its suppliers be liable for any damages arising out of the use or inability to use the service.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">6. Modifications</h3>
                <p className="text-sm leading-relaxed">We reserve the right to modify these terms at any time. We will notify users of any changes by updating the date at the bottom of this page.</p>
              </section>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div 
            className="bg-white/95 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-gray-700 space-y-5">
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                <p className="text-sm leading-relaxed">We collect information you provide directly to us, including your name, email address, and any other information you choose to provide.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
                <p className="text-sm leading-relaxed">We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect our users.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">3. Information Sharing</h3>
                <p className="text-sm leading-relaxed">We do not share your personal information with third parties except as described in this privacy policy or with your consent.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">4. Data Security</h3>
                <p className="text-sm leading-relaxed">We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">5. Your Rights</h3>
                <p className="text-sm leading-relaxed">You have the right to access, update, or delete your personal information at any time by contacting us.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">6. Contact Us</h3>
                <p className="text-sm leading-relaxed">If you have any questions about this Privacy Policy, please contact us at privacy@farmadventure.com</p>
              </section>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
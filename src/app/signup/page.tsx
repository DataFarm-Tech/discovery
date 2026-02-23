'use client';

import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { signupUser } from '@/lib/auth/signup';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSignup();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const strength = getPasswordStrength(value);
    setPasswordStrength(strength);
    setPasswordError(value && strength < 2 ? 'Password is too weak' : '');
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && password) {
      setConfirmPasswordError(value !== password ? 'Passwords do not match' : '');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <>
      <main className="flex items-center justify-center min-h-screen bg-[#0c1220] px-4 py-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#00be64]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00be64]/5 rounded-full blur-3xl" />
        
        <div className="w-full max-w-2xl relative z-10">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00be64]/10 border border-[#00be64]/30 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-[#00be64]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Get Started</h1>
            <p className="text-gray-400">Create your Discovery account</p>
          </div>

          {/* Signup Form */}
          <div className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 shadow-xl">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold mb-2 text-white">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold mb-2 text-white">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2 text-white">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  disabled={loading}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 bg-[#0c1220] border ${emailError ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200 disabled:opacity-50`}
                />
                {emailError && (
                  <p className="text-red-400 text-sm mt-1">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2 text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-12 bg-[#0c1220] border ${passwordError ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200 disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00be64] transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded transition-all duration-300 ${
                            level <= passwordStrength
                              ? passwordStrength <= 1 ? 'bg-red-500'
                              : passwordStrength === 2 ? 'bg-yellow-500'
                              : passwordStrength === 3 ? 'bg-blue-500'
                              : 'bg-[#00be64]'
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength <= 1 ? 'text-red-400' :
                      passwordStrength === 2 ? 'text-yellow-400' :
                      passwordStrength === 3 ? 'text-blue-400' : 'text-[#00be64]'
                    }`}>
                      {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
                    </p>
                  </div>
                )}
                
                {passwordError && (
                  <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2 text-white">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-12 bg-[#0c1220] border ${confirmPasswordError ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200 disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00be64] transition-colors disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-red-400 text-sm mt-1">{confirmPasswordError}</p>
                )}
                {!confirmPasswordError && confirmPassword && password === confirmPassword && (
                  <p className="text-[#00be64] text-sm mt-1">✓ Passwords match</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-[#0c1220]/50 border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-semibold mb-2">Password requirements:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`text-xs flex items-center gap-2 ${password.length >= 8 ? 'text-[#00be64]' : 'text-gray-500'}`}>
                    <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-[#00be64]' : 'bg-gray-500'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-[#00be64]' : 'text-gray-500'}`}>
                    <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-[#00be64]' : 'bg-gray-500'}`} />
                    <span>Upper & lowercase</span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-[#00be64]' : 'text-gray-500'}`}>
                    <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-[#00be64]' : 'bg-gray-500'}`} />
                    <span>Numbers</span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? 'text-[#00be64]' : 'text-gray-500'}`}>
                    <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-[#00be64]' : 'bg-gray-500'}`} />
                    <span>Symbols (!@#$%)</span>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 h-5 w-5 rounded border-gray-700 bg-[#0c1220] text-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 disabled:opacity-50 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="text-[#00be64] hover:text-[#00d470] underline transition-colors"
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
                    className="text-[#00be64] hover:text-[#00d470] underline transition-colors"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00be64] hover:bg-[#00d470] text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00be64]/20 hover:shadow-xl hover:shadow-[#00be64]/30"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/" className="text-[#00be64] hover:text-[#00d470] font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Terms Modal */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-gray-300 space-y-4">
              <section>
                <h3 className="font-semibold text-white mb-2">1. Acceptance of Terms</h3>
                <p className="text-sm leading-relaxed">By accessing and using this Discovery service, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">2. Use License</h3>
                <p className="text-sm leading-relaxed">Permission is granted to temporarily use this service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">3. User Account</h3>
                <p className="text-sm leading-relaxed">You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">4. Prohibited Uses</h3>
                <p className="text-sm leading-relaxed">You may not use the service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction when using our service.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">5. Limitation of Liability</h3>
                <p className="text-sm leading-relaxed">In no event shall Discovery or its suppliers be liable for any damages arising out of the use or inability to use the service.</p>
              </section>
            </div>
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-2.5 bg-[#00be64] hover:bg-[#00d470] text-white font-medium rounded-xl transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-gray-300 space-y-4">
              <section>
                <h3 className="font-semibold text-white mb-2">1. Information We Collect</h3>
                <p className="text-sm leading-relaxed">We collect information you provide directly to us, including your name, email address, and any other information you choose to provide.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">2. How We Use Your Information</h3>
                <p className="text-sm leading-relaxed">We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect our users.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">3. Information Sharing</h3>
                <p className="text-sm leading-relaxed">We do not share your personal information with third parties except as described in this privacy policy or with your consent.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">4. Data Security</h3>
                <p className="text-sm leading-relaxed">We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">5. Your Rights</h3>
                <p className="text-sm leading-relaxed">You have the right to access, update, or delete your personal information at any time by contacting us.</p>
              </section>
              
              <section>
                <h3 className="font-semibold text-white mb-2">6. Contact Us</h3>
                <p className="text-sm leading-relaxed">If you have any questions about this Privacy Policy, please contact us at privacy@discovery.com</p>
              </section>
            </div>
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-2.5 bg-[#00be64] hover:bg-[#00d470] text-white font-medium rounded-xl transition-all duration-200"
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
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { mapFirebaseAuthError } from '../lib/firebase';
import { GoogleLogoSvg } from './LoginPage';

export function RegisterPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, registerWithEmail } = useStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/', { replace: true });
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(fullName, email, password);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-14 h-14 rounded-2xl bg-[#E31E24] text-white flex items-center justify-center shadow-sm mb-4">
        <UserPlus className="w-7 h-7" />
      </div>

      <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-[#1F1F1F] tracking-tight">
        নতুন অ্যাকাউন্ট খুলুন
      </h1>
      <p className="text-sm text-[#737373] mt-1 mb-7">
        জনতা মার্টে দ্রুত ও নিরাপদ কেনাকাটা শুরু করুন
      </p>

      <div className="w-full max-w-[420px] bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_6px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignup}
          className="w-full h-11 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] transition-all flex items-center justify-center gap-3 text-sm font-semibold text-[#333333] cursor-pointer disabled:opacity-60"
        >
          <GoogleLogoSvg />
          <span>{googleLoading ? 'অপেক্ষা করুন...' : 'গুগল দিয়ে চালিয়ে যান'}</span>
        </button>

        <div className="relative my-6 flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-[#EEEEEE]" />
          <span className="relative bg-white px-3 text-xs text-[#737373]">অথবা</span>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-semibold text-[#333333] mb-1.5">
              পুরো নাম
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#E3E3E3] text-sm text-[#333333] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-[#333333] mb-1.5">
              ইমেইল
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#E3E3E3] text-sm text-[#333333] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-[#333333] mb-1.5">
              পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#E3E3E3] text-sm text-[#333333] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#525252] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-11 mt-2 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? 'অ্যাকাউন্ট খোলা হচ্ছে...' : 'অ্যাকাউন্ট খুলুন'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-[#737373]">
        আগে থেকেই অ্যাকাউন্ট আছে?{' '}
        <Link to="/login" className="font-semibold text-[#E31E24] hover:underline">
          লগইন করুন
        </Link>
      </p>

      <Link
        to="/"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#333333] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>দোকানে ফিরে যান</span>
      </Link>
    </div>
  );
}

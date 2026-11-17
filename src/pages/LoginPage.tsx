import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { mapFirebaseAuthError, isVerifiedAdminEmail } from '../lib/firebase';
import { BRAND_LOGO_URL } from '../data/bangladeshData';

export function GoogleLogoSvg() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isRegisteredUser, loginWithGoogle, loginWithEmail, resendVerificationEmail, reloadUser, logout } =
    useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = (location.state as { from?: string } | null)?.from || '/';

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const signedIn = await loginWithGoogle();
      if (isVerifiedAdminEmail(signedIn.email, signedIn.emailVerified) && redirectTo === '/admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('অনুগ্রহ করে সঠিক ইমেইল ও পাসওয়ার্ড লিখুন।');
      return;
    }
    setLoading(true);
    try {
      const signedIn = await loginWithEmail(email, password);
      if (signedIn.emailVerified) {
        if (isVerifiedAdminEmail(signedIn.email, signedIn.emailVerified) && redirectTo === '/admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isRegisteredUser && user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] flex flex-col items-center justify-center px-4 py-10">
        <div className="w-14 h-14 rounded-2xl bg-[#E31E24] text-white flex items-center justify-center shadow-sm mb-4">
          <Mail className="w-7 h-7" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#1F1F1F]">ইমেইল ভেরিফিকেশন প্রয়োজন</h1>
        <p className="text-sm text-[#737373] mt-1 mb-6 text-center max-w-md">
          <span className="font-semibold text-[#333333]">{user.email}</span> ঠিকানায় পাঠানো ভেরিফিকেশন লিংকে ক্লিক করুন।
        </p>

        <div className="w-full max-w-[420px] bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_6px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>ইনবক্সে না পেলে স্প্যাম ফোল্ডার চেক করুন। লিংকে ক্লিক করার পর নিচের বাটনে চাপ দিন।</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              const ok = await reloadUser();
              if (ok) navigate(redirectTo, { replace: true });
            }}
            className="w-full h-11 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ইমেইল ভেরিফাই করেছি (এগিয়ে যান)</span>
          </button>

          <button
            type="button"
            onClick={resendVerificationEmail}
            className="w-full h-11 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] text-[#333333] font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>আবার ভেরিফিকেশন ইমেইল পাঠান</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full text-center text-xs font-medium text-[#737373] hover:text-[#E31E24] pt-2 cursor-pointer"
          >
            অন্য অ্যাকাউন্ট দিয়ে লগইন করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col items-center justify-center px-4 py-10">
      {/* Brand mark matching PDF Page 18 */}
      <img
        src={BRAND_LOGO_URL}
        alt="জনতা মার্ট"
        className="w-16 h-16 rounded-2xl object-contain bg-[#FFF0F0] p-2 border border-[#E31E24]/15 mb-2.5"
      />
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#E31E24]">জনতা মার্ট</h1>
      <div className="flex items-center gap-3 w-full max-w-[260px] mt-1 mb-6">
        <span className="h-px flex-1 bg-[#E5E5E5]" />
        <span className="text-xs text-[#737373] font-medium">আপনাকে স্বাগতম</span>
        <span className="h-px flex-1 bg-[#E5E5E5]" />
      </div>

      {/* Login Card */}
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
          onClick={handleGoogleLogin}
          className="w-full h-11 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] transition-all flex items-center justify-center gap-3 text-sm font-semibold text-[#333333] cursor-pointer disabled:opacity-60"
        >
          <GoogleLogoSvg />
          <span>{googleLoading ? 'অপেক্ষা করুন...' : 'গুগল দিয়ে চালিয়ে যান'}</span>
        </button>

        <div className="relative my-6 flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-[#EEEEEE]" />
          <span className="relative bg-white px-3 text-xs text-[#737373]">অথবা</span>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-[#333333] mb-1.5">
              ইমেইল
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-email"
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
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-sm font-semibold text-[#333333]">
                পাসওয়ার্ড
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-[#E31E24] hover:underline">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
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
            {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-[#737373]">
        অ্যাকাউন্ট নেই?{' '}
        <Link to="/register" className="font-semibold text-[#E31E24] hover:underline">
          নতুন অ্যাকাউন্ট খুলুন
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

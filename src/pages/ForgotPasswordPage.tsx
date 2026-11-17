import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { mapFirebaseAuthError } from '../lib/firebase';

export function ForgotPasswordPage() {
  const { resetPassword } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSent(false);
    if (!email.trim()) {
      setError('অনুগ্রহ করে আপনার ইমেইল লিখুন।');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-14 h-14 rounded-2xl bg-[#E31E24] text-white flex items-center justify-center shadow-sm mb-4">
        <KeyRound className="w-7 h-7" />
      </div>

      <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-[#1F1F1F]">
        পাসওয়ার্ড রিসেট করুন
      </h1>
      <p className="text-sm text-[#737373] mt-1 mb-7 text-center max-w-sm">
        আপনার অ্যাকাউন্টের ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট লিংক পাঠাবো
      </p>

      <div className="w-full max-w-[420px] bg-white rounded-3xl border border-[#EAEAEA] shadow-[0_6px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-[#333333] leading-relaxed">
              <span className="font-semibold">{email}</span> ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold"
            >
              লগইন পেজে ফিরুন
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-semibold text-[#333333] mb-1.5">
                ইমেইল
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#E3E3E3] text-sm text-[#333333] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/15"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
            </button>
          </form>
        )}
      </div>

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#E31E24] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>লগইন পেজে ফিরে যান</span>
      </Link>
    </div>
  );
}

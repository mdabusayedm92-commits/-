import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, CheckCircle2, Clock, PackageCheck, Truck, XCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderTrackingRecord } from '../types';
import { ORDER_STATUS_META, formatBdt } from '../data/bangladeshData';

const STEPS = [
  { key: 'pending', label: 'নতুন অর্ডার', icon: Clock },
  { key: 'confirmed', label: 'নিশ্চিত হয়েছে', icon: CheckCircle2 },
  { key: 'packed', label: 'প্যাকিং হয়েছে', icon: PackageCheck },
  { key: 'shipped', label: 'পথে আছে', icon: Truck },
  { key: 'delivered', label: 'ডেলিভারি সম্পন্ন', icon: CheckCircle2 },
];

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const { lookupTracking } = useStore();

  const [orderIdInput, setOrderIdInput] = useState(searchParams.get('orderId') || '');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderTrackingRecord | null>(null);

  useEffect(() => {
    const qId = searchParams.get('orderId');
    if (qId) setOrderIdInput(qId);
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!orderIdInput.trim()) {
      setError('অর্ডার আইডি লিখুন (যেমন: JM-261115-ABCDE)।');
      return;
    }

    setLoading(true);
    try {
      const rec = await lookupTracking(orderIdInput, phoneLast4);
      if (!rec) {
        setError('এই অর্ডার আইডি দিয়ে কোনো অর্ডার পাওয়া যায়নি।');
      } else {
        setResult(rec);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অর্ডার তথ্য খুঁজে পাওয়া যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const activeMeta = result ? ORDER_STATUS_META[result.status] : null;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-8 space-y-6">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#E31E24] flex items-center justify-center mx-auto">
          <PackageSearch className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B]">অর্ডার ট্র্যাক করুন</h1>
        <p className="text-sm text-[#737373]">আপনার অর্ডার আইডি এবং মোবাইল নম্বরের শেষ ৪ সংখ্যা দিন</p>
      </div>

      <form
        onSubmit={handleTrack}
        className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E8E8] space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#333333] mb-1">অর্ডার আইডি *</label>
            <input
              type="text"
              required
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="JM-XXXXXX-XXXXX"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E3E3E3] text-sm uppercase outline-none focus:border-[#E31E24]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333333] mb-1">ফোন নম্বরের শেষ ৪ সংখ্যা</label>
            <input
              type="text"
              maxLength={4}
              value={phoneLast4}
              onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="যেমন: 3751"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
        >
          {loading ? 'খোঁজা হচ্ছে...' : 'অবস্থান দেখুন'}
        </button>
      </form>

      {result && activeMeta && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E8E8] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E8E8] pb-4">
            <div>
              <p className="text-xs text-[#737373]">অর্ডার আইডি</p>
              <p className="text-base font-bold text-[#2B2B2B]">{result.orderId}</p>
            </div>
            <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${activeMeta.badgeClass}`}>
              {activeMeta.label}
            </span>
          </div>

          {result.status === 'cancelled' ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>অর্ডারটি বাতিল করা হয়েছে। {result.statusNote ? `(${result.statusNote})` : ''}</span>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {STEPS.map((step, index) => {
                const done = index <= activeMeta.stepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                        done
                          ? 'bg-[#E31E24] border-[#E31E24] text-white'
                          : 'bg-[#F5F5F5] border-[#E8E8E8] text-[#A3A3A3]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] leading-tight ${done ? 'font-semibold text-[#2B2B2B]' : 'text-[#737373]'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-sm">
            <div>
              <span className="text-xs text-[#737373] block">ডেলিভারি জেলা</span>
              <span className="font-semibold text-[#333333]">{result.district}</span>
            </div>
            <div>
              <span className="text-xs text-[#737373] block">মোট মূল্য</span>
              <span className="bengali-num font-bold text-[#E31E24]">{formatBdt(result.total)}</span>
            </div>
            {result.statusNote && (
              <div className="sm:col-span-2 pt-2 border-t border-[#E8E8E8]">
                <span className="text-xs text-[#737373] block">সর্বশেষ আপডেট</span>
                <span className="text-[#333333]">{result.statusNote}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Copy, Check, PackageSearch, ShoppingBag } from 'lucide-react';
import { FirestoreOrder } from '../types';
import { formatBdt, toBengaliNumber } from '../data/bangladeshData';
import { useStore } from '../context/StoreContext';

export function OrderSuccessPage() {
  const location = useLocation();
  const { showToast } = useStore();
  const order = (location.state as { order?: FirestoreOrder } | null)?.order;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      showToast('অর্ডার আইডি কপি হয়েছে');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(`অর্ডার আইডি: ${order.orderId}`);
    }
  };

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
        <h1 className="font-heading text-2xl font-bold text-[#2B2B2B]">অর্ডার সম্পন্ন হয়েছে!</h1>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/orders" className="px-5 h-10 rounded-xl bg-[#E31E24] text-white text-sm font-semibold inline-flex items-center">
            আমার অর্ডার দেখুন
          </Link>
          <Link to="/shop" className="px-5 h-10 rounded-xl border border-[#E8E8E8] text-sm font-semibold inline-flex items-center">
            শপিং চালিয়ে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E8E8] shadow-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B]">
            ধন্যবাদ! আপনার অর্ডার গৃহীত হয়েছে
          </h1>
          <p className="text-sm text-[#737373]">
            খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
          </p>
        </div>

        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F5F5F5] border border-[#E8E8E8]">
          <span className="text-xs text-[#737373]">অর্ডার আইডি:</span>
          <span className="font-bold text-sm text-[#2B2B2B] tracking-wide">{order.orderId}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-[#E31E24] hover:opacity-80 cursor-pointer"
            aria-label="কপি করুন"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-left p-4 rounded-2xl bg-[#FAFAFA] border border-[#E8E8E8] space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#737373]">গ্রাহক</span>
            <span className="font-semibold text-[#333333]">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#737373]">ফোন</span>
            <span className="font-semibold text-[#333333]">{order.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#737373]">ঠিকানা</span>
            <span className="font-medium text-[#333333] text-right">{order.address}, {order.upazila}, {order.district}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#737373]">পেমেন্ট</span>
            <span className="font-semibold text-[#333333]">
              {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : `বিকাশ (TrxID: ${order.bkashTrxId || '-'})`}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E8E8E8]">
            <span className="font-bold text-[#2B2B2B]">সর্বমোট ({toBengaliNumber(order.items.length)}টি আইটেম)</span>
            <span className="bengali-num font-bold text-[#E31E24] text-base">{formatBdt(order.total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to={`/track?orderId=${encodeURIComponent(order.orderId)}`}
            className="h-11 rounded-xl border border-[#E8E8E8] hover:border-[#E31E24]/40 text-[#333333] text-sm font-semibold flex items-center justify-center gap-2"
          >
            <PackageSearch className="w-4 h-4 text-[#E31E24]" />
            <span>অর্ডার ট্র্যাক করুন</span>
          </Link>
          <Link
            to="/shop"
            className="h-11 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>আরও শপিং করুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

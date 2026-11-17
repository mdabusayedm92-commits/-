import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Banknote,
  Smartphone,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  UserCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  BD_LOCATIONS,
  calculateDeliveryCharge,
  formatBdt,
  toBengaliNumber,
} from '../data/bangladeshData';
import { PaymentMethod } from '../types';
import { GoogleLogoSvg } from './LoginPage';
import { mapFirebaseAuthError } from '../lib/firebase';

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    user,
    isRegisteredUser,
    userProfile,
    cart,
    selectedCartItems,
    shopSettings,
    loginWithGoogle,
    placeOrder,
    showToast,
  } = useStore();

  const checkoutItems = useMemo(
    () => (selectedCartItems.length > 0 ? selectedCartItems : cart),
    [selectedCartItems, cart]
  );

  const checkoutSubtotal = useMemo(
    () => checkoutItems.reduce((acc, item) => acc + item.price * item.qty, 0),
    [checkoutItems]
  );

  const divisions = Object.keys(BD_LOCATIONS);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [division, setDivision] = useState('ঢাকা');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('মিরপুর');
  const [address, setAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bkashSender, setBkashSender] = useState('');
  const [bkashTrxId, setBkashTrxId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState('');
  const [copiedBkash, setCopiedBkash] = useState(false);

  // Sync saved profile fields for logged-in customers (never invent fake guest info)
  useEffect(() => {
    if (isRegisteredUser && userProfile) {
      if (userProfile.fullName && !customerName) setCustomerName(userProfile.fullName);
      if (userProfile.phone && !customerPhone) setCustomerPhone(userProfile.phone);
      if (userProfile.email && !customerEmail) setCustomerEmail(userProfile.email);
      if (userProfile.division && BD_LOCATIONS[userProfile.division]) {
        setDivision(userProfile.division);
        const dists = Object.keys(BD_LOCATIONS[userProfile.division]);
        if (userProfile.district && dists.includes(userProfile.district)) {
          setDistrict(userProfile.district);
          const ups = BD_LOCATIONS[userProfile.division][userProfile.district] || [];
          if (userProfile.upazila && ups.includes(userProfile.upazila)) {
            setUpazila(userProfile.upazila);
          }
        }
      }
      if (userProfile.address && !address) setAddress(userProfile.address);
    } else if (isRegisteredUser && user) {
      if (user.displayName && !customerName) setCustomerName(user.displayName);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
    }
  }, [isRegisteredUser, userProfile, user]);

  const districtList = useMemo(
    () => Object.keys(BD_LOCATIONS[division] || {}),
    [division]
  );

  const upazilaList = useMemo(
    () => BD_LOCATIONS[division]?.[district] || [],
    [division, district]
  );

  const handleDivisionChange = (nextDiv: string) => {
    setDivision(nextDiv);
    const nextDists = Object.keys(BD_LOCATIONS[nextDiv] || {});
    const firstDist = nextDists[0] || '';
    setDistrict(firstDist);
    const nextUps = BD_LOCATIONS[nextDiv]?.[firstDist] || [];
    setUpazila(nextUps[0] || '');
  };

  const handleDistrictChange = (nextDist: string) => {
    setDistrict(nextDist);
    const nextUps = BD_LOCATIONS[division]?.[nextDist] || [];
    setUpazila(nextUps[0] || '');
  };

  const deliveryCharge = useMemo(
    () => calculateDeliveryCharge(district, checkoutItems, shopSettings),
    [district, checkoutItems, shopSettings]
  );

  const grandTotal = checkoutSubtotal + deliveryCharge;

  const copyBkashNumber = async () => {
    try {
      await navigator.clipboard.writeText(shopSettings.bkashNumber);
      setCopiedBkash(true);
      showToast('বিকাশ নম্বর কপি হয়েছে');
      setTimeout(() => setCopiedBkash(false), 2000);
    } catch {
      showToast(`নম্বর: ${shopSettings.bkashNumber}`);
    }
  };

  const handleQuickGoogleSignIn = async () => {
    setError('');
    setAuthBusy(true);
    try {
      await loginWithGoogle();
      showToast('গুগল লগইন সম্পন্ন হয়েছে!');
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!customerName.trim()) {
      setError('অনুগ্রহ করে গ্রাহকের পুরো নাম লিখুন।');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setError('সঠিক ১১ সংখ্যার বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (address.trim().length < 4) {
      setError('অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    if (paymentMethod === 'bkash') {
      const cleanSender = bkashSender.replace(/\D/g, '');
      if (!/^01[3-9]\d{8}$/.test(cleanSender)) {
        setError('যে নম্বর থেকে বিকাশ সেন্ড মানি করেছেন সেই ১১ সংখ্যার নম্বর দিন।');
        return;
      }
      if (bkashTrxId.trim().length < 5) {
        setError('সঠিক বিকাশ ট্রানজেকশন আইডি (TrxID) লিখুন।');
        return;
      }
    }

    setSubmitting(true);
    try {
      const placed = await placeOrder({
        customerName,
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || (isRegisteredUser ? user?.email || undefined : undefined),
        division,
        district,
        upazila,
        address,
        orderNote: orderNote.trim() || undefined,
        paymentMethod,
        bkashSender: paymentMethod === 'bkash' ? bkashSender.replace(/\D/g, '') : undefined,
        bkashTrxId: paymentMethod === 'bkash' ? bkashTrxId.trim().toUpperCase() : undefined,
        items: checkoutItems,
        subtotal: checkoutSubtotal,
        deliveryCharge,
        total: grandTotal,
      });

      navigate('/order-success', { state: { order: placed }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অর্ডার জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-heading text-2xl font-bold text-[#2B2B2B]">চেকআউটের জন্য কার্টে কোনো পণ্য নেই</h1>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-[#E31E24] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>পণ্য দেখুন</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B]">অর্ডার কনফার্ম করুন</h1>
          <p className="text-sm text-[#737373] mt-0.5">সঠিক ডেলিভারি তথ্য ও পেমেন্ট মাধ্যম নির্বাচন করুন</p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#737373] hover:text-[#E31E24]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>কার্টে ফিরুন</span>
        </Link>
      </div>

      {/* Optional Login Banner (Allows Guest Checkout Seamlessly) */}
      {!isRegisteredUser && (
        <div className="p-3.5 sm:p-4 rounded-2xl glass-red-card border border-[#E31E24]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#525252]">
            <UserCheck className="w-4 h-4 text-[#E31E24] shrink-0 mt-0.5" />
            <span>
              অ্যাকাউন্ট ছাড়াও সরাসরি <strong className="text-[#2B2B2B]">গেস্ট অর্ডার</strong> করতে পারেন। অর্ডার হিস্ট্রি প্রোফাইলে সংরক্ষণ করতে চাইলে ঐচ্ছিকভাবে লগইন করুন।
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={authBusy}
              onClick={handleQuickGoogleSignIn}
              className="h-9 px-3 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] text-xs font-semibold text-[#333333] flex items-center gap-1.5 cursor-pointer"
            >
              <GoogleLogoSvg />
              <span>{authBusy ? 'অপেক্ষা...' : 'গুগল'}</span>
            </button>
            <Link
              to="/login"
              state={{ from: '/checkout' }}
              className="h-9 px-3 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-xs font-semibold inline-flex items-center"
            >
              লগইন
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Delivery + Order Note + Payment Method */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-[#E8E8E8] space-y-4">
            <h2 className="font-heading text-base font-bold text-[#2B2B2B] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#E31E24]" />
              <span>ডেলিভারি তথ্য</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="আপনার পুরো নাম"
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">ইমেইল (ঐচ্ছিক)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">বিভাগ</label>
                <select
                  value={division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
                >
                  {divisions.map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">জেলা</label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
                >
                  {districtList.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">থানা / উপজেলা</label>
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
                >
                  {upazilaList.map((up) => (
                    <option key={up} value={up}>{up}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">বিস্তারিত ঠিকানা *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা লিখুন"
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">অর্ডার নোট (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="ডেলিভারি সংক্রান্ত বিশেষ নির্দেশনা বা সময় লিখুন..."
                className="w-full p-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E8E8] space-y-4">
            <h2 className="font-heading text-base font-bold text-[#2B2B2B]">পেমেন্ট মাধ্যম</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-[#E31E24] bg-[#FFF0F0]/60'
                    : 'border-[#E8E8E8] hover:border-[#D4D4D4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-[#2B2B2B]">
                    <Banknote className="w-4 h-4 text-[#E31E24]" />
                    ক্যাশ অন ডেলিভারি
                  </span>
                  {paymentMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-[#E31E24]" />}
                </div>
                <p className="text-xs text-[#737373] mt-1">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-pink-50/60'
                    : 'border-[#E8E8E8] hover:border-[#D4D4D4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-[#2B2B2B]">
                    <Smartphone className="w-4 h-4 text-[#E2136E]" />
                    বিকাশে অগ্রিম পেমেন্ট
                  </span>
                  {paymentMethod === 'bkash' && <CheckCircle2 className="w-4 h-4 text-[#E2136E]" />}
                </div>
                <p className="text-xs text-[#737373] mt-1">বিকাশে টাকা পাঠিয়ে অর্ডার নিশ্চিত করুন</p>
              </button>
            </div>

            {paymentMethod === 'bkash' && (
              <div className="p-4 rounded-xl bg-pink-50/70 border border-[#E2136E]/25 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[#E2136E]">বিকাশ পার্সোনাল নম্বর (Send Money করুন):</p>
                    <p className="text-lg font-bold text-[#2B2B2B] tracking-wide">{shopSettings.bkashNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyBkashNumber}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-[#E2136E]/30 text-xs font-semibold text-[#E2136E] cursor-pointer"
                  >
                    {copiedBkash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBkash ? 'কপি হয়েছে' : 'নম্বর কপি করুন'}</span>
                  </button>
                </div>

                <p className="bengali-num text-xs text-[#525252]">
                  মোট <span className="font-bold text-[#E2136E]">{formatBdt(grandTotal)}</span> উপরের নম্বরে Send Money করে নিচে আপনার বিকাশ নম্বর ও TrxID দিন:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1">আপনার বিকাশ নম্বর *</label>
                    <input
                      type="tel"
                      required={paymentMethod === 'bkash'}
                      value={bkashSender}
                      onChange={(e) => setBkashSender(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E2136E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1">ট্রানজেকশন আইডি (TrxID) *</label>
                    <input
                      type="text"
                      required={paymentMethod === 'bkash'}
                      value={bkashTrxId}
                      onChange={(e) => setBkashTrxId(e.target.value)}
                      placeholder="যেমন: 9A4B7C2D1E"
                      className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm uppercase outline-none focus:border-[#E2136E]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="p-5 rounded-2xl bg-white border border-[#E8E8E8] sticky top-24 space-y-4">
            <h2 className="font-heading text-base font-bold text-[#2B2B2B]">
              অর্ডার আইটেম ({toBengaliNumber(checkoutItems.length)})
            </h2>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {checkoutItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-[#333333] truncate">{item.name}</p>
                    <p className="bengali-num text-xs text-[#737373]">
                      {toBengaliNumber(item.qty)} × {formatBdt(item.price)}
                    </p>
                  </div>
                  <span className="bengali-num font-semibold text-[#333333] shrink-0">
                    {formatBdt(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8E8E8] pt-3.5 space-y-2 text-sm">
              <div className="flex justify-between text-[#525252]">
                <span>সাবটোটাল</span>
                <span className="bengali-num font-semibold text-[#333333]">{formatBdt(checkoutSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#525252]">
                <span>ডেলিভারি চার্জ ({district})</span>
                <span className="bengali-num font-semibold text-[#333333]">{formatBdt(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-[#2B2B2B] pt-2 border-t border-[#E8E8E8]">
                <span>সর্বমোট</span>
                <span className="bengali-num text-xl text-[#E31E24]">{formatBdt(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'অর্ডার জমা হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

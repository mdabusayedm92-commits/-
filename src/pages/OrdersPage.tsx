import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  LogIn,
  PackageSearch,
  ShoppingBag,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ORDER_STATUS_META, formatBdt, toBengaliNumber } from '../data/bangladeshData';
import { FirestoreOrder } from '../types';

const TRACK_STEPS = [
  { key: 'pending', label: 'অর্ডার গ্রহণ', icon: Clock },
  { key: 'confirmed', label: 'নিশ্চিত', icon: CheckCircle2 },
  { key: 'packed', label: 'প্যাকিং', icon: PackageCheck },
  { key: 'shipped', label: 'পথে আছে', icon: Truck },
  { key: 'delivered', label: 'ডেলিভারড', icon: CheckCircle2 },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const { user, isRegisteredUser, orders, ordersLoading } = useStore();

  const [trackPopupOpen, setTrackPopupOpen] = useState(false);
  const [trackOrderInput, setTrackOrderInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<FirestoreOrder | null>(null);

  const handleOpenTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = trackOrderInput.trim().toUpperCase();
    if (!id) return;
    setTrackPopupOpen(false);
    navigate(`/track?orderId=${encodeURIComponent(id)}`);
  };

  const formatTimestamp = (ts: unknown) => {
    const millis = (ts as { toMillis?: () => number })?.toMillis?.();
    if (!millis) return 'সাম্প্রতিক অর্ডার';
    return new Date(millis).toLocaleString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header + TRACK YOUR ORDER Button (PDF Page 17) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B]">আমার অর্ডারসমূহ</h1>
          <p className="bengali-num text-sm text-[#737373] mt-0.5">
            {user ? `মোট ${toBengaliNumber(orders.length)}টি অর্ডার` : 'আপনার অর্ডার নম্বর দিয়ে ট্র্যাক করুন'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setTrackPopupOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-xs font-bold tracking-wide shadow-sm transition-colors cursor-pointer"
        >
          <PackageSearch className="w-4 h-4" />
          <span>TRACK YOUR ORDER</span>
        </button>
      </div>

      {/* Optional Sign-in Suggestion for Guests */}
      {!isRegisteredUser && (
        <div className="p-4 rounded-2xl glass-red-card border border-[#E31E24]/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#525252]">
            <ClipboardList className="w-4 h-4 text-[#E31E24] shrink-0" />
            <span>সব ডিভাইস থেকে অর্ডার দেখতে আপনার অ্যাকাউন্টে লগইন করতে পারেন।</span>
          </div>
          <Link
            to="/login"
            state={{ from: '/orders' }}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-white border border-[#E31E24]/30 text-xs font-semibold text-[#E31E24] hover:bg-[#FFF0F0]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>লগইন করুন</span>
          </Link>
        </div>
      )}

      {ordersLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-14 text-center rounded-3xl border border-[#E8E8E8] bg-[#F9F9F9] space-y-3">
          <ShoppingBag className="w-12 h-12 text-[#A3A3A3] mx-auto stroke-[1.5]" />
          <h2 className="font-heading text-lg font-bold text-[#333333]">এখনো কোনো অর্ডার নেই</h2>
          <p className="text-sm text-[#737373]">
            আপনার প্রথম অর্ডার করতে শপিং পেজ ঘুরে দেখুন অথবা উপরের TRACK YOUR ORDER বাটনে অর্ডার আইডি দিন।
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-6 h-10 rounded-full bg-[#E31E24] text-white text-sm font-semibold"
          >
            শপিং শুরু করুন
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pending;
            return (
              <div
                key={order.orderId}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedOrder(order)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedOrder(order);
                  }
                }}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8E8] hover:border-[#E31E24]/40 transition-all space-y-3 cursor-pointer"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3">
                  <div>
                    <span className="text-xs text-[#737373]">অর্ডার আইডি:</span>{' '}
                    <span className="font-bold text-sm text-[#2B2B2B]">{order.orderId}</span>
                    <p className="text-[11px] text-[#737373] mt-0.5">{formatTimestamp(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={`${order.orderId}-${idx}`} className="flex items-center justify-between text-sm">
                      <span className="text-[#333333] truncate pr-4">
                        {item.name} × <span className="bengali-num font-semibold">{toBengaliNumber(item.qty)}</span>
                      </span>
                      <span className="bengali-num font-semibold text-[#333333] shrink-0">
                        {formatBdt(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#F0F0F0] text-xs sm:text-sm">
                  <span className="text-[#737373]">
                    {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : `বিকাশ (${order.bkashTrxId || ''})`} • {order.district}
                  </span>
                  <span className="bengali-num font-bold text-[#E31E24] text-base">
                    মোট: {formatBdt(order.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popup 1: TRACK YOUR ORDER Search Modal (PDF Page 17) */}
      {trackPopupOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setTrackPopupOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white border border-[#E8E8E8] p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-[#2B2B2B] flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-[#E31E24]" />
                <span>অর্ডার ট্র্যাক করুন</span>
              </h2>
              <button
                type="button"
                onClick={() => setTrackPopupOpen(false)}
                aria-label="বন্ধ করুন"
                className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#525252] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpenTrackingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  অর্ডার নম্বর লিখুন *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={trackOrderInput}
                  onChange={(e) => setTrackOrderInput(e.target.value)}
                  placeholder="যেমন: JM-261115-ABCDE"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E3E3E3] text-sm uppercase outline-none focus:border-[#E31E24]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-bold transition-colors cursor-pointer"
              >
                অবস্থান দেখুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup 2: Order Detail Modal / Drawer when tapping an order card (PDF Page 17) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white border border-[#E8E8E8] p-5 sm:p-6 space-y-5 my-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#E8E8E8] pb-3.5">
              <div>
                <p className="text-xs text-[#737373]">অর্ডার বিস্তারিত</p>
                <h2 className="font-heading text-lg font-bold text-[#2B2B2B]">{selectedOrder.orderId}</h2>
                <p className="text-xs text-[#737373] mt-0.5">{formatTimestamp(selectedOrder.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="বন্ধ করুন"
                className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#525252] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-step Tracking Bar */}
            {selectedOrder.status === 'cancelled' ? (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs sm:text-sm text-red-700">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>অর্ডারটি বাতিল করা হয়েছে {selectedOrder.statusNote ? `(${selectedOrder.statusNote})` : ''}</span>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1.5 py-1">
                {TRACK_STEPS.map((st, idx) => {
                  const currentIdx = (ORDER_STATUS_META[selectedOrder.status] || ORDER_STATUS_META.pending).stepIndex;
                  const done = idx <= currentIdx;
                  const Icon = st.icon;
                  return (
                    <div key={st.key} className="flex flex-col items-center text-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                          done
                            ? 'bg-[#E31E24] border-[#E31E24] text-white'
                            : 'bg-[#F5F5F5] border-[#E8E8E8] text-[#A3A3A3]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] leading-tight ${done ? 'font-bold text-[#2B2B2B]' : 'text-[#737373]'}`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Shipping Info */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm space-y-1.5">
              <p className="font-bold text-[#2B2B2B] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#E31E24]" />
                <span>{selectedOrder.customerName} • {selectedOrder.customerPhone}</span>
              </p>
              <p className="text-[#525252]">
                {selectedOrder.address}, {selectedOrder.upazila}, {selectedOrder.district}, {selectedOrder.division}
              </p>
              {selectedOrder.orderNote && (
                <p className="text-xs text-[#737373] pt-1 border-t border-[#E8E8E8]">
                  নোট: {selectedOrder.orderNote}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover border border-[#E8E8E8] shrink-0"
                    />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#2B2B2B] truncate">{item.name}</p>
                    <p className="bengali-num text-xs text-[#737373]">
                      {toBengaliNumber(item.qty)} × {formatBdt(item.price)}
                    </p>
                  </div>
                  <span className="bengali-num font-bold text-[#333333] shrink-0">
                    {formatBdt(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-[#E8E8E8] pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-[#525252]">
                <span>সাবটোটাল</span>
                <span className="bengali-num font-semibold">{formatBdt(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#525252]">
                <span>ডেলিভারি চার্জ</span>
                <span className="bengali-num font-semibold">{formatBdt(selectedOrder.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-[#2B2B2B] pt-1.5 border-t border-[#F0F0F0]">
                <span>সর্বমোট</span>
                <span className="bengali-num text-[#E31E24]">{formatBdt(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <Link
                to={`/track?orderId=${encodeURIComponent(selectedOrder.orderId)}`}
                onClick={() => setSelectedOrder(null)}
                className="flex-1 h-10 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <PackageSearch className="w-4 h-4" />
                <span>লাইভ ট্র্যাক পেজ</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 h-10 rounded-full border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-[#525252] cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

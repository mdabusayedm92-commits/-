import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Package,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  calculateDeliveryCharge,
  formatBdt,
  toBengaliNumber,
} from '../data/bangladeshData';
import { ProductCard } from '../components/ProductCard';

export function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    selectedCartItems,
    selectedCartSubtotal,
    shopSettings,
    products,
    updateCartQty,
    toggleCartItemSelected,
    toggleSelectAllCart,
    removeFromCart,
    clearCart,
  } = useStore();

  const allSelected = cart.length > 0 && selectedCartItems.length === cart.length;

  const dhakaFee = useMemo(
    () =>
      selectedCartItems.length > 0
        ? calculateDeliveryCharge('ঢাকা', selectedCartItems, shopSettings)
        : shopSettings.dhakaDelivery,
    [selectedCartItems, shopSettings]
  );

  const outsideFee = useMemo(
    () =>
      selectedCartItems.length > 0
        ? calculateDeliveryCharge('চট্টগ্রাম', selectedCartItems, shopSettings)
        : shopSettings.outsideDhakaDelivery,
    [selectedCartItems, shopSettings]
  );

  const suggestedProducts = useMemo(() => {
    const inCartIds = new Set(cart.map((c) => c.productId));
    const active = products.filter((p) => p.isActive !== false && !inCartIds.has(p.id));
    return (active.length > 0 ? active : products.filter((p) => p.isActive !== false)).slice(0, 4);
  }, [products, cart]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-10">
      {cart.length === 0 ? (
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF0F0] text-[#E31E24] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#2B2B2B]">আপনার কার্ট খালি</h1>
          <p className="text-sm text-[#737373]">পছন্দের পণ্য বেছে কার্টে যোগ করুন এবং সহজে অর্ডার করুন।</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold transition-colors"
          >
            <span>শপিং শুরু করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B]">শপিং কার্ট</h1>
              <p className="bengali-num text-sm text-[#737373] mt-0.5">
                মোট {toBengaliNumber(cart.length)} ধরনের পণ্য ({toBengaliNumber(selectedCartItems.length)}টি নির্বাচিত)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSelectAllCart(!allSelected)}
                className="inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-[#E8E8E8] bg-white hover:border-[#E31E24]/40 text-xs font-semibold text-[#333333] cursor-pointer"
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    allSelected
                      ? 'bg-[#E31E24] border-[#E31E24] text-white'
                      : 'border-[#CCCCCC] bg-white'
                  }`}
                >
                  {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span>{allSelected ? 'সব আনসিলেক্ট' : 'সব সিলেক্ট'}</span>
              </button>

              <button
                type="button"
                onClick={() => clearCart(false)}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-xs font-semibold text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব মুছুন</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cart Items with Tick-Mark Checkboxes */}
            <div className="lg:col-span-8 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-colors flex items-center gap-3 sm:gap-4 ${
                    item.selected ? 'border-[#E31E24]/40 shadow-[0_2px_10px_rgba(227,30,36,0.04)]' : 'border-[#E8E8E8] opacity-75'
                  }`}
                >
                  {/* Tick-mark checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleCartItemSelected(item.productId)}
                    aria-label={item.selected ? 'চেকআউট থেকে বাদ দিন' : 'চেকআউটের জন্য নির্বাচন করুন'}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 transition-colors cursor-pointer ${
                      item.selected
                        ? 'bg-[#E31E24] border-[#E31E24] text-white'
                        : 'border-[#CCCCCC] bg-white hover:border-[#E31E24]'
                    }`}
                  >
                    {item.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <Link
                    to={`/product/${item.productId}`}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-[#F5F5F5] border border-[#E8E8E8] overflow-hidden shrink-0 flex items-center justify-center"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-7 h-7 text-[#A3A3A3]" />
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-sm sm:text-base font-semibold text-[#333333] hover:text-[#E31E24] line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="bengali-num text-sm font-bold text-[#E31E24] mt-1">
                      {formatBdt(item.price)}
                      {item.unit ? (
                        <span className="text-xs font-normal text-[#737373] ml-1.5">({item.unit})</span>
                      ) : null}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center border border-[#E8E8E8] rounded-xl bg-[#FAFAFA]">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.productId, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#525252] hover:text-[#E31E24] cursor-pointer"
                          aria-label="পরিমাণ কমান"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="bengali-num w-8 text-center text-xs sm:text-sm font-bold text-[#333333]">
                          {toBengaliNumber(item.qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.productId, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#525252] hover:text-[#E31E24] cursor-pointer"
                          aria-label="পরিমাণ বাড়ান"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="bengali-num text-sm font-bold text-[#333333]">
                          {formatBdt(item.price * item.qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label="পণ্য সরান"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#737373] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E8E8E8] sticky top-24 space-y-4">
                <h2 className="font-heading text-lg font-bold text-[#2B2B2B]">অর্ডার সারসংক্ষেপ</h2>

                <div className="space-y-2.5 text-sm border-y border-[#E8E8E8] py-3.5">
                  <div className="flex items-center justify-between text-[#525252]">
                    <span>নির্বাচিত পণ্যের মূল্য ({toBengaliNumber(selectedCartItems.length)}টি)</span>
                    <span className="bengali-num font-semibold text-[#333333]">
                      {formatBdt(selectedCartSubtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#525252]">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="bengali-num text-xs text-[#737373]">
                      ঢাকায় {formatBdt(dhakaFee)} / বাইরে {formatBdt(outsideFee)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-base font-bold text-[#2B2B2B]">
                  <span>সাবটোটাল</span>
                  <span className="bengali-num text-lg text-[#E31E24]">
                    {formatBdt(selectedCartSubtotal)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={selectedCartItems.length === 0}
                  onClick={() => navigate('/checkout')}
                  className="w-full h-11 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {selectedCartItems.length === 0
                      ? 'অন্তত ১টি পণ্য সিলেক্ট করুন'
                      : 'অর্ডার সম্পন্ন করুন'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/shop"
                  className="block text-center text-xs font-semibold text-[#737373] hover:text-[#E31E24]"
                >
                  আরও পণ্য দেখুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Products Shelf Below Cart (PDF Page 15) */}
      {suggestedProducts.length > 0 && (
        <section className="space-y-4 pt-2 border-t border-[#F0F0F0]">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#2B2B2B]">জনপ্রিয় পণ্য</h2>
            <Link to="/shop" className="text-xs sm:text-sm font-semibold text-[#E31E24] hover:underline">
              সব দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {suggestedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

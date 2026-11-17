import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  Banknote,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  MapPin,
  PackageCheck,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  BRAND_LOGO_URL,
  HERO_BANNER_IMAGE,
  PDF_FAQ_ITEMS,
  STARTER_PRODUCTS,
  playSound,
} from '../data/bangladeshData';
import { ProductCard } from '../components/ProductCard';

const HERO_SLIDES = [
  {
    badge: 'দারুণ সব অফার',
    title: 'সবার পছন্দের পণ্য এখন এক জায়গায়',
    subtitle: 'গ্যাজেট, ফ্যাশন আর ঘরের প্রয়োজনীয় জিনিস — এক ক্লিকেই অর্ডার করুন।',
    cta: 'এখনই শপিং করুন',
    to: '/shop',
    image: HERO_BANNER_IMAGE,
  },
  {
    badge: 'সাপ্তাহিক কালেকশন',
    title: 'সেরা মানের স্মার্ট গ্যাজেট ও অডিও',
    subtitle: 'ক্যাশ অন ডেলিভারি এবং সারা দেশে দ্রুত হোম ডেলিভারি সুবিধা।',
    cta: 'গ্যাজেট দেখুন',
    to: '/shop?category=electronics',
    image: STARTER_PRODUCTS[0].imageUrl,
  },
  {
    badge: 'হোম ও কিচেন',
    title: 'ঘরের ও রান্নাঘরের নির্ভরযোগ্য সামগ্রী',
    subtitle: 'অরিজিনাল পণ্য যাচাই করে প্যাকেজিং — ৭ দিনের সহজ রিটার্ন সুবিধা।',
    cta: 'অফার দেখুন',
    to: '/offers',
    image: STARTER_PRODUCTS[3].imageUrl,
  },
];

export function HomePage() {
  const { products, shopSettings } = useStore();
  const [slideIdx, setSlideIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeProducts = products.filter((p) => p.isActive !== false);
  const popularList = activeProducts.slice(0, 8);
  const currentSlide = HERO_SLIDES[slideIdx];
  const promo = shopSettings.promoBanner;

  const promoTargetLink =
    promo.targetType === 'product' && promo.targetValue
      ? `/product/${promo.targetValue}`
      : promo.targetType === 'category' && promo.targetValue
        ? `/shop?category=${promo.targetValue}`
        : '/offers';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* 1. Hero Promo Carousel (1000 x 446 aspect proportion) */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E8E8] shadow-sm aspect-[16/9] sm:aspect-[1000/446] bg-[#2B2B2B]">
        <img
          src={currentSlide.image}
          alt={currentSlide.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />

        <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-10 max-w-xl text-white">
          <span className="inline-flex w-fit items-center px-3 py-1 rounded-full bg-[#E31E24] text-white text-[11px] sm:text-xs font-bold mb-2.5">
            {currentSlide.badge}
          </span>
          <h1 className="font-heading text-xl sm:text-3xl lg:text-4xl font-bold leading-snug">
            {currentSlide.title}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1.5 line-clamp-2">
            {currentSlide.subtitle}
          </p>
          <div className="mt-4">
            <Link
              to={currentSlide.to}
              onClick={() => playSound('click')}
              className="inline-flex items-center gap-2 px-4 sm:px-5 h-9 sm:h-11 rounded-full bg-white text-[#E31E24] hover:bg-[#FFF0F0] text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <span>{currentSlide.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`স্লাইড ${i + 1}`}
              onClick={() => setSlideIdx(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                slideIdx === i ? 'w-6 bg-white' : 'w-1.5 bg-white/55'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. 3 Value Proposition / Feature Badges (1032 x 177 proportion row) */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="glass-red-card rounded-2xl border border-[#E31E24]/15 py-3.5 sm:py-5 px-2.5 sm:px-4 flex flex-col items-center justify-center text-center gap-1.5">
          <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#E31E24]" />
          <span className="text-[11px] sm:text-sm font-semibold text-[#333333]">দ্রুত ডেলিভারি</span>
        </div>

        <div className="glass-red-card rounded-2xl border border-[#E31E24]/15 py-3.5 sm:py-5 px-2.5 sm:px-4 flex flex-col items-center justify-center text-center gap-1.5">
          <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-[#E31E24]" />
          <span className="text-[11px] sm:text-sm font-semibold text-[#333333]">ক্যাশ অন ডেলিভারি</span>
        </div>

        <div className="glass-red-card rounded-2xl border border-[#E31E24]/15 py-3.5 sm:py-5 px-2.5 sm:px-4 flex flex-col items-center justify-center text-center gap-1.5">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#E31E24]" />
          <span className="text-[11px] sm:text-sm font-semibold text-[#333333]">১০০% আসল পণ্য</span>
        </div>
      </section>

      {/* 3. Admin-Controlled Animated Weekly Promo Banner Card */}
      {promo?.isActive && (
        <section className="promo-animate rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#E31E24] to-[#C41419] text-white p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold">
              {promo.tag}
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold leading-snug">
              {promo.headline}
            </h2>
            <p className="text-xs sm:text-sm text-white/90">{promo.subtitle}</p>
          </div>
          <Link
            to={promoTargetLink}
            onClick={() => playSound('click')}
            className="inline-flex items-center justify-center gap-1.5 px-6 h-10 sm:h-11 rounded-full bg-white text-[#E31E24] hover:bg-[#FFF0F0] text-sm font-bold shrink-0 transition-colors"
          >
            <span>{promo.ctaText || 'কিনুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* 4. জনপ্রিয় পণ্য + সব পণ্য → */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg sm:text-2xl font-bold text-[#2B2B2B]">
            জনপ্রিয় পণ্য
          </h2>
          <Link
            to="/shop"
            onClick={() => playSound('click')}
            className="text-xs sm:text-sm font-semibold text-[#E31E24] hover:underline flex items-center gap-1"
          >
            <span>সব পণ্য</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {popularList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. কেন জনতা মার্ট? (PDF Pages 4-5) */}
      <section className="space-y-3 pt-2">
        <div>
          <h2 className="font-heading text-lg sm:text-2xl font-bold text-[#2B2B2B]">কেন জনতা মার্ট?</h2>
          <p className="text-xs sm:text-sm text-[#737373]">অর্ডার থেকে ডেলিভারি — প্রতিটি ধাপে নির্ভরযোগ্য সেবা</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: Banknote,
              title: 'ক্যাশ অন ডেলিভারি',
              desc: 'পণ্য হাতে পেয়ে টাকা পরিশোধ করুন — কোনো অগ্রিম লাগবে না।',
            },
            {
              icon: Truck,
              title: 'সারা দেশে হোম ডেলিভারি',
              desc: 'ঢাকায় ২৪-৪৮ ঘণ্টা এবং সারা দেশে ৩-৫ দিনে পৌঁছে যায়।',
            },
            {
              icon: RotateCcw,
              title: '৭ দিনের রিটার্ন',
              desc: 'ত্রুটি বা ভুল পণ্য হলে ৭ দিনের মধ্যে সহজ ফেরত।',
            },
            {
              icon: ShieldCheck,
              title: '১০০% আসল পণ্য',
              desc: 'প্রতিটি পণ্য নিজস্ব মান যাচাই করে পাঠাই আমরা।',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-[#E8E8E8] flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] text-[#E31E24] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#2B2B2B]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#737373] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. অর্ডার করবেন যেভাবে (PDF Pages 5-6) */}
      <section className="space-y-4 pt-2">
        <div>
          <h2 className="font-heading text-lg sm:text-2xl font-bold text-[#2B2B2B]">অর্ডার করবেন যেভাবে</h2>
          <p className="text-xs sm:text-sm text-[#737373]">মাত্র তিন ধাপে কেনাকাটা সম্পন্ন করুন</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              step: '১',
              icon: Sparkles,
              title: '১. পণ্য পছন্দ করুন',
              desc: 'ক্যাটাগরি বা সার্চ দিয়ে পণ্য খুঁজে কার্টে যোগ করুন।',
            },
            {
              step: '২',
              icon: MapPin,
              title: '২. ঠিকানা দিন',
              desc: 'চেকআউটে নাম, মোবাইল নম্বর ও ঠিকানা লিখে অর্ডার নিশ্চিত করুন।',
            },
            {
              step: '৩',
              icon: PackageCheck,
              title: '৩. পণ্য বুঝে নিন',
              desc: 'কুরিয়ারের মাধ্যমে পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।',
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8E8] overflow-hidden"
              >
                <span className="bengali-num absolute top-3 right-4 text-4xl font-extrabold text-[#F2F2F2] select-none">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#E31E24] text-white flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-[#2B2B2B]">{s.title}</h3>
                <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div>
          <Link
            to="/shop"
            onClick={() => playSound('click')}
            className="inline-flex items-center justify-center px-6 h-11 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-bold shadow-sm transition-colors"
          >
            কেনাকাটা শুরু করুন
          </Link>
        </div>
      </section>

      {/* 7. প্রায়শই জিজ্ঞাসিত প্রশ্ন + Bottom 2 Mini Cards (PDF Pages 6-8) */}
      <section id="faq" className="space-y-4 pt-2">
        <div>
          <h2 className="font-heading text-lg sm:text-2xl font-bold text-[#2B2B2B]">প্রায়শই জিজ্ঞাসিত প্রশ্ন</h2>
          <p className="text-xs sm:text-sm text-[#737373]">ডেলিভারি, পেমেন্ট ও রিটার্ন নিয়ে সাধারণ জিজ্ঞাসার উত্তর</p>
        </div>

        <div className="space-y-2.5">
          {PDF_FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-[#E8E8E8] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setOpenFaq(isOpen ? null : idx);
                  }}
                  className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left text-sm font-semibold text-[#2B2B2B] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#737373] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#E31E24]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-[#525252] leading-relaxed border-t border-[#F0F0F0] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 2 Compact Promo Cards from PDF Page 8 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to="/shop?category=home"
            className="glass-red-card p-5 rounded-2xl border border-[#E31E24]/15 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <img src={BRAND_LOGO_URL} alt="" className="w-5 h-5 rounded-md object-contain" />
                <span className="text-xs font-bold text-[#2B2B2B]">{shopSettings.storeName}</span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#E31E24] text-white text-[10px] font-bold">
                হোম ও কিচেন
              </span>
              <p className="text-sm font-bold text-[#2B2B2B]">রান্নাঘরের সেরা পণ্য</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E31E24]">
                দেখুন <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            to="/offers"
            className="glass-red-card p-5 rounded-2xl border border-[#E31E24]/15 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <img src={BRAND_LOGO_URL} alt="" className="w-5 h-5 rounded-md object-contain" />
                <span className="text-xs font-bold text-[#2B2B2B]">{shopSettings.storeName}</span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#E31E24] text-white text-[10px] font-bold">
                নতুন অফার
              </span>
              <p className="text-sm font-bold text-[#2B2B2B]">বিশেষ ডিসকাউন্ট কালেকশন</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E31E24]">
                দেখুন <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

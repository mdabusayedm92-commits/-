import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Banknote, RotateCcw, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BRAND_LOGO_URL, CATEGORIES } from '../data/bangladeshData';

export function Footer() {
  const { shopSettings } = useStore();

  return (
    <footer className="bg-[#FAFAFA] border-t border-[#E8E8E8] text-[#333333] mt-12 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img
              src={BRAND_LOGO_URL}
              alt={shopSettings.storeName}
              className="w-8 h-8 rounded-xl bg-[#FFF0F0] p-1 border border-[#E31E24]/15 object-contain"
            />
            <span className="font-heading font-bold text-lg text-[#E31E24]">
              {shopSettings.storeName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
            গ্রাম থেকে শহর — ইলেকট্রনিক্স, ফ্যাশন, ঘরের প্রয়োজনীয় জিনিস ও বাচ্চাদের পণ্য এক জায়গায়! সারা বাংলাদেশে হোম ডেলিভারি।
          </p>
          <ul className="space-y-1.5 text-xs text-[#525252] pt-1">
            <li className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
              <span>ঢাকায় ২৪-৪৮ ঘণ্টায় ডেলিভারি</span>
            </li>
            <li className="flex items-center gap-2">
              <Banknote className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
              <span>ক্যাশ অন ডেলিভারি ও বিকাশ</span>
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
              <span>৭ দিনের রিটার্ন সুবিধা</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-bold text-sm text-[#2B2B2B] mb-3">দ্রুত লিংক</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-[#525252]">
            <li><Link to="/" className="hover:text-[#E31E24] transition-colors">হোম</Link></li>
            <li><Link to="/shop" className="hover:text-[#E31E24] transition-colors">সব পণ্য</Link></li>
            <li><Link to="/offers" className="hover:text-[#E31E24] transition-colors">অফার</Link></li>
            <li><Link to="/track" className="hover:text-[#E31E24] transition-colors">অর্ডার ট্র্যাক করুন</Link></li>
            <li><Link to="/orders" className="hover:text-[#E31E24] transition-colors">আমার অর্ডার</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-heading font-bold text-sm text-[#2B2B2B] mb-3">ক্যাটাগরি</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-[#525252]">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <li key={cat.slug}>
                <Link to={`/shop?category=${cat.slug}`} className="hover:text-[#E31E24] transition-colors">
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-heading font-bold text-sm text-[#2B2B2B] mb-3">সহায়তা</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-[#525252]">
            <li><a href="/#faq" className="hover:text-[#E31E24] transition-colors">প্রায়শই জিজ্ঞাসিত প্রশ্ন</a></li>
            <li><Link to="/track" className="hover:text-[#E31E24] transition-colors">ডেলিভারি ও রিটার্ন তথ্য</Link></li>
            <li><Link to="/cart" className="hover:text-[#E31E24] transition-colors">আমার কার্ট</Link></li>
            <li className="pt-1 flex items-center gap-1.5 text-xs text-[#737373]">
              <Phone className="w-3.5 h-3.5 text-[#E31E24]" />
              <span>সহায়তা: {shopSettings.supportPhone}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#737373]">
          <p>© {new Date().getFullYear()} {shopSettings.storeName} — সর্বস্বত্ব সংরক্ষিত</p>
          <p>ক্যাশ অন ডেলিভারি • বিকাশ ({shopSettings.bkashNumber})</p>
        </div>
      </div>
    </footer>
  );
}

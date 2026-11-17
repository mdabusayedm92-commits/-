import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  User as UserIcon,
  LogOut,
  LayoutGrid,
  Package,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BRAND_LOGO_URL, toBengaliNumber, playSound } from '../data/bangladeshData';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isRegisteredUser,
    userProfile,
    isAdmin,
    wishlistIds,
    shopSettings,
    logout,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('q') || '');
  }, [location.search]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');
    const clean = searchTerm.trim();
    navigate(clean ? `/shop?q=${encodeURIComponent(clean)}` : '/shop');
  };

  const accountFullName =
    userProfile?.fullName ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'অ্যাকাউন্ট';

  return (
    <header className="sticky top-0 z-40 glass-surface border-b border-[#E8E8E8]/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Red Logo + জনতা মার্ট */}
        <Link
          to="/"
          onClick={() => playSound('click')}
          className="flex items-center gap-2 shrink-0 whitespace-nowrap"
        >
          <img
            src={BRAND_LOGO_URL}
            alt={shopSettings.storeName}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain bg-[#FFF0F0] p-1 border border-[#E31E24]/15"
          />
          <span className="font-heading font-bold text-lg sm:text-xl text-[#E31E24]">
            {shopSettings.storeName}
          </span>
        </Link>

        {/* Center: Glass Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="পণ্য, গ্যাজেট খুঁজুন..."
            className="w-full h-9 sm:h-10 pl-9 pr-3 rounded-full bg-[#F5F5F5]/90 border border-[#E8E8E8] focus:bg-white focus:border-[#E31E24]/50 text-xs sm:text-sm text-[#333333] placeholder:text-[#737373] outline-none transition-colors"
          />
        </form>

        {/* Right: Wishlist & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            to="/wishlist"
            onClick={() => playSound('click')}
            aria-label="উইশলিস্ট"
            title="উইশলিস্ট"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/80 border border-[#E8E8E8] flex items-center justify-center text-[#333333] hover:text-[#E31E24] hover:border-[#E31E24]/30 transition-colors"
          >
            <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            {wishlistIds.length > 0 && (
              <span className="bengali-num absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E31E24] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {toBengaliNumber(wishlistIds.length)}
              </span>
            )}
          </Link>

          {!isRegisteredUser ? (
            <Link
              to="/login"
              onClick={() => playSound('click')}
              aria-label="লগইন / প্রোফাইল"
              title="লগইন করুন"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FFF0F0] border border-[#E31E24]/25 flex items-center justify-center text-[#E31E24] hover:bg-[#E31E24] hover:text-white transition-colors"
            >
              <UserIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setMenuOpen((o) => !o);
                }}
                aria-label="প্রোফাইল মেনু"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FFF0F0] border border-[#E31E24]/25 flex items-center justify-center text-[#E31E24] hover:border-[#E31E24] transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8E8E8] shadow-xl py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-[#E8E8E8]">
                    <p className="text-sm font-bold text-[#2B2B2B] truncate">{accountFullName}</p>
                    <p className="text-[11px] text-[#737373] truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E31E24] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#525252]" />
                      <span>আমার অর্ডার</span>
                    </Link>

                    <Link
                      to="/track"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E31E24] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-[#525252]" />
                      <span>অর্ডার ট্র্যাক</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E31E24] transition-colors"
                      >
                        <LayoutGrid className="w-4 h-4 text-[#525252]" />
                        <span>অ্যাডমিন প্যানেল</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E31E24] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#525252]" />
                      <span>প্রোফাইল ও ঠিকানা</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#E8E8E8] pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#E31E24] hover:bg-[#FFF0F0] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>লগআউট</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

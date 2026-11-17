import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Percent, ShoppingCart, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { toBengaliNumber, playSound } from '../data/bangladeshData';

export const SWIPE_ROUTE_ORDER = ['/', '/shop', '/offers', '/cart', '/orders'];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { cartCount } = useStore();

  const items = [
    { path: '/', label: 'হোম', icon: Home, badge: 0 },
    { path: '/shop', label: 'ক্যাটাগরি', icon: LayoutGrid, badge: 0 },
    { path: '/offers', label: 'অফার', icon: Percent, badge: 0 },
    { path: '/cart', label: 'কার্ট', icon: ShoppingCart, badge: cartCount },
    { path: '/orders', label: 'অর্ডার', icon: Package, badge: 0 },
  ];

  return (
    <nav
      aria-label="নিচের নেভিগেশন বার"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-surface border-t border-[#E8E8E8] shadow-[0_-4px_18px_rgba(0,0,0,0.05)]"
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive =
            item.path === '/'
              ? pathname === '/'
              : pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => playSound('click')}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors whitespace-nowrap ${
                isActive ? 'text-[#E31E24] font-bold' : 'text-[#525252]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#E31E24]" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.8]'}`} />
                {item.badge > 0 && (
                  <span className="bengali-num absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E31E24] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {toBengaliNumber(item.badge)}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

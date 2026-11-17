import React, { useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav, SWIPE_ROUTE_ORDER } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { OffersPage } from './pages/OffersPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { playSound } from './data/bangladeshData';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toastMessage } = useStore();

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalDrag = useRef(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  const resetSwipeState = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalDrag.current = false;
    setIsDragging(false);
    setDragOffsetX(0);
  };

  // Interactive finger-tracking swipe across the 5 bottom-nav tabs
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || isAuthPage) return;
    if (!SWIPE_ROUTE_ORDER.includes(location.pathname)) return;

    const target = e.target as HTMLElement | null;
    if (
      target?.closest('.no-scrollbar') ||
      target?.closest('input, textarea, select, [data-no-swipe="true"]')
    ) {
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalDrag.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || isAuthPage) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!isHorizontalDrag.current) {
      if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) {
        // User is scrolling vertically; release horizontal lock
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }
      if (Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        isHorizontalDrag.current = true;
        setIsDragging(true);
      }
    }

    if (isHorizontalDrag.current) {
      const currentIdx = SWIPE_ROUTE_ORDER.indexOf(location.pathname);
      const nextIdx = dx < 0 ? currentIdx + 1 : currentIdx - 1;
      const canSwipe = nextIdx >= 0 && nextIdx < SWIPE_ROUTE_ORDER.length;
      const damped = canSwipe ? Math.max(-110, Math.min(110, dx * 0.35)) : Math.max(-28, Math.min(28, dx * 0.12));
      setDragOffsetX(damped);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || isAuthPage) {
      resetSwipeState();
      return;
    }

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const wasDrag = isHorizontalDrag.current;

    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalDrag.current = false;
    setIsDragging(false);

    if (!wasDrag && (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.5)) {
      setDragOffsetX(0);
      return;
    }

    if (Math.abs(dx) >= 72 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      const currentIdx = SWIPE_ROUTE_ORDER.indexOf(location.pathname);
      const nextIdx = dx < 0 ? currentIdx + 1 : currentIdx - 1;
      if (currentIdx !== -1 && nextIdx >= 0 && nextIdx < SWIPE_ROUTE_ORDER.length) {
        playSound('click');
        setDragOffsetX(0);
        navigate(SWIPE_ROUTE_ORDER[nextIdx]);
        return;
      }
    }

    setDragOffsetX(0);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-[#333333] overflow-x-clip"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetSwipeState}
    >
      {!isAuthPage && <Navbar />}

      <main
        className="flex-1"
        style={{
          transform: dragOffsetX !== 0 ? `translate3d(${dragOffsetX}px, 0, 0)` : undefined,
          transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all whitespace-nowrap ${
            toastMessage.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-[#2B2B2B] text-white'
          }`}
        >
          {toastMessage.text}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </BrowserRouter>
  );
}

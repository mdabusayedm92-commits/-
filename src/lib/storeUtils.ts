import { PromoBannerConfig, ShopSettings } from '../types';

export const ADMIN_EMAIL = 'mdabusayedm92@gmail.com';

export const DEFAULT_PROMO_BANNER: PromoBannerConfig = {
  isActive: true,
  tag: '% সাপ্তাহিক অফার',
  headline: 'গ্যাজেট ও এক্সেসরিজে ২০% পর্যন্ত ছাড়!',
  subtitle: 'সীমিত সময়ের জন্য — স্টক শেষ হওয়ার আগেই কিনুন।',
  ctaText: 'কিনুন',
  targetType: 'category',
  targetValue: 'electronics',
};

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  storeName: 'জনতা মার্ট',
  tagline: 'জনতার প্রয়োজন, জনতার হাতেই',
  supportPhone: '01777273751',
  bkashNumber: '01777273751',
  dhakaDelivery: 70,
  outsideDhakaDelivery: 130,
  promoBanner: DEFAULT_PROMO_BANNER,
};

export function isVerifiedAdminEmail(email?: string | null, emailVerified?: boolean | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && emailVerified === true;
}

export function isAdminUser(
  email?: string | null,
  emailVerified?: boolean | null,
  profileRole?: string | null
): boolean {
  if (isVerifiedAdminEmail(email, emailVerified)) return true;
  return emailVerified === true && profileRole === 'admin';
}

export function toBengaliNumber(num: number | string, formatCommas = false): string {
  if (num === undefined || num === null || num === '') return '০';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

  if (typeof num === 'number' && !isNaN(num) && formatCommas) {
    const formatted = num.toLocaleString('en-US');
    return formatted.replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
  }

  return num
    .toString()
    .replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
}

export function formatBdt(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `৳${toBengaliNumber(safe, true)}`;
}

export function calculateDeliveryCharge(
  district: string,
  items: {
    deliveryCharge?: number;
    dhakaDeliveryCharge?: number;
    outsideDhakaDeliveryCharge?: number;
  }[],
  settings: ShopSettings = DEFAULT_SHOP_SETTINGS
): number {
  const isDhaka = district.trim() === 'ঢাকা';
  if (items.length === 0) {
    return isDhaka ? settings.dhakaDelivery : settings.outsideDhakaDelivery;
  }

  const perItemRates = items.map((item) => {
    if (isDhaka) {
      if (typeof item.dhakaDeliveryCharge === 'number') return item.dhakaDeliveryCharge;
      if (typeof item.deliveryCharge === 'number') return item.deliveryCharge;
      return settings.dhakaDelivery;
    }
    if (typeof item.outsideDhakaDeliveryCharge === 'number') return item.outsideDhakaDeliveryCharge;
    return settings.outsideDhakaDelivery;
  });

  return Math.max(...perItemRates);
}

export function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `JM-${y}${m}${d}-${rand}`;
}

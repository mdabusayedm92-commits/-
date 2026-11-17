import React from 'react';
import { Link } from 'react-router-dom';
import { Percent, ArrowRight, PackageX } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { toBengaliNumber } from '../data/bangladeshData';

export function OffersPage() {
  const { products, shopSettings } = useStore();
  const promo = shopSettings.promoBanner;

  const discountedProducts = products.filter(
    (p) => p.isActive !== false && typeof p.comparePrice === 'number' && p.comparePrice > p.price
  );

  const promoTargetLink =
    promo.targetType === 'product' && promo.targetValue
      ? `/product/${promo.targetValue}`
      : promo.targetType === 'category' && promo.targetValue
        ? `/shop?category=${promo.targetValue}`
        : '/shop';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B] flex items-center gap-2">
            <Percent className="w-6 h-6 text-[#E31E24]" />
            <span>বিশেষ অফার ও ছাড়</span>
          </h1>
          <p className="bengali-num text-sm text-[#737373] mt-0.5">
            বর্তমানে {toBengaliNumber(discountedProducts.length)}টি পণ্যে ছাড় চলছে
          </p>
        </div>
      </div>

      {promo?.isActive && (
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#E31E24] to-[#C41419] text-white p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold">
              {promo.tag}
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold">{promo.headline}</h2>
            <p className="text-xs sm:text-sm text-white/90">{promo.subtitle}</p>
          </div>
          <Link
            to={promoTargetLink}
            className="inline-flex items-center justify-center gap-1.5 px-6 h-10 rounded-full bg-white text-[#E31E24] hover:bg-[#FFF0F0] text-sm font-bold shrink-0"
          >
            <span>{promo.ctaText || 'কিনুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {discountedProducts.length === 0 ? (
        <div className="py-14 text-center rounded-3xl border border-[#E8E8E8] bg-[#FAFAFA] space-y-3">
          <PackageX className="w-12 h-12 text-[#A3A3A3] mx-auto stroke-[1.5]" />
          <p className="text-sm font-semibold text-[#333333]">এই মুহূর্তে কোনো ছাড়যুক্ত পণ্য নেই</p>
          <Link
            to="/shop"
            className="inline-flex items-center px-5 h-10 rounded-full bg-[#E31E24] text-white text-sm font-semibold"
          >
            সব পণ্য দেখুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {discountedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

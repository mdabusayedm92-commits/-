import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { toBengaliNumber } from '../data/bangladeshData';

export function WishlistPage() {
  const { wishlistProducts } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B]">উইশলিস্ট</h1>
        <p className="bengali-num text-sm text-[#737373] mt-0.5">
          সংরক্ষিত {toBengaliNumber(wishlistProducts.length)}টি পণ্য
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-[#E8E8E8] bg-[#F9F9F9] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0F0] text-[#E31E24] flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#2B2B2B]">আপনার উইশলিস্ট খালি</h2>
          <p className="text-sm text-[#737373]">পছন্দের পণ্যগুলোর হার্ট আইকনে ক্লিক করে এখানে সংরক্ষণ করুন।</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold"
          >
            <span>পণ্য দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

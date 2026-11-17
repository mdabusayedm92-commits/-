import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageX } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, toBengaliNumber } from '../data/bangladeshData';
import { ProductCard } from '../components/ProductCard';
import { ProductCategorySlug } from '../types';

type SortMode = 'newest' | 'price-asc' | 'price-desc';

export function ShopPage() {
  const { products, productsLoading } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = (searchParams.get('category') as ProductCategorySlug | 'all') || 'all';
  const queryText = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(queryText);
  const [sortBy, setSortBy] = useState<SortMode>('newest');

  useEffect(() => {
    setLocalSearch(queryText);
  }, [queryText]);

  const setCategory = (slug: ProductCategorySlug | 'all') => {
    const next = new URLSearchParams(searchParams);
    if (slug === 'all') {
      next.delete('category');
    } else {
      next.set('category', slug);
    }
    setSearchParams(next);
  };

  const applySearch = (val: string) => {
    setLocalSearch(val);
    const next = new URLSearchParams(searchParams);
    if (val.trim()) {
      next.set('q', val.trim());
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    const list = products.filter((p) => {
      if (p.isActive === false) return false;
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (q) {
        const hay = `${p.name} ${p.description || ''} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, activeCategory, localSearch, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B]">সকল পণ্য</h1>
          <p className="bengali-num text-sm text-[#737373] mt-0.5">
            মোট {toBengaliNumber(filteredProducts.length)}টি পণ্য পাওয়া গেছে
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => applySearch(e.target.value)}
              placeholder="পণ্য খুঁজুন..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#333333] outline-none focus:border-[#E31E24]"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              className="h-10 pl-9 pr-4 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#333333] outline-none focus:border-[#E31E24] cursor-pointer"
            >
              <option value="newest">নতুন পণ্য</option>
              <option value="price-asc">দাম: কম থেকে বেশি</option>
              <option value="price-desc">দাম: বেশি থেকে কম</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`px-4 h-9 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#E31E24] text-white'
              : 'bg-[#F5F5F5] text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E31E24]'
          }`}
        >
          সব পণ্য
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setCategory(cat.slug)}
            className={`px-4 h-9 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat.slug
                ? 'bg-[#E31E24] text-white'
                : 'bg-[#F5F5F5] text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E31E24]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-2xl border border-[#E8E8E8] p-4 space-y-3 animate-pulse">
              <div className="aspect-square rounded-xl bg-[#F5F5F5]" />
              <div className="h-4 bg-[#F5F5F5] rounded w-3/4" />
              <div className="h-4 bg-[#F5F5F5] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-[#F9F9F9] rounded-3xl border border-[#E8E8E8] space-y-3">
          <PackageX className="w-12 h-12 text-[#A3A3A3] mx-auto stroke-[1.5]" />
          <h2 className="font-heading text-lg font-bold text-[#333333]">কোনো পণ্য পাওয়া যায়নি</h2>
          <p className="text-sm text-[#737373]">অন্য ক্যাটাগরি বা কীওয়ার্ড দিয়ে আবার খুঁজুন</p>
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              applySearch('');
            }}
            className="inline-flex items-center px-5 h-10 rounded-xl bg-[#E31E24] text-white text-sm font-semibold cursor-pointer"
          >
            সব পণ্য দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

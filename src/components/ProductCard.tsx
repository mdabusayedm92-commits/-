import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Package } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBdt, toBengaliNumber } from '../data/bangladeshData';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [imgError, setImgError] = useState(false);

  const wishlisted = isInWishlist(product.id);
  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;
  const outOfStock = product.stock <= 0;

  return (
    <div className="group rounded-2xl bg-white border border-[#E8E8E8] overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
      {/* Product Photo */}
      <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {!imgError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#A3A3A3] gap-1.5">
              <Package className="w-10 h-10 stroke-[1.5]" />
              <span className="text-xs">ছবি নেই</span>
            </div>
          )}
        </Link>

        {discountPercent > 0 && (
          <span className="bengali-num absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#E31E24] text-white text-[11px] font-bold">
            {toBengaliNumber(discountPercent)}% ছাড়
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে যোগ করুন'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
            wishlisted
              ? 'bg-[#E31E24] text-white'
              : 'bg-white/90 text-[#525252] hover:text-[#E31E24]'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-lg bg-white text-[#333333] text-xs font-bold">
              স্টক শেষ
            </span>
          </div>
        )}
      </div>

      {/* Product Info matching PDF page 3 */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link
          to={`/product/${product.id}`}
          className="text-sm sm:text-[15px] font-semibold text-[#2B2B2B] hover:text-[#E31E24] line-clamp-2 leading-snug transition-colors"
        >
          {product.name}
        </Link>

        {product.unit && (
          <p className="text-[11px] text-[#737373] mt-0.5 truncate">{product.unit}</p>
        )}

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            <p className="bengali-num text-base sm:text-lg font-bold text-[#E31E24] leading-tight">
              {formatBdt(product.price)}
            </p>
            {product.comparePrice && product.comparePrice > product.price && (
              <p className="bengali-num text-xs text-[#737373] line-through leading-tight">
                {formatBdt(product.comparePrice)}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addToCart(product, 1)}
            aria-label="কার্টে যোগ করুন"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              outOfStock
                ? 'bg-[#F5F5F5] text-[#A3A3A3] cursor-not-allowed'
                : 'bg-[#E31E24] text-white hover:bg-[#C41419] shadow-sm'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

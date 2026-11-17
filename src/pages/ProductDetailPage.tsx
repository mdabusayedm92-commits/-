import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  Package,
  Share2,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORY_LABELS, formatBdt, toBengaliNumber } from '../data/bangladeshData';
import { ProductCard } from '../components/ProductCard';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    products,
    reviews,
    user,
    userProfile,
    shopSettings,
    addToCart,
    toggleWishlist,
    isInWishlist,
    submitProductReview,
    showToast,
  } = useStore();

  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Review state
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [submittingRev, setSubmittingRev] = useState(false);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    setQty(1);
    setImgError(false);
    setSelectedImageIdx(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (userProfile?.fullName && !revName) setRevName(userProfile.fullName);
    else if (user?.displayName && !revName) setRevName(user.displayName);
  }, [userProfile?.fullName, user?.displayName]);

  const productReviews = useMemo(
    () => (id ? reviews.filter((r) => r.productId === id) : []),
    [reviews, id]
  );

  const avgRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / productReviews.length).toFixed(1));
  }, [productReviews]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <Package className="w-12 h-12 text-[#A3A3A3] mx-auto stroke-[1.5]" />
        <h1 className="font-heading text-xl font-bold text-[#2B2B2B]">পণ্যটি পাওয়া যায়নি</h1>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-[#E31E24] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সব পণ্য দেখুন</span>
        </Link>
      </div>
    );
  }

  const galleryImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);
  const activeImage = galleryImages[selectedImageIdx] || product.imageUrl;

  const dhakaFee =
    typeof product.dhakaDeliveryCharge === 'number'
      ? product.dhakaDeliveryCharge
      : typeof product.deliveryCharge === 'number'
        ? product.deliveryCharge
        : shopSettings.dhakaDelivery;
  const outsideFee =
    typeof product.outsideDhakaDeliveryCharge === 'number'
      ? product.outsideDhakaDeliveryCharge
      : shopSettings.outsideDhakaDelivery;

  const wishlisted = isInWishlist(product.id);
  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;
  const outOfStock = product.stock <= 0;

  const related = products
    .filter((p) => p.id !== product.id && p.isActive !== false && p.category === product.category)
    .slice(0, 4);

  const handleShareLink = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `${product.name} — মাত্র ${formatBdt(product.price)} | জনতা মার্ট`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('পণ্যের লিংক কপি হয়েছে');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('পণ্যের লিংক কপি হয়েছে');
      } catch {
        showToast('লিংক কপি করা যায়নি', 'error');
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revComment.trim()) return;
    setSubmittingRev(true);
    try {
      await submitProductReview(
        product.id,
        product.name,
        revName.trim() || 'গ্রাহক',
        revRating,
        revComment
      );
      setRevComment('');
    } finally {
      setSubmittingRev(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-10 pb-24 sm:pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#737373]">
        <Link to="/" className="hover:text-[#E31E24]">হোম</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-[#E31E24]">
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span>/</span>
        <span className="text-[#333333] font-medium truncate">{product.name}</span>
      </div>

      {/* Main PDP Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        {/* Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative rounded-3xl border border-[#E8E8E8] bg-[#F9F9F9] overflow-hidden aspect-square">
            {!imgError && activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#A3A3A3] gap-2">
                <Package className="w-16 h-16 stroke-[1.5]" />
                <span className="text-sm">ছবি প্রদর্শিত হচ্ছে না</span>
              </div>
            )}

            {discountPercent > 0 && (
              <span className="bengali-num absolute top-4 left-4 px-3 py-1 rounded-full bg-[#E31E24] text-white text-xs font-bold">
                {toBengaliNumber(discountPercent)}% ছাড়
              </span>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImgError(false);
                    setSelectedImageIdx(idx);
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                    selectedImageIdx === idx ? 'border-[#E31E24]' : 'border-[#E8E8E8]'
                  }`}
                >
                  <img src={imgUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Details */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#E31E24]">
              {CATEGORY_LABELS[product.category]}
              {product.unit ? ` · ${product.unit}` : ''}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareLink}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full border border-[#E8E8E8] hover:border-[#E31E24]/40 text-xs font-semibold text-[#333333] hover:text-[#E31E24] cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>শেয়ার করুন</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                  wishlisted
                    ? 'bg-[#FFF0F0] border-[#E31E24]/40 text-[#E31E24]'
                    : 'border-[#E8E8E8] text-[#525252] hover:text-[#E31E24]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                <span>{wishlisted ? 'সংরক্ষিত' : 'উইশলিস্ট'}</span>
              </button>
            </div>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2B2B2B] leading-snug">
            {product.name}
          </h1>

          {/* Rating & Stock summary */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            {productReviews.length > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-[#2B2B2B]">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="bengali-num">{toBengaliNumber(avgRating)}</span>
                <span className="bengali-num text-[#737373]">({toBengaliNumber(productReviews.length)} রিভিউ)</span>
              </span>
            )}
            <span className={`bengali-num font-semibold ${outOfStock ? 'text-red-600' : 'text-emerald-600'}`}>
              {outOfStock ? 'স্টক শেষ' : `ইন-স্টক (${toBengaliNumber(product.stock)}টি)`}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="bengali-num text-3xl font-bold text-[#E31E24]">
              {formatBdt(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="bengali-num text-lg text-[#737373] line-through">
                {formatBdt(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Per-product Dhaka & Outside Dhaka delivery rates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FFF0F0]/60 border border-[#E31E24]/15 flex items-center gap-3 text-xs sm:text-sm">
              <Truck className="w-5 h-5 text-[#E31E24] shrink-0" />
              <span className="bengali-num text-[#333333]">
                ঢাকায় ডেলিভারি: <strong>{formatBdt(dhakaFee)}</strong> · বাইরে: <strong>{formatBdt(outsideFee)}</strong>
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] flex items-center gap-3 text-xs sm:text-sm">
              <ShieldCheck className="w-5 h-5 text-[#E31E24] shrink-0" />
              <span className="text-[#525252]">ক্যাশ অন ডেলিভারি ও বিকাশ সুবিধা</span>
            </div>
          </div>

          {product.description && (
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E8E8E8]">
              <h2 className="text-xs font-semibold text-[#737373] mb-1.5">পণ্যের বিবরণ</h2>
              <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Qty + Desktop CTAs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[#333333]">পরিমাণ:</span>
              <div className="inline-flex items-center border border-[#E8E8E8] rounded-xl bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#525252] hover:text-[#E31E24] cursor-pointer"
                  aria-label="কমান"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="bengali-num w-10 text-center font-bold text-sm text-[#333333]">
                  {toBengaliNumber(qty)}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#525252] hover:text-[#E31E24] cursor-pointer"
                  aria-label="বাড়ান"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => addToCart(product, qty)}
                className="h-12 rounded-xl border-2 border-[#E31E24] text-[#E31E24] hover:bg-[#FFF0F0] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>কার্টে যোগ করুন</span>
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  addToCart(product, qty);
                  navigate('/checkout');
                }}
                className="h-12 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>এখনই কিনুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-6 border-t border-[#E8E8E8] grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#FAFAFA] border border-[#E8E8E8] space-y-4">
          <h2 className="font-heading text-lg font-bold text-[#2B2B2B]">রিভিউ লিখুন</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">আপনার নাম</label>
              <input
                type="text"
                required
                value={revName}
                onChange={(e) => setRevName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">রেটিং</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRevRating(star)}
                    className="p-1 cursor-pointer"
                    aria-label={`${star} স্টার`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= revRating ? 'fill-amber-400 text-amber-400' : 'text-[#D4D4D4]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">মতামত *</label>
              <textarea
                rows={3}
                required
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                placeholder="পণ্যটি কেমন লেগেছে লিখুন..."
                className="w-full p-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingRev}
              className="w-full h-10 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              {submittingRev ? 'জমা হচ্ছে...' : 'রিভিউ জমা দিন'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <h2 className="font-heading text-lg font-bold text-[#2B2B2B]">
            গ্রাহকদের মতামত ({toBengaliNumber(productReviews.length)})
          </h2>
          {productReviews.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] text-sm text-[#737373]">
              এই পণ্যে এখনো কোনো রিভিউ নেই। আপনি প্রথম রিভিউটি দিতে পারেন!
            </div>
          ) : (
            <div className="space-y-3">
              {productReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-white border border-[#E8E8E8] space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#2B2B2B]">{rev.authorName}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-[#E5E5E5]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#525252] leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-4 border-t border-[#E8E8E8]">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-[#2B2B2B] mb-4">
            একই ক্যাটাগরির আরও পণ্য
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

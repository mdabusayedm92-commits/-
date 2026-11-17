import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Package,
  ClipboardList,
  MessageSquare,
  Users,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Database,
  Save,
  X,
  LogIn,
  Search,
  Star,
  UserPlus,
  UserMinus,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ADMIN_EMAIL, DEFAULT_PROMO_BANNER } from '../lib/storeUtils';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  ORDER_STATUS_META,
  formatBdt,
  toBengaliNumber,
} from '../data/bangladeshData';
import { OrderStatus, Product, ProductCategorySlug, PromoBannerConfig } from '../types';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'reviews' | 'users' | 'settings';

export function AdminPanelPage() {
  const {
    user,
    isRegisteredUser,
    authLoading,
    isAdmin,
    products,
    reviews,
    isUsingStarterCatalog,
    orders,
    allUsers,
    shopSettings,
    saveProduct,
    removeProduct,
    seedStarterProducts,
    updateOrderStatus,
    deleteProductReview,
    toggleUserAdminRole,
    saveShopSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Order inline edits
  const [orderEdits, setOrderEdits] = useState<Record<string, { status: OrderStatus; note: string }>>({});
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [roleBusyUid, setRoleBusyUid] = useState<string | null>(null);

  // Product Form Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<ProductCategorySlug>('electronics');
  const [pPrice, setPPrice] = useState('');
  const [pComparePrice, setPComparePrice] = useState('');
  const [pUnit, setPUnit] = useState('১ পিস');
  const [pStock, setPStock] = useState('20');
  const [pDhakaDelivery, setPDhakaDelivery] = useState('70');
  const [pOutsideDhakaDelivery, setPOutsideDhakaDelivery] = useState('130');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pExtraImages, setPExtraImages] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pIsActive, setPIsActive] = useState(true);
  const [pIsFeatured, setPIsFeatured] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Settings + Promo Banner Form
  const [sStoreName, setSStoreName] = useState(shopSettings.storeName);
  const [sTagline, setSTagline] = useState(shopSettings.tagline);
  const [sSupportPhone, setSSupportPhone] = useState(shopSettings.supportPhone);
  const [sBkashNumber, setSBkashNumber] = useState(shopSettings.bkashNumber);
  const [sDhakaDelivery, setSDhakaDelivery] = useState(String(shopSettings.dhakaDelivery));
  const [sOutsideDhakaDelivery, setSOutsideDhakaDelivery] = useState(String(shopSettings.outsideDhakaDelivery));
  const [promoDraft, setPromoDraft] = useState<PromoBannerConfig>(
    shopSettings.promoBanner || DEFAULT_PROMO_BANNER
  );
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setSStoreName(shopSettings.storeName);
    setSTagline(shopSettings.tagline);
    setSSupportPhone(shopSettings.supportPhone);
    setSBkashNumber(shopSettings.bkashNumber);
    setSDhakaDelivery(String(shopSettings.dhakaDelivery));
    setSOutsideDhakaDelivery(String(shopSettings.outsideDhakaDelivery));
    setPromoDraft({ ...DEFAULT_PROMO_BANNER, ...(shopSettings.promoBanner || {}) });
  }, [shopSettings]);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + (o.total || 0), 0);
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    return {
      totalOrders: orders.length,
      pendingCount,
      totalRevenue,
      totalProducts: isUsingStarterCatalog ? 0 : products.length,
    };
  }, [orders, products.length, isUsingStarterCatalog]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (q) {
        const hay = `${o.orderId} ${o.customerName} ${o.customerPhone} ${o.district}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      `${p.name} ${CATEGORY_LABELS[p.category]} ${p.description || ''}`.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) =>
      `${u.fullName} ${u.email} ${u.phone || ''}`.toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-[#737373]">
        অ্যাকাউন্ট যাচাই করা হচ্ছে...
      </div>
    );
  }

  if (!isRegisteredUser || !user || !isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E8E8] shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0F0] text-[#E31E24] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#2B2B2B]">অ্যাডমিন প্যানেল সংরক্ষিত</h1>
          <p className="text-sm text-[#737373] leading-relaxed">
            এই অংশটি শুধুমাত্র অনুমোদিত অ্যাডমিন (মূল অ্যাডমিন <span className="font-semibold text-[#333333]">{ADMIN_EMAIL}</span> অথবা অ্যাডমিন কর্তৃক নিযুক্ত অ্যাডমিন) অ্যাকাউন্টের জন্য উন্মুক্ত।
          </p>
          {isRegisteredUser && user && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5">
              বর্তমান লগইন: {user.email} — অ্যাডমিন অনুমতি নেই।
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/login"
              state={{ from: '/admin' }}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold"
            >
              <LogIn className="w-4 h-4" />
              <span>অ্যাডমিন লগইন</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-5 h-10 rounded-full border border-[#E8E8E8] text-sm font-semibold text-[#333333]"
            >
              হোমে ফিরুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const openNewProductForm = () => {
    setEditingProduct(null);
    setPName('');
    setPCategory('electronics');
    setPPrice('');
    setPComparePrice('');
    setPUnit('১ পিস');
    setPStock('20');
    setPDhakaDelivery(String(shopSettings.dhakaDelivery));
    setPOutsideDhakaDelivery(String(shopSettings.outsideDhakaDelivery));
    setPImageUrl('');
    setPExtraImages('');
    setPDescription('');
    setPIsActive(true);
    setPIsFeatured(false);
    setProductFormOpen(true);
  };

  const openEditProductForm = (p: Product) => {
    setEditingProduct(p);
    setPName(p.name);
    setPCategory(p.category);
    setPPrice(String(p.price));
    setPComparePrice(p.comparePrice ? String(p.comparePrice) : '');
    setPUnit(p.unit || '১ পিস');
    setPStock(String(p.stock));
    setPDhakaDelivery(
      typeof p.dhakaDeliveryCharge === 'number'
        ? String(p.dhakaDeliveryCharge)
        : typeof p.deliveryCharge === 'number'
          ? String(p.deliveryCharge)
          : String(shopSettings.dhakaDelivery)
    );
    setPOutsideDhakaDelivery(
      typeof p.outsideDhakaDeliveryCharge === 'number'
        ? String(p.outsideDhakaDeliveryCharge)
        : String(shopSettings.outsideDhakaDelivery)
    );
    setPImageUrl(p.imageUrl);
    setPExtraImages(Array.isArray(p.additionalImages) ? p.additionalImages.join('\n') : '');
    setPDescription(p.description || '');
    setPIsActive(p.isActive !== false);
    setPIsFeatured(Boolean(p.isFeatured));
    setProductFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    const parsedExtras = pExtraImages
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await saveProduct({
        id: editingProduct && !editingProduct.isStarterSeed ? editingProduct.id : undefined,
        name: pName,
        category: pCategory,
        price: Number(pPrice) || 0,
        comparePrice: pComparePrice ? Number(pComparePrice) : undefined,
        unit: pUnit,
        stock: Number(pStock) || 0,
        dhakaDeliveryCharge: pDhakaDelivery !== '' ? Number(pDhakaDelivery) : shopSettings.dhakaDelivery,
        outsideDhakaDeliveryCharge:
          pOutsideDhakaDelivery !== '' ? Number(pOutsideDhakaDelivery) : shopSettings.outsideDhakaDelivery,
        deliveryCharge: pDhakaDelivery !== '' ? Number(pDhakaDelivery) : shopSettings.dhakaDelivery,
        imageUrl: pImageUrl,
        additionalImages: parsedExtras,
        description: pDescription,
        isActive: pIsActive,
        isFeatured: pIsFeatured,
      });
      setProductFormOpen(false);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveShopSettings({
        storeName: sStoreName,
        tagline: sTagline,
        supportPhone: sSupportPhone,
        bkashNumber: sBkashNumber,
        dhakaDelivery: Number(sDhakaDelivery) || 70,
        outsideDhakaDelivery: Number(sOutsideDhakaDelivery) || 130,
        promoBanner: promoDraft,
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'products', label: 'পণ্য', icon: Package },
    { id: 'orders', label: 'অর্ডার', icon: ClipboardList },
    { id: 'reviews', label: 'রিভিউ', icon: MessageSquare },
    { id: 'users', label: 'ব্যবহারকারী', icon: Users },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header + 6 PDF Tabs */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8E8] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#E31E24] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2B2B2B]">অ্যাডমিন প্যানেল</h1>
              <p className="text-xs text-[#737373]">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={openNewProductForm}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-[#F0F0F0]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#E31E24] text-white'
                    : 'bg-[#F5F5F5] text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E31E24]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW (PDF Page 20) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8E8]">
              <p className="text-xs text-[#737373]">মোট বিক্রি</p>
              <p className="bengali-num text-2xl font-bold text-[#E31E24] mt-1">{formatBdt(stats.totalRevenue)}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8E8]">
              <p className="text-xs text-[#737373]">মোট অর্ডার</p>
              <p className="bengali-num text-2xl font-bold text-[#2B2B2B] mt-1">{toBengaliNumber(stats.totalOrders)}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8E8]">
              <p className="text-xs text-[#737373]">পেন্ডিং অর্ডার</p>
              <p className="bengali-num text-2xl font-bold text-amber-600 mt-1">{toBengaliNumber(stats.pendingCount)}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8E8]">
              <p className="text-xs text-[#737373]">ডাটাবেস পণ্য</p>
              <p className="bengali-num text-2xl font-bold text-[#2B2B2B] mt-1">{toBengaliNumber(stats.totalProducts)}</p>
            </div>
          </div>

          {/* Workflow Guide matching PDF Page 20 */}
          <div className="p-5 rounded-2xl glass-red-card border border-[#E31E24]/20 space-y-3">
            <h2 className="font-heading text-base font-bold text-[#2B2B2B] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E31E24]" />
              <span>দ্রুত পরিচালনা নির্দেশিকা</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm text-[#525252]">
              <div className="p-3.5 rounded-xl bg-white/85 border border-[#E8E8E8] space-y-1">
                <p className="font-bold text-[#2B2B2B]">১. পণ্য ও ডেলিভারি চার্জ</p>
                <p>প্রতিটি পণ্যে ঢাকার ভিতরে ও বাইরের আলাদা ডেলিভারি চার্জ এবং একাধিক ছবি সেট করুন।</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/85 border border-[#E8E8E8] space-y-1">
                <p className="font-bold text-[#2B2B2B]">২. সাপ্তাহিক অফার ব্যানার</p>
                <p>সেটিংস ট্যাব থেকে হোম পেজের অ্যানিমেটেড অফার ব্যানার সরাসরি চালু, বন্ধ বা পরিবর্তন করুন।</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/85 border border-[#E8E8E8] space-y-1">
                <p className="font-bold text-[#2B2B2B]">৩. অ্যাডমিন নিয়োগ ও রিভিউ</p>
                <p>ব্যবহারকারী ট্যাব থেকে যেকোনো গ্রাহককে অ্যাডমিন করুন এবং রিভিউ ট্যাব থেকে মন্তব্য মডারেট করুন।</p>
              </div>
            </div>
          </div>

          {isUsingStarterCatalog && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                আপনার লাইভ ডাটাবেসে এখনো কোনো পণ্য সেভ নেই। প্রাথমিক ৪টি পণ্য যুক্ত করতে পারেন বা নতুন পণ্য যোগ করুন।
              </p>
              <button
                type="button"
                onClick={seedStarterProducts}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-[#E31E24] text-white text-xs font-semibold cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>প্রাথমিক ৪টি পণ্য ডাটাবেসে যুক্ত করুন</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="পণ্যের নাম খুঁজুন..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E8E8E8] bg-white text-sm outline-none focus:border-[#E31E24]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isUsingStarterCatalog && (
                <button
                  type="button"
                  onClick={seedStarterProducts}
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl border border-[#E31E24] text-[#E31E24] hover:bg-[#FFF0F0] text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>প্রাথমিক ৪টি পণ্য যুক্ত করুন</span>
                </button>
              )}
              <button
                type="button"
                onClick={openNewProductForm}
                className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন পণ্য</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-[#E8E8E8] flex items-center gap-3.5"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-[#F5F5F5] border border-[#E8E8E8] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2B2B2B] truncate">{p.name}</p>
                  <p className="bengali-num text-xs text-[#737373] mt-0.5">
                    {CATEGORY_LABELS[p.category]} • {formatBdt(p.price)} • স্টক: {toBengaliNumber(p.stock)}
                  </p>
                  <p className="bengali-num text-[11px] text-[#525252] mt-0.5">
                    ডেলিভারি: ঢাকা {formatBdt(p.dhakaDeliveryCharge ?? shopSettings.dhakaDelivery)} / বাইরে{' '}
                    {formatBdt(p.outsideDhakaDeliveryCharge ?? shopSettings.outsideDhakaDelivery)}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className={p.isActive !== false ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {p.isActive !== false ? 'সক্রিয়' : 'বন্ধ'}
                    </span>
                    {p.isFeatured && <span className="text-[#E31E24] font-semibold">• জনপ্রিয়</span>}
                    {p.isStarterSeed && <span className="text-amber-600">(প্রিভিউ — সেভ করুন)</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditProductForm(p)}
                    aria-label="সম্পাদনা করুন"
                    className="w-9 h-9 rounded-xl border border-[#E8E8E8] hover:border-[#E31E24] text-[#525252] hover:text-[#E31E24] flex items-center justify-center cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {!p.isStarterSeed && (
                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      aria-label="ডিলিট করুন"
                      className="w-9 h-9 rounded-xl border border-[#E8E8E8] hover:border-red-300 text-[#525252] hover:text-red-600 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 h-8 rounded-full text-xs font-semibold cursor-pointer ${
                  statusFilter === 'all' ? 'bg-[#E31E24] text-white' : 'bg-[#F5F5F5] text-[#333333]'
                }`}
              >
                সব ({toBengaliNumber(orders.length)})
              </button>
              {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 h-8 rounded-full text-xs font-semibold cursor-pointer ${
                    statusFilter === st ? 'bg-[#E31E24] text-white' : 'bg-[#F5F5F5] text-[#333333]'
                  }`}
                >
                  {ORDER_STATUS_META[st].label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="অর্ডার আইডি বা ফোন..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E8E8E8] bg-white text-xs sm:text-sm outline-none focus:border-[#E31E24]"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-[#F9F9F9] border border-[#E8E8E8] text-sm text-[#737373]">
              এই ক্যাটাগরিতে কোনো অর্ডার নেই।
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const currentEdit = orderEdits[order.orderId] || {
                  status: order.status,
                  note: order.statusNote || '',
                };
                const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pending;

                return (
                  <div
                    key={order.orderId}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E8E8] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E8E8] pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#2B2B2B]">{order.orderId}</span>
                        {order.isGuest && (
                          <span className="px-2 py-0.5 rounded-md bg-[#F5F5F5] text-[10px] font-semibold text-[#525252]">
                            গেস্ট অর্ডার
                          </span>
                        )}
                        <span className="text-xs text-[#737373]">
                          • {order.customerName} ({order.customerPhone})
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-[#525252] grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p>
                          <span className="font-semibold text-[#333333]">ঠিকানা:</span> {order.address}, {order.upazila}, {order.district}
                        </p>
                        <p className="mt-0.5">
                          <span className="font-semibold text-[#333333]">পেমেন্ট:</span>{' '}
                          {order.paymentMethod === 'cod'
                            ? 'ক্যাশ অন ডেলিভারি'
                            : `বিকাশ (নম্বর: ${order.bkashSender || '-'}, TrxID: ${order.bkashTrxId || '-'})`}
                        </p>
                        {order.orderNote && (
                          <p className="mt-0.5 text-xs text-[#737373]">
                            <span className="font-semibold text-[#333333]">গ্রাহকের নোট:</span> {order.orderNote}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#333333]">পণ্য:</p>
                        <ul className="space-y-0.5">
                          {order.items.map((it, idx) => (
                            <li key={idx} className="bengali-num">
                              {it.name} × {toBengaliNumber(it.qty)} ({formatBdt(it.price * it.qty)})
                            </li>
                          ))}
                        </ul>
                        <p className="bengali-num font-bold text-[#E31E24] mt-1">সর্বমোট: {formatBdt(order.total)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E8E8E8] flex flex-wrap items-center gap-2.5">
                      <select
                        value={currentEdit.status}
                        onChange={(e) =>
                          setOrderEdits((prev) => ({
                            ...prev,
                            [order.orderId]: {
                              status: e.target.value as OrderStatus,
                              note: currentEdit.note,
                            },
                          }))
                        }
                        className="h-9 px-3 rounded-xl border border-[#E3E3E3] bg-white text-xs sm:text-sm outline-none focus:border-[#E31E24]"
                      >
                        {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((st) => (
                          <option key={st} value={st}>{ORDER_STATUS_META[st].label}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={currentEdit.note}
                        onChange={(e) =>
                          setOrderEdits((prev) => ({
                            ...prev,
                            [order.orderId]: {
                              status: currentEdit.status,
                              note: e.target.value,
                            },
                          }))
                        }
                        placeholder="কুরিয়ার বা স্ট্যাটাস নোট লিখুন..."
                        className="flex-1 min-w-[180px] h-9 px-3 rounded-xl border border-[#E3E3E3] text-xs sm:text-sm outline-none focus:border-[#E31E24]"
                      />

                      <button
                        type="button"
                        disabled={savingOrderId === order.orderId}
                        onClick={async () => {
                          setSavingOrderId(order.orderId);
                          try {
                            await updateOrderStatus(order.orderId, currentEdit.status, currentEdit.note);
                          } finally {
                            setSavingOrderId(null);
                          }
                        }}
                        className="px-4 h-9 rounded-xl bg-[#E31E24] hover:bg-[#C41419] text-white text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
                      >
                        {savingOrderId === order.orderId ? 'সেভ হচ্ছে...' : 'আপডেট করুন'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REVIEWS MODERATION (PDF Page 19) */}
      {activeTab === 'reviews' && (
        <div className="rounded-2xl bg-white border border-[#E8E8E8] overflow-hidden">
          <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[#2B2B2B]">
              ক্রেতাদের রিভিউ ({toBengaliNumber(reviews.length)})
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#737373]">এখনো কোনো পণ্যের রিভিউ জমা হয়নি।</div>
          ) : (
            <div className="divide-y divide-[#E8E8E8]">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#2B2B2B]">{rev.authorName}</span>
                      <span className="text-xs text-[#737373]">• {rev.productName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${n <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-[#D4D4D4]'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#525252]">{rev.comment}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteProductReview(rev.id)}
                    aria-label="রিভিউ ডিলিট"
                    className="w-9 h-9 rounded-xl border border-[#E8E8E8] hover:border-red-300 text-[#737373] hover:text-red-600 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: USERS & ADMIN PROMOTION/DEMOTION (PDF Page 19-20) */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-white border border-[#E8E8E8] overflow-hidden">
          <div className="p-4 border-b border-[#E8E8E8] flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-base font-bold text-[#2B2B2B]">
              নিবন্ধিত ব্যবহারকারী ({toBengaliNumber(allUsers.length)})
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="নাম বা ইমেইল খুঁজুন..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E8E8E8] text-xs sm:text-sm outline-none focus:border-[#E31E24]"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#737373]">কোনো নিবন্ধিত ব্যবহারকারী পাওয়া যায়নি।</div>
          ) : (
            <div className="divide-y divide-[#E8E8E8]">
              {filteredUsers.map((u) => {
                const isRootSuperAdmin = u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                const isCurrentlyAdmin = isRootSuperAdmin || u.role === 'admin';
                return (
                  <div key={u.uid} className="p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-[#2B2B2B]">{u.fullName}</p>
                      <p className="text-xs text-[#737373]">
                        {u.email} {u.phone ? `• ${u.phone}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                          isCurrentlyAdmin
                            ? 'bg-[#FFF0F0] text-[#E31E24]'
                            : 'bg-[#F5F5F5] text-[#525252]'
                        }`}
                      >
                        {isRootSuperAdmin ? 'সুপার অ্যাডমিন' : isCurrentlyAdmin ? 'অ্যাডমিন' : 'গ্রাহক'}
                      </span>

                      {!isRootSuperAdmin && (
                        <button
                          type="button"
                          disabled={roleBusyUid === u.uid}
                          onClick={async () => {
                            setRoleBusyUid(u.uid);
                            try {
                              await toggleUserAdminRole(u, !isCurrentlyAdmin);
                            } finally {
                              setRoleBusyUid(null);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                            isCurrentlyAdmin
                              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                              : 'border-[#E31E24]/30 bg-white text-[#E31E24] hover:bg-[#FFF0F0]'
                          }`}
                        >
                          {isCurrentlyAdmin ? (
                            <>
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>অ্যাডমিন থেকে সরান</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>অ্যাডমিন করুন</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: STORE SETTINGS & WEEKLY PROMO BANNER */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E8E8] space-y-4">
            <h2 className="font-heading text-lg font-bold text-[#2B2B2B]">দোকানের সাধারণ সেটিংস</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">দোকানের নাম</label>
                <input
                  type="text"
                  required
                  value={sStoreName}
                  onChange={(e) => setSStoreName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">ট্যাগলাইন</label>
                <input
                  type="text"
                  required
                  value={sTagline}
                  onChange={(e) => setSTagline(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">সাপোর্ট / হটলাইন নম্বর</label>
                <input
                  type="text"
                  required
                  value={sSupportPhone}
                  onChange={(e) => setSSupportPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">বিকাশ পেমেন্ট নম্বর</label>
                <input
                  type="text"
                  required
                  value={sBkashNumber}
                  onChange={(e) => setSBkashNumber(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">ডিফল্ট ঢাকা ডেলিভারি চার্জ (৳)</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={sDhakaDelivery}
                  onChange={(e) => setSDhakaDelivery(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">ডিফল্ট ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={sOutsideDhakaDelivery}
                  onChange={(e) => setSOutsideDhakaDelivery(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E8E8] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
            </div>
          </div>

          {/* Weekly Promo Banner Controls (Confirmed Decision 3) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E8E8] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-lg font-bold text-[#2B2B2B]">সাপ্তাহিক অফার ব্যানার নিয়ন্ত্রণ</h2>
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#333333] cursor-pointer">
                <input
                  type="checkbox"
                  checked={promoDraft.isActive}
                  onChange={(e) => setPromoDraft({ ...promoDraft, isActive: e.target.checked })}
                  className="accent-[#E31E24] w-4 h-4"
                />
                <span>হোম ও অফার পেজে দেখান</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">অফার ট্যাগ (যেমন: % সাপ্তাহিক অফার)</label>
                <input
                  type="text"
                  value={promoDraft.tag}
                  onChange={(e) => setPromoDraft({ ...promoDraft, tag: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">বাটনের লেখা</label>
                <input
                  type="text"
                  value={promoDraft.ctaText}
                  onChange={(e) => setPromoDraft({ ...promoDraft, ctaText: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">মূল শিরোনাম</label>
              <input
                type="text"
                value={promoDraft.headline}
                onChange={(e) => setPromoDraft({ ...promoDraft, headline: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1">উপশিরোনাম / বিবরণ</label>
              <input
                type="text"
                value={promoDraft.subtitle}
                onChange={(e) => setPromoDraft({ ...promoDraft, subtitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">বাটনে ক্লিক করলে যাবে</label>
                <select
                  value={promoDraft.targetType}
                  onChange={(e) => {
                    const nextType = e.target.value as 'all' | 'category' | 'product';
                    setPromoDraft({
                      ...promoDraft,
                      targetType: nextType,
                      targetValue:
                        nextType === 'category'
                          ? CATEGORIES[0].slug
                          : nextType === 'product'
                            ? products[0]?.id || ''
                            : '',
                    });
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
                >
                  <option value="all">সকল অফার / পণ্য</option>
                  <option value="category">নির্দিষ্ট ক্যাটাগরি</option>
                  <option value="product">নির্দিষ্ট পণ্য</option>
                </select>
              </div>

              {promoDraft.targetType === 'category' && (
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">ক্যাটাগরি নির্বাচন</label>
                  <select
                    value={promoDraft.targetValue}
                    onChange={(e) => setPromoDraft({ ...promoDraft, targetValue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {promoDraft.targetType === 'product' && (
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">পণ্য নির্বাচন</label>
                  <select
                    value={promoDraft.targetValue}
                    onChange={(e) => setPromoDraft({ ...promoDraft, targetValue: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'সেভ হচ্ছে...' : 'সব সেটিংস সেভ করুন'}</span>
          </button>
        </form>
      )}

      {/* Product Add/Edit Modal (with Dhaka + Outside Dhaka Delivery Charges & Multi-Image URLs) */}
      {productFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E8E8E8] p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <h3 className="font-heading text-lg font-bold text-[#2B2B2B]">
                {editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setProductFormOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#525252] cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">ক্যাটাগরি</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as ProductCategorySlug)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] bg-white text-sm outline-none focus:border-[#E31E24]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">ইউনিট / পরিমাণ</label>
                  <input
                    type="text"
                    value={pUnit}
                    onChange={(e) => setPUnit(e.target.value)}
                    placeholder="যেমন: ১ পিস"
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">পূর্বের দাম (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={pComparePrice}
                    onChange={(e) => setPComparePrice(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">স্টক *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">ঢাকার ভিতরে ডেলিভারি (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={pDhakaDelivery}
                    onChange={(e) => setPDhakaDelivery(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">ঢাকার বাইরে ডেলিভারি (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={pOutsideDhakaDelivery}
                    onChange={(e) => setPOutsideDhakaDelivery(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">মূল ছবির লিংক (URL) *</label>
                <input
                  type="text"
                  required
                  value={pImageUrl}
                  onChange={(e) => setPImageUrl(e.target.value)}
                  placeholder="https://... অথবা লোকাল পাথ"
                  className="w-full h-10 px-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">অতিরিক্ত ছবির লিংক (প্রতি লাইনে বা কমা দিয়ে)</label>
                <textarea
                  rows={2}
                  value={pExtraImages}
                  onChange={(e) => setPExtraImages(e.target.value)}
                  placeholder="https://example.com/photo2.jpg"
                  className="w-full p-2.5 rounded-xl border border-[#E3E3E3] text-xs outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">পণ্যের বিবরণ</label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E3E3E3] text-sm outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="flex items-center gap-6 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pIsActive}
                    onChange={(e) => setPIsActive(e.target.checked)}
                    className="accent-[#E31E24] w-4 h-4"
                  />
                  <span>দোকানে প্রদর্শিত হবে (Active)</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pIsFeatured}
                    onChange={(e) => setPIsFeatured(e.target.checked)}
                    className="accent-[#E31E24] w-4 h-4"
                  />
                  <span>জনপ্রিয় পণ্য</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setProductFormOpen(false)}
                  className="px-4 h-10 rounded-xl border border-[#E8E8E8] text-sm font-semibold text-[#525252] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 h-10 rounded-full bg-[#E31E24] hover:bg-[#C41419] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {savingProduct ? 'সেভ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  writeBatch,
  getDocsFromServer,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInAnonymously,
  signOut,
  isVerifiedAdminEmail,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  CartItem,
  FirestoreOrder,
  OrderStatus,
  OrderTrackingRecord,
  PaymentMethod,
  Product,
  ProductReview,
  ShopSettings,
  UserProfile,
} from '../types';
import {
  DEFAULT_SHOP_SETTINGS,
  STARTER_PRODUCTS,
  generateOrderId,
  playSound,
} from '../data/bangladeshData';
import { ADMIN_EMAIL, DEFAULT_PROMO_BANNER, isAdminUser } from '../lib/storeUtils';

interface PlaceOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  orderNote?: string;
  paymentMethod: PaymentMethod;
  bkashSender?: string;
  bkashTrxId?: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

interface StoreContextValue {
  // Auth
  user: User | null;
  isRegisteredUser: boolean;
  userProfile: UserProfile | null;
  authLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isVerifiedUser: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (fullName: string, email: string, password: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<boolean>;
  logout: () => Promise<void>;
  saveUserProfile: (patch: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'division' | 'district' | 'upazila' | 'address'>>) => Promise<void>;

  // Catalog & Reviews
  products: Product[];
  reviews: ProductReview[];
  isUsingStarterCatalog: boolean;
  productsLoading: boolean;
  refreshData: () => Promise<void>;
  shopSettings: ShopSettings;
  submitProductReview: (productId: string, productName: string, authorName: string, rating: number, comment: string) => Promise<void>;
  deleteProductReview: (reviewId: string) => Promise<void>;

  // Cart & Wishlist
  cart: CartItem[];
  cartCount: number;
  selectedCartItems: CartItem[];
  selectedCartSubtotal: number;
  cartSubtotal: number;
  wishlistIds: string[];
  wishlistProducts: Product[];
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  toggleCartItemSelected: (productId: string) => void;
  toggleSelectAllCart: (selected: boolean) => void;
  removeFromCart: (productId: string) => void;
  clearCart: (onlySelected?: boolean) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders & Tracking
  orders: FirestoreOrder[];
  ordersLoading: boolean;
  placeOrder: (input: PlaceOrderInput) => Promise<FirestoreOrder>;
  lookupTracking: (orderId: string, phoneLast4?: string) => Promise<OrderTrackingRecord | null>;

  // Admin Operations
  allUsers: UserProfile[];
  saveProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  seedStarterProducts: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, statusNote?: string) => Promise<void>;
  saveShopSettings: (next: Omit<ShopSettings, 'updatedAt'>) => Promise<void>;
  toggleUserAdminRole: (target: UserProfile, makeAdmin: boolean) => Promise<void>;

  // Toast feedback
  toastMessage: { text: string; type: 'success' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'jm_cart_v3';
const WISHLIST_STORAGE_KEY = 'jm_wishlist_v2';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasAdminMarker, setHasAdminMarker] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  const [shopSettings, setShopSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            ...item,
            selected: item.selected !== false,
          }))
        : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3200);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlistIds]);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  const isRegisteredUser = Boolean(user && !user.isAnonymous);
  const isVerifiedUser = Boolean(user && !user.isAnonymous && user.emailVerified);
  const isSuperAdmin = useMemo(
    () => isVerifiedAdminEmail(user?.email, user?.emailVerified),
    [user?.email, user?.emailVerified]
  );
  const isAdmin = useMemo(
    () =>
      Boolean(
        isSuperAdmin ||
          (isVerifiedUser && (hasAdminMarker || isAdminUser(user?.email, user?.emailVerified, userProfile?.role)))
      ),
    [isSuperAdmin, isVerifiedUser, hasAdminMarker, user?.email, user?.emailVerified, userProfile?.role]
  );

  // Sync verified non-anonymous user profile & admin marker
  const ensureUserProfile = useCallback(async (firebaseUser: User) => {
    if (firebaseUser.isAnonymous || !firebaseUser.emailVerified) {
      setUserProfile(null);
      setHasAdminMarker(false);
      return;
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    const adminRef = doc(db, 'admins', firebaseUser.uid);
    try {
      const [userSnap, adminSnap] = await Promise.all([
        getDoc(userRef),
        getDoc(adminRef).catch(() => null),
      ]);

      setHasAdminMarker(Boolean(adminSnap && adminSnap.exists()));

      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      } else {
        const superAdmin = isVerifiedAdminEmail(firebaseUser.email, firebaseUser.emailVerified);
        const fallbackName =
          firebaseUser.displayName?.trim() ||
          firebaseUser.email?.split('@')[0] ||
          'গ্রাহক';

        const newProfile: Record<string, unknown> = {
          uid: firebaseUser.uid,
          fullName: fallbackName.slice(0, 120),
          email: (firebaseUser.email || '').slice(0, 180),
          role: superAdmin ? 'admin' : 'customer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userRef, newProfile);
        setUserProfile({
          uid: firebaseUser.uid,
          fullName: fallbackName.slice(0, 120),
          email: (firebaseUser.email || '').slice(0, 180),
          role: superAdmin ? 'admin' : 'customer',
        });
      }
    } catch (error) {
      console.error('Profile sync error:', error);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current) {
        await ensureUserProfile(current);
      } else {
        setUserProfile(null);
        setHasAdminMarker(false);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [ensureUserProfile]);

  // Products real-time listener
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Product[] = snapshot.docs.map((d) => ({
          ...(d.data() as Product),
          id: d.id,
        }));
        setFirestoreProducts(list);
        setProductsLoaded(true);
      },
      (err) => {
        console.error('Products listener error:', err);
        setProductsLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  // Reviews real-time listener
  useEffect(() => {
    const q = query(collection(db, 'productReviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setReviews(snap.docs.map((d) => d.data() as ProductReview));
      },
      (err) => {
        console.error('Reviews listener error:', err);
      }
    );
    return () => unsub();
  }, []);

  // Shop settings real-time listener
  useEffect(() => {
    const ref = doc(db, 'shopSettings', 'public');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<ShopSettings>;
          setShopSettings({
            ...DEFAULT_SHOP_SETTINGS,
            ...data,
            promoBanner: {
              ...DEFAULT_PROMO_BANNER,
              ...(data.promoBanner || {}),
            },
          });
        }
      },
      (err) => {
        console.error('Shop settings listener error:', err);
      }
    );
    return () => unsub();
  }, []);

  // Orders listener (guest UID or customer UID or all orders for admin)
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    const ordersRef = collection(db, 'orders');
    const q = isAdmin
      ? query(ordersRef, orderBy('createdAt', 'desc'))
      : query(ordersRef, where('userId', '==', user.uid));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: FirestoreOrder[] = snap.docs.map((d) => d.data() as FirestoreOrder);
        list.sort((a, b) => {
          const tA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() ?? 0;
          const tB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() ?? 0;
          return tB - tA;
        });
        setOrders(list);
        setOrdersLoading(false);
      },
      (err) => {
        console.error('Orders listener error:', err);
        setOrdersLoading(false);
      }
    );
    return () => unsub();
  }, [user, isAdmin]);

  // Users listener for Admin
  useEffect(() => {
    if (!isAdmin) {
      setAllUsers([]);
      return;
    }

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAllUsers(snap.docs.map((d) => d.data() as UserProfile));
      },
      (err) => {
        console.error('Users listener error:', err);
      }
    );
    return () => unsub();
  }, [isAdmin]);

  const isUsingStarterCatalog = productsLoaded && firestoreProducts.length === 0;
  const products = useMemo(
    () => (isUsingStarterCatalog ? STARTER_PRODUCTS : firestoreProducts),
    [isUsingStarterCatalog, firestoreProducts]
  );

  // Auth actions
  const loginWithGoogle = useCallback(async () => {
    const res = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(res.user);
    return res.user;
  }, [ensureUserProfile]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      await ensureUserProfile(res.user);
      return res.user;
    },
    [ensureUserProfile]
  );

  const registerWithEmail = useCallback(async (fullName: string, email: string, password: string) => {
    const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (fullName.trim()) {
      await updateProfile(res.user, { displayName: fullName.trim() });
    }
    await sendEmailVerification(res.user);
    return res.user;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      await sendEmailVerification(auth.currentUser);
      showToast('ভেরিফিকেশন ইমেইল পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।');
    }
  }, [showToast]);

  const reloadUser = useCallback(async () => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const refreshed = auth.currentUser;
    setUser({ ...refreshed } as User);
    if (refreshed.emailVerified) {
      await ensureUserProfile(refreshed);
      showToast('ইমেইল ভেরিফিকেশন সম্পন্ন হয়েছে!');
      return true;
    }
    showToast('ইমেইল এখনো ভেরিফাই হয়নি। আপনার ইমেইলের লিংকে ক্লিক করুন।', 'error');
    return false;
  }, [ensureUserProfile, showToast]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUserProfile(null);
    setHasAdminMarker(false);
    setOrders([]);
    showToast('সফলভাবে লগআউট হয়েছে।');
  }, [showToast]);

  const saveUserProfile = useCallback(
    async (
      patch: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'division' | 'district' | 'upazila' | 'address'>>
    ) => {
      if (!user || user.isAnonymous || !user.emailVerified) {
        throw new Error('প্রোফাইল সংরক্ষণ করতে ভেরিফায়েড অ্যাকাউন্ট দিয়ে লগইন করুন।');
      }
      const userRef = doc(db, 'users', user.uid);
      const cleanPatch: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (patch.fullName !== undefined) cleanPatch.fullName = patch.fullName.trim().slice(0, 120);
      if (patch.phone !== undefined) cleanPatch.phone = patch.phone.trim().slice(0, 20);
      if (patch.division !== undefined) cleanPatch.division = patch.division.trim().slice(0, 60);
      if (patch.district !== undefined) cleanPatch.district = patch.district.trim().slice(0, 60);
      if (patch.upazila !== undefined) cleanPatch.upazila = patch.upazila.trim().slice(0, 80);
      if (patch.address !== undefined) cleanPatch.address = patch.address.trim().slice(0, 300);

      try {
        await updateDoc(userRef, cleanPatch);
        setUserProfile((prev) => (prev ? { ...prev, ...patch } : prev));
        showToast('প্রোফাইল তথ্য সংরক্ষণ করা হয়েছে।');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    },
    [user, showToast]
  );

  // Cart & Wishlist
  const addToCart = useCallback(
    (product: Product, qty = 1) => {
      playSound('pop');
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, qty: Math.min(product.stock || 99, item.qty + qty), selected: true }
              : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            unit: product.unit,
            deliveryCharge: product.deliveryCharge,
            dhakaDeliveryCharge: product.dhakaDeliveryCharge,
            outsideDhakaDeliveryCharge: product.outsideDhakaDeliveryCharge,
            qty: Math.max(1, qty),
            selected: true,
          },
        ];
      });
      showToast('পণ্যটি কার্টে যোগ করা হয়েছে');
    },
    [showToast]
  );

  const updateCartQty = useCallback((productId: string, qty: number) => {
    playSound('click');
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, qty } : item))
    );
  }, []);

  const toggleCartItemSelected = useCallback((productId: string) => {
    playSound('click');
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const toggleSelectAllCart = useCallback((selected: boolean) => {
    playSound('click');
    setCart((prev) => prev.map((item) => ({ ...item, selected })));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    playSound('trash');
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback((onlySelected = false) => {
    playSound('trash');
    if (onlySelected) {
      setCart((prev) => prev.filter((item) => !item.selected));
    } else {
      setCart([]);
    }
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      playSound('pop');
      setWishlistIds((prev) => {
        if (prev.includes(productId)) {
          showToast('উইশলিস্ট থেকে সরানো হয়েছে');
          return prev.filter((id) => id !== productId);
        }
        showToast('উইশলিস্টে সংরক্ষণ করা হয়েছে');
        return [productId, ...prev];
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart]
  );
  const selectedCartItems = useMemo(() => cart.filter((item) => item.selected), [cart]);
  const selectedCartSubtotal = useMemo(
    () => selectedCartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
    [selectedCartItems]
  );

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const refreshData = useCallback(async () => {
    playSound('click');
    try {
      const snap = await getDocsFromServer(
        query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      );
      setFirestoreProducts(snap.docs.map((d) => ({ ...(d.data() as Product), id: d.id })));
      showToast('সব তথ্য রিফ্রেশ করা হয়েছে');
    } catch {
      showToast('রিফ্রেশ সম্পন্ন হয়েছে');
    }
  }, [showToast]);

  // Reviews actions
  const submitProductReview = useCallback(
    async (
      productId: string,
      productName: string,
      authorName: string,
      rating: number,
      comment: string
    ) => {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const anonRes = await signInAnonymously(auth);
        currentUser = anonRes.user;
      }
      const reviewId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      try {
        await setDoc(doc(db, 'productReviews', reviewId), {
          id: reviewId,
          productId,
          productName: productName.slice(0, 200),
          userId: currentUser.uid,
          authorName: authorName.trim().slice(0, 100) || 'গ্রাহক',
          rating: Math.min(5, Math.max(1, Math.round(rating))),
          comment: comment.trim().slice(0, 800),
          createdAt: serverTimestamp(),
        });
        showToast('আপনার রিভিউ যুক্ত হয়েছে');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `productReviews/${reviewId}`);
      }
    },
    [showToast]
  );

  const deleteProductReview = useCallback(
    async (reviewId: string) => {
      try {
        await deleteDoc(doc(db, 'productReviews', reviewId));
        showToast('রিভিউ মুছে ফেলা হয়েছে');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `productReviews/${reviewId}`);
      }
    },
    [showToast]
  );

  // Place order supporting BOTH logged-in customers AND guest customers via Anonymous Auth
  const placeOrder = useCallback(async (input: PlaceOrderInput): Promise<FirestoreOrder> => {
    let activeUser = auth.currentUser;
    let isGuestOrder = false;

    if (!activeUser) {
      try {
        const anon = await signInAnonymously(auth);
        activeUser = anon.user;
        isGuestOrder = true;
      } catch (err) {
        const code = (err as { code?: string })?.code || '';
        if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
          throw new Error(
            'গেস্ট অর্ডারের জন্য Firebase Console থেকে Anonymous sign-in চালু করুন অথবা গুগল/ইমেইল দিয়ে লগইন করে অর্ডার করুন।'
          );
        }
        throw err;
      }
    } else if (activeUser.isAnonymous) {
      isGuestOrder = true;
    }

    const orderId = generateOrderId();
    const digitsOnlyPhone = input.customerPhone.replace(/\D/g, '');
    const phoneLast4 = digitsOnlyPhone.slice(-4).padStart(4, '0');

    const orderDoc: Record<string, unknown> = {
      orderId,
      userId: activeUser.uid,
      isGuest: isGuestOrder,
      customerName: input.customerName.trim().slice(0, 120),
      customerPhone: input.customerPhone.trim().slice(0, 20),
      division: input.division.trim().slice(0, 60),
      district: input.district.trim().slice(0, 60),
      upazila: input.upazila.trim().slice(0, 80),
      address: input.address.trim().slice(0, 300),
      paymentMethod: input.paymentMethod,
      items: input.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        imageUrl: item.imageUrl,
      })),
      subtotal: Math.round(input.subtotal),
      deliveryCharge: Math.round(input.deliveryCharge),
      total: Math.round(input.total),
      status: 'pending',
      statusNote: 'অর্ডার গ্রহণ করা হয়েছে',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (input.orderNote?.trim()) {
      orderDoc.orderNote = input.orderNote.trim().slice(0, 400);
    }

    if (input.customerEmail?.trim()) {
      orderDoc.customerEmail = input.customerEmail.trim().slice(0, 180);
    } else if (activeUser.email) {
      orderDoc.customerEmail = activeUser.email.slice(0, 180);
    }

    if (input.paymentMethod === 'bkash') {
      if (input.bkashSender?.trim()) orderDoc.bkashSender = input.bkashSender.trim().slice(0, 20);
      if (input.bkashTrxId?.trim()) orderDoc.bkashTrxId = input.bkashTrxId.trim().slice(0, 40);
    }

    const trackingDoc: Record<string, unknown> = {
      orderId,
      userId: activeUser.uid,
      phoneLast4,
      status: 'pending',
      statusNote: 'অর্ডার গ্রহণ করা হয়েছে',
      total: Math.round(input.total),
      district: input.district.trim().slice(0, 60),
      updatedAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'orders', orderId), orderDoc);
    batch.set(doc(db, 'orderTracking', orderId), trackingDoc);

    try {
      await batch.commit();
      playSound('success');
      // Remove only the checked-out items from cart
      const orderedIds = new Set(input.items.map((it) => it.productId));
      setCart((prev) => prev.filter((item) => !orderedIds.has(item.productId)));
      return orderDoc as unknown as FirestoreOrder;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
    }
  }, []);

  // Tracking lookup (optional last 4 check when provided; direct lookup when opened via Orders or Track Popup)
  const lookupTracking = useCallback(
    async (orderId: string, phoneLast4?: string): Promise<OrderTrackingRecord | null> => {
      const cleanId = orderId.trim().toUpperCase();
      if (!/^[a-zA-Z0-9_-]+$/.test(cleanId)) return null;
      try {
        const snap = await getDoc(doc(db, 'orderTracking', cleanId));
        if (!snap.exists()) return null;
        const data = snap.data() as OrderTrackingRecord;
        const cleanLast4 = (phoneLast4 || '').replace(/\D/g, '').slice(-4);
        if (cleanLast4 && data.phoneLast4 !== cleanLast4) {
          throw new Error('ফোন নম্বরের শেষ ৪ সংখ্যা মিলছে না।');
        }
        return data;
      } catch (err) {
        if (err instanceof Error && err.message.includes('ফোন')) {
          throw err;
        }
        return null;
      }
    },
    []
  );

  // Admin: Product Save/Delete/Seed
  const saveProduct = useCallback(
    async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
      if (!isAdmin) {
        throw new Error('শুধুমাত্র অনুমোদিত অ্যাডমিন পণ্য পরিবর্তন করতে পারবেন।');
      }
      const isEdit = Boolean(product.id && !product.isStarterSeed);
      const id =
        product.id && /^[a-zA-Z0-9_-]+$/.test(product.id)
          ? product.id
          : `prod_${Date.now()}`;

      const ref = doc(db, 'products', id);
      const payload: Record<string, unknown> = {
        id,
        name: product.name.trim().slice(0, 200),
        category: product.category,
        price: Math.max(0, Number(product.price) || 0),
        stock: Math.max(0, Math.round(Number(product.stock) || 0)),
        imageUrl: product.imageUrl.trim().slice(0, 1000),
        isActive: Boolean(product.isActive),
        isFeatured: Boolean(product.isFeatured),
        updatedAt: serverTimestamp(),
      };

      if (typeof product.comparePrice === 'number' && product.comparePrice > 0) {
        payload.comparePrice = Math.round(product.comparePrice);
      }
      if (product.unit?.trim()) {
        payload.unit = product.unit.trim().slice(0, 50);
      }
      if (typeof product.dhakaDeliveryCharge === 'number' && product.dhakaDeliveryCharge >= 0) {
        payload.dhakaDeliveryCharge = Math.round(product.dhakaDeliveryCharge);
        payload.deliveryCharge = Math.round(product.dhakaDeliveryCharge);
      }
      if (typeof product.outsideDhakaDeliveryCharge === 'number' && product.outsideDhakaDeliveryCharge >= 0) {
        payload.outsideDhakaDeliveryCharge = Math.round(product.outsideDhakaDeliveryCharge);
      }
      if (Array.isArray(product.additionalImages) && product.additionalImages.length > 0) {
        payload.additionalImages = product.additionalImages.filter(Boolean).slice(0, 8);
      }
      if (product.description?.trim()) {
        payload.description = product.description.trim().slice(0, 2000);
      }

      try {
        if (isEdit) {
          const snap = await getDoc(ref);
          payload.createdAt = snap.exists() && snap.data().createdAt ? snap.data().createdAt : serverTimestamp();
        } else {
          payload.createdAt = serverTimestamp();
        }
        await setDoc(ref, payload);
        showToast(isEdit ? 'পণ্য আপডেট হয়েছে' : 'নতুন পণ্য যোগ করা হয়েছে');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
      }
    },
    [isAdmin, showToast]
  );

  const removeProduct = useCallback(
    async (productId: string) => {
      if (!isAdmin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন।');
      try {
        await deleteDoc(doc(db, 'products', productId));
        showToast('পণ্যটি ডিলিট করা হয়েছে');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
      }
    },
    [isAdmin, showToast]
  );

  const seedStarterProducts = useCallback(async () => {
    if (!isAdmin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন।');
    const batch = writeBatch(db);
    STARTER_PRODUCTS.forEach((p) => {
      const ref = doc(db, 'products', p.id);
      batch.set(ref, {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        comparePrice: p.comparePrice,
        unit: p.unit,
        stock: p.stock,
        dhakaDeliveryCharge: p.dhakaDeliveryCharge ?? 70,
        outsideDhakaDeliveryCharge: p.outsideDhakaDeliveryCharge ?? 130,
        deliveryCharge: p.dhakaDeliveryCharge ?? 70,
        description: p.description,
        imageUrl: p.imageUrl,
        isActive: p.isActive,
        isFeatured: Boolean(p.isFeatured),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    try {
      await batch.commit();
      showToast('প্রাথমিক ৪টি পণ্য ডাটাবেসে যুক্ত হয়েছে!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products/starter-seed');
    }
  }, [isAdmin, showToast]);

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, statusNote?: string) => {
      if (!isAdmin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন।');
      const note = statusNote?.trim() || '';
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', orderId), {
        status,
        statusNote: note.slice(0, 300),
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'orderTracking', orderId), {
        status,
        statusNote: note.slice(0, 300),
        updatedAt: serverTimestamp(),
      });

      try {
        await batch.commit();
        showToast(`অর্ডার #${orderId} আপডেট হয়েছে`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    },
    [isAdmin, showToast]
  );

  const saveShopSettings = useCallback(
    async (next: Omit<ShopSettings, 'updatedAt'>) => {
      if (!isAdmin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন।');
      const ref = doc(db, 'shopSettings', 'public');
      try {
        await setDoc(ref, {
          storeName: next.storeName.trim().slice(0, 100),
          tagline: next.tagline.trim().slice(0, 160),
          supportPhone: next.supportPhone.trim().slice(0, 25),
          bkashNumber: next.bkashNumber.trim().slice(0, 20),
          dhakaDelivery: Math.max(0, Number(next.dhakaDelivery) || 0),
          outsideDhakaDelivery: Math.max(0, Number(next.outsideDhakaDelivery) || 0),
          promoBanner: {
            isActive: Boolean(next.promoBanner?.isActive),
            tag: (next.promoBanner?.tag || '').trim().slice(0, 60),
            headline: (next.promoBanner?.headline || '').trim().slice(0, 160),
            subtitle: (next.promoBanner?.subtitle || '').trim().slice(0, 240),
            ctaText: (next.promoBanner?.ctaText || 'কিনুন').trim().slice(0, 40),
            targetType: next.promoBanner?.targetType || 'all',
            targetValue: (next.promoBanner?.targetValue || '').trim().slice(0, 128),
          },
          updatedAt: serverTimestamp(),
        });
        showToast('দোকানের সেটিংস ও অফার ব্যানার আপডেট হয়েছে');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'shopSettings/public');
      }
    },
    [isAdmin, showToast]
  );

  // Admin: Promote / Demote any user between Customer <-> Admin atomically
  const toggleUserAdminRole = useCallback(
    async (target: UserProfile, makeAdmin: boolean) => {
      if (!isAdmin || !user) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন।');
      if (target.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        showToast('সুপার অ্যাডমিনের ভূমিকা পরিবর্তন করা যাবে না।', 'error');
        return;
      }

      const batch = writeBatch(db);
      const userRef = doc(db, 'users', target.uid);
      const markerRef = doc(db, 'admins', target.uid);

      batch.update(userRef, {
        role: makeAdmin ? 'admin' : 'customer',
        updatedAt: serverTimestamp(),
      });

      if (makeAdmin) {
        batch.set(markerRef, {
          uid: target.uid,
          email: target.email,
          promotedBy: user.uid,
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.delete(markerRef);
      }

      try {
        await batch.commit();
        showToast(
          makeAdmin
            ? `${target.fullName}-কে অ্যাডমিন করা হয়েছে`
            : `${target.fullName}-কে অ্যাডমিন থেকে সরানো হয়েছে`
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${target.uid}`);
      }
    },
    [isAdmin, user, showToast]
  );

  const value: StoreContextValue = {
    user,
    isRegisteredUser,
    userProfile,
    authLoading,
    isAdmin,
    isSuperAdmin,
    isVerifiedUser,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    resendVerificationEmail,
    reloadUser,
    logout,
    saveUserProfile,

    products,
    reviews,
    isUsingStarterCatalog,
    productsLoading: !productsLoaded,
    refreshData,
    shopSettings,
    submitProductReview,
    deleteProductReview,

    cart,
    cartCount,
    selectedCartItems,
    selectedCartSubtotal,
    cartSubtotal,
    wishlistIds,
    wishlistProducts,
    addToCart,
    updateCartQty,
    toggleCartItemSelected,
    toggleSelectAllCart,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInWishlist,

    orders,
    ordersLoading,
    placeOrder,
    lookupTracking,

    allUsers,
    saveProduct,
    removeProduct,
    seedStarterProducts,
    updateOrderStatus,
    saveShopSettings,
    toggleUserAdminRole,

    toastMessage,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

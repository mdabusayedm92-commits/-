export type ProductCategorySlug = 'electronics' | 'fashion' | 'home' | 'beauty' | 'kids' | 'other';

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cod' | 'bkash';

export interface Product {
  id: string;
  name: string;
  category: ProductCategorySlug;
  price: number;
  comparePrice?: number;
  unit?: string;
  stock: number;
  deliveryCharge?: number;
  dhakaDeliveryCharge?: number;
  outsideDhakaDeliveryCharge?: number;
  description?: string;
  imageUrl: string;
  additionalImages?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  isStarterSeed?: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt?: unknown;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  unit?: string;
  deliveryCharge?: number;
  dhakaDeliveryCharge?: number;
  outsideDhakaDeliveryCharge?: number;
  qty: number;
  selected: boolean;
}

export interface OrderItemPayload {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  division?: string;
  district?: string;
  upazila?: string;
  address?: string;
  role: 'customer' | 'admin';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreOrder {
  orderId: string;
  userId: string;
  isGuest?: boolean;
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
  items: OrderItemPayload[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  statusNote?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderTrackingRecord {
  orderId: string;
  userId: string;
  phoneLast4: string;
  status: OrderStatus;
  statusNote?: string;
  total: number;
  district: string;
  updatedAt?: unknown;
}

export interface PromoBannerConfig {
  isActive: boolean;
  tag: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  targetType: 'all' | 'category' | 'product';
  targetValue: string;
}

export interface ShopSettings {
  storeName: string;
  tagline: string;
  supportPhone: string;
  bkashNumber: string;
  dhakaDelivery: number;
  outsideDhakaDelivery: number;
  promoBanner: PromoBannerConfig;
  updatedAt?: unknown;
}

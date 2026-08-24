export type DeliveryStatus =
  | 'قيد التحضير'
  | 'تم الإرسال'
  | 'قيد التوصيل'
  | 'تم التوصيل'
  | 'فشل التوصيل'
  | 'ملغى';

export type ReturnStatus =
  | 'لا يوجد إرجاع'
  | 'طلب إرجاع'
  | 'في طريق الإرجاع'
  | 'تم الإرجاع'
  | 'تم التعويض';

export type CollectionStatus =
  | 'غير محصل'
  | 'محصل'
  | 'دفع مسبق';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string; // ISO string or YYYY-MM-DD
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress?: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number; // ثمن الوحدة
  unitCost?: number; // تكلفة المنتج للربح
  account: string; // حساب الإرسال
  deliveryCompany: string; // شركة التوصيل
  trackingNumber: string; // رقم التتبع
  deliveryFee: number | 'مجاني' | string; // سعر التوصيل
  
  // Statuses
  deliveryStatus: DeliveryStatus;
  returnStatus: ReturnStatus;
  collectionStatus: CollectionStatus;
  
  // Returns details
  returnDate?: string;
  returnReason?: string;
  returnAmount?: number;
  returnNotes?: string;

  // Notes and history
  notes?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface OrderTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  user?: string;
  statusType?: 'delivery' | 'collection' | 'return' | 'created' | 'system';
}

export interface AccountItem {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  active: boolean;
}

export interface DeliveryCompany {
  id: string;
  name: string;
  phone?: string;
  defaultFee: number;
  trackingUrlTemplate?: string;
  notes?: string;
  active: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  description?: string;
  active: boolean;
}

export interface ReturnReasonItem {
  id: string;
  reason: string;
  description?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  orderId?: string;
  orderNumber?: string;
}

export interface SystemSettings {
  companyName: string;
  website: string;
  currency: string;
  phone: string;
  email: string;
  address: string;
  defaultDeliveryFee: number;
  autoBackupEnabled: boolean;
  language: 'ar' | 'fr' | 'en';
}

export interface OrderFilter {
  searchQuery: string;
  startDate?: string;
  endDate?: string;
  account?: string;
  deliveryCompany?: string;
  deliveryStatus?: DeliveryStatus | 'all';
  returnStatus?: ReturnStatus | 'all';
  collectionStatus?: CollectionStatus | 'all';
  city?: string;
}

export type Product = ProductItem;

export interface FinancialSummary {
  totalOrdersCount: number;
  deliveredCount: number;
  inTransitCount: number;
  inPrepCount: number;
  shippedCount: number;
  failedCount: number;
  cancelledCount: number;
  returnsCount: number;
  successRate: number; // Delivered / Total * 100

  // Values in MAD
  grossSalesValue: number; // مبيعات فقط للطلبات التي تم توصيلها
  totalCollected: number; // مبالغ محصلة فقط للطلبات بحالة محصل
  totalUncollected: number; // مبالغ غير محصلة
  totalPrepaid: number; // مبالغ دفع مسبق
  totalDeliveryFees: number; // مجموع مصاريف التوصيل (للطلبات المشحونة أو المسلمة)
  totalReturnAmount: number; // مجموع مبالغ المرتجعات
  netValue: number; // مبيعات - مرتجعات
  netCollection: number; // محصل - مرتجعات
  netCollected: number; // alias for netCollection
  
  // Pre-delivery Value breakdown (قيمة الطلبات قبل التوصيل)
  preDeliveryTotal: number;
  preDeliveryInPrep: number;
  preDeliveryShipped: number;
  preDeliveryInTransit: number;
  preDeliveryFailed: number;
  preDeliveryCancelled: number;

  // Profit
  totalEstimatedCost: number;
  grossProfit: number;
}

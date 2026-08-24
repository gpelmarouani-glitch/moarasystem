import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Order,
  AccountItem,
  DeliveryCompany,
  ProductItem,
  ReturnReasonItem,
  ActivityLog,
  SystemSettings,
  User,
  OrderFilter,
  FinancialSummary,
  DeliveryStatus,
  ReturnStatus,
  CollectionStatus,
} from '../types';
import { StorageService } from '../utils/storage';
import { calculateFinancialSummary } from '../utils/calculations';
import { Language, translations } from '../utils/i18n';

interface AppContextType {
  // State
  orders: Order[];
  accounts: AccountItem[];
  deliveryCompanies: DeliveryCompany[];
  products: ProductItem[];
  returnReasons: ReturnReasonItem[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;
  currentUser: User;
  language: Language;
  t: typeof translations['ar'];
  filters: OrderFilter;
  filteredOrders: Order[];
  financialSummary: FinancialSummary;
  activeView: string;
  selectedOrder: Order | null;
  isOrderModalOpen: boolean;
  orderModalMode: 'create' | 'edit';
  editingOrder: Order | null;
  notifications: { id: string; type: 'warning' | 'error' | 'info' | 'success'; title: string; count: number; filterKey?: string }[];
  
  // Actions
  setActiveView: (view: string) => void;
  setLanguage: (lang: Language) => void;
  setFilters: React.Dispatch<React.SetStateAction<OrderFilter>>;
  resetFilters: () => void;
  setCurrentUserRole: (role: 'admin' | 'user') => void;
  
  // Order Actions
  openNewOrderModal: () => void;
  openEditOrderModal: (order: Order) => void;
  closeOrderModal: () => void;
  viewOrderDetails: (order: Order) => void;
  closeOrderDetails: () => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>, logNote?: string) => void;
  deleteOrder: (orderId: string) => void;
  bulkUpdateDeliveryStatus: (orderIds: string[], status: DeliveryStatus) => void;
  bulkUpdateCollectionStatus: (orderIds: string[], status: CollectionStatus) => void;
  importOrdersList: (newOrders: Partial<Order>[]) => { added: number; skipped: number };

  // Management Actions
  saveAccount: (account: AccountItem) => void;
  deleteAccount: (id: string) => void;
  saveDeliveryCompany: (company: DeliveryCompany) => void;
  deleteDeliveryCompany: (id: string) => void;
  saveProduct: (product: ProductItem) => void;
  deleteProduct: (id: string) => void;
  saveReturnReason: (reason: ReturnReasonItem) => void;
  deleteReturnReason: (id: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Demo & Reset
  clearDemoData: () => void;
  loadDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialFilters: OrderFilter = {
  searchQuery: '',
  deliveryStatus: 'all',
  returnStatus: 'all',
  collectionStatus: 'all',
  account: 'all',
  deliveryCompany: 'all',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [deliveryCompanies, setDeliveryCompanies] = useState<DeliveryCompany[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [returnReasons, setReturnReasons] = useState<ReturnReasonItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(StorageService.getSettings());
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [language, setLangState] = useState<Language>(settings.language || 'ar');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [filters, setFilters] = useState<OrderFilter>(initialFilters);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalMode, setOrderModalMode] = useState<'create' | 'edit'>('create');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Initial load
  useEffect(() => {
    setOrders(StorageService.getOrders());
    setAccounts(StorageService.getAccounts());
    setDeliveryCompanies(StorageService.getDeliveryCompanies());
    setProducts(StorageService.getProducts());
    setReturnReasons(StorageService.getReturnReasons());
    setActivityLogs(StorageService.getActivityLogs());
  }, []);

  // Sync language with document direction
  const setLanguage = (lang: Language) => {
    setLangState(lang);
    const newSettings = { ...settings, language: lang };
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations.ar;

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search query in order number, customer, phone, city, product, SKU, tracking
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const match =
          order.orderNumber.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerPhone.toLowerCase().includes(q) ||
          order.customerCity.toLowerCase().includes(q) ||
          order.productName.toLowerCase().includes(q) ||
          order.productSku.toLowerCase().includes(q) ||
          (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q)) ||
          order.account.toLowerCase().includes(q) ||
          order.deliveryCompany.toLowerCase().includes(q);

        if (!match) return false;
      }

      // Date range filter
      if (filters.startDate && order.date < filters.startDate) return false;
      if (filters.endDate && order.date > filters.endDate) return false;

      // Status filters
      if (filters.deliveryStatus && filters.deliveryStatus !== 'all' && order.deliveryStatus !== filters.deliveryStatus) return false;
      if (filters.returnStatus && filters.returnStatus !== 'all' && order.returnStatus !== filters.returnStatus) return false;
      if (filters.collectionStatus && filters.collectionStatus !== 'all' && order.collectionStatus !== filters.collectionStatus) return false;
      if (filters.account && filters.account !== 'all' && order.account !== filters.account) return false;
      if (filters.deliveryCompany && filters.deliveryCompany !== 'all' && order.deliveryCompany !== filters.deliveryCompany) return false;

      return true;
    });
  }, [orders, filters]);

  // Financial summary of ALL active orders
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(orders);
  }, [orders]);

  // Notifications calculation
  const notifications = useMemo(() => {
    const alerts: { id: string; type: 'warning' | 'error' | 'info' | 'success'; title: string; count: number; filterKey?: string }[] = [];

    // 1. Delivered but uncollected orders
    const deliveredUncollected = orders.filter((o) => o.deliveryStatus === 'تم التوصيل' && o.collectionStatus === 'غير محصل');
    if (deliveredUncollected.length > 0) {
      alerts.push({
        id: 'del_uncoll',
        type: 'warning',
        title: 'طلبات تم توصيلها وبانتظار التحصيل المالي',
        count: deliveredUncollected.length,
        filterKey: 'delivered_uncollected',
      });
    }

    // 2. Returns pending
    const pendingReturns = orders.filter((o) => o.returnStatus === 'طلب إرجاع' || o.returnStatus === 'في طريق الإرجاع');
    if (pendingReturns.length > 0) {
      alerts.push({
        id: 'ret_pending',
        type: 'error',
        title: 'طلبات مرتجعة قيد المتابعة والتسوية',
        count: pendingReturns.length,
        filterKey: 'returns_pending',
      });
    }

    // 3. Failed delivery
    const failedDeliveries = orders.filter((o) => o.deliveryStatus === 'فشل التوصيل');
    if (failedDeliveries.length > 0) {
      alerts.push({
        id: 'failed_del',
        type: 'error',
        title: 'شحنات فشل توصيلها بحاجة لمعالجة',
        count: failedDeliveries.length,
        filterKey: 'failed',
      });
    }

    // 4. In prep orders
    const inPrep = orders.filter((o) => o.deliveryStatus === 'قيد التحضير');
    if (inPrep.length > 0) {
      alerts.push({
        id: 'in_prep',
        type: 'info',
        title: 'طلبات قيد التحضير جاهزة للشحن',
        count: inPrep.length,
        filterKey: 'in_prep',
      });
    }

    return alerts;
  }, [orders]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const setCurrentUserRole = (role: 'admin' | 'user') => {
    const updatedUser: User = {
      ...currentUser,
      role,
      name: role === 'admin' ? 'المدير العام (Admin MPARA)' : 'موظف العمليات (Agent)',
    };
    setCurrentUser(updatedUser);
    StorageService.saveCurrentUser(updatedUser);
    StorageService.logAction(updatedUser.name, role, 'تبديل الصلاحية', `تم التبديل إلى دور ${role === 'admin' ? 'المدير العام' : 'الموظف'}`);
    setActivityLogs(StorageService.getActivityLogs());
  };

  // Order CRUD
  const openNewOrderModal = () => {
    setOrderModalMode('create');
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const openEditOrderModal = (order: Order) => {
    setOrderModalMode('edit');
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setEditingOrder(null);
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: 't_' + Date.now(),
          timestamp: now.replace('T', ' ').slice(0, 16),
          title: 'تم إنشاء الطلب في النظام',
          description: `المنتج: ${orderData.productName} (الكمية: ${orderData.quantity}) | الحساب: ${orderData.account}`,
          user: currentUser.name,
          statusType: 'created',
        },
      ],
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    StorageService.saveOrders(updated);
    StorageService.logAction(
      currentUser.name,
      currentUser.role,
      'إضافة طلب جديد',
      `تم إنشاء الطلب رقم ${newOrder.orderNumber} للعميل ${newOrder.customerName}`,
      newOrder.id,
      newOrder.orderNumber
    );
    setActivityLogs(StorageService.getActivityLogs());
    closeOrderModal();
  };

  const updateOrder = (orderId: string, updates: Partial<Order>, logNote?: string) => {
    const now = new Date().toISOString();
    const current = orders.find((o) => o.id === orderId);
    if (!current) return;

    // Track status change in timeline
    const timelineEvents = [...(current.timeline || [])];
    if (updates.deliveryStatus && updates.deliveryStatus !== current.deliveryStatus) {
      timelineEvents.push({
        id: 't_' + Date.now() + '_d',
        timestamp: now.replace('T', ' ').slice(0, 16),
        title: `تغيير حالة التوصيل إلى: ${updates.deliveryStatus}`,
        user: currentUser.name,
        statusType: 'delivery',
      });
    }
    if (updates.collectionStatus && updates.collectionStatus !== current.collectionStatus) {
      timelineEvents.push({
        id: 't_' + Date.now() + '_c',
        timestamp: now.replace('T', ' ').slice(0, 16),
        title: `تغيير حالة التحصيل إلى: ${updates.collectionStatus}`,
        user: currentUser.name,
        statusType: 'collection',
      });
    }
    if (updates.returnStatus && updates.returnStatus !== current.returnStatus) {
      timelineEvents.push({
        id: 't_' + Date.now() + '_r',
        timestamp: now.replace('T', ' ').slice(0, 16),
        title: `تغيير حالة الإرجاع إلى: ${updates.returnStatus}`,
        description: updates.returnReason ? `السبب: ${updates.returnReason}` : undefined,
        user: currentUser.name,
        statusType: 'return',
      });
    }

    const updatedOrder: Order = {
      ...current,
      ...updates,
      updatedAt: now,
      timeline: timelineEvents,
    };

    const updatedOrders = orders.map((o) => (o.id === orderId ? updatedOrder : o));
    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updatedOrder);
    }

    StorageService.logAction(
      currentUser.name,
      currentUser.role,
      'تعديل الطلب',
      logNote || `تحديث بيانات الطلب ${current.orderNumber}`,
      current.id,
      current.orderNumber
    );
    setActivityLogs(StorageService.getActivityLogs());
  };

  const deleteOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    StorageService.saveOrders(updated);
    if (selectedOrder?.id === orderId) setSelectedOrder(null);
    if (target) {
      StorageService.logAction(
        currentUser.name,
        currentUser.role,
        'حذف طلب',
        `تم حذف الطلب رقم ${target.orderNumber} نهائياً من النظام.`,
        target.id,
        target.orderNumber
      );
      setActivityLogs(StorageService.getActivityLogs());
    }
  };

  const bulkUpdateDeliveryStatus = (orderIds: string[], status: DeliveryStatus) => {
    const now = new Date().toISOString();
    const updated = orders.map((o) => {
      if (orderIds.includes(o.id)) {
        return {
          ...o,
          deliveryStatus: status,
          updatedAt: now,
          timeline: [
            ...(o.timeline || []),
            {
              id: 't_' + Date.now() + '_' + o.id,
              timestamp: now.replace('T', ' ').slice(0, 16),
              title: `تحديث جماعي لحالة التوصيل إلى: ${status}`,
              user: currentUser.name,
              statusType: 'delivery' as const,
            },
          ],
        };
      }
      return o;
    });
    setOrders(updated);
    StorageService.saveOrders(updated);
    StorageService.logAction(
      currentUser.name,
      currentUser.role,
      'تحديث حالة جماعي',
      `تم تحديث حالة ${orderIds.length} طلب إلى "${status}"`
    );
    setActivityLogs(StorageService.getActivityLogs());
  };

  const bulkUpdateCollectionStatus = (orderIds: string[], status: CollectionStatus) => {
    const now = new Date().toISOString();
    const updated = orders.map((o) => {
      if (orderIds.includes(o.id)) {
        return {
          ...o,
          collectionStatus: status,
          updatedAt: now,
          timeline: [
            ...(o.timeline || []),
            {
              id: 't_' + Date.now() + '_' + o.id,
              timestamp: now.replace('T', ' ').slice(0, 16),
              title: `تحديث حالة التحصيل إلى: ${status}`,
              user: currentUser.name,
              statusType: 'collection' as const,
            },
          ],
        };
      }
      return o;
    });
    setOrders(updated);
    StorageService.saveOrders(updated);
    StorageService.logAction(
      currentUser.name,
      currentUser.role,
      'تحصيل جماعي',
      `تم تغيير حالة تحصيل ${orderIds.length} طلب إلى "${status}"`
    );
    setActivityLogs(StorageService.getActivityLogs());
  };

  const importOrdersList = (newOrders: Partial<Order>[]) => {
    let added = 0;
    let skipped = 0;
    const existingNumbers = new Set(orders.map((o) => o.orderNumber.trim().toLowerCase()));
    const now = new Date().toISOString();

    const formatted: Order[] = [];
    newOrders.forEach((o) => {
      const num = (o.orderNumber || '').trim();
      if (!num || existingNumbers.has(num.toLowerCase())) {
        skipped++;
        return;
      }
      existingNumbers.add(num.toLowerCase());
      added++;

      formatted.push({
        id: 'ord_imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        orderNumber: num,
        date: o.date || now.split('T')[0],
        customerName: o.customerName || 'عميل مستورد',
        customerPhone: o.customerPhone || '0600000000',
        customerCity: o.customerCity || 'الدار البيضاء',
        customerAddress: o.customerAddress || '',
        productName: o.productName || 'منتج مستورد',
        productSku: o.productSku || 'SKU-IMP',
        quantity: o.quantity || 1,
        unitPrice: o.unitPrice || 100,
        unitCost: o.unitCost || 50,
        account: o.account || 'PARAMEDICALmparaOSJ',
        deliveryCompany: o.deliveryCompany || 'Cathedis',
        trackingNumber: o.trackingNumber || '',
        deliveryFee: o.deliveryFee !== undefined ? o.deliveryFee : 29,
        deliveryStatus: o.deliveryStatus || 'قيد التحضير',
        returnStatus: o.returnStatus || 'لا يوجد إرجاع',
        collectionStatus: o.collectionStatus || 'غير محصل',
        notes: o.notes || 'تم الاستيراد من ملف خارجي',
        timeline: [
          {
            id: 't_' + Date.now(),
            timestamp: now.replace('T', ' ').slice(0, 16),
            title: 'تم استيراد الطلب من ملف إكسيل / CSV',
            user: currentUser.name,
            statusType: 'created',
          },
        ],
        createdAt: now,
        updatedAt: now,
      });
    });

    if (formatted.length > 0) {
      const updated = [...formatted, ...orders];
      setOrders(updated);
      StorageService.saveOrders(updated);
      StorageService.logAction(
        currentUser.name,
        currentUser.role,
        'استيراد طلبات',
        `تم استيراد ${added} طلب بنجاح (تم تخطي ${skipped} مكرر).`
      );
      setActivityLogs(StorageService.getActivityLogs());
    }

    return { added, skipped };
  };

  // Management methods
  const saveAccount = (acc: AccountItem) => {
    const exists = accounts.find((a) => a.id === acc.id);
    let updated: AccountItem[];
    if (exists) {
      updated = accounts.map((a) => (a.id === acc.id ? acc : a));
    } else {
      updated = [...accounts, acc];
    }
    setAccounts(updated);
    StorageService.saveAccounts(updated);
    StorageService.logAction(currentUser.name, currentUser.role, 'تعديل الحسابات', `تم حفظ الحساب: ${acc.name}`);
    setActivityLogs(StorageService.getActivityLogs());
  };

  const deleteAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    StorageService.saveAccounts(updated);
    if (acc) {
      StorageService.logAction(currentUser.name, currentUser.role, 'حذف حساب', `تم حذف حساب الإرسال: ${acc.name}`);
      setActivityLogs(StorageService.getActivityLogs());
    }
  };

  const saveDeliveryCompany = (comp: DeliveryCompany) => {
    const exists = deliveryCompanies.find((c) => c.id === comp.id);
    let updated: DeliveryCompany[];
    if (exists) {
      updated = deliveryCompanies.map((c) => (c.id === comp.id ? comp : c));
    } else {
      updated = [...deliveryCompanies, comp];
    }
    setDeliveryCompanies(updated);
    StorageService.saveDeliveryCompanies(updated);
    StorageService.logAction(currentUser.name, currentUser.role, 'تعديل شركات الشحن', `تم حفظ شركة التوصيل: ${comp.name}`);
    setActivityLogs(StorageService.getActivityLogs());
  };

  const deleteDeliveryCompany = (id: string) => {
    const comp = deliveryCompanies.find((c) => c.id === id);
    const updated = deliveryCompanies.filter((c) => c.id !== id);
    setDeliveryCompanies(updated);
    StorageService.saveDeliveryCompanies(updated);
    if (comp) {
      StorageService.logAction(currentUser.name, currentUser.role, 'حذف شركة شحن', `تم حذف شركة التوصيل: ${comp.name}`);
      setActivityLogs(StorageService.getActivityLogs());
    }
  };

  const saveProduct = (prod: ProductItem) => {
    const exists = products.find((p) => p.id === prod.id);
    let updated: ProductItem[];
    if (exists) {
      updated = products.map((p) => (p.id === prod.id ? prod : p));
    } else {
      updated = [...products, prod];
    }
    setProducts(updated);
    StorageService.saveProducts(updated);
    StorageService.logAction(currentUser.name, currentUser.role, 'إدارة المنتجات', `تم حفظ المنتج: ${prod.name}`);
    setActivityLogs(StorageService.getActivityLogs());
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    StorageService.saveProducts(updated);
    if (prod) {
      StorageService.logAction(currentUser.name, currentUser.role, 'حذف منتج', `تم حذف المنتج: ${prod.name}`);
      setActivityLogs(StorageService.getActivityLogs());
    }
  };

  const saveReturnReason = (reason: ReturnReasonItem) => {
    const exists = returnReasons.find((r) => r.id === reason.id);
    let updated: ReturnReasonItem[];
    if (exists) {
      updated = returnReasons.map((r) => (r.id === reason.id ? reason : r));
    } else {
      updated = [...returnReasons, reason];
    }
    setReturnReasons(updated);
    StorageService.saveReturnReasons(updated);
    StorageService.logAction(currentUser.name, currentUser.role, 'أسباب الإرجاع', `تم حفظ سبب الإرجاع: ${reason.reason}`);
    setActivityLogs(StorageService.getActivityLogs());
  };

  const deleteReturnReason = (id: string) => {
    const updated = returnReasons.filter((r) => r.id !== id);
    setReturnReasons(updated);
    StorageService.saveReturnReasons(updated);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);
    StorageService.logAction(currentUser.name, currentUser.role, 'تحديث الإعدادات', 'تم تعديل الإعدادات العامة للنظام.');
    setActivityLogs(StorageService.getActivityLogs());
  };

  const clearDemoData = () => {
    StorageService.clearAllDemoOrders();
    setOrders([]);
    setActivityLogs(StorageService.getActivityLogs());
  };

  const loadDemoData = () => {
    StorageService.reloadDemoOrders();
    setOrders(StorageService.getOrders());
    setActivityLogs(StorageService.getActivityLogs());
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        accounts,
        deliveryCompanies,
        products,
        returnReasons,
        activityLogs,
        settings,
        currentUser,
        language,
        t,
        filters,
        filteredOrders,
        financialSummary,
        activeView,
        selectedOrder,
        isOrderModalOpen,
        orderModalMode,
        editingOrder,
        notifications,

        setActiveView,
        setLanguage,
        setFilters,
        resetFilters,
        setCurrentUserRole,

        openNewOrderModal,
        openEditOrderModal,
        closeOrderModal,
        viewOrderDetails,
        closeOrderDetails,
        addOrder,
        updateOrder,
        deleteOrder,
        bulkUpdateDeliveryStatus,
        bulkUpdateCollectionStatus,
        importOrdersList,

        saveAccount,
        deleteAccount,
        saveDeliveryCompany,
        deleteDeliveryCompany,
        saveProduct,
        deleteProduct,
        saveReturnReason,
        deleteReturnReason,
        updateSettings,

        clearDemoData,
        loadDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

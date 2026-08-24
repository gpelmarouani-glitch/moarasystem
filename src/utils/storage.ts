import { Order, AccountItem, DeliveryCompany, ProductItem, ActivityLog, SystemSettings, ReturnReasonItem, User } from '../types';

const STORAGE_KEYS = {
  ORDERS: 'mpara_orders_v1',
  ACCOUNTS: 'mpara_accounts_v1',
  DELIVERY_COMPANIES: 'mpara_delivery_companies_v1',
  PRODUCTS: 'mpara_products_v1',
  RETURN_REASONS: 'mpara_return_reasons_v1',
  ACTIVITY_LOGS: 'mpara_activity_logs_v1',
  SETTINGS: 'mpara_settings_v1',
  CURRENT_USER: 'mpara_current_user_v1',
};

export const DEFAULT_ACCOUNTS: AccountItem[] = [
  { id: 'acc_1', name: 'PARAMEDICALmparaOSJ', description: 'حساب باراميديكال الرئيسي', isDefault: true, active: true },
  { id: 'acc_2', name: 'MARKETMEDICAL(mpara)', description: 'حساب ماركت ميديكال', active: true },
  { id: 'acc_3', name: 'MARKETMEDICALOSJ', description: 'حساب ماركت ميديكال OSJ', active: true },
  { id: 'acc_4', name: 'mparasarl', description: 'حساب شركة MPARA SARL', active: true },
  { id: 'acc_5', name: 'mparatawssil Zainab', description: 'حساب توصيل زينب', active: true },
];

export const DEFAULT_DELIVERY_COMPANIES: DeliveryCompany[] = [
  { id: 'comp_1', name: 'Amana Express', phone: '0800000000', defaultFee: 35, trackingUrlTemplate: 'https://www.poste.ma/suivi?num={tracking}', active: true },
  { id: 'comp_2', name: 'Cathedis', phone: '0522000000', defaultFee: 29, trackingUrlTemplate: 'https://cathedis.com/tracking?code={tracking}', active: true },
  { id: 'comp_3', name: 'CTM Messagerie', phone: '0522541010', defaultFee: 35, trackingUrlTemplate: 'https://ctmmessagerie.ma/suivi?code={tracking}', active: true },
  { id: 'comp_4', name: 'Ozone Express', phone: '0520112233', defaultFee: 30, trackingUrlTemplate: 'https://ozone.ma/track/{tracking}', active: true },
  { id: 'comp_5', name: 'Ghazala Messagerie', phone: '0522445566', defaultFee: 29, trackingUrlTemplate: 'https://ghazala.ma/suivi/{tracking}', active: true },
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: 'prod_1', name: 'جهاز قياس ضغط الدم أوتوماتيكي (Tensiomètre Bras)', sku: 'MED-TENS-01', price: 349, cost: 180, stock: 45, category: 'أجهزة طبية', active: true },
  { id: 'prod_2', name: 'جهاز قياس الأكسجين في الدم (Oxymètre de Pouls)', sku: 'MED-OXY-02', price: 149, cost: 70, stock: 80, category: 'أجهزة طبية', active: true },
  { id: 'prod_3', name: 'سيروم حمض الهيالورونيك 30ml (Sérum Hydratant)', sku: 'PARA-HA-03', price: 199, cost: 95, stock: 120, category: 'عناية بالبشرة', active: true },
  { id: 'prod_4', name: 'كريم واقي من الشمس SPF 50+ (Écran Solaire)', sku: 'PARA-SUN-04', price: 175, cost: 85, stock: 95, category: 'عناية بالبشرة', active: true },
  { id: 'prod_5', name: 'مكمل غذائي مغنيسيوم B6 (Magnésium B6 60 Gélules)', sku: 'NUTRI-MG-05', price: 120, cost: 55, stock: 150, category: 'مكملات غذائية', active: true },
  { id: 'prod_6', name: 'حزام داعم للظهر قابل للتعديل (Ceinture Lombaire)', sku: 'ORTHO-BELT-06', price: 249, cost: 110, stock: 35, category: 'مستلزمات تقويمية', active: true },
];

export const DEFAULT_RETURN_REASONS: ReturnReasonItem[] = [
  { id: 'ret_1', reason: 'العميل لم يجب على الهاتف', description: 'تكرار الاتصال دون رد' },
  { id: 'ret_2', reason: 'رفض استلام الطلب', description: 'العميل تراجع أو رفض الاستلام عند الوصول' },
  { id: 'ret_3', reason: 'العنوان غير صحيح / غير موجود', description: 'تعذر الوصول للعنوان المحدد' },
  { id: 'ret_4', reason: 'المنتج غير مطابق للمواصفات', description: 'طلب تغيير الحجم أو النوع' },
  { id: 'ret_5', reason: 'تأخر التوصيل من شركة الشحن', description: 'استغرق وقتاً طويلاً فالغى العميل' },
  { id: 'ret_6', reason: 'إلغاء الطلب من طرف العميل مسبقاً', description: 'تم الإلغاء قبل وصول الموزع' },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'MPARA SARL',
  website: 'www.mpara.ma',
  currency: 'MAD',
  phone: '+212 5 22 00 00 00',
  email: 'contact@mpara.ma',
  address: 'Casablanca, Morocco',
  defaultDeliveryFee: 29,
  autoBackupEnabled: true,
  language: 'ar',
};

export const DEFAULT_USERS: User[] = [
  { id: 'usr_admin', name: 'المدير العام (Admin MPARA)', email: 'admin@mpara.ma', role: 'admin' },
  { id: 'usr_agent', name: 'موظف العمليات (Agent)', email: 'agent@mpara.ma', role: 'user' },
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    orderNumber: 'MP-2026-1001',
    date: '2026-08-20',
    customerName: 'كريم البودالي',
    customerPhone: '0661234567',
    customerCity: 'الدار البيضاء',
    customerAddress: 'حي المعاريف، زنقة 14 رقم 5',
    productName: 'جهاز قياس ضغط الدم أوتوماتيكي (Tensiomètre Bras)',
    productSku: 'MED-TENS-01',
    quantity: 1,
    unitPrice: 349,
    unitCost: 180,
    account: 'PARAMEDICALmparaOSJ',
    deliveryCompany: 'Cathedis',
    trackingNumber: 'CTH-9884210',
    deliveryFee: 29,
    deliveryStatus: 'تم التوصيل',
    returnStatus: 'لا يوجد إرجاع',
    collectionStatus: 'محصل',
    notes: 'تم التسليم والتحصيل نقداً',
    timeline: [
      { id: 't1', timestamp: '2026-08-20 10:15', title: 'تم إنشاء الطلب', user: 'Admin MPARA', statusType: 'created' },
      { id: 't2', timestamp: '2026-08-20 14:30', title: 'تم الإرسال مع شركة Cathedis', user: 'Agent', statusType: 'delivery' },
      { id: 't3', timestamp: '2026-08-21 11:20', title: 'تم التوصيل للعميل', user: 'Cathedis', statusType: 'delivery' },
      { id: 't4', timestamp: '2026-08-22 17:00', title: 'تم تحصيل المبلغ وتحويله للمؤسسة', user: 'Admin MPARA', statusType: 'collection' },
    ],
    createdAt: '2026-08-20T10:15:00Z',
    updatedAt: '2026-08-22T17:00:00Z',
  },
  {
    id: 'ord_1002',
    orderNumber: 'MP-2026-1002',
    date: '2026-08-21',
    customerName: 'فاطمة الزهراء العلمي',
    customerPhone: '0662345678',
    customerCity: 'الرباط',
    customerAddress: 'أكدال، شارع فرنسا عمارة 8',
    productName: 'سيروم حمض الهيالورونيك 30ml (Sérum Hydratant)',
    productSku: 'PARA-HA-03',
    quantity: 2,
    unitPrice: 199,
    unitCost: 95,
    account: 'MARKETMEDICAL(mpara)',
    deliveryCompany: 'Amana Express',
    trackingNumber: 'AMN-4451209',
    deliveryFee: 'مجاني',
    deliveryStatus: 'تم التوصيل',
    returnStatus: 'لا يوجد إرجاع',
    collectionStatus: 'غير محصل',
    notes: 'توصيل مجاني لعرض حبتين - بانتظار تحويل الأمانة',
    timeline: [
      { id: 't1', timestamp: '2026-08-21 09:30', title: 'تم إنشاء الطلب', user: 'Agent', statusType: 'created' },
      { id: 't2', timestamp: '2026-08-21 16:00', title: 'تم الإرسال عبر أمانة', user: 'Agent', statusType: 'delivery' },
      { id: 't3', timestamp: '2026-08-23 12:45', title: 'تم التوصيل للزبونة', user: 'Amana', statusType: 'delivery' },
    ],
    createdAt: '2026-08-21T09:30:00Z',
    updatedAt: '2026-08-23T12:45:00Z',
  },
  {
    id: 'ord_1003',
    orderNumber: 'MP-2026-1003',
    date: '2026-08-22',
    customerName: 'يوسف التازي',
    customerPhone: '0663456789',
    customerCity: 'مراكش',
    customerAddress: 'حي جليز، ممر النخيل',
    productName: 'حزام داعم للظهر قابل للتعديل (Ceinture Lombaire)',
    productSku: 'ORTHO-BELT-06',
    quantity: 1,
    unitPrice: 249,
    unitCost: 110,
    account: 'MARKETMEDICALOSJ',
    deliveryCompany: 'CTM Messagerie',
    trackingNumber: 'CTM-7712390',
    deliveryFee: 35,
    deliveryStatus: 'قيد التوصيل',
    returnStatus: 'لا يوجد إرجاع',
    collectionStatus: 'غير محصل',
    notes: 'خرج للتسليم مع الموزع صباح اليوم',
    timeline: [
      { id: 't1', timestamp: '2026-08-22 11:00', title: 'إنشاء الطلب', user: 'Agent', statusType: 'created' },
      { id: 't2', timestamp: '2026-08-22 15:00', title: 'تم الإرسال لمركز مراكش', user: 'CTM', statusType: 'delivery' },
      { id: 't3', timestamp: '2026-08-24 08:30', title: 'قيد التوصيل مع المندوب', user: 'CTM', statusType: 'delivery' },
    ],
    createdAt: '2026-08-22T11:00:00Z',
    updatedAt: '2026-08-24T08:30:00Z',
  },
  {
    id: 'ord_1004',
    orderNumber: 'MP-2026-1004',
    date: '2026-08-22',
    customerName: 'سناء بنجلون',
    customerPhone: '0664567890',
    customerCity: 'فاس',
    customerAddress: 'طريق عين الشقف، إقامة الياسمين',
    productName: 'مكمل غذائي مغنيسيوم B6 (Magnésium B6 60 Gélules)',
    productSku: 'NUTRI-MG-05',
    quantity: 3,
    unitPrice: 120,
    unitCost: 55,
    account: 'mparasarl',
    deliveryCompany: 'Ozone Express',
    trackingNumber: 'OZN-652391',
    deliveryFee: 30,
    deliveryStatus: 'تم الإرسال',
    returnStatus: 'لا يوجد إرجاع',
    collectionStatus: 'دفع مسبق',
    notes: 'تم الدفع بالبطاقة البنكية مسبقاً',
    timeline: [
      { id: 't1', timestamp: '2026-08-22 14:20', title: 'إنشاء الطلب والدفع المسبق', user: 'System', statusType: 'collection' },
      { id: 't2', timestamp: '2026-08-23 10:00', title: 'تم تسليم الشحنة لشركة أوزون', user: 'Agent', statusType: 'delivery' },
    ],
    createdAt: '2026-08-22T14:20:00Z',
    updatedAt: '2026-08-23T10:00:00Z',
  },
  {
    id: 'ord_1005',
    orderNumber: 'MP-2026-1005',
    date: '2026-08-23',
    customerName: 'حسن المرابط',
    customerPhone: '0665678901',
    customerCity: 'طنجة',
    customerAddress: 'حي مسبك طنجة، شارع الجيش الملكي',
    productName: 'كريم واقي من الشمس SPF 50+ (Écran Solaire)',
    productSku: 'PARA-SUN-04',
    quantity: 1,
    unitPrice: 175,
    unitCost: 85,
    account: 'mparatawssil Zainab',
    deliveryCompany: 'Ghazala Messagerie',
    trackingNumber: 'GHZ-889012',
    deliveryFee: 29,
    deliveryStatus: 'تم التوصيل',
    returnStatus: 'تم الإرجاع',
    returnDate: '2026-08-24',
    returnReason: 'المنتج غير مطابق للمواصفات',
    returnAmount: 204,
    returnNotes: 'الزبون أراد عبوة بحجم 100ml وتم استرجاع المنتج سليم',
    collectionStatus: 'غير محصل',
    notes: 'تم التوصيل ثم قام العميل بطلب الإرجاع واسترجاع الطرد',
    timeline: [
      { id: 't1', timestamp: '2026-08-23 09:00', title: 'إنشاء الطلب', user: 'Agent', statusType: 'created' },
      { id: 't2', timestamp: '2026-08-23 11:30', title: 'تم التوصيل', user: 'Ghazala', statusType: 'delivery' },
      { id: 't3', timestamp: '2026-08-24 10:00', title: 'تم الإرجاع واستلام الطرد', user: 'Admin MPARA', statusType: 'return' },
    ],
    createdAt: '2026-08-23T09:00:00Z',
    updatedAt: '2026-08-24T10:00:00Z',
  },
  {
    id: 'ord_1006',
    orderNumber: 'MP-2026-1006',
    date: '2026-08-23',
    customerName: 'عمر القادري',
    customerPhone: '0666789012',
    customerCity: 'أكادير',
    customerAddress: 'حي تالبرجت، شارع الحسن الثاني',
    productName: 'جهاز قياس الأكسجين في الدم (Oxymètre de Pouls)',
    productSku: 'MED-OXY-02',
    quantity: 2,
    unitPrice: 149,
    unitCost: 70,
    account: 'PARAMEDICALmparaOSJ',
    deliveryCompany: 'Cathedis',
    trackingNumber: 'CTH-992144',
    deliveryFee: 29,
    deliveryStatus: 'فشل التوصيل',
    returnStatus: 'في طريق الإرجاع',
    returnReason: 'العميل لم يجب على الهاتف',
    returnNotes: 'تم الاتصال به 3 مرات في أوقات مختلفة دون رد',
    collectionStatus: 'غير محصل',
    notes: 'طرد في طريق العودة لمستودع كازا',
    timeline: [
      { id: 't1', timestamp: '2026-08-23 10:30', title: 'إنشاء الطلب', user: 'Agent', statusType: 'created' },
      { id: 't2', timestamp: '2026-08-24 11:00', title: 'فشل التسليم - عدم الرد', user: 'Cathedis', statusType: 'delivery' },
    ],
    createdAt: '2026-08-23T10:30:00Z',
    updatedAt: '2026-08-24T11:00:00Z',
  },
  {
    id: 'ord_1007',
    orderNumber: 'MP-2026-1007',
    date: '2026-08-24',
    customerName: 'رشيدة الصالحي',
    customerPhone: '0667890123',
    customerCity: 'القنيطرة',
    customerAddress: 'وسط المدينة، ميموزا',
    productName: 'سيروم حمض الهيالورونيك 30ml (Sérum Hydratant)',
    productSku: 'PARA-HA-03',
    quantity: 1,
    unitPrice: 199,
    unitCost: 95,
    account: 'mparasarl',
    deliveryCompany: 'Amana Express',
    trackingNumber: 'AMN-8812301',
    deliveryFee: 35,
    deliveryStatus: 'قيد التحضير',
    returnStatus: 'لا يوجد إرجاع',
    collectionStatus: 'غير محصل',
    notes: 'طلب جديد اليوم تحت التجهيز والتغليف',
    timeline: [
      { id: 't1', timestamp: '2026-08-24 09:15', title: 'إنشاء الطلب في النظام', user: 'Agent', statusType: 'created' },
    ],
    createdAt: '2026-08-24T09:15:00Z',
    updatedAt: '2026-08-24T09:15:00Z',
  },
];

export const StorageService = {
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        this.saveOrders(SEED_ORDERS);
        return SEED_ORDERS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_ORDERS;
    }
  },

  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders to localStorage', e);
    }
  },

  getAccounts(): AccountItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) {
        this.saveAccounts(DEFAULT_ACCOUNTS);
        return DEFAULT_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  saveAccounts(accounts: AccountItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Error saving accounts', e);
    }
  },

  getDeliveryCompanies(): DeliveryCompany[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELIVERY_COMPANIES);
      if (!data) {
        this.saveDeliveryCompanies(DEFAULT_DELIVERY_COMPANIES);
        return DEFAULT_DELIVERY_COMPANIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_DELIVERY_COMPANIES;
    }
  },

  saveDeliveryCompanies(companies: DeliveryCompany[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DELIVERY_COMPANIES, JSON.stringify(companies));
    } catch (e) {
      console.error('Error saving delivery companies', e);
    }
  },

  getProducts(): ProductItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        this.saveProducts(DEFAULT_PRODUCTS);
        return DEFAULT_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PRODUCTS;
    }
  },

  saveProducts(products: ProductItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products', e);
    }
  },

  getReturnReasons(): ReturnReasonItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RETURN_REASONS);
      if (!data) {
        this.saveReturnReasons(DEFAULT_RETURN_REASONS);
        return DEFAULT_RETURN_REASONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_RETURN_REASONS;
    }
  },

  saveReturnReasons(reasons: ReturnReasonItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RETURN_REASONS, JSON.stringify(reasons));
    } catch (e) {
      console.error('Error saving return reasons', e);
    }
  },

  getActivityLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      if (!data) {
        const initialLogs: ActivityLog[] = [
          {
            id: 'log_1',
            timestamp: new Date().toISOString(),
            userName: 'Admin MPARA',
            userRole: 'admin',
            action: 'تهيئة النظام',
            details: 'تم بدء تشغيل نظام إدارة MPARA وتفعيل قاعدة البيانات المحلية الحية.',
          },
        ];
        this.saveActivityLogs(initialLogs);
        return initialLogs;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveActivityLogs(logs: ActivityLog[]): void {
    try {
      // Keep most recent 500 logs
      const trimmed = logs.slice(0, 500);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Error saving logs', e);
    }
  },

  logAction(userName: string, userRole: 'admin' | 'user', action: string, details: string, orderId?: string, orderNumber?: string): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      userName,
      userRole,
      action,
      details,
      orderId,
      orderNumber,
    };
    this.saveActivityLogs([newLog, ...logs]);
  },

  getSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: SystemSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  getCurrentUser(): User {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) {
        return DEFAULT_USERS[0];
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_USERS[0];
    }
  },

  saveCurrentUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving current user', e);
    }
  },

  // Export full database JSON
  exportFullDatabaseJSON(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company: 'MPARA SARL',
      website: 'www.mpara.ma',
      orders: this.getOrders(),
      accounts: this.getAccounts(),
      deliveryCompanies: this.getDeliveryCompanies(),
      products: this.getProducts(),
      returnReasons: this.getReturnReasons(),
      activityLogs: this.getActivityLogs(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  exportAllData(): string {
    return this.exportFullDatabaseJSON();
  },

  importAllData(jsonString: string): boolean {
    const result = this.restoreFullDatabaseJSON(jsonString);
    return result.success;
  },

  // Restore full database JSON
  restoreFullDatabaseJSON(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.orders || !Array.isArray(data.orders)) {
        return { success: false, error: 'الملف غير صالح أو لا يحتوي على بنية طلبات MPARA الصحيحة.' };
      }
      if (data.orders) this.saveOrders(data.orders);
      if (data.accounts) this.saveAccounts(data.accounts);
      if (data.deliveryCompanies) this.saveDeliveryCompanies(data.deliveryCompanies);
      if (data.products) this.saveProducts(data.products);
      if (data.returnReasons) this.saveReturnReasons(data.returnReasons);
      if (data.settings) this.saveSettings(data.settings);
      this.logAction('Admin MPARA', 'admin', 'استعادة قاعدة البيانات', 'تم استعادة نسخة احتياطية بنجاح.');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ في معالجة الملف';
      return { success: false, error: msg };
    }
  },

  // Clear demo data
  clearAllDemoOrders(): void {
    this.saveOrders([]);
    this.logAction('Admin MPARA', 'admin', 'مسح البيانات التجريبية', 'تم تنظيف سجل الطلبات ليصبح فارغاً للعمل الفعلي.');
  },

  // Reload demo orders
  reloadDemoOrders(): void {
    this.saveOrders(SEED_ORDERS);
    this.logAction('Admin MPARA', 'admin', 'تحميل بيانات تجريبية', 'تم تحميل مجموعة طلبات نموذجية للاختبار.');
  },
};

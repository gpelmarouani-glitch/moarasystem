import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  Order,
  AccountItem,
  DeliveryCompany,
  ProductItem,
  FinancialSummary,
  DeliveryStatus,
  CollectionStatus,
  ReturnStatus,
} from '../types';
import {
  calculateOrderGrandTotal,
  calculateOrderSubtotal,
  parseDeliveryFee,
  formatMAD,
  calculateAccountStats,
  calculateDeliveryCompanyStats,
} from './calculations';

// Extend jsPDF interface for autoTable
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: unknown) => void;
}

/**
 * Format orders into clean flat rows for Excel/CSV export
 */
export function formatOrdersForExport(orders: Order[]) {
  return orders.map((o) => {
    const subtotal = calculateOrderSubtotal(o.quantity, o.unitPrice);
    const grandTotal = calculateOrderGrandTotal(o);

    return {
      'رقم الطلب': o.orderNumber,
      'التاريخ': o.date,
      'اسم العميل': o.customerName,
      'الهاتف': o.customerPhone,
      'المدينة': o.customerCity,
      'العنوان': o.customerAddress || '',
      'اسم المنتج': o.productName,
      'مرجع SKU': o.productSku,
      'الكمية': o.quantity,
      'ثمن الوحدة (MAD)': o.unitPrice,
      'تكلفة الوحدة (MAD)': o.unitCost || 0,
      'مجموع المنتجات (MAD)': subtotal,
      'سعر التوصيل': typeof o.deliveryFee === 'number' ? o.deliveryFee : o.deliveryFee,
      'الإجمالي الكلي COD (MAD)': grandTotal,
      'حساب الإرسال': o.account,
      'شركة التوصيل': o.deliveryCompany,
      'رقم التتبع': o.trackingNumber || '',
      'حالة التوصيل': o.deliveryStatus,
      'حالة التحصيل': o.collectionStatus,
      'حالة الإرجاع': o.returnStatus,
      'سبب الإرجاع': o.returnReason || '',
      'مبلغ الإرجاع (MAD)': o.returnAmount || 0,
      'ملاحظات': o.notes || '',
    };
  });
}

/**
 * Export orders to standard Excel (.xlsx)
 */
export function exportOrdersToExcel(orders: Order[], filename = 'MPARA_Orders_List.xlsx'): void {
  const data = formatOrdersForExport(orders);
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 16 }, // Order #
    { wch: 12 }, // Date
    { wch: 20 }, // Customer
    { wch: 14 }, // Phone
    { wch: 14 }, // City
    { wch: 25 }, // Address
    { wch: 30 }, // Product
    { wch: 15 }, // SKU
    { wch: 8 },  // Qty
    { wch: 16 }, // Price
    { wch: 16 }, // Cost
    { wch: 18 }, // Subtotal
    { wch: 14 }, // Delivery Fee
    { wch: 22 }, // Grand Total COD
    { wch: 22 }, // Account
    { wch: 18 }, // Carrier
    { wch: 16 }, // Tracking
    { wch: 14 }, // Delivery Status
    { wch: 14 }, // Collection Status
    { wch: 14 }, // Return Status
    { wch: 24 }, // Return Reason
    { wch: 18 }, // Return Amount
    { wch: 30 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الطلبات');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export orders to CSV with UTF-8 BOM for Arabic compatibility in Excel
 */
export function exportOrdersToCSV(orders: Order[], filename = 'MPARA_Orders.csv'): void {
  const data = formatOrdersForExport(orders);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  // Add UTF-8 BOM so Excel opens Arabic letters perfectly without garbled text
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Collections report to Excel (.xlsx)
 */
export function exportCollectionsToExcel(orders: Order[], filename = 'MPARA_Collections_Report.xlsx'): void {
  const data = orders.map((o) => ({
    'رقم الطلب': o.orderNumber,
    'التاريخ': o.date,
    'العميل': o.customerName,
    'الهاتف': o.customerPhone,
    'المدينة': o.customerCity,
    'المنتج': o.productName,
    'المبلغ الإجمالي المستحق (MAD)': calculateOrderGrandTotal(o),
    'شركة التوصيل': o.deliveryCompany,
    'رقم التتبع': o.trackingNumber || '',
    'حالة التوصيل': o.deliveryStatus,
    'حالة التحصيل': o.collectionStatus,
    'حساب الإرسال': o.account,
    'ملاحظات': o.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 12 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'التحصيلات والتسويات');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export Returns report to Excel (.xlsx)
 */
export function exportReturnsToExcel(orders: Order[], filename = 'MPARA_Returns_Report.xlsx'): void {
  const data = orders.map((o) => ({
    'رقم الطلب': o.orderNumber,
    'التاريخ': o.date,
    'العميل': o.customerName,
    'الهاتف': o.customerPhone,
    'المدينة': o.customerCity,
    'المنتج': o.productName,
    'قيمة الطلب الأصلية (MAD)': calculateOrderGrandTotal(o),
    'حالة الإرجاع': o.returnStatus,
    'تاريخ الإرجاع': o.returnDate || o.date,
    'سبب الإرجاع': o.returnReason || 'غير محدد',
    'المبلغ المخصوم كمرتجع (MAD)': o.returnAmount || (o.returnStatus === 'تم الإرجاع' ? calculateOrderGrandTotal(o) : 0),
    'شركة التوصيل': o.deliveryCompany,
    'حساب الإرسال': o.account,
    'ملاحظات الإرجاع': o.returnNotes || o.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المرتجعات');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export Products Catalog & Stock to Excel (.xlsx)
 */
export function exportProductsToExcel(products: ProductItem[], orders: Order[], filename = 'MPARA_Products_Stock.xlsx'): void {
  const data = products.map((p) => {
    const totalSold = orders
      .filter((o) => o.productSku === p.sku && o.deliveryStatus === 'تم التوصيل')
      .reduce((sum, o) => sum + o.quantity, 0);

    const totalRevenue = totalSold * p.price;
    const estimatedCost = totalSold * p.cost;
    const grossMargin = totalRevenue - estimatedCost;

    return {
      'اسم المنتج': p.name,
      'رمز SKU': p.sku,
      'التصنيف': p.category,
      'سعر البيع (MAD)': p.price,
      'تكلفة الشراء (MAD)': p.cost,
      'هامش الربح للقطعة (MAD)': p.price - p.cost,
      'المخزون الحالي': p.stock,
      'إجمالي القطع المسلمة': totalSold,
      'إجمالي المبيعات (MAD)': totalRevenue,
      'إجمالي الأرباح التقديرية (MAD)': grossMargin,
      'الحالة': p.active ? 'نشط' : 'غير نشط',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'المخزون والمنتجات');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export Accounts performance to Excel (.xlsx)
 */
export function exportAccountsToExcel(accounts: AccountItem[], orders: Order[], filename = 'MPARA_Accounts_Performance.xlsx'): void {
  const data = accounts.map((acc) => {
    const stats = calculateAccountStats(orders, acc.name);
    return {
      'اسم حساب الإرسال': acc.name,
      'الوصف': acc.description || '',
      'إجمالي الطلبات': stats.totalOrders,
      'تم التوصيل': stats.delivered,
      'فشل التوصيل': stats.failed,
      'عدد المرتجعات': stats.returns,
      'نسبة النجاح %': `${stats.successRate}%`,
      'إجمالي المبيعات الفعلية (MAD)': stats.sales,
      'إجمالي المحصل (MAD)': stats.collected,
      'المبلغ غير المحصل (MAD)': stats.uncollected,
      'المبالغ المحولة للشركة (MAD)': stats.transferred,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'أداء حسابات الإرسال');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export Carriers performance to Excel (.xlsx)
 */
export function exportCarriersToExcel(companies: DeliveryCompany[], orders: Order[], filename = 'MPARA_Carriers_Performance.xlsx'): void {
  const data = companies.map((comp) => {
    const stats = calculateDeliveryCompanyStats(orders, comp.name);
    const companyOrders = orders.filter((o) => o.deliveryCompany === comp.name);
    const collectedAmt = companyOrders
      .filter((o) => o.collectionStatus === 'محصل')
      .reduce((sum, o) => sum + calculateOrderGrandTotal(o), 0);
    const pendingColl = companyOrders
      .filter((o) => o.deliveryStatus === 'تم التوصيل' && o.collectionStatus === 'غير محصل')
      .reduce((sum, o) => sum + calculateOrderGrandTotal(o), 0);
    const totalFees = companyOrders
      .filter((o) => o.deliveryStatus === 'تم التوصيل')
      .reduce((sum, o) => sum + parseDeliveryFee(o.deliveryFee), 0);

    return {
      'شركة التوصيل': comp.name,
      'الهاتف': comp.phone || '',
      'التعرفة الافتراضية (MAD)': comp.defaultFee,
      'إجمالي الشحنات': stats.totalOrders,
      'الشحنات المسلمة': stats.delivered,
      'شحنات فاشلة': stats.failed,
      'شحنات مرتجعة': stats.returns,
      'نسبة التوصيل الناجح %': `${stats.successRate}%`,
      'إجمالي المبالغ المحصلة (MAD)': collectedAmt,
      'مستحقات معلقة لدى الشركة (MAD)': pendingColl,
      'إجمالي مصاريف الشحن المستحقة (MAD)': totalFees,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'أداء شركات التوصيل');
  XLSX.writeFile(workbook, filename);
}

/**
 * Master Comprehensive Multi-Sheet Excel Workbook (.xlsx)
 * Generates an executive multi-tab Excel workbook for MPARA SARL
 */
export function exportComprehensiveWorkbook(
  orders: Order[],
  accounts: AccountItem[],
  deliveryCompanies: DeliveryCompany[],
  products: ProductItem[],
  summary: FinancialSummary,
  filename = 'MPARA_Master_Financial_Workbook.xlsx'
): void {
  const workbook = XLSX.utils.book_new();

  // 1. Executive Summary Sheet
  const summaryData = [
    { 'البند': 'المؤسسة والشركة', 'القيمة / المعيار': 'MPARA SARL (www.mpara.ma)' },
    { 'البند': 'تاريخ واستخراج التقرير', 'القيمة / المعيار': new Date().toLocaleString('ar-MA') },
    { 'البند': 'العملة المعتمدة', 'القيمة / المعيار': 'الدرهم المغربي (MAD)' },
    { 'البند': '--- المؤشرات التشغيلية ---', 'القيمة / المعيار': '---------------------------' },
    { 'البند': 'إجمالي عدد الطلبات المسجلة', 'القيمة / المعيار': summary.totalOrdersCount },
    { 'البند': 'عدد الطلبات المسلمة (تم التوصيل)', 'القيمة / المعيار': summary.deliveredCount },
    { 'البند': 'نسبة نجاح التوصيل الإجمالية', 'القيمة / المعيار': `${summary.successRate}%` },
    { 'البند': 'عدد الطلبات قيد التحضير', 'القيمة / المعيار': summary.inPrepCount },
    { 'البند': 'عدد الطلبات المشحونة قيد التوصيل', 'القيمة / المعيار': summary.inTransitCount + summary.shippedCount },
    { 'البند': 'عدد الشحنات الفاشلة', 'القيمة / المعيار': summary.failedCount },
    { 'البند': 'عدد الطلبات المرتجعة', 'القيمة / المعيار': summary.returnsCount },
    { 'البند': '--- المؤشرات المالية والقواعد السبعة ---', 'القيمة / المعيار': '---------------------------' },
    { 'البند': 'إجمالي المبيعات الفعلية (للطلبات المسلمة فقط)', 'القيمة / المعيار': formatMAD(summary.grossSalesValue) },
    { 'البند': 'إجمالي المبالغ المحصلة نقدياً (محصل)', 'القيمة / المعيار': formatMAD(summary.totalCollected) },
    { 'البند': 'إجمالي المبالغ غير المحصلة لدى الموزعين', 'القيمة / المعيار': formatMAD(summary.totalUncollected) },
    { 'البند': 'إجمالي مبالغ الدفع المسبق', 'القيمة / المعيار': formatMAD(summary.totalPrepaid) },
    { 'البند': 'إجمالي مصاريف الشحن والتوصيل', 'القيمة / المعيار': formatMAD(summary.totalDeliveryFees) },
    { 'البند': 'إجمالي المبالغ المخصومة كمرتجع', 'القيمة / المعيار': formatMAD(summary.totalReturnAmount) },
    { 'البند': 'صافي القيمة المعتمد (المبيعات - المرتجعات)', 'القيمة / المعيار': formatMAD(summary.netValue) },
    { 'البند': 'صافي التحصيل (المحصل - المرتجعات)', 'القيمة / المعيار': formatMAD(summary.netCollection) },
    { 'البند': 'إجمالي الربح الإجمالي التقديري', 'القيمة / المعيار': formatMAD(summary.grossProfit) },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 45 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص التنفيذي');

  // 2. All Orders Sheet
  const ordersData = formatOrdersForExport(orders);
  const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(workbook, ordersSheet, 'سجل الطلبات');

  // 3. Collections & COD Sheet
  const collectionsData = orders
    .filter((o) => o.deliveryStatus === 'تم التوصيل' || o.collectionStatus === 'محصل')
    .map((o) => ({
      'رقم الطلب': o.orderNumber,
      'التاريخ': o.date,
      'العميل': o.customerName,
      'الهاتف': o.customerPhone,
      'المدينة': o.customerCity,
      'المنتج': o.productName,
      'المبلغ COD (MAD)': calculateOrderGrandTotal(o),
      'شركة التوصيل': o.deliveryCompany,
      'رقم التتبع': o.trackingNumber || '',
      'حالة التوصيل': o.deliveryStatus,
      'حالة التحصيل': o.collectionStatus,
      'حساب الإرسال': o.account,
    }));
  const collectionsSheet = XLSX.utils.json_to_sheet(collectionsData);
  XLSX.utils.book_append_sheet(workbook, collectionsSheet, 'التحصيلات والتسويات');

  // 4. Returns Sheet
  const returnsData = orders
    .filter((o) => o.returnStatus !== 'لا يوجد إرجاع')
    .map((o) => ({
      'رقم الطلب': o.orderNumber,
      'التاريخ': o.date,
      'العميل': o.customerName,
      'الهاتف': o.customerPhone,
      'المدينة': o.customerCity,
      'المنتج': o.productName,
      'قيمة الطلب (MAD)': calculateOrderGrandTotal(o),
      'حالة الإرجاع': o.returnStatus,
      'سبب الإرجاع': o.returnReason || '',
      'مبلغ الخصم (MAD)': o.returnAmount || (o.returnStatus === 'تم الإرجاع' ? calculateOrderGrandTotal(o) : 0),
      'شركة الشحن': o.deliveryCompany,
      'ملاحظات': o.returnNotes || o.notes || '',
    }));
  const returnsSheet = XLSX.utils.json_to_sheet(returnsData);
  XLSX.utils.book_append_sheet(workbook, returnsSheet, 'المرتجعات');

  // 5. Products & Inventory Sheet
  const productsData = products.map((p) => {
    const totalSold = orders
      .filter((o) => o.productSku === p.sku && o.deliveryStatus === 'تم التوصيل')
      .reduce((sum, o) => sum + o.quantity, 0);

    return {
      'اسم المنتج': p.name,
      'رمز SKU': p.sku,
      'التصنيف': p.category,
      'سعر البيع (MAD)': p.price,
      'التكلفة (MAD)': p.cost,
      'المخزون': p.stock,
      'المباع الفعلي': totalSold,
      'إيرادات المبيعات (MAD)': totalSold * p.price,
    };
  });
  const productsSheet = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'المنتجات والمخزون');

  // 6. Accounts Performance Sheet
  const accountsData = accounts.map((acc) => {
    const stats = calculateAccountStats(orders, acc.name);
    return {
      'الحساب': acc.name,
      'إجمالي الطلبات': stats.totalOrders,
      'تم التوصيل': stats.delivered,
      'فشل التوصيل': stats.failed,
      'المرتجعات': stats.returns,
      'نسبة النجاح': `${stats.successRate}%`,
      'المبيعات (MAD)': stats.sales,
      'المحصل (MAD)': stats.collected,
      'غير المحصل (MAD)': stats.uncollected,
      'المحول (MAD)': stats.transferred,
    };
  });
  const accountsSheet = XLSX.utils.json_to_sheet(accountsData);
  XLSX.utils.book_append_sheet(workbook, accountsSheet, 'حسابات الإرسال');

  // 7. Carriers Performance Sheet
  const carriersData = deliveryCompanies.map((comp) => {
    const stats = calculateDeliveryCompanyStats(orders, comp.name);
    const companyOrders = orders.filter((o) => o.deliveryCompany === comp.name);
    const collectedAmt = companyOrders
      .filter((o) => o.collectionStatus === 'محصل')
      .reduce((sum, o) => sum + calculateOrderGrandTotal(o), 0);
    const pendingColl = companyOrders
      .filter((o) => o.deliveryStatus === 'تم التوصيل' && o.collectionStatus === 'غير محصل')
      .reduce((sum, o) => sum + calculateOrderGrandTotal(o), 0);
    const totalFees = companyOrders
      .filter((o) => o.deliveryStatus === 'تم التوصيل')
      .reduce((sum, o) => sum + parseDeliveryFee(o.deliveryFee), 0);

    return {
      'شركة الشحن': comp.name,
      'الهاتف': comp.phone || '',
      'إجمالي الشحنات': stats.totalOrders,
      'المسلمة': stats.delivered,
      'فاشلة': stats.failed,
      'مرتجعة': stats.returns,
      'نسبة النجاح': `${stats.successRate}%`,
      'المبالغ المحصلة (MAD)': collectedAmt,
      'مستحقات معلقة (MAD)': pendingColl,
      'مصاريف التوصيل المستحقة (MAD)': totalFees,
    };
  });
  const carriersSheet = XLSX.utils.json_to_sheet(carriersData);
  XLSX.utils.book_append_sheet(workbook, carriersSheet, 'شركات التوصيل');

  // Write file
  XLSX.writeFile(workbook, filename);
}

/**
 * Download Official Pre-built Excel Template for Orders Import
 */
export function downloadOrdersImportTemplate(): void {
  const sampleData = [
    {
      'رقم الطلب': 'MP-2026-9001',
      'التاريخ': new Date().toISOString().split('T')[0],
      'اسم العميل': 'محمد العلمي',
      'الهاتف': '0661122334',
      'المدينة': 'الدار البيضاء',
      'العنوان': 'المعاريف، شارع الزرقطوني عمارة 12',
      'اسم المنتج': 'جهاز قياس ضغط الدم أوتوماتيكي',
      'مرجع SKU': 'MED-TENS-01',
      'الكمية': 1,
      'ثمن الوحدة': 349,
      'تكلفة الوحدة': 180,
      'سعر التوصيل': 29,
      'حساب الإرسال': 'PARAMEDICALmparaOSJ',
      'شركة التوصيل': 'Cathedis',
      'رقم التتبع': 'CTH-778899',
      'حالة التوصيل': 'قيد التحضير',
      'حالة التحصيل': 'غير محصل',
      'حالة الإرجاع': 'لا يوجد إرجاع',
      'ملاحظات': 'يرجى الاتصال قبل التسليم بنصف ساعة',
    },
    {
      'رقم الطلب': 'MP-2026-9002',
      'التاريخ': new Date().toISOString().split('T')[0],
      'اسم العميل': 'خديجة المنصوري',
      'الهاتف': '0662233445',
      'المدينة': 'الرباط',
      'العنوان': 'حي الرياض، شارع النخيل',
      'اسم المنتج': 'سيروم حمض الهيالورونيك 30ml',
      'مرجع SKU': 'PARA-HA-03',
      'الكمية': 2,
      'ثمن الوحدة': 199,
      'تكلفة الوحدة': 95,
      'سعر التوصيل': 'مجاني',
      'حساب الإرسال': 'MARKETMEDICAL(mpara)',
      'شركة التوصيل': 'Amana Express',
      'رقم التتبع': 'AMN-554433',
      'حالة التوصيل': 'تم الإرسال',
      'حالة التحصيل': 'غير محصل',
      'حالة الإرجاع': 'لا يوجد إرجاع',
      'ملاحظات': 'عرض توصيل مجاني لحبتين',
    },
    {
      'رقم الطلب': 'MP-2026-9003',
      'التاريخ': new Date().toISOString().split('T')[0],
      'اسم العميل': 'ياسين الفاسي',
      'الهاتف': '0663344556',
      'المدينة': 'مراكش',
      'العنوان': 'جيليز، شارع محمد الخامس',
      'اسم المنتج': 'مكمل غذائي مغنيسيوم B6',
      'مرجع SKU': 'NUTRI-MG-05',
      'الكمية': 3,
      'ثمن الوحدة': 120,
      'تكلفة الوحدة': 55,
      'سعر التوصيل': 35,
      'حساب الإرسال': 'mparasarl',
      'شركة التوصيل': 'CTM Messagerie',
      'رقم التتبع': 'CTM-112233',
      'حالة التوصيل': 'تم التوصيل',
      'حالة التحصيل': 'محصل',
      'حالة الإرجاع': 'لا يوجد إرجاع',
      'ملاحظات': 'تم التسليم والتحصيل بنجاح',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 12 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 26 },
    { wch: 28 },
    { wch: 14 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج_استيراد_الطلبات');
  XLSX.writeFile(workbook, 'نموذج_استيراد_طلبات_MPARA_الرسمي.xlsx');
}

/**
 * Download Official Products Excel Template
 */
export function downloadProductsImportTemplate(): void {
  const sample = [
    {
      'اسم المنتج': 'كريم العناية الفائقة 50ml',
      'رمز SKU': 'PARA-CREAM-07',
      'التصنيف': 'عناية بالبشرة',
      'سعر البيع (MAD)': 189,
      'تكلفة الشراء (MAD)': 80,
      'المخزون الأولي': 100,
      'الحالة': 'نشط',
    },
    {
      'اسم المنتج': 'ميزان حرارة رقمي طبي',
      'رمز SKU': 'MED-THERM-08',
      'التصنيف': 'أجهزة طبية',
      'سعر البيع (MAD)': 99,
      'تكلفة الشراء (MAD)': 40,
      'المخزون الأولي': 150,
      'الحالة': 'نشط',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sample);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'قالب_المنتجات');
  XLSX.writeFile(workbook, 'نموذج_كتالوج_المنتجات_MPARA.xlsx');
}

/**
 * Export financial report / orders to PDF
 */
export function exportOrdersToPDF(orders: Order[], title = 'تقرير مبيعات وطلبات MPARA'): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  }) as JsPDFWithAutoTable;

  // Header Banner
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, 842, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('MPARA SARL - www.mpara.ma', 40, 30);

  doc.setFontSize(11);
  doc.text(`Exported: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`, 650, 30);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text(title, 40, 80);

  const tableHead = [
    [
      'Order #',
      'Date',
      'Customer',
      'Phone',
      'City',
      'Product',
      'Qty',
      'Price',
      'Total',
      'Account',
      'Carrier',
      'Tracking',
      'Status',
      'Payment',
    ],
  ];

  const tableData = orders.map((o) => [
    o.orderNumber,
    o.date,
    o.customerName,
    o.customerPhone,
    o.customerCity,
    o.productName.slice(0, 22),
    o.quantity.toString(),
    `${o.unitPrice} MAD`,
    `${calculateOrderGrandTotal(o)} MAD`,
    o.account,
    o.deliveryCompany,
    o.trackingNumber || '-',
    o.deliveryStatus,
    o.collectionStatus,
  ]);

  doc.autoTable({
    head: tableHead,
    body: tableData,
    startY: 95,
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 30, right: 30 },
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Print complete financial report
 */
export function printFinancialReport(summary: FinancialSummary, orders: Order[]): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>تقرير مالي شامل - MPARA SARL</title>
      <style>
        body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 24px; color: #1e293b; background: #fff; }
        .report-header { border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .company { font-size: 24px; font-weight: 900; color: #059669; }
        .title { font-size: 16px; font-weight: 700; color: #334155; margin-top: 4px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
        .card-label { font-size: 11px; color: #64748b; font-weight: bold; }
        .card-val { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        th { background: #f1f5f9; text-align: right; padding: 8px; border-bottom: 2px solid #cbd5e1; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        .net-box { background: #ecfdf5; border: 2px solid #059669; border-radius: 8px; padding: 14px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 900; color: #065f46; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="report-header">
        <div>
          <div class="company">MPARA SARL</div>
          <div class="title">كشف الحساب المالي والأداء التشغيلي (Financial & Operations Statement)</div>
          <div style="font-size: 11px; color: #64748b;">الموقع: www.mpara.ma | العملة: الدرهم المغربي (MAD)</div>
        </div>
        <div style="text-align: left; font-size: 11px; color: #64748b;">
          <div>تاريخ التقرير: ${new Date().toLocaleDateString('ar-MA')}</div>
          <div>عدد الطلبات المشمولة: ${orders.length}</div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-label">إجمالي الطلبات</div>
          <div class="card-val">${summary.totalOrdersCount}</div>
        </div>
        <div class="card">
          <div class="card-label">تم التوصيل</div>
          <div class="card-val" style="color: #059669;">${summary.deliveredCount} (${summary.successRate}%)</div>
        </div>
        <div class="card">
          <div class="card-label">المبيعات (تم التوصيل)</div>
          <div class="card-val" style="color: #059669;">${formatMAD(summary.grossSalesValue)}</div>
        </div>
        <div class="card">
          <div class="card-label">إجمالي المحصل</div>
          <div class="card-val" style="color: #4f46e5;">${formatMAD(summary.totalCollected)}</div>
        </div>
      </div>

      <div class="net-box">
        <span>صافي القيمة المعتمد (المبيعات - المرتجعات):</span>
        <span style="font-size: 20px;">${formatMAD(summary.netValue)}</span>
      </div>

      <h4 style="margin-bottom: 6px; font-size: 13px; color: #334155;">ملخص الطلبات الأخيرة (${Math.min(orders.length, 20)} طلب)</h4>
      <table>
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>التاريخ</th>
            <th>العميل</th>
            <th>المدينة</th>
            <th>المنتج</th>
            <th>الإجمالي</th>
            <th>الحساب</th>
            <th>الشركة</th>
            <th>التوصيل</th>
            <th>التحصيل</th>
          </tr>
        </thead>
        <tbody>
          ${orders.slice(0, 30).map((o) => `
            <tr>
              <td style="font-family: monospace; font-weight: bold;">${o.orderNumber}</td>
              <td>${o.date}</td>
              <td>${o.customerName}</td>
              <td>${o.customerCity}</td>
              <td>${o.productName}</td>
              <td style="font-weight: bold;">${calculateOrderGrandTotal(o)} MAD</td>
              <td>${o.account}</td>
              <td>${o.deliveryCompany}</td>
              <td>${o.deliveryStatus}</td>
              <td>${o.collectionStatus}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Print single order waybill / delivery invoice
 */
export function printOrderInvoice(order: Order): void {
  const grandTotal = calculateOrderGrandTotal(order);
  const subtotal = calculateOrderSubtotal(order.quantity, order.unitPrice);
  const deliveryText = typeof order.deliveryFee === 'number' ? `${order.deliveryFee} MAD` : order.deliveryFee;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>بوليصة شحن - ${order.orderNumber}</title>
      <style>
        body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 24px; color: #1e293b; background: #fff; }
        .invoice-card { border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 650px; margin: auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #059669; }
        .subtitle { font-size: 12px; color: #64748b; }
        .badge { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 99px; font-weight: bold; font-size: 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        .box-title { font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
        .box-val { font-size: 13px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f1f5f9; text-align: right; padding: 10px; font-size: 12px; border-bottom: 2px solid #cbd5e1; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .totals { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-top: 10px; }
        .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .grand-total { font-size: 18px; font-weight: 900; color: #047857; border-top: 1px dashed #86efac; margin-top: 6px; padding-top: 6px; }
        .barcode { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1; }
        .barcode-num { font-family: monospace; font-size: 18px; letter-spacing: 4px; font-weight: bold; }
        @media print {
          body { padding: 0; }
          .invoice-card { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div>
            <div class="logo">MPARA SARL</div>
            <div class="subtitle">www.mpara.ma | المستلزمات الطبية والبارافارماسي</div>
          </div>
          <div>
            <span class="badge">بوليصة توصيل وتحصيل</span>
            <div style="font-size: 12px; margin-top: 6px; color: #64748b; text-align: left;">التاريخ: ${order.date}</div>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <div class="box-title">بيانات المستلم (العميل)</div>
            <div class="box-val">${order.customerName}</div>
            <div class="box-val" style="direction: ltr; text-align: right;">📞 ${order.customerPhone}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">📍 ${order.customerCity} - ${order.customerAddress || 'التسليم بالمدينة'}</div>
          </div>
          <div class="box">
            <div class="box-title">بيانات الشحن والإرسال</div>
            <div class="box-val">رقم الطلب: ${order.orderNumber}</div>
            <div class="box-val">شركة التوصيل: ${order.deliveryCompany}</div>
            <div class="box-val">الحساب: ${order.account}</div>
            <div style="font-size: 12px; color: #059669; font-weight: bold;">تتبع: ${order.trackingNumber || 'غير محدد'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>SKU</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${order.productName}</strong></td>
              <td style="font-family: monospace;">${order.productSku}</td>
              <td>${order.quantity}</td>
              <td>${order.unitPrice} MAD</td>
              <td>${subtotal} MAD</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>مجموع المنتجات:</span>
            <span>${subtotal} MAD</span>
          </div>
          <div class="total-row">
            <span>مصاريف التوصيل:</span>
            <span>${deliveryText}</span>
          </div>
          <div class="total-row grand-total">
            <span>المبلغ المطلوب تحصيله (COD):</span>
            <span>${grandTotal} MAD</span>
          </div>
        </div>

        ${order.notes ? `<div style="margin-top: 14px; font-size: 12px; background: #fffbeb; border: 1px solid #fef3c7; padding: 8px 12px; border-radius: 6px;"><strong>ملاحظات التسليم:</strong> ${order.notes}</div>` : ''}

        <div class="barcode">
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">رمز التتبع الباركود</div>
          <div class="barcode-num">*${order.orderNumber}*</div>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Clean currency and number helper
 */
function cleanNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Clean delivery fee helper (can be number or 'مجاني')
 */
function cleanDeliveryFee(val: unknown): number | 'مجاني' | string {
  if (val === undefined || val === null || val === '') return 29;
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase();
    if (lower.includes('مجان') || lower === 'free' || lower === 'gratuit' || lower === '0') {
      return 'مجاني';
    }
  }
  return cleanNumber(val, 29);
}

/**
 * Parse status mapping helper
 */
function normalizeDeliveryStatus(raw: string): DeliveryStatus {
  const s = raw.trim().toLowerCase();
  if (s.includes('توصيل') && s.includes('تم') || s.includes('livré') || s.includes('delivered')) return 'تم التوصيل';
  if (s.includes('فشل') || s.includes('échec') || s.includes('failed') || s.includes('annulé') || s.includes('refus')) return 'فشل التوصيل';
  if (s.includes('طريق') || s.includes('cours') || s.includes('transit') || s.includes('قيد التوصيل')) return 'قيد التوصيل';
  if (s.includes('إرسال') || s.includes('expédié') || s.includes('shipped') || s.includes('تم الارسال')) return 'تم الإرسال';
  if (s.includes('ملغ') || s.includes('cancelled') || s.includes('annule')) return 'ملغى';
  return 'قيد التحضير';
}

function normalizeCollectionStatus(raw: string): CollectionStatus {
  const s = raw.trim().toLowerCase();
  if (s.includes('مسبق') || s.includes('prépayé') || s.includes('prepaid') || s.includes('carte') || s.includes('virement')) return 'دفع مسبق';
  if (s.includes('محصل') || s.includes('encaissé') || s.includes('collected') || s.includes('payé') || s.includes('paid')) return 'محصل';
  return 'غير محصل';
}

function normalizeReturnStatus(raw: string): ReturnStatus {
  const s = raw.trim().toLowerCase();
  if (s.includes('تم الإرجاع') || s.includes('تم الارجاع') || s.includes('retourné') || s.includes('returned')) return 'تم الإرجاع';
  if (s.includes('تعويض') || s.includes('compensé') || s.includes('refunded')) return 'تم التعويض';
  if (s.includes('طريق') || s.includes('transit')) return 'في طريق الإرجاع';
  if (s.includes('طلب') || s.includes('demande') || s.includes('requested')) return 'طلب إرجاع';
  return 'لا يوجد إرجاع';
}

/**
 * Smart Parser for Excel (.xlsx, .xls) and CSV files
 */
export async function parseUploadedOrdersFile(file: File): Promise<{
  orders: Partial<Order>[];
  errors: string[];
  warnings: string[];
  totalRows: number;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const orders: Partial<Order>[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        if (rawJson.length === 0) {
          resolve({
            orders: [],
            errors: ['الملف المرفوع فارغ أو لا يحتوي على أسطر بيانات.'],
            warnings: [],
            totalRows: 0,
          });
          return;
        }

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // Row 1 is header

          // Find key match flexibly
          const findVal = (keys: string[]): unknown => {
            for (const key of keys) {
              if (row[key] !== undefined && row[key] !== '') return row[key];
            }
            // Case-insensitive lookup
            const rowKeys = Object.keys(row);
            for (const key of keys) {
              const matchedKey = rowKeys.find((k) => k.trim().toLowerCase() === key.toLowerCase());
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return row[matchedKey];
              }
            }
            return '';
          };

          const rawOrderNum = findVal(['رقم الطلب', 'Order #', 'Order Number', 'N° Commande', 'Order', 'Code', 'رقم']);
          const rawCustomer = findVal(['اسم العميل', 'العميل', 'Customer', 'Nom Client', 'Nom', 'Customer Name', 'الاسم']);
          const rawPhone = findVal(['الهاتف', 'رقم الهاتف', 'Phone', 'Téléphone', 'Tel', 'GSM', 'Mobile', 'هاتف']);
          const rawCity = findVal(['المدينة', 'City', 'Ville', 'Region', 'المحافظة']);
          const rawAddress = findVal(['العنوان', 'Address', 'Adresse', 'الحي']);
          const rawProduct = findVal(['اسم المنتج', 'المنتج', 'Product', 'Produit', 'Article', 'Designation', 'السلعة']);
          const rawSku = findVal(['مرجع SKU', 'SKU', 'Reference', 'Ref', 'رمز المنتج', 'كود']);
          const rawQty = findVal(['الكمية', 'Quantity', 'Qty', 'Qte', 'Quantite', 'عدد']);
          const rawPrice = findVal(['ثمن الوحدة', 'السعر', 'Price', 'Prix', 'Prix Unitaire', 'سعر البيع', 'الثمن']);
          const rawCost = findVal(['تكلفة الوحدة', 'التكلفة', 'Cost', 'Cout', 'Prix d\'achat', 'سعر التكلفة']);
          const rawFee = findVal(['سعر التوصيل', 'التوصيل', 'Delivery Fee', 'Frais Livraison', 'مصاريف التوصيل', 'الشحن']);
          const rawAccount = findVal(['حساب الإرسال', 'الحساب', 'Account', 'Compte', 'Store', 'المتجر']);
          const rawCarrier = findVal(['شركة التوصيل', 'الشركة', 'Carrier', 'Livreur', 'Société', 'شركة الشحن']);
          const rawTracking = findVal(['رقم التتبع', 'التتبع', 'Tracking', 'Tracking Number', 'Code Suivi', 'البوليصة']);
          const rawDelivStatus = findVal(['حالة التوصيل', 'الحالة', 'Status', 'Statut', 'Statut Livraison']);
          const rawCollStatus = findVal(['حالة التحصيل', 'التحصيل', 'Collection', 'Statut Encaissement', 'الدفع']);
          const rawRetStatus = findVal(['حالة الإرجاع', 'المرتجع', 'Return', 'Statut Retour', 'الإرجاع']);
          const rawRetReason = findVal(['سبب الإرجاع', 'سبب الارجاع', 'Return Reason', 'Motif']);
          const rawRetAmount = findVal(['مبلغ الإرجاع', 'مبلغ الارجاع', 'Return Amount', 'Montant Retour']);
          const rawDate = findVal(['التاريخ', 'Date', 'Date Commande', 'تاريخ الطلب']);
          const rawNotes = findVal(['ملاحظات', 'Notes', 'Remarques', 'Commentaire']);

          // Normalization & Defaults
          const orderNumber = String(rawOrderNum || `MP-${Date.now().toString().slice(-6)}-${index + 1}`);
          const customerName = String(rawCustomer || '').trim();
          const customerPhone = String(rawPhone || '').replace(/[^\d+]/g, '');
          const customerCity = String(rawCity || 'الدار البيضاء').trim();
          const customerAddress = String(rawAddress || '').trim();
          const productName = String(rawProduct || 'منتج عام MPARA').trim();
          const productSku = String(rawSku || 'MP-SKU-GEN').trim();
          const quantity = Math.max(1, cleanNumber(rawQty, 1));
          const unitPrice = Math.max(0, cleanNumber(rawPrice, 100));
          const unitCost = Math.max(0, cleanNumber(rawCost, 50));
          const deliveryFee = cleanDeliveryFee(rawFee);
          const account = String(rawAccount || 'PARAMEDICALmparaOSJ').trim();
          const deliveryCompany = String(rawCarrier || 'Cathedis').trim();
          const trackingNumber = String(rawTracking || '').trim();
          const deliveryStatus = normalizeDeliveryStatus(String(rawDelivStatus));
          const collectionStatus = normalizeCollectionStatus(String(rawCollStatus));
          const returnStatus = normalizeReturnStatus(String(rawRetStatus));
          const returnReason = String(rawRetReason || '');
          const returnAmount = cleanNumber(rawRetAmount, 0);
          const notes = String(rawNotes || '');

          let dateStr = new Date().toISOString().split('T')[0];
          if (rawDate) {
            try {
              if (typeof rawDate === 'number') {
                // Excel serial date to JS Date
                const dateObj = new Date((rawDate - 25569) * 86400 * 1000);
                if (!isNaN(dateObj.getTime())) dateStr = dateObj.toISOString().split('T')[0];
              } else {
                const parsed = new Date(String(rawDate));
                if (!isNaN(parsed.getTime())) dateStr = parsed.toISOString().split('T')[0];
              }
            } catch {
              // fallback to today
            }
          }

          if (!customerName) {
            warnings.push(`السطر ${rowNum}: تم تعيين اسم عميل افتراضي لأن الحقل كان فارغاً.`);
          }

          orders.push({
            orderNumber,
            date: dateStr,
            customerName: customerName || 'عميل مستورد',
            customerPhone: customerPhone || '0600000000',
            customerCity,
            customerAddress,
            productName,
            productSku,
            quantity,
            unitPrice,
            unitCost,
            deliveryFee,
            account,
            deliveryCompany,
            trackingNumber,
            deliveryStatus,
            collectionStatus,
            returnStatus,
            returnReason: returnReason || undefined,
            returnAmount: returnAmount > 0 ? returnAmount : undefined,
            notes: notes || 'مستورد عبر إكسيل',
            timeline: [
              {
                id: 't_' + Date.now() + '_' + index,
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                title: 'تم استيراد الطلب من ملف إكسيل / CSV',
                description: `الملف: ${file.name} | السطر: ${rowNum}`,
                user: 'Excel Importer',
                statusType: 'system',
              },
            ],
          });
        });

        resolve({
          orders,
          errors,
          warnings,
          totalRows: rawJson.length,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'تعذر قراءة ملف الإكسيل';
        resolve({
          orders: [],
          errors: [msg],
          warnings: [],
          totalRows: 0,
        });
      }
    };

    reader.readAsBinaryString(file);
  });
}


import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Order } from '../types';
import { calculateOrderGrandTotal, calculateOrderSubtotal, parseDeliveryFee, formatMAD } from './calculations';

// Extend jsPDF interface for autoTable
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: unknown) => void;
}

/**
 * Convert orders list to flat rows for Excel/CSV
 */
export function formatOrdersForExport(orders: Order[]) {
  return orders.map((o) => {
    const subtotal = calculateOrderSubtotal(o.quantity, o.unitPrice);
    const fee = parseDeliveryFee(o.deliveryFee);
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
      'المجموع (MAD)': subtotal,
      'سعر التوصيل': typeof o.deliveryFee === 'number' ? o.deliveryFee : o.deliveryFee,
      'الإجمالي الكلي (MAD)': grandTotal,
      'حساب الإرسال': o.account,
      'شركة التوصيل': o.deliveryCompany,
      'رقم التتبع': o.trackingNumber,
      'حالة التوصيل': o.deliveryStatus,
      'حالة الإرجاع': o.returnStatus,
      'سبب الإرجاع': o.returnReason || '',
      'مبلغ الإرجاع (MAD)': o.returnAmount || 0,
      'حالة التحصيل': o.collectionStatus,
      'ملاحظات': o.notes || '',
    };
  });
}

/**
 * Export orders to Excel (.xlsx)
 */
export function exportOrdersToExcel(orders: Order[], filename = 'MPARA_Orders_Report.xlsx'): void {
  const data = formatOrdersForExport(orders);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلبات');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export orders to CSV with UTF-8 BOM for Arabic compatibility in Excel
 */
export function exportOrdersToCSV(orders: Order[], filename = 'MPARA_Orders.csv'): void {
  const data = formatOrdersForExport(orders);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  // Add UTF-8 BOM so Excel opens Arabic correctly
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
export function printFinancialReport(summary: import('../types').FinancialSummary, orders: Order[]): void {
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
 * Parse Excel or CSV file uploaded by user
 */
export async function parseUploadedOrdersFile(file: File): Promise<{
  orders: Partial<Order>[];
  errors: string[];
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
        const rawJson: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

        const orders: Partial<Order>[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1
          
          // Match field names in Arabic, French, or English
          const orderNumber = String(row['رقم الطلب'] || row['Order #'] || row['Order Number'] || row['N° Commande'] || `MP-${Date.now()}-${index}`);
          const customerName = String(row['اسم العميل'] || row['العميل'] || row['Customer'] || row['Nom Client'] || '');
          const customerPhone = String(row['الهاتف'] || row['رقم الهاتف'] || row['Phone'] || row['Téléphone'] || '');
          const productName = String(row['اسم المنتج'] || row['المنتج'] || row['Product'] || row['Produit'] || 'منتج عام');
          const productSku = String(row['مرجع SKU'] || row['SKU'] || row['Reference'] || 'SKU-GEN');
          const quantity = Number(row['الكمية'] || row['Quantity'] || row['Qty'] || 1) || 1;
          const unitPrice = Number(row['ثمن الوحدة'] || row['السعر'] || row['Price'] || row['Prix'] || 0) || 0;
          const deliveryFee = row['سعر التوصيل'] || row['التوصيل'] || row['Delivery Fee'] || 29;
          const account = String(row['حساب الإرسال'] || row['الحساب'] || row['Account'] || 'PARAMEDICALmparaOSJ');
          const deliveryCompany = String(row['شركة التوصيل'] || row['الشركة'] || row['Carrier'] || 'Cathedis');
          const trackingNumber = String(row['رقم التتبع'] || row['التتبع'] || row['Tracking'] || '');
          const customerCity = String(row['المدينة'] || row['City'] || row['Ville'] || 'Casablanca');
          const customerAddress = String(row['العنوان'] || row['Address'] || '');
          const deliveryStatus = String(row['حالة التوصيل'] || row['الحالة'] || row['Status'] || 'قيد التحضير');
          const collectionStatus = String(row['حالة التحصيل'] || row['التحصيل'] || row['Collection'] || 'غير محصل');
          const returnStatus = String(row['حالة الإرجاع'] || row['المرتجع'] || row['Return'] || 'لا يوجد إرجاع');
          const date = String(row['التاريخ'] || row['Date'] || new Date().toISOString().split('T')[0]);

          if (!customerName) {
            errors.push(`السطر ${rowNum}: اسم العميل مفقود`);
          }

          orders.push({
            orderNumber,
            date,
            customerName: customerName || 'عميل بدون اسم',
            customerPhone: customerPhone || '0600000000',
            customerCity,
            customerAddress,
            productName,
            productSku,
            quantity,
            unitPrice,
            deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : String(deliveryFee),
            account,
            deliveryCompany,
            trackingNumber,
            deliveryStatus: (deliveryStatus as any) || 'قيد التحضير',
            collectionStatus: (collectionStatus as any) || 'غير محصل',
            returnStatus: (returnStatus as any) || 'لا يوجد إرجاع',
            timeline: [
              {
                id: 't_' + Date.now(),
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                title: 'تم استيراد الطلب من ملف خارجي',
                user: 'Import Excel',
                statusType: 'system',
              },
            ],
          });
        });

        resolve({
          orders,
          errors,
          totalRows: rawJson.length,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'تعذر قراءة الملف';
        resolve({
          orders: [],
          errors: [msg],
          totalRows: 0,
        });
      }
    };

    reader.readAsBinaryString(file);
  });
}

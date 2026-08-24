import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  RotateCcw,
  BadgeDollarSign,
  ShieldCheck,
  Building2,
  Truck,
  Percent,
  Layers,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateFinancialSummary,
  calculateAccountStats,
  calculateDeliveryCompanyStats,
  formatMAD,
} from '../utils/calculations';
import {
  exportOrdersToExcel,
  exportOrdersToPDF,
  printFinancialReport,
  exportComprehensiveWorkbook,
  exportCollectionsToExcel,
  exportReturnsToExcel,
  exportProductsToExcel,
  exportAccountsToExcel,
  exportCarriersToExcel,
} from '../utils/exportImport';

export const ReportsView: React.FC = () => {
  const { orders, accounts, deliveryCompanies, products, settings, t } = useApp();

  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter orders based on chosen quick range
  const filteredOrders = React.useMemo(() => {
    if (dateRange === 'all') return orders;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (dateRange === 'today') {
      return orders.filter((o) => o.date === todayStr);
    }

    if (dateRange === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orders.filter((o) => new Date(o.date) >= oneWeekAgo);
    }

    if (dateRange === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orders.filter((o) => new Date(o.date) >= oneMonthAgo);
    }

    return orders;
  }, [orders, dateRange]);

  const summary = calculateFinancialSummary(filteredOrders);
  const accountStats = accounts.map((acc) => calculateAccountStats(filteredOrders, acc.name));
  const carrierStats = deliveryCompanies.map((comp) => calculateDeliveryCompanyStats(filteredOrders, comp.name));

  const handleExportMasterWorkbook = () => {
    exportComprehensiveWorkbook(filteredOrders, accounts, deliveryCompanies, products, summary);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>التقارير المالية والقوائم الحسابية الرسمية</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            كشوفات الحسابات، الأرباح، التكاليف، وملفات Excel المتقدمة لشركة MPARA SARL
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Filters */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                dateRange === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                dateRange === 'month' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              آخر 30 يوم
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                dateRange === 'week' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              هذا الأسبوع
            </button>
          </div>

          {/* Master 7-Sheets Workbook Export */}
          <button
            onClick={handleExportMasterWorkbook}
            id="btn-export-master-excel"
            className="flex items-center gap-1.5 text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            title="تصدير مصنف إكسيل تنفيذي شامل يضم 7 صفحات مدمجة"
          >
            <Layers className="w-4 h-4" />
            <span>مصنف Excel الشامل (7 صفحات)</span>
          </button>

          <button
            onClick={() => exportOrdersToExcel(filteredOrders)}
            className="flex items-center gap-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel الطلبات</span>
          </button>

          <button
            onClick={() => exportOrdersToPDF(filteredOrders)}
            className="flex items-center gap-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => printFinancialReport(summary, filteredOrders)}
            className="flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Specialized Excel Exports Hub */}
      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-xs sm:text-sm text-emerald-950">
              تصدير تقارير الإكسيل المخصصة (.xlsx) بضغطة واحدة
            </h3>
          </div>
          <span className="text-[11px] text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
            متوافق 100% مع Microsoft Excel
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => exportOrdersToExcel(filteredOrders, 'MPARA_Orders_Report.xlsx')}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group shadow-2xs"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-slate-800">سجل الطلبات</span>
            <span className="text-[10px] text-slate-500">All Orders</span>
          </button>

          <button
            onClick={() => exportCollectionsToExcel(filteredOrders)}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group shadow-2xs"
          >
            <BadgeDollarSign className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-slate-800">التحصيلات COD</span>
            <span className="text-[10px] text-slate-500">Collections</span>
          </button>

          <button
            onClick={() => exportReturnsToExcel(filteredOrders)}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group shadow-2xs"
          >
            <RotateCcw className="w-5 h-5 text-rose-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-slate-800">المرتجعات</span>
            <span className="text-[10px] text-slate-500">Returns</span>
          </button>

          <button
            onClick={() => exportProductsToExcel(products, filteredOrders)}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group shadow-2xs"
          >
            <FileCheck2 className="w-5 h-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-slate-800">المخزون والمنتجات</span>
            <span className="text-[10px] text-slate-500">Inventory</span>
          </button>

          <button
            onClick={() => exportAccountsToExcel(accounts, filteredOrders)}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group shadow-2xs"
          >
            <Building2 className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-slate-800">حسابات الإرسال</span>
            <span className="text-[10px] text-slate-500">Store Accounts</span>
          </button>

          <button
            onClick={() => exportCarriersToExcel(deliveryCompanies, filteredOrders)}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group shadow-2xs"
          >
            <Truck className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs text-slate-800">شركات التوصيل</span>
            <span className="text-[10px] text-slate-500">Carriers</span>
          </button>
        </div>
      </div>

      {/* Main Financial Statement Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="font-black text-xl text-slate-900">MPARA SARL</span>
            <p className="text-xs text-slate-500">كشف الحساب المالي والتدفقات النقدية (Financial Statement)</p>
          </div>
          <div className="text-end text-xs text-slate-500">
            <div>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-MA')}</div>
            <div className="font-bold text-emerald-700">عدد الطلبات المدرجة: {filteredOrders.length}</div>
          </div>
        </div>

        {/* Statement Items */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-semibold">إجمالي الطلبات المسجلة:</span>
            <span className="font-bold text-slate-900">{summary.totalOrdersCount} طلب</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-semibold">الطلبات المسلمة بنجاح (تم التوصيل):</span>
            <span className="font-bold text-emerald-800">{summary.deliveredCount} طلب ({summary.successRate}%)</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-semibold">إجمالي قيمة المبيعات (Gross Sales):</span>
            <span className="font-black text-slate-900">{formatMAD(summary.grossSalesValue)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-rose-700">
            <span className="font-semibold">يخصم: مبالغ المرتجعات والتعويضات (Returns):</span>
            <span className="font-bold">-{formatMAD(summary.totalReturnAmount)}</span>
          </div>

          <div className="flex justify-between py-3 border-b-2 border-slate-800 text-sm font-black bg-slate-50 px-3 rounded-lg">
            <span className="text-slate-900">صافي المبيعات (Net Value = Sales - Returns):</span>
            <span className="text-emerald-700">{formatMAD(summary.netValue)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-semibold">تكاليف مصاريف التوصيل والشحن:</span>
            <span className="font-bold text-slate-800">{formatMAD(summary.totalDeliveryFees)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-semibold">المبالغ المحصلة نقدياً فعلياً:</span>
            <span className="font-bold text-emerald-800">{formatMAD(summary.totalCollected)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-semibold">المستحقات المعلقة لدى شركات التوصيل:</span>
            <span className="font-bold text-amber-800">{formatMAD(summary.totalUncollected)}</span>
          </div>
        </div>

        {/* Account Statements Table */}
        <div className="pt-4">
          <h3 className="font-extrabold text-xs text-slate-800 mb-3">تفصيل الأداء المالي حسب حسابات الإرسال</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-start">الحساب</th>
                  <th className="p-2.5 text-center">الطلبات</th>
                  <th className="p-2.5 text-center">تم التوصيل</th>
                  <th className="p-2.5 text-start">المبيعات</th>
                  <th className="p-2.5 text-start">المحصل</th>
                  <th className="p-2.5 text-start">المحول</th>
                  <th className="p-2.5 text-center">نسبة النجاح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {accountStats.map((acc, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-bold text-slate-900">{acc.accountName}</td>
                    <td className="p-2.5 text-center font-semibold">{acc.totalOrders}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-700">{acc.delivered}</td>
                    <td className="p-2.5 font-semibold">{formatMAD(acc.sales)}</td>
                    <td className="p-2.5 font-semibold text-emerald-800">{formatMAD(acc.collected)}</td>
                    <td className="p-2.5 font-bold text-indigo-800">{formatMAD(acc.transferred)}</td>
                    <td className="p-2.5 text-center font-bold">{acc.successRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

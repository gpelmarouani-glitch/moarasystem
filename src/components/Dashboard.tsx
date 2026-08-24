import React, { useMemo } from 'react';
import {
  TrendingUp,
  Package,
  Truck,
  RotateCcw,
  BadgeDollarSign,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Percent,
  PlusCircle,
  Eye,
  CreditCard,
  Building2,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  calculateAccountStats,
  calculateDeliveryCompanyStats,
  calculateOrderGrandTotal,
  formatMAD,
} from '../utils/calculations';

const STATUS_COLORS: Record<string, string> = {
  'تم التوصيل': '#059669', // emerald-600
  'قيد التوصيل': '#0284c7', // sky-600
  'تم الإرسال': '#6366f1', // indigo-500
  'قيد التحضير': '#f59e0b', // amber-500
  'فشل التوصيل': '#e11d48', // rose-600
  'ملغى': '#64748b', // slate-500
};

const PIE_COLORS = ['#059669', '#0284c7', '#6366f1', '#f59e0b', '#e11d48', '#64748b', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC = () => {
  const {
    orders,
    accounts,
    deliveryCompanies,
    returnReasons,
    financialSummary,
    openNewOrderModal,
    viewOrderDetails,
    setActiveView,
    t,
  } = useApp();

  // 1. Data for Status Distribution Pie Chart
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.deliveryStatus] = (counts[o.deliveryStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#94a3b8',
    }));
  }, [orders]);

  // 2. Data for Sales Trend by Date
  const salesTrendData = useMemo(() => {
    const dateMap: Record<string, { date: string; sales: number; collected: number; ordersCount: number }> = {};

    // Sort orders by date
    const sorted = [...orders].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((o) => {
      if (!dateMap[o.date]) {
        dateMap[o.date] = { date: o.date, sales: 0, collected: 0, ordersCount: 0 };
      }
      dateMap[o.date].ordersCount += 1;
      const total = calculateOrderGrandTotal(o);
      if (o.deliveryStatus === 'تم التوصيل') {
        dateMap[o.date].sales += total;
      }
      if (o.collectionStatus === 'محصل' || o.collectionStatus === 'دفع مسبق') {
        dateMap[o.date].collected += total;
      }
    });

    return Object.values(dateMap).slice(-10); // last 10 dates
  }, [orders]);

  // 3. Accounts Analysis Data
  const accountsTableData = useMemo(() => {
    return accounts.map((acc) => calculateAccountStats(orders, acc.name));
  }, [accounts, orders]);

  // 4. Delivery Companies Analysis Data
  const deliveryTableData = useMemo(() => {
    return deliveryCompanies.map((comp) => calculateDeliveryCompanyStats(orders, comp.name));
  }, [deliveryCompanies, orders]);

  // 5. Return Reasons Breakdown Data
  const returnReasonsData = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalReturns = 0;
    orders.forEach((o) => {
      if (o.returnStatus === 'تم الإرجاع' || o.returnStatus === 'تم التعويض' || o.returnStatus === 'طلب إرجاع' || o.returnStatus === 'في طريق الإرجاع') {
        const reason = o.returnReason || 'غير محدد';
        counts[reason] = (counts[reason] || 0) + 1;
        totalReturns++;
      }
    });

    return Object.entries(counts).map(([reason, count]) => ({
      reason,
      count,
      percentage: totalReturns > 0 ? Math.round((count / totalReturns) * 100) : 0,
    }));
  }, [orders]);

  // Recent 8 orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 8);
  }, [orders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Company Title & Subtitle */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-2xl tracking-tight text-white">MPARA</span>
            <span className="text-xs bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold">
              SARL
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-100 mt-1">
            Order & Financial Management System
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            لوحة القيادة والمتابعة الحية للطلبات والشحن والتحصيلات | www.mpara.ma
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('orders')}
            className="text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            عرض جميع الطلبات ({orders.length})
          </button>
          <button
            onClick={openNewOrderModal}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة طلب جديد</span>
          </button>
        </div>
      </div>

      {/* 10 KPI Cards Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">مؤشرات الأداء الرئيسية (10 KPI Cards)</h2>
          <span className="text-xs text-slate-500">العملة: الدرهم المغربي (MAD)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
          {/* Card 1: Total Orders */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold">{t.kpiTotalOrders}</span>
              <Package className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">{financialSummary.totalOrdersCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">إجمالي ما تم تسجيله</div>
          </div>

          {/* Card 2: Delivered */}
          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold">{t.kpiDelivered}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-800">{financialSummary.deliveredCount}</div>
            <div className="text-[10px] text-emerald-600 mt-1">
              {financialSummary.totalOrdersCount > 0
                ? `${Math.round((financialSummary.deliveredCount / financialSummary.totalOrdersCount) * 100)}% نسبة التوصيل`
                : '0%'}
            </div>
          </div>

          {/* Card 3: In Transit */}
          <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-blue-700 mb-1">
              <span className="text-[11px] font-bold">{t.kpiInTransit}</span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-blue-800">{financialSummary.inTransitCount}</div>
            <div className="text-[10px] text-blue-600 mt-1">مع مندوبي التوصيل</div>
          </div>

          {/* Card 4: Failed */}
          <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-300 transition-all">
            <div className="flex items-center justify-between text-rose-700 mb-1">
              <span className="text-[11px] font-bold">{t.kpiFailed}</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-extrabold text-rose-800">{financialSummary.failedCount}</div>
            <div className="text-[10px] text-rose-600 mt-1">تعذر تسليمها</div>
          </div>

          {/* Card 5: Returns */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-bold">{t.kpiReturns}</span>
              <RotateCcw className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-extrabold text-amber-800">{financialSummary.returnsCount}</div>
            <div className="text-[10px] text-amber-600 mt-1">مرتجع أو معوض</div>
          </div>

          {/* Card 6: Sales Value (Delivered Only) */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-emerald-500/70 bg-emerald-50/40 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] font-extrabold">{t.kpiSalesValue}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-900 truncate">
              {formatMAD(financialSummary.grossSalesValue)}
            </div>
            <div className="text-[10px] text-emerald-700 mt-1 font-semibold">للطلبات المسلمة فقط ✓</div>
          </div>

          {/* Card 7: Collected Amount */}
          <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-xs hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between text-indigo-700 mb-1">
              <span className="text-[11px] font-bold">{t.kpiCollectedAmount}</span>
              <BadgeDollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-indigo-950 truncate">
              {formatMAD(financialSummary.totalCollected)}
            </div>
            <div className="text-[10px] text-indigo-600 mt-1">تم تحصيلها فعلياً</div>
          </div>

          {/* Card 8: Uncollected Amount */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-300 bg-amber-50/30 shadow-xs hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-[11px] font-bold">{t.kpiUncollectedAmount}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-950 truncate">
              {formatMAD(financialSummary.totalUncollected)}
            </div>
            <div className="text-[10px] text-amber-700 mt-1">مستحقات مع الشركات</div>
          </div>

          {/* Card 9: Delivery Fees */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-[11px] font-bold">{t.kpiDeliveryFees}</span>
              <Truck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-800 truncate">
              {formatMAD(financialSummary.totalDeliveryFees)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">تكاليف الشحن الإجمالية</div>
          </div>

          {/* Card 10: Net Value */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-white shadow-md">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[11px] font-black">{t.kpiNetValue}</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-300 truncate">
              {formatMAD(financialSummary.netValue)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">المبيعات - المرتجعات</div>
          </div>
        </div>
      </div>

      {/* Section 14: Pre-Delivery Value Breakdown (قيمة الطلبات قبل التوصيل) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>قيمة الطلبات قبل التوصيل (Pipeline & Unfinished Orders)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              حجم الأموال الموجودة حالياً في الطلبات التي لم تكتمل كـ &quot;تم التوصيل&quot;
            </p>
          </div>
          <div className="text-end">
            <span className="text-xs text-slate-400">إجمالي ما قبل التوصيل:</span>
            <span className="text-base font-black text-amber-700 ms-2">
              {formatMAD(financialSummary.preDeliveryTotal)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <span className="text-[10px] text-amber-800 font-bold block mb-1">قيد التحضير</span>
            <span className="text-sm font-extrabold text-amber-950 block">{formatMAD(financialSummary.preDeliveryInPrep)}</span>
            <span className="text-[10px] text-amber-700 opacity-80">{financialSummary.inPrepCount} طلبات</span>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
            <span className="text-[10px] text-indigo-800 font-bold block mb-1">تم الإرسال</span>
            <span className="text-sm font-extrabold text-indigo-950 block">{formatMAD(financialSummary.preDeliveryShipped)}</span>
            <span className="text-[10px] text-indigo-700 opacity-80">{financialSummary.shippedCount} طلبات</span>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <span className="text-[10px] text-blue-800 font-bold block mb-1">قيد التوصيل</span>
            <span className="text-sm font-extrabold text-blue-950 block">{formatMAD(financialSummary.preDeliveryInTransit)}</span>
            <span className="text-[10px] text-blue-700 opacity-80">{financialSummary.inTransitCount} طلبات</span>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
            <span className="text-[10px] text-rose-800 font-bold block mb-1">فشل التوصيل</span>
            <span className="text-sm font-extrabold text-rose-950 block">{formatMAD(financialSummary.preDeliveryFailed)}</span>
            <span className="text-[10px] text-rose-700 opacity-80">{financialSummary.failedCount} طلبات</span>
          </div>

          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-700 font-bold block mb-1">الطلبات الملغاة</span>
            <span className="text-sm font-extrabold text-slate-800 block">{formatMAD(financialSummary.preDeliveryCancelled)}</span>
            <span className="text-[10px] text-slate-500 opacity-80">{financialSummary.cancelledCount} طلبات</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Sales Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800">تطور المبيعات والمبالغ المحصلة (MAD)</h3>
              <p className="text-[11px] text-slate-400">مقارنة المبيعات الفعلية مع المبالغ المحصلة حسب الأيام</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
              تحديث مباشر
            </span>
          </div>

          <div className="h-64 w-full">
            {salesTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val: any) => [`${val} MAD`, '']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="sales" name="المبيعات الفعلية (MAD)" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                  <Area type="monotone" dataKey="collected" name="المبالغ المحصلة (MAD)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#collGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                لا توجد بيانات كافية لعرض الرسم البياني
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Order Status Distribution (Pie Chart) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800">توزيع حالات الطلبات</h3>
            <p className="text-[11px] text-slate-400">نسبة كل حالة من إجمالي الطلبات</p>
          </div>

          <div className="h-56 w-full">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                لا توجد طلبات مسجلة
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 15: Accounts Analysis Table (جدول تحليل الحسابات) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-extrabold text-slate-800">
              جدول تحليل حسابات الإرسال الخمسة (Sending Accounts Performance)
            </h3>
          </div>
          <button
            onClick={() => setActiveView('accounts')}
            className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>عرض تفاصيل الحسابات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-start">الحساب</th>
                <th className="p-3 text-center">الطلبات</th>
                <th className="p-3 text-center text-emerald-700">تم التوصيل</th>
                <th className="p-3 text-center text-rose-700">فشل</th>
                <th className="p-3 text-center text-amber-700">المرتجعات</th>
                <th className="p-3 text-start">المبيعات (MAD)</th>
                <th className="p-3 text-start text-emerald-700">المحصل (MAD)</th>
                <th className="p-3 text-start text-amber-700">غير المحصل (MAD)</th>
                <th className="p-3 text-start text-indigo-700 font-extrabold">المحول (MAD)</th>
                <th className="p-3 text-center">نسبة النجاح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {accountsTableData.map((acc, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{acc.accountName}</span>
                  </td>
                  <td className="p-3 text-center font-bold">{acc.totalOrders}</td>
                  <td className="p-3 text-center font-semibold text-emerald-700">{acc.delivered}</td>
                  <td className="p-3 text-center font-semibold text-rose-700">{acc.failed}</td>
                  <td className="p-3 text-center font-semibold text-amber-700">{acc.returns}</td>
                  <td className="p-3 font-semibold">{formatMAD(acc.sales)}</td>
                  <td className="p-3 font-semibold text-emerald-800">{formatMAD(acc.collected)}</td>
                  <td className="p-3 font-semibold text-amber-800">{formatMAD(acc.uncollected)}</td>
                  <td className="p-3 font-black text-indigo-800 bg-indigo-50/40">{formatMAD(acc.transferred)}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        acc.successRate >= 70
                          ? 'bg-emerald-100 text-emerald-800'
                          : acc.successRate >= 40
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {acc.successRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Delivery Partners & Return Reasons Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Section 16: Delivery Companies Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-extrabold text-slate-800">
                تحليل أداء شركات التوصيل (Delivery Partners)
              </h3>
            </div>
            <button
              onClick={() => setActiveView('delivery_companies')}
              className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              عرض الكل
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-start">شركة التوصيل</th>
                  <th className="p-3 text-center">الطلبات</th>
                  <th className="p-3 text-center text-emerald-700">تم التوصيل</th>
                  <th className="p-3 text-center text-rose-700">فشل</th>
                  <th className="p-3 text-center text-amber-700">مرتجعات</th>
                  <th className="p-3 text-center">نسبة النجاح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deliveryTableData.map((carrier, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{carrier.companyName}</td>
                    <td className="p-3 text-center font-bold">{carrier.totalOrders}</td>
                    <td className="p-3 text-center font-semibold text-emerald-700">{carrier.delivered}</td>
                    <td className="p-3 text-center font-semibold text-rose-700">{carrier.failed}</td>
                    <td className="p-3 text-center font-semibold text-amber-700">{carrier.returns}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          carrier.successRate >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : carrier.successRate >= 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {carrier.successRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 17: Return Reasons Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-extrabold text-slate-800">
                تحليل أسباب المرتجعات (Return Reasons Breakdown)
              </h3>
            </div>
            <button
              onClick={() => setActiveView('returns')}
              className="text-xs text-rose-700 font-bold hover:underline cursor-pointer"
            >
              إدارة المرتجعات
            </button>
          </div>

          <div className="p-4">
            {returnReasonsData.length > 0 ? (
              <div className="space-y-3">
                {returnReasonsData.map((item, index) => (
                  <div key={index} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{item.reason}</span>
                      <span className="font-bold text-slate-600">
                        {item.count} حالة ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span>لا توجد مرتجعات مسجلة في الوقت الحالي</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 37: Recent Orders List (آخر الطلبات) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-800">أحدث الطلبات المسجلة في النظام</h3>
            <p className="text-[11px] text-slate-400">آخر العمليات والتحديثات المباشرة</p>
          </div>
          <button
            onClick={() => setActiveView('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            عرض الكل &larr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-start">رقم الطلب</th>
                <th className="p-3 text-start">التاريخ</th>
                <th className="p-3 text-start">العميل</th>
                <th className="p-3 text-start">المنتج</th>
                <th className="p-3 text-start">الإجمالي (COD)</th>
                <th className="p-3 text-start">حساب الإرسال</th>
                <th className="p-3 text-start">شركة التوصيل</th>
                <th className="p-3 text-center">حالة التوصيل</th>
                <th className="p-3 text-center">حالة التحصيل</th>
                <th className="p-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentOrders.map((order) => {
                const total = calculateOrderGrandTotal(order);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="p-3 text-slate-500">{order.date}</td>
                    <td className="p-3 font-semibold text-slate-800">{order.customerName}</td>
                    <td className="p-3 text-slate-600 truncate max-w-[140px]">{order.productName}</td>
                    <td className="p-3 font-black text-emerald-800">{formatMAD(total)}</td>
                    <td className="p-3 text-[11px] font-bold text-purple-900">{order.account}</td>
                    <td className="p-3 text-slate-700">{order.deliveryCompany}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          order.deliveryStatus === 'تم التوصيل'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.deliveryStatus === 'قيد التوصيل'
                            ? 'bg-blue-100 text-blue-800'
                            : order.deliveryStatus === 'فشل التوصيل'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.deliveryStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          order.collectionStatus === 'محصل'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.collectionStatus === 'دفع مسبق'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.collectionStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="تفاصيل الطلب"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

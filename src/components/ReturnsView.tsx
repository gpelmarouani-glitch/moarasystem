import React, { useState } from 'react';
import {
  RotateCcw,
  PlusCircle,
  AlertTriangle,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Trash2,
  Eye,
  Edit,
  BadgeAlert,
  Percent,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateOrderGrandTotal, formatMAD } from '../utils/calculations';
import { exportOrdersToExcel } from '../utils/exportImport';

export const ReturnsView: React.FC = () => {
  const {
    orders,
    returnReasons,
    addReturnReason,
    deleteReturnReason,
    viewOrderDetails,
    openEditOrderModal,
    t,
  } = useApp();

  const [newReason, setNewReason] = useState('');
  const [search, setSearch] = useState('');

  // Filter orders that have return status active
  const returnedOrders = orders.filter(
    (o) =>
      o.returnStatus !== 'لا يوجد إرجاع' &&
      (o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (o.returnReason || '').toLowerCase().includes(search.toLowerCase()))
  );

  const totalReturnOrders = returnedOrders.length;
  const totalReturnAmount = returnedOrders.reduce((sum, o) => {
    return sum + (o.returnAmount || (o.returnStatus === 'تم الإرجاع' ? calculateOrderGrandTotal(o) : 0));
  }, 0);

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) return;
    addReturnReason(newReason.trim());
    setNewReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-600" />
            <span>إدارة المرتجعات وأسباب الإرجاع (Returns Management)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تتبع الشحنات المرتجعة، حصر التكاليف المخصومة من المبيعات، وتحليل أسباب الرفض
          </p>
        </div>

        <button
          onClick={() => exportOrdersToExcel(returnedOrders)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-rose-600" />
          <span>تصدير تقرير المرتجعات</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-xs font-bold text-rose-700 block mb-1">إجمالي طلبات المرتجعات</span>
          <span className="text-2xl font-black text-rose-950">{totalReturnOrders} طلب</span>
          <span className="text-[10px] text-rose-600 block mt-1">
            {orders.length > 0 ? `${Math.round((totalReturnOrders / orders.length) * 100)}% من إجمالي الطلبات` : '0%'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-bold text-amber-700 block mb-1">إجمالي المبالغ المخصومة كمرتجع</span>
          <span className="text-2xl font-black text-amber-950">{formatMAD(totalReturnAmount)}</span>
          <span className="text-[10px] text-amber-700 block mt-1">تُخصم من إجمالي المبيعات لحساب صافي القيمة</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-xs font-bold text-slate-400 block mb-1">قاعدة صافي القيمة (Net Value Rule)</span>
          <div className="text-xs text-emerald-400 font-mono font-bold mt-1">
            صافي القيمة = المبيعات (تم التوصيل) - المرتجعات
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">مطبقة تلقائياً بدون تدخل يدوي</span>
        </div>
      </div>

      {/* Grid: Return Reasons List & Returns Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Return Reasons Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-800">قائمة أسباب الإرجاع المعتمدة</h3>
            <p className="text-[11px] text-slate-400">تظهر في القائمة المنسدلة عند تسجيل إرجاع</p>
          </div>

          <form onSubmit={handleAddReason} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="إضافة سبب إرجاع جديد..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              + إضافة
            </button>
          </form>

          <div className="space-y-2">
            {returnReasons.map((r) => (
              <div
                key={r.id}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-800">{r.reason}</span>
                <button
                  onClick={() => deleteReturnReason(r.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="حذف هذا السبب"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Returned Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold text-slate-800">
              سجل الطلبات المرتجعة ({returnedOrders.length})
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث في المرتجعات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg ps-8 pe-3 py-1.5 text-xs text-slate-800 w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-start">رقم الطلب</th>
                  <th className="p-3 text-start">العميل</th>
                  <th className="p-3 text-start">سبب الإرجاع</th>
                  <th className="p-3 text-start">مبلغ المرتجع</th>
                  <th className="p-3 text-center">حالة الإرجاع</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {returnedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      لا توجد طلبات مرتجعة حالياً
                    </td>
                  </tr>
                ) : (
                  returnedOrders.map((order) => {
                    const total = calculateOrderGrandTotal(order);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{order.customerName}</div>
                          <div className="text-[10px] text-slate-400">{order.customerCity}</div>
                        </td>
                        <td className="p-3 text-rose-800 font-medium">{order.returnReason || 'غير محدد'}</td>
                        <td className="p-3 font-bold text-rose-700">
                          {formatMAD(order.returnAmount || total)}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
                            {order.returnStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => viewOrderDetails(order)}
                              className="p-1 text-slate-500 hover:text-emerald-700 rounded"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditOrderModal(order)}
                              className="p-1 text-slate-500 hover:text-blue-700 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

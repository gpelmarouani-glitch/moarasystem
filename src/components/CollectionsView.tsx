import React, { useState } from 'react';
import {
  BadgeDollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileSpreadsheet,
  Search,
  ArrowRightLeft,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateOrderGrandTotal, formatMAD } from '../utils/calculations';
import { exportOrdersToExcel } from '../utils/exportImport';

export const CollectionsView: React.FC = () => {
  const {
    orders,
    financialSummary,
    deliveryCompanies,
    accounts,
    updateOrder,
    bulkUpdateCollectionStatus,
    t,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Delivered but uncollected orders (Money waiting to be remitted by delivery carriers)
  const uncollectedDeliveredOrders = orders.filter((o) => {
    const isUncollected = o.collectionStatus === 'غير محصل';
    const isDelivered = o.deliveryStatus === 'تم التوصيل';
    const matchesComp = selectedCompany === 'all' || o.deliveryCompany === selectedCompany;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber || '').toLowerCase().includes(search.toLowerCase());

    return isUncollected && isDelivered && matchesComp && matchesSearch;
  });

  const totalWaitingFromCarriers = uncollectedDeliveredOrders.reduce((sum, o) => {
    return sum + calculateOrderGrandTotal(o);
  }, 0);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(uncollectedDeliveredOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggle = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMarkCollected = () => {
    if (selectedOrderIds.length === 0) return;
    bulkUpdateCollectionStatus(selectedOrderIds, 'محصل');
    setSelectedOrderIds([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
            <span>إدارة التحصيلات المالية والتسويات (Collections & COD Reconciliation)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة المبالغ المحصلة، المستحقات لدى شركات التوصيل، وتأكيد استلام أموال الدفع عند الاستلام
          </p>
        </div>

        <button
          onClick={() => exportOrdersToExcel(orders.filter((o) => o.collectionStatus === 'غير محصل'))}
          className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>تصدير كشف المستحقات غير المحصلة</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 block mb-1">المبلغ المحصل نقدياً</span>
          <span className="text-xl font-black text-emerald-950">{formatMAD(financialSummary.totalCollected)}</span>
          <span className="text-[10px] text-emerald-600 block mt-1">تم تأكيد استلامه في النظام</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <span className="text-xs font-bold text-amber-800 block mb-1">المبلغ غير المحصل (مع الشركات)</span>
          <span className="text-xl font-black text-amber-950">{formatMAD(financialSummary.totalUncollected)}</span>
          <span className="text-[10px] text-amber-700 block mt-1">أموال بانتظار التحويل البنكي</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <span className="text-xs font-bold text-indigo-700 block mb-1">المبالغ المحولة للشركة</span>
          <span className="text-xl font-black text-indigo-950">{formatMAD(financialSummary.totalTransferred)}</span>
          <span className="text-[10px] text-indigo-600 block mt-1">تحويلات بنكية مسجلة</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-xs font-bold text-slate-400 block mb-1">صافي التحصيل (Net Collected)</span>
          <span className="text-xl font-black text-emerald-400">{formatMAD(financialSummary.netCollected)}</span>
          <span className="text-[10px] text-slate-400 block mt-1">المحصل نقدياً - المرتجعات</span>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>مستحقات الطلبات المسلمة المعلقة لدى شركات التوصيل ({uncollectedDeliveredOrders.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              إجمالي المعلق: <strong className="text-amber-800">{formatMAD(totalWaitingFromCarriers)}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-lg p-1.5 text-slate-800"
            >
              <option value="all">جميع شركات التوصيل</option>
              {deliveryCompanies.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="بحث برقم الطلب أو العميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-800 w-44"
            />
          </div>
        </div>

        {/* Action bar for selected */}
        {selectedOrderIds.length > 0 && (
          <div className="p-3 bg-emerald-900 text-white flex items-center justify-between text-xs px-4">
            <span className="font-bold">تم تحديد {selectedOrderIds.length} طلب</span>
            <button
              onClick={handleBulkMarkCollected}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
            >
              ✓ تأكيد استلام التحصيل للمحدد (تسوية نقدية)
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-center w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrderIds.length > 0 &&
                      selectedOrderIds.length === uncollectedDeliveredOrders.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                </th>
                <th className="p-3 text-start">رقم الطلب</th>
                <th className="p-3 text-start">التاريخ</th>
                <th className="p-3 text-start">العميل والمدينة</th>
                <th className="p-3 text-start">شركة التوصيل</th>
                <th className="p-3 text-start">حساب الإرسال</th>
                <th className="p-3 text-start">المبلغ المطلوب (COD)</th>
                <th className="p-3 text-center">إجراء التسوية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {uncollectedDeliveredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    <span className="font-semibold">جميع الطلبات المسلمة محصلة ومسواة بالكامل!</span>
                  </td>
                </tr>
              ) : (
                uncollectedDeliveredOrders.map((order) => {
                  const grandTotal = calculateOrderGrandTotal(order);
                  const isSelected = selectedOrderIds.includes(order.id);

                  return (
                    <tr key={order.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(order.id)}
                          className="rounded border-slate-300 text-emerald-600"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                      <td className="p-3 text-slate-500">{order.date}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400">{order.customerCity}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-700">{order.deliveryCompany}</td>
                      <td className="p-3 text-[11px] font-bold text-purple-900">{order.account}</td>
                      <td className="p-3 font-black text-emerald-800">{formatMAD(grandTotal)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => updateOrder(order.id, { collectionStatus: 'محصل' })}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          تأكيد التحصيل ✓
                        </button>
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
  );
};

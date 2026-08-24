import React, { useState } from 'react';
import {
  Truck,
  PlusCircle,
  Phone,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDeliveryCompanyStats, formatMAD } from '../utils/calculations';

export const DeliveryCompaniesView: React.FC = () => {
  const { deliveryCompanies, orders, addDeliveryCompany, setFilters, setActiveView, t } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fee, setFee] = useState<string | number>('29');
  const [trackingUrl, setTrackingUrl] = useState('');

  const companyStats = deliveryCompanies.map((comp) => ({
    ...comp,
    stats: calculateDeliveryCompanyStats(orders, comp.name),
  }));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addDeliveryCompany({
      name: name.trim(),
      phone: phone.trim(),
      defaultFee: typeof fee === 'number' ? fee : String(fee).trim(),
      trackingUrlTemplate: trackingUrl.trim(),
    });
    setName('');
    setPhone('');
    setFee('29');
    setTrackingUrl('');
    setIsAddModalOpen(false);
  };

  const handleFilterByCompany = (companyName: string) => {
    setFilters((prev) => ({ ...prev, deliveryCompany: companyName }));
    setActiveView('orders');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>إدارة ومتابعة شركات التوصيل (Delivery Carriers)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تحليل نسب نجاح التوصيل، متابعة الشحنات العالقة، وتكاليف النقل لكل شركة
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة شركة توصيل</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyStats.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-slate-900 text-base">{item.name}</h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    item.stats.successRate >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.stats.successRate >= 40
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {item.stats.successRate}% نسبة النجاح
                </span>
              </div>

              {item.phone && (
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span dir="ltr">{item.phone}</span>
                </div>
              )}

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 text-xs text-center mb-4">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">إجمالي الطلبات</span>
                  <span className="font-bold text-slate-900 text-sm">{item.stats.totalOrders}</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <span className="text-[10px] text-emerald-700 block">تم التوصيل</span>
                  <span className="font-bold text-emerald-800 text-sm">{item.stats.delivered}</span>
                </div>
                <div className="p-2 bg-rose-50 rounded-xl">
                  <span className="text-[10px] text-rose-700 block">فشل / مرتجع</span>
                  <span className="font-bold text-rose-800 text-sm">{item.stats.failed + item.stats.returns}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                <div className="flex justify-between">
                  <span>سعر التوصيل الافتراضي:</span>
                  <span className="font-bold text-slate-800">{item.defaultFee} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>قيمة الطلبات المسلمة:</span>
                  <span className="font-bold text-emerald-800">{formatMAD(item.stats.deliveredSalesValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>المستحقات غير المحصلة:</span>
                  <span className="font-bold text-amber-800">{formatMAD(item.stats.uncollectedAmount)}</span>
                </div>
              </div>
            </div>

            {/* Bottom button */}
            <button
              onClick={() => handleFilterByCompany(item.name)}
              className="w-full py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              عرض طلبات {item.name} &larr;
            </button>
          </div>
        ))}
      </div>

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 mb-3">إضافة شركة توصيل جديدة</h3>
            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">اسم شركة التوصيل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Sendit Express"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">رقم الهاتف أو خدمة العملاء</label>
                <input
                  type="tel"
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">تسعيرة التوصيل الافتراضية (MAD)</label>
                <input
                  type="text"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="29"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  حفظ الشركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

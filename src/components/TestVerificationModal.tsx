import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  CheckCheck,
  Calculator,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  calculateOrderGrandTotal,
  calculateOrderSubtotal,
  calculateOrderSalesValue,
  calculateOrderCollectedAmount,
  calculateFinancialSummary,
  formatMAD,
  parseDeliveryFee,
} from '../utils/calculations';
import { Order } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TestVerificationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [customQty, setCustomQty] = useState<number>(2);
  const [customPrice, setCustomPrice] = useState<number>(150);
  const [customDelivery, setCustomDelivery] = useState<string>('29');
  const [customStatus, setCustomStatus] = useState<'قيد التوصيل' | 'تم التوصيل' | 'قيد التحضير'>('تم التوصيل');
  const [customCollection, setCustomCollection] = useState<'غير محصل' | 'محصل' | 'دفع مسبق'>('محصل');
  const [customReturnAmt, setCustomReturnAmt] = useState<number>(0);

  if (!isOpen) return null;

  // Execute the 7 official test cases
  const t1Order: Pick<Order, 'quantity' | 'unitPrice' | 'deliveryFee'> = {
    quantity: 2,
    unitPrice: 100,
    deliveryFee: 29,
  };
  const t1Total = calculateOrderGrandTotal(t1Order);
  const t1Pass = t1Total === 229;

  const t2Order: Pick<Order, 'quantity' | 'unitPrice' | 'deliveryFee'> = {
    quantity: 2,
    unitPrice: 100,
    deliveryFee: 'مجاني',
  };
  const t2Total = calculateOrderGrandTotal(t2Order);
  const t2Pass = t2Total === 200;

  const t3MockOrder: Order = {
    id: 'test_3',
    orderNumber: 'T3',
    date: '2026-08-24',
    customerName: 'Test 3',
    customerPhone: '0600000000',
    customerCity: 'Casa',
    productName: 'Item',
    productSku: 'SKU',
    quantity: 1,
    unitPrice: 500,
    account: 'PARAMEDICALmparaOSJ',
    deliveryCompany: 'Cathedis',
    trackingNumber: 'TRK',
    deliveryFee: 0,
    deliveryStatus: 'قيد التوصيل',
    returnStatus: 'لا يوجد إرجاع',
    collectionStatus: 'غير محصل',
    timeline: [],
    createdAt: '',
    updatedAt: '',
  };
  const t3Sales = calculateOrderSalesValue(t3MockOrder);
  const t3Pass = t3Sales === 0;

  const t4MockOrder: Order = {
    ...t3MockOrder,
    deliveryStatus: 'تم التوصيل',
  };
  const t4Sales = calculateOrderSalesValue(t4MockOrder);
  const t4Pass = t4Sales === 500;

  const t5MockOrder: Order = {
    ...t3MockOrder,
    deliveryStatus: 'تم التوصيل',
    collectionStatus: 'غير محصل',
  };
  const t5Sales = calculateOrderSalesValue(t5MockOrder);
  const t5Collected = calculateOrderCollectedAmount(t5MockOrder);
  const t5Pass = t5Sales === 500 && t5Collected === 0;

  const t6MockOrder: Order = {
    ...t3MockOrder,
    deliveryStatus: 'تم التوصيل',
    collectionStatus: 'محصل',
  };
  const t6Sales = calculateOrderSalesValue(t6MockOrder);
  const t6Collected = calculateOrderCollectedAmount(t6MockOrder);
  const t6Pass = t6Sales === 500 && t6Collected === 500;

  const t7Summary = calculateFinancialSummary([
    {
      ...t3MockOrder,
      deliveryStatus: 'تم التوصيل',
      returnStatus: 'تم الإرجاع',
      returnAmount: 500,
      collectionStatus: 'محصل',
    },
  ]);
  const t7NetValue = t7Summary.netValue;
  const t7Pass = t7NetValue === 0 && t7Summary.grossSalesValue === 500 && t7Summary.totalReturnAmount === 500;

  const allPassed = t1Pass && t2Pass && t3Pass && t4Pass && t5Pass && t6Pass && t7Pass;

  // Custom interactive test result
  const customOrder: Order = {
    ...t3MockOrder,
    quantity: customQty,
    unitPrice: customPrice,
    deliveryFee: customDelivery,
    deliveryStatus: customStatus,
    collectionStatus: customCollection,
    returnStatus: customReturnAmt > 0 ? 'تم الإرجاع' : 'لا يوجد إرجاع',
    returnAmount: customReturnAmt,
  };
  const customGrandTotal = calculateOrderGrandTotal(customOrder);
  const customSalesVal = calculateOrderSalesValue(customOrder);
  const customCollectedVal = calculateOrderCollectedAmount(customOrder);
  const customNetVal = Math.max(0, customSalesVal - (customOrder.returnAmount || 0));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">فحص اختبارات القواعد المالية السبعة (Tests 1-7)</h3>
              <p className="text-xs text-emerald-200/80">التحقق الصارم من المعادلات الحسابية المعتمدة لشركة MPARA SARL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                allPassed ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-500 text-white'
              }`}
            >
              {allPassed ? <CheckCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {allPassed ? '7 / 7 ناجحة 100%' : 'فشل بعض الاختبارات'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Test Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Test 1 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">اختبار 1: حساب الإجمالي مع توصيل عادي</span>
                {t1Pass ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ناجح
                  </span>
                ) : (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">راسب</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                الكمية: 2 | السعر: 100 MAD | التوصيل: 29 MAD
              </p>
              <div className="text-xs font-mono font-bold text-emerald-700 bg-white border border-slate-200 p-2 rounded-lg">
                الإجمالي = {t1Total} MAD (المتوقع: 229 MAD)
              </div>
            </div>

            {/* Test 2 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">اختبار 2: التوصيل مجاني</span>
                {t2Pass ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ناجح
                  </span>
                ) : (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">راسب</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                الكمية: 2 | السعر: 100 MAD | التوصيل: &quot;مجاني&quot; (0)
              </p>
              <div className="text-xs font-mono font-bold text-emerald-700 bg-white border border-slate-200 p-2 rounded-lg">
                الإجمالي = {t2Total} MAD (المتوقع: 200 MAD)
              </div>
            </div>

            {/* Test 3 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">اختبار 3: مبيعات قيد التوصيل</span>
                {t3Pass ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ناجح
                  </span>
                ) : (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">راسب</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                حالة الطلب: &quot;قيد التوصيل&quot; (قيمة الطلب 500)
              </p>
              <div className="text-xs font-mono font-bold text-emerald-700 bg-white border border-slate-200 p-2 rounded-lg">
                قيمة المبيعات = {t3Sales} MAD (المتوقع: 0 MAD)
              </div>
            </div>

            {/* Test 4 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">اختبار 4: مبيعات تم التوصيل</span>
                {t4Pass ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ناجح
                  </span>
                ) : (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">راسب</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                حالة الطلب: &quot;تم التوصيل&quot; (قيمة الطلب 500)
              </p>
              <div className="text-xs font-mono font-bold text-emerald-700 bg-white border border-slate-200 p-2 rounded-lg">
                قيمة المبيعات = {t4Sales} MAD (المتوقع: 500 MAD)
              </div>
            </div>

            {/* Test 5 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">اختبار 5: تم التوصيل + غير محصل</span>
                {t5Pass ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ناجح
                  </span>
                ) : (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">راسب</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                التوصيل: &quot;تم التوصيل&quot; | التحصيل: &quot;غير محصل&quot;
              </p>
              <div className="text-xs font-mono font-bold text-emerald-700 bg-white border border-slate-200 p-2 rounded-lg flex justify-between">
                <span>المبيعات: {t5Sales} MAD</span>
                <span className="text-amber-700">المحصل: {t5Collected} MAD</span>
              </div>
            </div>

            {/* Test 6 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">اختبار 6: تم التوصيل + محصل</span>
                {t6Pass ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ناجح
                  </span>
                ) : (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">راسب</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                التوصيل: &quot;تم التوصيل&quot; | التحصيل: &quot;محصل&quot;
              </p>
              <div className="text-xs font-mono font-bold text-emerald-700 bg-white border border-slate-200 p-2 rounded-lg flex justify-between">
                <span>المبيعات: {t6Sales} MAD</span>
                <span>المحصل: {t6Collected} MAD</span>
              </div>
            </div>

            {/* Test 7 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">اختبار 7: صافي القيمة بعد الإرجاع الكامل</span>
                {t7Pass ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ناجح
                  </span>
                ) : (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">راسب</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mb-1">
                المبيعات = 500 MAD | المرتجع = 500 MAD | المعادلة: صافي القيمة = المبيعات - المرتجعات
              </p>
              <div className="text-xs font-mono font-bold text-emerald-700 bg-white border border-slate-200 p-2 rounded-lg flex justify-between">
                <span>المبيعات: 500 MAD</span>
                <span className="text-rose-700">المرتجع: 500 MAD</span>
                <span className="text-indigo-700 font-extrabold">صافي القيمة = {t7NetValue} MAD (المتوقع: 0 MAD)</span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Playground */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs text-emerald-300">مختبر الحسابات التفاعلي المباشر (Live Sandbox)</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">الكمية</label>
                <input
                  type="number"
                  value={customQty}
                  onChange={(e) => setCustomQty(Number(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">ثمن الوحدة</label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">التوصيل (رقم أو مجاني)</label>
                <input
                  type="text"
                  value={customDelivery}
                  onChange={(e) => setCustomDelivery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">حالة التوصيل</label>
                <select
                  value={customStatus}
                  onChange={(e: any) => setCustomStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                >
                  <option value="تم التوصيل">تم التوصيل</option>
                  <option value="قيد التوصيل">قيد التوصيل</option>
                  <option value="قيد التحضير">قيد التحضير</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">حالة التحصيل</label>
                <select
                  value={customCollection}
                  onChange={(e: any) => setCustomCollection(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                >
                  <option value="محصل">محصل</option>
                  <option value="غير محصل">غير محصل</option>
                  <option value="دفع مسبق">دفع مسبق</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">مبلغ الإرجاع</label>
                <input
                  type="number"
                  value={customReturnAmt}
                  onChange={(e) => setCustomReturnAmt(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                />
              </div>
            </div>

            {/* Sandbox Live Output */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-3 border-t border-slate-800">
              <div className="bg-slate-800/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400">الإجمالي الكلي:</span>
                <div className="font-bold text-white text-sm">{formatMAD(customGrandTotal)}</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400">المبيعات الفعلية:</span>
                <div className="font-bold text-emerald-400 text-sm">{formatMAD(customSalesVal)}</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400">المبلغ المحصل:</span>
                <div className="font-bold text-cyan-400 text-sm">{formatMAD(customCollectedVal)}</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400">صافي القيمة:</span>
                <div className="font-bold text-amber-400 text-sm">{formatMAD(customNetVal)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            إغلاق نافذة الفحص
          </button>
        </div>
      </div>
    </div>
  );
};

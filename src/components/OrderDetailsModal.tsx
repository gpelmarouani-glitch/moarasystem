import React, { useState } from 'react';
import {
  X,
  Printer,
  Edit,
  Trash2,
  Phone,
  MessageSquare,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  BadgeDollarSign,
  AlertTriangle,
  Building2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateOrderGrandTotal,
  calculateOrderSubtotal,
  calculateOrderSalesValue,
  calculateOrderCollectedAmount,
  calculateOrderReturnAmount,
  formatMAD,
  parseDeliveryFee,
} from '../utils/calculations';
import { printOrderInvoice } from '../utils/exportImport';
import { DeliveryStatus, CollectionStatus, ReturnStatus } from '../types';

export const OrderDetailsModal: React.FC = () => {
  const {
    selectedOrder,
    closeOrderDetails,
    openEditOrderModal,
    deleteOrder,
    updateOrder,
    currentUser,
    t,
  } = useApp();

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!selectedOrder) return null;

  const grandTotal = calculateOrderGrandTotal(selectedOrder);
  const subtotal = calculateOrderSubtotal(selectedOrder.quantity, selectedOrder.unitPrice);
  const salesValue = calculateOrderSalesValue(selectedOrder);
  const collectedAmount = calculateOrderCollectedAmount(selectedOrder);
  const returnAmt = calculateOrderReturnAmount(selectedOrder);

  // Generate WhatsApp message
  const handleWhatsApp = () => {
    let phone = selectedOrder.customerPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '212' + phone.substring(1);
    }
    const message = encodeURIComponent(
      `السلام عليكم ${selectedOrder.customerName}،\nمعكم شركة MPARA SARL بخصوص طلبكم رقم ${selectedOrder.orderNumber} (${selectedOrder.productName}).\nالمبلغ الإجمالي المطلوب عند الاستلام: ${grandTotal} MAD.\nشركة التوصيل: ${selectedOrder.deliveryCompany} (تتبع: ${selectedOrder.trackingNumber || 'قيد المعالجة'}).\nشكراً لثقتكم بنا! www.mpara.ma`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleQuickDeliveryStatus = (status: DeliveryStatus) => {
    updateOrder(selectedOrder.id, { deliveryStatus: status });
  };

  const handleQuickCollectionStatus = (status: CollectionStatus) => {
    updateOrder(selectedOrder.id, { collectionStatus: status });
  };

  const handleDelete = () => {
    deleteOrder(selectedOrder.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
              MP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">{selectedOrder.orderNumber}</h3>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    selectedOrder.deliveryStatus === 'تم التوصيل'
                      ? 'bg-emerald-400 text-emerald-950'
                      : selectedOrder.deliveryStatus === 'قيد التوصيل'
                      ? 'bg-blue-400 text-blue-950'
                      : selectedOrder.deliveryStatus === 'فشل التوصيل'
                      ? 'bg-rose-400 text-rose-950'
                      : 'bg-amber-400 text-amber-950'
                  }`}
                >
                  {selectedOrder.deliveryStatus}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">تاريخ الطلب: {selectedOrder.date}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => printOrderInvoice(selectedOrder)}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title={t.print}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{t.print}</span>
            </button>

            <button
              onClick={() => {
                closeOrderDetails();
                openEditOrderModal(selectedOrder);
              }}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">{t.edit}</span>
            </button>

            <button
              onClick={closeOrderDetails}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Key Financial Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">الإجمالي المطلوب (COD)</span>
              <span className="text-base font-black text-slate-900">{formatMAD(grandTotal)}</span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[11px] text-emerald-700 font-semibold block mb-1">المبيعات المحتسبة</span>
              <span className="text-base font-black text-emerald-800">
                {salesValue > 0 ? formatMAD(salesValue) : '0.00 MAD'}
              </span>
              <span className="text-[9px] text-emerald-600 block mt-0.5">
                {selectedOrder.deliveryStatus === 'تم التوصيل' ? '✓ تم التوصيل' : '0 (لم يتم التوصيل بعد)'}
              </span>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[11px] text-blue-700 font-semibold block mb-1">حالة التحصيل المالي</span>
              <span className="text-base font-black text-blue-800">{formatMAD(collectedAmount)}</span>
              <span className="text-[9px] text-blue-600 block mt-0.5">
                {selectedOrder.collectionStatus === 'محصل' ? '✓ محصل فعلياً' : 'غير محصل'}
              </span>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-[11px] text-purple-700 font-semibold block mb-1">حساب الإرسال</span>
              <span className="text-xs font-bold text-purple-900 block truncate" title={selectedOrder.account}>
                {selectedOrder.account}
              </span>
              <span className="text-[9px] text-purple-600 block mt-0.5">شركة: {selectedOrder.deliveryCompany}</span>
            </div>
          </div>

          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-800">بيانات العميل والتواصل</span>
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.sendWhatsApp}</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">اسم العميل:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الهاتف:</span>
                  <a href={`tel:${selectedOrder.customerPhone}`} className="font-mono font-bold text-emerald-700 hover:underline" dir="ltr">
                    {selectedOrder.customerPhone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المدينة:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.customerCity}</span>
                </div>
                {selectedOrder.customerAddress && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">العنوان:</span>
                    <span className="text-slate-700 max-w-[200px] text-end">{selectedOrder.customerAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping & Account Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-800">بيانات الشحن والتتبع</span>
                <span className="text-[11px] font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  تتبع: {selectedOrder.trackingNumber || 'غير متوفر'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">حساب الإرسال:</span>
                  <span className="font-bold text-emerald-800">{selectedOrder.account}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">شركة التوصيل:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.deliveryCompany}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">سعر التوصيل:</span>
                  <span className="font-semibold text-slate-800">
                    {typeof selectedOrder.deliveryFee === 'number'
                      ? `${selectedOrder.deliveryFee} MAD`
                      : selectedOrder.deliveryFee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">حالة الإرجاع:</span>
                  <span
                    className={`font-bold ${
                      selectedOrder.returnStatus !== 'لا يوجد إرجاع' ? 'text-rose-600' : 'text-slate-600'
                    }`}
                  >
                    {selectedOrder.returnStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div>
            <div className="font-bold text-xs text-slate-800 mb-2">المنتج والتسعير</div>
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-start">المنتج</th>
                    <th className="p-3 text-start">SKU</th>
                    <th className="p-3 text-center">الكمية</th>
                    <th className="p-3 text-start">ثمن الوحدة</th>
                    <th className="p-3 text-start">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">{selectedOrder.productName}</td>
                    <td className="p-3 font-mono text-slate-500">{selectedOrder.productSku}</td>
                    <td className="p-3 text-center font-bold">{selectedOrder.quantity}</td>
                    <td className="p-3 font-semibold">{formatMAD(selectedOrder.unitPrice)}</td>
                    <td className="p-3 font-bold text-emerald-800">{formatMAD(subtotal)}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-end text-slate-600">مصاريف التوصيل:</td>
                    <td className="p-2.5 font-bold text-slate-800">{formatMAD(parseDeliveryFee(selectedOrder.deliveryFee))}</td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-950 font-black">
                    <td colSpan={4} className="p-3 text-end text-sm">الإجمالي الكلي (Grand Total):</td>
                    <td className="p-3 text-sm text-emerald-700">{formatMAD(grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Returns Section (if applicable) */}
          {selectedOrder.returnStatus !== 'لا يوجد إرجاع' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>تفاصيل الإرجاع</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-rose-800">
                <div>
                  <span className="opacity-75">سبب الإرجاع: </span>
                  <span className="font-bold">{selectedOrder.returnReason || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="opacity-75">مبلغ المرتجع: </span>
                  <span className="font-bold">{formatMAD(returnAmt)}</span>
                </div>
                <div>
                  <span className="opacity-75">تاريخ الإرجاع: </span>
                  <span className="font-bold">{selectedOrder.returnDate || 'اليوم'}</span>
                </div>
              </div>
              {selectedOrder.returnNotes && (
                <div className="text-slate-700 bg-white/80 p-2 rounded border border-rose-100">
                  {selectedOrder.returnNotes}
                </div>
              )}
            </div>
          )}

          {/* Quick Action Status Toggles */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="font-bold text-xs text-emerald-400">تحديث سريع للحالة (بنقرة واحدة)</div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleQuickDeliveryStatus('تم التوصيل')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedOrder.deliveryStatus === 'تم التوصيل'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ✓ تم التوصيل (مبيعات)
              </button>

              <button
                onClick={() => handleQuickDeliveryStatus('قيد التوصيل')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedOrder.deliveryStatus === 'قيد التوصيل'
                    ? 'bg-blue-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                قيد التوصيل
              </button>

              <button
                onClick={() => handleQuickDeliveryStatus('فشل التوصيل')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedOrder.deliveryStatus === 'فشل التوصيل'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                فشل التوصيل
              </button>

              <div className="w-px h-6 bg-slate-700 mx-1"></div>

              <button
                onClick={() => handleQuickCollectionStatus('محصل')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedOrder.collectionStatus === 'محصل'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                💰 تم التحصيل
              </button>

              <button
                onClick={() => handleQuickCollectionStatus('غير محصل')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedOrder.collectionStatus === 'غير محصل'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                غير محصل
              </button>
            </div>
          </div>

          {/* Timeline History */}
          <div>
            <div className="font-bold text-xs text-slate-800 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>الخط الزمني وسجل العمليات (Timeline)</span>
            </div>

            <div className="relative ps-6 space-y-4 before:content-[''] before:absolute before:start-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(selectedOrder.timeline || []).map((event) => (
                <div key={event.id} className="relative text-xs">
                  <div className="absolute -start-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{event.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{event.timestamp}</span>
                  </div>
                  {event.description && <p className="text-slate-600 text-[11px] mt-0.5">{event.description}</p>}
                  {event.user && <span className="text-[10px] text-emerald-700 font-medium">بواسطة: {event.user}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700 font-bold">تأكيد حذف الطلب؟</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  نعم، احذف
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف هذا الطلب</span>
              </button>
            )}
          </div>

          <button
            onClick={closeOrderDetails}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

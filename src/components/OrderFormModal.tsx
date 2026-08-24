import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  Save,
  Package,
  User,
  Truck,
  DollarSign,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  DeliveryStatus,
  ReturnStatus,
  CollectionStatus,
  Order,
} from '../types';
import {
  calculateOrderSubtotal,
  calculateOrderGrandTotal,
  parseDeliveryFee,
  formatMAD,
} from '../utils/calculations';

export const OrderFormModal: React.FC = () => {
  const {
    isOrderModalOpen,
    orderModalMode,
    editingOrder,
    closeOrderModal,
    addOrder,
    updateOrder,
    accounts,
    deliveryCompanies,
    products,
    returnReasons,
    settings,
    t,
  } = useApp();

  // Form states
  const [orderNumber, setOrderNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('الدار البيضاء');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const [productName, setProductName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(100);
  const [unitCost, setUnitCost] = useState<number>(50);

  const [account, setAccount] = useState('PARAMEDICALmparaOSJ');
  const [deliveryCompany, setDeliveryCompany] = useState('Cathedis');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<string | number>('29');

  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('قيد التحضير');
  const [returnStatus, setReturnStatus] = useState<ReturnStatus>('لا يوجد إرجاع');
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus>('غير محصل');

  const [returnReason, setReturnReason] = useState('');
  const [returnAmount, setReturnAmount] = useState<number>(0);
  const [returnNotes, setReturnNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Pre-fill on open or edit
  useEffect(() => {
    if (!isOrderModalOpen) return;

    if (orderModalMode === 'edit' && editingOrder) {
      setOrderNumber(editingOrder.orderNumber);
      setDate(editingOrder.date);
      setCustomerName(editingOrder.customerName);
      setCustomerPhone(editingOrder.customerPhone);
      setCustomerCity(editingOrder.customerCity);
      setCustomerAddress(editingOrder.customerAddress || '');
      setProductName(editingOrder.productName);
      setProductSku(editingOrder.productSku);
      setQuantity(editingOrder.quantity);
      setUnitPrice(editingOrder.unitPrice);
      setUnitCost(editingOrder.unitCost || 0);
      setAccount(editingOrder.account);
      setDeliveryCompany(editingOrder.deliveryCompany);
      setTrackingNumber(editingOrder.trackingNumber || '');
      setDeliveryFee(editingOrder.deliveryFee);
      setDeliveryStatus(editingOrder.deliveryStatus);
      setReturnStatus(editingOrder.returnStatus);
      setCollectionStatus(editingOrder.collectionStatus);
      setReturnReason(editingOrder.returnReason || '');
      setReturnAmount(editingOrder.returnAmount || 0);
      setReturnNotes(editingOrder.returnNotes || '');
      setNotes(editingOrder.notes || '');
    } else {
      // Auto-generate fresh unique order number
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setOrderNumber(`MP-${new Date().getFullYear()}-${randomSuffix}`);
      setDate(new Date().toISOString().split('T')[0]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCity('الدار البيضاء');
      setCustomerAddress('');
      
      if (products.length > 0) {
        setProductName(products[0].name);
        setProductSku(products[0].sku);
        setUnitPrice(products[0].price);
        setUnitCost(products[0].cost);
      } else {
        setProductName('');
        setProductSku('');
        setUnitPrice(100);
        setUnitCost(50);
      }

      setQuantity(1);
      setAccount(accounts[0]?.name || 'PARAMEDICALmparaOSJ');
      setDeliveryCompany(deliveryCompanies[0]?.name || 'Cathedis');
      setTrackingNumber('');
      setDeliveryFee(settings.defaultDeliveryFee || 29);
      setDeliveryStatus('قيد التحضير');
      setReturnStatus('لا يوجد إرجاع');
      setCollectionStatus('غير محصل');
      setReturnReason('');
      setReturnAmount(0);
      setReturnNotes('');
      setNotes('');
    }
    setFormError('');
  }, [isOrderModalOpen, orderModalMode, editingOrder]);

  if (!isOrderModalOpen) return null;

  // Real-time automatic calculations
  const currentSubtotal = calculateOrderSubtotal(quantity, unitPrice);
  const currentGrandTotal = calculateOrderGrandTotal({
    quantity,
    unitPrice,
    deliveryFee,
  });

  // Handle product select from dropdown
  const handleProductSelect = (sku: string) => {
    const selected = products.find((p) => p.sku === sku);
    if (selected) {
      setProductName(selected.name);
      setProductSku(selected.sku);
      setUnitPrice(selected.price);
      setUnitCost(selected.cost);
    }
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim() || !customerName.trim() || !customerPhone.trim() || !productName.trim()) {
      setFormError(t.errorRequiredFields);
      return;
    }

    const orderPayload = {
      orderNumber: orderNumber.trim(),
      date,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerCity: customerCity.trim(),
      customerAddress: customerAddress.trim(),
      productName: productName.trim(),
      productSku: productSku.trim() || 'SKU-GEN',
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 0,
      unitCost: Number(unitCost) || 0,
      account,
      deliveryCompany,
      trackingNumber: trackingNumber.trim(),
      deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : String(deliveryFee).trim(),
      deliveryStatus,
      returnStatus,
      collectionStatus,
      returnReason: returnStatus !== 'لا يوجد إرجاع' ? returnReason : undefined,
      returnAmount: returnStatus !== 'لا يوجد إرجاع' ? returnAmount : 0,
      returnNotes: returnStatus !== 'لا يوجد إرجاع' ? returnNotes : undefined,
      notes: notes.trim(),
    };

    if (orderModalMode === 'create') {
      addOrder(orderPayload);
    } else if (editingOrder) {
      updateOrder(editingOrder.id, orderPayload);
      closeOrderModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {orderModalMode === 'create' ? 'تسجيل طلب جديد في MPARA' : `تعديل الطلب: ${editingOrder?.orderNumber}`}
              </h3>
              <p className="text-xs text-emerald-200/80">
                الحسابات المالية مولدة ومحمية تلقائياً من النظام
              </p>
            </div>
          </div>

          <button
            onClick={closeOrderModal}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Order Meta & Customer Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-3 pb-1 border-b border-slate-200">
              <User className="w-4 h-4 text-emerald-600" />
              <span>بيانات الطلب والعميل</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.orderNumber} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.orderDate} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.customerName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يونس الإدريسي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.customerPhone} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="06XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.customerCity} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-600 font-semibold mb-1">{t.customerAddress}</label>
                <input
                  type="text"
                  placeholder="العنوان بالتفصيل، الحي، رقم العمارة أو الشارع..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product & Pricing */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-3 pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>بيانات المنتج والكميات</span>
              </div>
              {products.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] font-normal text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>اختيار من المخزون:</span>
                  <select
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded px-2 py-0.5 text-xs font-semibold"
                  >
                    <option value="">-- قائمة المنتجات --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.sku}>
                        {p.name} ({p.price} MAD)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
              <div className="lg:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.productName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.productSku}</label>
                <input
                  type="text"
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.quantity} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.unitPrice} (MAD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Shipping & Sending Accounts */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-3 pb-1 border-b border-slate-200">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>بيانات الشحن وحساب الإرسال</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.account} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-300 font-bold text-emerald-950 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.deliveryCompany} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={deliveryCompany}
                  onChange={(e) => setDeliveryCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 font-semibold text-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                >
                  {deliveryCompanies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.trackingNumber}</label>
                <input
                  type="text"
                  placeholder="رقم البوليصة والتتبع..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {t.deliveryFee} (رقم أو &quot;مجاني&quot;)
                </label>
                <input
                  type="text"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="29 أو مجاني"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Live Auto-Calculated Protected Summary */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
              <Calculator className="w-4 h-4" />
              <span>الحسابات المالية الآلية (محمية ومحسوبة تلقائياً)</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2.5 rounded-lg bg-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">مجموع المنتجات (الكمية × السعر)</span>
                <span className="font-extrabold text-sm text-slate-200">{formatMAD(currentSubtotal)}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-0.5">مصاريف الشحن</span>
                <span className="font-extrabold text-sm text-amber-400">
                  {parseDeliveryFee(deliveryFee) === 0 ? '0.00 MAD (مجاني)' : formatMAD(parseDeliveryFee(deliveryFee))}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40">
                <span className="text-[11px] text-emerald-300 block mb-0.5">الإجمالي الكلي المطلوب (COD)</span>
                <span className="font-black text-base text-emerald-400">{formatMAD(currentGrandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Statuses */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-3 pb-1 border-b border-slate-200">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>حالات التوصيل والتحصيل والمرتجع</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.deliveryStatus}</label>
                <select
                  value={deliveryStatus}
                  onChange={(e: any) => setDeliveryStatus(e.target.value)}
                  className={`w-full font-bold rounded-lg p-2 border ${
                    deliveryStatus === 'تم التوصيل'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : deliveryStatus === 'قيد التوصيل'
                      ? 'bg-blue-50 text-blue-900 border-blue-300'
                      : deliveryStatus === 'فشل التوصيل'
                      ? 'bg-rose-50 text-rose-900 border-rose-300'
                      : deliveryStatus === 'ملغى'
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  <option value="قيد التحضير">قيد التحضير</option>
                  <option value="تم الإرسال">تم الإرسال</option>
                  <option value="قيد التوصيل">قيد التوصيل</option>
                  <option value="تم التوصيل">تم التوصيل</option>
                  <option value="فشل التوصيل">فشل التوصيل</option>
                  <option value="ملغى">ملغى</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.collectionStatus}</label>
                <select
                  value={collectionStatus}
                  onChange={(e: any) => setCollectionStatus(e.target.value)}
                  className={`w-full font-bold rounded-lg p-2 border ${
                    collectionStatus === 'محصل'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : collectionStatus === 'دفع مسبق'
                      ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  <option value="غير محصل">غير محصل</option>
                  <option value="محصل">محصل</option>
                  <option value="دفع مسبق">دفع مسبق</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{t.returnStatus}</label>
                <select
                  value={returnStatus}
                  onChange={(e: any) => setReturnStatus(e.target.value)}
                  className={`w-full font-bold rounded-lg p-2 border ${
                    returnStatus === 'تم الإرجاع' || returnStatus === 'تم التعويض'
                      ? 'bg-rose-50 text-rose-900 border-rose-300'
                      : returnStatus !== 'لا يوجد إرجاع'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <option value="لا يوجد إرجاع">لا يوجد إرجاع</option>
                  <option value="طلب إرجاع">طلب إرجاع</option>
                  <option value="في طريق الإرجاع">في طريق الإرجاع</option>
                  <option value="تم الإرجاع">تم الإرجاع</option>
                  <option value="تم التعويض">تم التعويض</option>
                </select>
              </div>
            </div>

            {/* If return status active, show return reason and amount */}
            {returnStatus !== 'لا يوجد إرجاع' && (
              <div className="mt-3 p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
                <div>
                  <label className="block text-rose-900 font-semibold mb-1">{t.returnReason}</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-white border border-rose-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="">-- اختر سبب الإرجاع --</option>
                    {returnReasons.map((r) => (
                      <option key={r.id} value={r.reason}>
                        {r.reason}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-rose-900 font-semibold mb-1">{t.returnAmount} (MAD)</label>
                  <input
                    type="number"
                    value={returnAmount}
                    onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
                    placeholder="مبلغ الإرجاع المخصوم من صافي المبيعات"
                    className="w-full bg-white border border-rose-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Notes */}
          <div>
            <label className="block text-slate-600 font-semibold text-xs mb-1">{t.notes}</label>
            <textarea
              rows={2}
              placeholder="أي ملاحظات تخص وقت التسليم، تواصل العميل، أو شركة الشحن..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeOrderModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{orderModalMode === 'create' ? 'حفظ الطلب وتحديث الحسابات' : 'تحديث بيانات الطلب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

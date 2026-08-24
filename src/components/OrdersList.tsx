import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Truck,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Building2,
  DollarSign,
  AlertTriangle,
  UploadCloud,
  FileDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, DeliveryStatus, CollectionStatus, ReturnStatus } from '../types';
import {
  calculateOrderGrandTotal,
  calculateOrderSubtotal,
  formatMAD,
  parseDeliveryFee,
} from '../utils/calculations';
import {
  exportOrdersToExcel,
  exportOrdersToCSV,
  exportOrdersToPDF,
  printOrderInvoice,
  downloadOrdersImportTemplate,
} from '../utils/exportImport';
import { ExcelImportModal } from './ExcelImportModal';

export const OrdersList: React.FC = () => {
  const {
    filteredOrders,
    orders,
    accounts,
    deliveryCompanies,
    filters,
    setFilters,
    resetFilters,
    openNewOrderModal,
    openEditOrderModal,
    viewOrderDetails,
    deleteOrder,
    updateOrder,
    bulkUpdateDeliveryStatus,
    bulkUpdateCollectionStatus,
    t,
  } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Toggle selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleWhatsApp = (order: Order) => {
    let phone = order.customerPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '212' + phone.substring(1);
    const grandTotal = calculateOrderGrandTotal(order);
    const msg = encodeURIComponent(
      `السلام عليكم ${order.customerName}، معكم شركة MPARA بخصوص طلبكم ${order.orderNumber} (${order.productName}) بمبلغ إجمالي ${grandTotal} MAD. رقم التتبع: ${order.trackingNumber || 'قيد المعالجة'}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Header & Quick Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span>سجل وإدارة جميع الطلبات</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {filteredOrders.length} من {orders.length} طلب
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تتبع الشحنات، أرقام البوليصات، الحسابات المرسلة، والتحصيلات التلقائية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            id="btn-import-excel"
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="استيراد طلبات متعددة من ملف إكسيل (.xlsx أو .csv)"
          >
            <UploadCloud className="w-4 h-4" />
            <span>استيراد Excel</span>
          </button>

          {/* Download Official Template */}
          <button
            onClick={downloadOrdersImportTemplate}
            id="btn-download-template"
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="تحميل قالب إكسيل جاهز للملء"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>قالب Excel</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportOrdersToExcel(filteredOrders)}
            id="btn-export-excel"
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="تصدير النتائج إلى ملف Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => exportOrdersToCSV(filteredOrders)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="تصدير إلى CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportOrdersToPDF(filteredOrders)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="تصدير إلى PDF"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={openNewOrderModal}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newOrder}</span>
          </button>
        </div>
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Text search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="ابحث برقم الطلب، العميل، الهاتف، التتبع، المنتج، أو الحساب..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                showAdvancedFilters
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>فلاتر متقدمة</span>
            </button>

            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-2 cursor-pointer"
            >
              إعادة ضبط
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs animate-in fade-in">
            {/* Delivery Status */}
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">{t.deliveryStatus}</label>
              <select
                value={filters.deliveryStatus || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, deliveryStatus: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs"
              >
                <option value="all">الكل</option>
                <option value="قيد التحضير">قيد التحضير</option>
                <option value="تم الإرسال">تم الإرسال</option>
                <option value="قيد التوصيل">قيد التوصيل</option>
                <option value="تم التوصيل">تم التوصيل</option>
                <option value="فشل التوصيل">فشل التوصيل</option>
                <option value="ملغى">ملغى</option>
              </select>
            </div>

            {/* Collection Status */}
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">{t.collectionStatus}</label>
              <select
                value={filters.collectionStatus || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, collectionStatus: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs"
              >
                <option value="all">الكل</option>
                <option value="غير محصل">غير محصل</option>
                <option value="محصل">محصل</option>
                <option value="دفع مسبق">دفع مسبق</option>
              </select>
            </div>

            {/* Return Status */}
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">{t.returnStatus}</label>
              <select
                value={filters.returnStatus || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, returnStatus: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs"
              >
                <option value="all">الكل</option>
                <option value="لا يوجد إرجاع">لا يوجد إرجاع</option>
                <option value="طلب إرجاع">طلب إرجاع</option>
                <option value="في طريق الإرجاع">في طريق الإرجاع</option>
                <option value="تم الإرجاع">تم الإرجاع</option>
                <option value="تم التعويض">تم التعويض</option>
              </select>
            </div>

            {/* Account filter */}
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">{t.account}</label>
              <select
                value={filters.account || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, account: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs"
              >
                <option value="all">جميع الحسابات</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Company filter */}
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">{t.deliveryCompany}</label>
              <select
                value={filters.deliveryCompany || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, deliveryCompany: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs"
              >
                <option value="all">جميع الشركات</option>
                {deliveryCompanies.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">من تاريخ</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar (when orders selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
              {selectedIds.length} محدد
            </span>
            <span>إجراءات سريعة على الطلبات المحددة:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                bulkUpdateDeliveryStatus(selectedIds, 'تم التوصيل');
                setSelectedIds([]);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
            >
              ✓ تعليم كـ تم التوصيل
            </button>

            <button
              onClick={() => {
                bulkUpdateCollectionStatus(selectedIds, 'محصل');
                setSelectedIds([]);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
            >
              💰 تعليم كـ تم التحصيل
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white px-2 py-1"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="p-3 text-center w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-3 text-start">{t.orderNumber}</th>
                <th className="p-3 text-start">{t.orderDate}</th>
                <th className="p-3 text-start">{t.customerName}</th>
                <th className="p-3 text-start">{t.productName}</th>
                <th className="p-3 text-center">الكمية</th>
                <th className="p-3 text-start">ثمن الوحدة</th>
                <th className="p-3 text-start">التوصيل</th>
                <th className="p-3 text-start font-black text-emerald-950">الإجمالي الكلي</th>
                <th className="p-3 text-start">{t.account}</th>
                <th className="p-3 text-start">{t.deliveryCompany}</th>
                <th className="p-3 text-start">{t.trackingNumber}</th>
                <th className="p-3 text-center">{t.deliveryStatus}</th>
                <th className="p-3 text-center">{t.collectionStatus}</th>
                <th className="p-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-sm">لا توجد طلبات مطابقة للبحث أو الفلتر</span>
                      <button
                        onClick={resetFilters}
                        className="text-xs text-emerald-700 font-bold underline"
                      >
                        إعادة ضبط جميع الفلاتر
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const grandTotal = calculateOrderGrandTotal(order);
                  const isSelected = selectedIds.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Order # */}
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="hover:text-emerald-700 hover:underline cursor-pointer"
                        >
                          {order.orderNumber}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="p-3 text-slate-500 whitespace-nowrap">{order.date}</td>

                      {/* Customer */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                          {order.customerPhone}
                        </div>
                        <div className="text-[10px] text-slate-500">{order.customerCity}</div>
                      </td>

                      {/* Product */}
                      <td className="p-3 max-w-[160px]">
                        <div className="font-semibold text-slate-800 truncate" title={order.productName}>
                          {order.productName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{order.productSku}</div>
                      </td>

                      {/* Quantity */}
                      <td className="p-3 text-center font-bold text-slate-700">{order.quantity}</td>

                      {/* Unit Price */}
                      <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                        {formatMAD(order.unitPrice)}
                      </td>

                      {/* Delivery Fee */}
                      <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                        {typeof order.deliveryFee === 'number'
                          ? `${order.deliveryFee} MAD`
                          : order.deliveryFee}
                      </td>

                      {/* Grand Total */}
                      <td className="p-3 font-black text-emerald-800 whitespace-nowrap">
                        {formatMAD(grandTotal)}
                      </td>

                      {/* Account */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-[11px] text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                          {order.account}
                        </span>
                      </td>

                      {/* Carrier */}
                      <td className="p-3 whitespace-nowrap text-slate-700 font-medium">
                        {order.deliveryCompany}
                      </td>

                      {/* Tracking */}
                      <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {order.trackingNumber || '-'}
                      </td>

                      {/* Delivery Status Badge */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-block ${
                            order.deliveryStatus === 'تم التوصيل'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.deliveryStatus === 'قيد التوصيل'
                              ? 'bg-blue-100 text-blue-800'
                              : order.deliveryStatus === 'تم الإرسال'
                              ? 'bg-indigo-100 text-indigo-800'
                              : order.deliveryStatus === 'فشل التوصيل'
                              ? 'bg-rose-100 text-rose-800'
                              : order.deliveryStatus === 'ملغى'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.deliveryStatus}
                        </span>
                      </td>

                      {/* Collection Status Badge */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-block ${
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

                      {/* Actions */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                            title={t.viewDetails}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleWhatsApp(order)}
                            className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                            title={t.sendWhatsApp}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          <button
                            onClick={() => printOrderInvoice(order)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title={t.generateInvoice}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditOrderModal(order)}
                            className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                            title={t.edit}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

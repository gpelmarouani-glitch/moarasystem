import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  Trash2,
  X,
  RefreshCw,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { parseUploadedOrdersFile, downloadOrdersImportTemplate } from '../utils/exportImport';
import { formatMAD, calculateOrderGrandTotal } from '../utils/calculations';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { importOrdersList, t } = useApp();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedOrders, setParsedOrders] = useState<Partial<Order>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    setErrors([]);
    setWarnings([]);
    setParsedOrders([]);
    setImportResult(null);

    try {
      const result = await parseUploadedOrdersFile(selectedFile);
      setParsedOrders(result.orders);
      setErrors(result.errors);
      setWarnings(result.warnings || []);
      setTotalRows(result.totalRows);
    } catch (err: unknown) {
      setErrors(['حدث خطأ أثناء قراءة ملف الإكسيل.']);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedOrders.length === 0) return;
    const result = importOrdersList(parsedOrders);
    setImportResult(result);
  };

  const resetAll = () => {
    setFile(null);
    setParsedOrders([]);
    setErrors([]);
    setWarnings([]);
    setTotalRows(0);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">معالج استيراد ملفات الإكسيل (Excel & CSV Importer)</h3>
              <p className="text-xs text-slate-300">استيراد الطلبات والشحنات المتعددة من جداول Excel (.xlsx, .xls) أو CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick Help & Download Template Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-emerald-950">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">هل تحتاج إلى نموذج جاهز لتعبئة بياناتك؟</span>
                <span className="text-emerald-800 text-[11px]">
                  حمل نموذج إكسيل المعتمد لشركة MPARA بأسماء الأعمدة الصحيحة والأمثلة التوضيحية
                </span>
              </div>
            </div>
            <button
              onClick={downloadOrdersImportTemplate}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>تحميل نموذج Excel (.xlsx)</span>
            </button>
          </div>

          {/* Success Result View */}
          {importResult && (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-emerald-950">تم الاستيراد بنجاح إلى النظام!</h4>
              <div className="flex items-center justify-center gap-6 text-sm font-semibold text-slate-700">
                <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-xs text-slate-500 block">تمت الإضافة:</span>
                  <span className="text-lg font-black text-emerald-600">{importResult.added} طلب</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 block">تم التخطي (مكرر):</span>
                  <span className="text-lg font-black text-amber-600">{importResult.skipped} طلب</span>
                </div>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs"
                >
                  إغلاق ومشاهدة الطلبات
                </button>
                <button
                  onClick={resetAll}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  استيراد ملف آخر
                </button>
              </div>
            </div>
          )}

          {/* Upload Dropzone (if not imported yet) */}
          {!importResult && (
            <>
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    اسحب وأفلت ملف الإكسيل هنا، أو انقر للتصفح
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    يدعم ملفات: Microsoft Excel (.xlsx, .xls) وجداول البيانات CSV
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-4 py-2 rounded-xl shadow-2xs">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>تحديد ملف من جهازك</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{file.name}</div>
                      <div className="text-[11px] text-slate-500">
                        الحجم: {(file.size / 1024).toFixed(1)} KB | عدد الأسطر المكتشفة: {totalRows}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetAll}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="إلغاء واختيار ملف آخر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Parsing Spinner */}
              {isParsing && (
                <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>جارٍ فحص وتحليل بيانات ملف الإكسيل ومطابقة الأعمدة...</span>
                </div>
              )}

              {/* Errors list */}
              {errors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>أخطاء في الملف:</span>
                  </div>
                  {errors.map((err, i) => (
                    <div key={i} className="ps-5 text-[11px] list-disc">
                      • {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings list */}
              {warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-700">
                    <Info className="w-4 h-4" />
                    <span>تنبيهات غير حرجة ({warnings.length}):</span>
                  </div>
                  <div className="ps-5 text-[11px] text-amber-800">
                    • تم تصحيح بعض الحقول الفارغة تلقائياً بقيم افتراضية.
                  </div>
                </div>
              )}

              {/* Preview Table of Parsed Orders */}
              {parsedOrders.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      معاينة البيانات المستخرجة ({parsedOrders.length} طلب جاهز للاستيراد)
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      جاهز للإضافة
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56">
                    <table className="w-full text-[11px] text-start">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-2 text-start">رقم الطلب</th>
                          <th className="p-2 text-start">العميل</th>
                          <th className="p-2 text-start">الهاتف</th>
                          <th className="p-2 text-start">المدينة</th>
                          <th className="p-2 text-start">المنتج</th>
                          <th className="p-2 text-start">الكمية</th>
                          <th className="p-2 text-start">السعر</th>
                          <th className="p-2 text-start">الحساب</th>
                          <th className="p-2 text-start">الشركة</th>
                          <th className="p-2 text-start">حالة التوصيل</th>
                          <th className="p-2 text-start">التحصيل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedOrders.slice(0, 15).map((o, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                            <td className="p-2">{o.customerName}</td>
                            <td className="p-2 font-mono" dir="ltr">{o.customerPhone}</td>
                            <td className="p-2">{o.customerCity}</td>
                            <td className="p-2 max-w-[140px] truncate">{o.productName}</td>
                            <td className="p-2 font-bold">{o.quantity}</td>
                            <td className="p-2 font-bold text-emerald-700">{o.unitPrice} MAD</td>
                            <td className="p-2 text-slate-500">{o.account}</td>
                            <td className="p-2 text-slate-500">{o.deliveryCompany}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {o.deliveryStatus}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                                {o.collectionStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedOrders.length > 15 && (
                    <div className="text-center text-[10px] text-slate-400">
                      يتم عرض 15 من أصل {parsedOrders.length} طلب...
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {importResult ? 'إغلاق' : 'إلغاء'}
          </button>

          {!importResult && (
            <button
              onClick={handleConfirmImport}
              disabled={parsedOrders.length === 0 || isParsing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                parsedOrders.length > 0 && !isParsing
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد استيراد ({parsedOrders.length}) طلب إلى النظام</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

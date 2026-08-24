import React, { useState } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  RefreshCw,
  Building2,
  Database,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageService } from '../utils/storage';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToSeedData, t } = useApp();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [website, setWebsite] = useState(settings.website);
  const [defaultFee, setDefaultFee] = useState(settings.defaultDeliveryFee);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      website: website.trim(),
      defaultDeliveryFee: Number(defaultFee) || 29,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBackup = () => {
    const data = StorageService.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MPARA_ERP_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const success = StorageService.importAllData(json);
        if (success) {
          window.location.reload();
        } else {
          alert('الملف غير صالح أو تالف');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>إعدادات النظام والنسخ الاحتياطي (Settings & Backup)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تخصيص بيانات شركة MPARA SARL وإدارة قواعد البيانات والنسخ الاحتياطي
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ الإعدادات بنجاح!</span>
        </div>
      )}

      {/* Grid: Company Settings & Database Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Company Info Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 font-extrabold text-xs text-slate-800 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>بيانات وهوية الشركة (MPARA SARL Profile)</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">اسم الشركة التجاري</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">الموقع الإلكتروني</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">البريد الإلكتروني للشركة</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">رقم الهاتف / خدمة العملاء</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">العنوان والمقر التجاري</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">سعر التوصيل الافتراضي للطلبات (MAD)</label>
                <input
                  type="number"
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">العملة المعتمدة</label>
                <input
                  type="text"
                  disabled
                  value="MAD (الدرهم المغربي)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-bold text-slate-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database & Backup Tools */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-xs text-slate-800 pb-2 border-b border-slate-100">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>إدارة قواعد البيانات والنسخ الاحتياطي</span>
            </div>

            <p className="text-xs text-slate-500">
              حفظ نسخة احتياطية من جميع الطلبات والحسابات والمنتجات محلياً أو استرجاعها في أي وقت
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleBackup}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>تنزيل نسخة احتياطية (JSON)</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>استرجاع من ملف نسخة احتياطية</span>
                <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-4 border-t border-slate-100">
            {restoreConfirm ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-rose-800 block">هل أنت متأكد من إعادة ضبط البيانات الافتراضية؟</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      resetToSeedData();
                      setRestoreConfirm(false);
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    نعم، أعد الضبط
                  </button>
                  <button
                    onClick={() => setRestoreConfirm(false)}
                    className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setRestoreConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>استعادة البيانات النموذجية الافتراضية</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

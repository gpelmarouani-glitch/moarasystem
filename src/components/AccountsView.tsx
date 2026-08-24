import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  ArrowRightLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAccountStats, formatMAD } from '../utils/calculations';

export const AccountsView: React.FC = () => {
  const { accounts, orders, addAccount, addTransfer, t } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountDesc, setNewAccountDesc] = useState('');

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAccount, setTransferAccount] = useState(accounts[0]?.name || '');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferRef, setTransferRef] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Calculate detailed stats for each account
  const accountStats = accounts.map((acc) => ({
    ...acc,
    stats: calculateAccountStats(orders, acc.name),
  }));

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;
    addAccount({
      name: newAccountName.trim(),
      description: newAccountDesc.trim(),
      balance: 0,
      transferredAmount: 0,
    });
    setNewAccountName('');
    setNewAccountDesc('');
    setIsAddModalOpen(false);
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAccount || transferAmount <= 0) return;
    addTransfer({
      accountName: transferAccount,
      amount: transferAmount,
      date: new Date().toISOString().split('T')[0],
      referenceNumber: transferRef.trim() || `TR-${Date.now().toString().slice(-6)}`,
      notes: transferNotes.trim(),
    });
    setTransferAmount(0);
    setTransferRef('');
    setTransferNotes('');
    setIsTransferModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>إدارة حسابات الإرسال الخمسة (Sending Accounts)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة المبيعات والتحصيلات والتحويلات البنكية المستلمة لكل حساب في MPARA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>تسجيل تحويل بنكي</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة حساب جديد</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountStats.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {item.stats.totalOrders} طلب
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{item.description || 'حساب إرسال مسجل'}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">المبيعات الفعلية (تم التوصيل)</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatMAD(item.stats.sales)}
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 block mb-0.5">المحصل نقدياً (Collected)</span>
                  <span className="font-black text-emerald-800 text-sm">
                    {formatMAD(item.stats.collected)}
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-amber-700 block mb-0.5">غير المحصل (مع الشركات)</span>
                  <span className="font-bold text-amber-900 text-sm">
                    {formatMAD(item.stats.uncollected)}
                  </span>
                </div>

                <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-indigo-700 block mb-0.5">المحول إلى الشركة (Transferred)</span>
                  <span className="font-black text-indigo-900 text-sm">
                    {formatMAD(item.stats.transferred)}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Bar */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 font-semibold">نسبة التوصيل الناجح:</span>
                <span className="font-bold text-slate-800">{item.stats.successRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.stats.successRate >= 70
                      ? 'bg-emerald-500'
                      : item.stats.successRate >= 40
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.stats.successRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 mb-3">إضافة حساب إرسال جديد</h3>
            <form onSubmit={handleAddAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">اسم الحساب *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: PARAMEDICAL_VIP"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">الوصف أو التفاصيل</label>
                <input
                  type="text"
                  placeholder="مثال: حساب خاص لطلبات البارافارماسي الجنوبية..."
                  value={newAccountDesc}
                  onChange={(e) => setNewAccountDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
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
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 mb-3">تسجيل تحويل مالي مستلم</h3>
            <form onSubmit={handleAddTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">حساب الإرسال المحول منه *</label>
                <select
                  value={transferAccount}
                  onChange={(e) => setTransferAccount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-bold"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">المبلغ المحول (MAD) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-black text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">رقم التحويل البنكي / المرجع</label>
                <input
                  type="text"
                  placeholder="مثال: VIR-BANK-89412"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ملاحظات</label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
                >
                  تسجيل التحويل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

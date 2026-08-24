import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  CreditCard,
  Truck,
  RotateCcw,
  BadgeDollarSign,
  BarChart3,
  Package,
  Sliders,
  Database,
  HelpCircle,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    openNewOrderModal,
    orders,
    financialSummary,
    t,
    products,
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders',
      label: t.navOrders,
      icon: ShoppingCart,
      badge: orders.length > 0 ? orders.length : null,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'add_order',
      label: t.navAddOrder,
      icon: PlusCircle,
      action: openNewOrderModal,
      highlight: true,
    },
    {
      id: 'accounts',
      label: t.navAccounts,
      icon: CreditCard,
      badge: '5',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'delivery_companies',
      label: t.navDeliveryCompanies,
      icon: Truck,
      badge: null,
    },
    {
      id: 'returns',
      label: t.navReturns,
      icon: RotateCcw,
      badge: financialSummary.returnsCount > 0 ? financialSummary.returnsCount : null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'collections',
      label: t.navCollections,
      icon: BadgeDollarSign,
      badge: financialSummary.deliveredCount > 0 ? `${financialSummary.deliveredCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'reports',
      label: t.navReports,
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'products',
      label: t.navProducts,
      icon: Package,
      badge: products.length > 0 ? products.length : null,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'settings',
      label: t.navSettings,
      icon: Sliders,
      badge: null,
    },
    {
      id: 'backup',
      label: t.navBackup,
      icon: Database,
      badge: null,
    },
    {
      id: 'guide',
      label: t.navGuide,
      icon: HelpCircle,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-e border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
          MP
        </div>
        <div>
          <h2 className="font-extrabold text-white text-sm tracking-tight">MPARA SYSTEM</h2>
          <p className="text-[11px] text-emerald-400 font-medium">Order & Financial ERP</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          if (item.action) {
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/50 transition-all cursor-pointer shadow-xs my-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">+</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Financial Health Mini Banner in Sidebar */}
      <div className="p-3 m-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold">{t.kpiSalesValue}</span>
          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="font-extrabold text-emerald-400 text-sm">
          {new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(financialSummary.grossSalesValue)} MAD
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-700/50">
          <span>المحصل:</span>
          <span className="text-white font-bold">
            {new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(financialSummary.totalCollected)} MAD
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-center text-[10px] text-slate-500">
        <div>MPARA SARL &copy; 2026</div>
        <a href="https://www.mpara.ma" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
          www.mpara.ma
        </a>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Bell,
  PlusCircle,
  ShieldCheck,
  User as UserIcon,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Package,
  ExternalLink,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../utils/i18n';

interface HeaderProps {
  onOpenTestModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTestModal }) => {
  const {
    t,
    language,
    setLanguage,
    currentUser,
    setCurrentUserRole,
    openNewOrderModal,
    filters,
    setFilters,
    notifications,
    setActiveView,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleNotificationClick = (filterKey?: string) => {
    setShowNotifications(false);
    if (filterKey === 'delivered_uncollected') {
      setFilters((prev) => ({ ...prev, deliveryStatus: 'تم التوصيل', collectionStatus: 'غير محصل' }));
      setActiveView('orders');
    } else if (filterKey === 'returns_pending') {
      setActiveView('returns');
    } else if (filterKey === 'failed') {
      setFilters((prev) => ({ ...prev, deliveryStatus: 'فشل التوصيل' }));
      setActiveView('orders');
    } else if (filterKey === 'in_prep') {
      setFilters((prev) => ({ ...prev, deliveryStatus: 'قيد التحضير' }));
      setActiveView('orders');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left / Start: Brand info & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-xs">
            M
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">MPARA</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                SARL
              </span>
            </div>
            <a
              href="https://www.mpara.ma"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-0.5"
            >
              www.mpara.ma <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg ps-9 pe-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 rounded px-1.5 py-0.5"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right / End: Actions, Notifications, Language, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Test Rules Runner Button */}
        <button
          onClick={onOpenTestModal}
          id="btn-test-verification"
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          title="فحص القواعد المالية السبعة الصارمة"
        >
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          <span>{t.testRunner}</span>
        </button>

        {/* Quick New Order Button */}
        <button
          onClick={openNewOrderModal}
          id="btn-quick-new-order"
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t.newOrder}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label={t.notifications}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 end-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {notifications.reduce((acc, n) => acc + n.count, 0)}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute end-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-bold text-sm text-slate-800">{t.notifications}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  {notifications.length} تنبيهات
                </span>
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span>{t.noNotifications}</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.filterKey)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                        n.type === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100'
                          : n.type === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                          : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100'
                      }`}
                    >
                      {n.type === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <Package className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">العدد: {n.count} طلبات</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2 py-1 rounded transition-colors ${
              language === 'ar' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            عربي
          </button>
          <button
            onClick={() => setLanguage('fr')}
            className={`px-2 py-1 rounded transition-colors ${
              language === 'fr' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded transition-colors ${
              language === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
        </div>

        {/* User Role & Profile Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}
            >
              {currentUser.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden xl:block text-start text-xs">
              <div className="font-bold text-slate-800 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500">
                {currentUser.role === 'admin' ? t.adminRole : t.userRole}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute end-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="pb-2 border-b border-slate-100 mb-2">
                <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
              </div>

              <div className="text-xs font-semibold text-slate-400 mb-1.5">{t.switchRole}:</div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCurrentUserRole('admin');
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
                    currentUser.role === 'admin'
                      ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>{t.adminRole}</span>
                  </div>
                  {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <button
                  onClick={() => {
                    setCurrentUserRole('user');
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors ${
                    currentUser.role === 'user'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <span>{t.userRole}</span>
                  </div>
                  {currentUser.role === 'user' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

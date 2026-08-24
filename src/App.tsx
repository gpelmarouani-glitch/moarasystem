import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { OrdersList } from './components/OrdersList';
import { AccountsView } from './components/AccountsView';
import { DeliveryCompaniesView } from './components/DeliveryCompaniesView';
import { ReturnsView } from './components/ReturnsView';
import { CollectionsView } from './components/CollectionsView';
import { ProductsView } from './components/ProductsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { OrderFormModal } from './components/OrderFormModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { TestVerificationModal } from './components/TestVerificationModal';

const AppContent: React.FC = () => {
  const { activeView } = useApp();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <OrdersList />;
      case 'accounts':
        return <AccountsView />;
      case 'delivery_companies':
        return <DeliveryCompaniesView />;
      case 'returns':
        return <ReturnsView />;
      case 'collections':
        return <CollectionsView />;
      case 'products':
        return <ProductsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-cairo text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Header */}
      <Header onOpenTestRunner={() => setIsTestModalOpen(true)} />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar onOpenTestRunner={() => setIsTestModalOpen(true)} />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <OrderFormModal />
      <OrderDetailsModal />
      <TestVerificationModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

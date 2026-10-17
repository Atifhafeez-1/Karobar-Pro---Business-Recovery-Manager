import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  Bill,
  Payment,
  Language,
} from './types';
import {
  getAppSettings,
  saveAppSettings,
  seedInitialDataIfNeeded,
  DEFAULT_SETTINGS,
} from './lib/storage';
import { testConnection } from './lib/firebase';
import { syncPendingData } from './lib/sync';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ShopkeeperLedgerView } from './components/ShopkeeperLedgerView';
import { BillingView } from './components/BillingView';
import { InventoryView } from './components/InventoryView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { AndroidExportView } from './components/AndroidExportView';
import { SettingsView } from './components/SettingsView';
import { DailyRecoveryModal } from './components/DailyRecoveryModal';
import { ReceiptModal } from './components/ReceiptModal';
import {
  DollarSign,
  Settings,
  HelpCircle,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    NavTab | 'expenses' | 'exportApk' | 'settings'
  >('dashboard');

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [lang, setLang] = useState<Language>('en');
  const [selectedShopkeeperId, setSelectedShopkeeperId] = useState<string | null>(null);

  // Modals
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryShopkeeperId, setRecoveryShopkeeperId] = useState<string | undefined>(undefined);

  const [receiptState, setReceiptState] = useState<{
    isOpen: boolean;
    type: 'bill' | 'recovery';
    bill?: Bill | null;
    payment?: Payment | null;
  }>({
    isOpen: false,
    type: 'recovery',
  });

  // App Initialization
  useEffect(() => {
    async function init() {
      // 1. Seed sample data if fresh db
      await seedInitialDataIfNeeded();
      // 2. Load settings
      const loadedSettings = await getAppSettings();
      setSettings(loadedSettings);
      setLang(loadedSettings.language || 'en');
      // 3. Test Firebase & run initial sync
      testConnection().catch(console.warn);
      syncPendingData().catch(console.warn);
    }
    init();
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    const updated = { ...settings, language: newLang };
    setSettings(updated);
    saveAppSettings(updated).catch(console.warn);
  };

  const handleOpenRecoveryModal = (shopkeeperId?: string) => {
    setRecoveryShopkeeperId(shopkeeperId);
    setIsRecoveryModalOpen(true);
  };

  const handleRecoverySuccess = (payment: Payment) => {
    setReceiptState({
      isOpen: true,
      type: 'recovery',
      payment,
    });
  };

  const handleBillCreated = (bill: Bill) => {
    setReceiptState({
      isOpen: true,
      type: 'bill',
      bill,
    });
  };

  return (
    <div
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white ${
        lang === 'ur' ? 'font-sans' : ''
      }`}
    >
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-48 -right-32 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <Navbar
        settings={settings}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onOpenExportApk={() => setCurrentTab('exportApk')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        
        {/* Colorful Secondary Subnav for Quick Access to All Modules */}
        <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-200/80 text-xs overflow-x-auto gap-2 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            {/* Dashboard Button */}
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'btn-vibrant-blue ring-2 ring-blue-300'
                  : 'bg-white hover:bg-blue-50/70 text-slate-700 hover:text-blue-700 border border-slate-200/90 hover:border-blue-300 shadow-xs'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>{lang === 'ur' ? 'ڈیش بورڈ' : 'Dashboard'}</span>
            </button>

            {/* Shopkeepers Button */}
            <button
              onClick={() => setCurrentTab('shopkeepers')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                currentTab === 'shopkeepers'
                  ? 'btn-vibrant-purple ring-2 ring-purple-300'
                  : 'bg-white hover:bg-purple-50/70 text-slate-700 hover:text-purple-700 border border-slate-200/90 hover:border-purple-300 shadow-xs'
              }`}
            >
              <span>{lang === 'ur' ? 'کھاتہ دار' : 'Shopkeepers'}</span>
            </button>

            {/* Sales & Billing Button */}
            <button
              onClick={() => setCurrentTab('billing')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                currentTab === 'billing'
                  ? 'btn-vibrant-blue ring-2 ring-indigo-300'
                  : 'bg-white hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-700 border border-slate-200/90 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <span>{lang === 'ur' ? 'سیلز بلات' : 'Sales & Billing'}</span>
            </button>

            {/* Inventory Button */}
            <button
              onClick={() => setCurrentTab('inventory')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                currentTab === 'inventory'
                  ? 'btn-vibrant-amber ring-2 ring-amber-300'
                  : 'bg-white hover:bg-amber-50/70 text-slate-700 hover:text-amber-700 border border-slate-200/90 hover:border-amber-300 shadow-xs'
              }`}
            >
              <span>{lang === 'ur' ? 'اسٹاک' : 'Inventory'}</span>
            </button>

            {/* Reports Button */}
            <button
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                currentTab === 'reports'
                  ? 'btn-vibrant-cyan ring-2 ring-cyan-300'
                  : 'bg-white hover:bg-cyan-50/70 text-slate-700 hover:text-cyan-700 border border-slate-200/90 hover:border-cyan-300 shadow-xs'
              }`}
            >
              <span>{lang === 'ur' ? 'رپورٹس' : 'Reports'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Expenses Button */}
            <button
              onClick={() => setCurrentTab('expenses')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                currentTab === 'expenses'
                  ? 'btn-vibrant-rose ring-2 ring-rose-300'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 hover:border-rose-300 shadow-xs'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{lang === 'ur' ? 'اخراجات' : 'Expenses'}</span>
            </button>

            {/* Export APK Button */}
            <button
              onClick={() => setCurrentTab('exportApk')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                currentTab === 'exportApk'
                  ? 'btn-vibrant-emerald ring-2 ring-emerald-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 hover:border-emerald-300 shadow-xs'
              }`}
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{lang === 'ur' ? 'ای پی کے' : 'Export APK'}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-black text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-gradient-to-r from-slate-800 to-slate-950 text-white shadow-lg shadow-slate-900/30 ring-2 ring-slate-400'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-xs'
              }`}
            >
              <Settings className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{lang === 'ur' ? 'ترتیبات' : 'Settings'}</span>
            </button>
          </div>
        </div>

        {/* View Routing */}
        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenRecoveryModal={() => handleOpenRecoveryModal()}
            onOpenNewBill={() => setCurrentTab('billing')}
            onOpenNewShopkeeper={() => {
              setSelectedShopkeeperId(null);
              setCurrentTab('shopkeepers');
            }}
            onOpenNewProduct={() => setCurrentTab('inventory')}
            onSelectShopkeeper={(id) => {
              setSelectedShopkeeperId(id);
              setCurrentTab('shopkeepers');
            }}
            onSelectBill={(b) => {
              setReceiptState({ isOpen: true, type: 'bill', bill: b });
            }}
            settings={settings}
            lang={lang}
          />
        )}

        {currentTab === 'shopkeepers' && (
          <ShopkeeperLedgerView
            selectedShopkeeperId={selectedShopkeeperId}
            onSelectShopkeeper={setSelectedShopkeeperId}
            onOpenRecoveryModal={handleOpenRecoveryModal}
            onOpenNewBill={(id) => {
              setSelectedShopkeeperId(id || null);
              setCurrentTab('billing');
            }}
            settings={settings}
            lang={lang}
          />
        )}

        {currentTab === 'billing' && (
          <BillingView
            onBillCreated={handleBillCreated}
            onViewBillReceipt={(b) => setReceiptState({ isOpen: true, type: 'bill', bill: b })}
            initialShopkeeperId={selectedShopkeeperId}
            settings={settings}
            lang={lang}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView settings={settings} lang={lang} />
        )}

        {currentTab === 'expenses' && (
          <ExpensesView settings={settings} lang={lang} />
        )}

        {currentTab === 'reports' && (
          <ReportsView settings={settings} lang={lang} />
        )}

        {currentTab === 'exportApk' && <AndroidExportView />}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            lang={lang}
          />
        )}
      </main>

      {/* Floating Tactical Recovery Trigger Button (Mobile Floating Action Button) */}
      <button
        onClick={() => handleOpenRecoveryModal()}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-30 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-slate-950 font-black text-sm px-5 py-3.5 shadow-2xl shadow-emerald-500/40 border-2 border-emerald-300/60 transition-all duration-150 cursor-pointer group"
        title="Quick Recovery Entry"
      >
        <div className="h-6 w-6 rounded-lg bg-slate-950/20 flex items-center justify-center text-slate-950 font-black text-sm">
          ₨
        </div>
        <span className="font-extrabold">{lang === 'ur' ? 'فوری وصولی' : '+ Daily Recovery'}</span>
      </button>

      {/* Mobile Android Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab as NavTab}
        onTabChange={(tab) => {
          if (tab === 'recovery') {
            handleOpenRecoveryModal();
          } else {
            setCurrentTab(tab);
          }
        }}
        lang={lang}
      />

      {/* Daily Recovery Modal */}
      <DailyRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onSuccess={handleRecoverySuccess}
        initialShopkeeperId={recoveryShopkeeperId}
        settings={settings}
        lang={lang}
      />

      {/* Printable Receipt & WhatsApp Voucher Modal */}
      <ReceiptModal
        isOpen={receiptState.isOpen}
        onClose={() => setReceiptState({ ...receiptState, isOpen: false })}
        type={receiptState.type}
        bill={receiptState.bill}
        payment={receiptState.payment}
        settings={settings}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Shopkeeper,
  Product,
  Bill,
  Payment,
  AppSettings,
  Language,
} from '../types';
import {
  getShopkeepers,
  getProducts,
  getBills,
  getPayments,
} from '../lib/storage';
import { translations, formatCurrency, formatDate } from '../lib/i18n';
import {
  TrendingUp,
  CreditCard,
  HandCoins,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Calendar,
  PlusCircle,
  FileText,
  BadgeAlert,
  Clock,
  Banknote,
  Building2,
  ChevronRight,
  Flame,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenRecoveryModal: () => void;
  onOpenNewBill: () => void;
  onOpenNewShopkeeper: () => void;
  onOpenNewProduct: () => void;
  onSelectShopkeeper: (id: string) => void;
  onSelectBill: (bill: Bill) => void;
  settings: AppSettings;
  lang: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRecoveryModal,
  onOpenNewBill,
  onOpenNewShopkeeper,
  onOpenNewProduct,
  onSelectShopkeeper,
  onSelectBill,
  settings,
  lang,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const t = translations[lang];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [sk, pr, bl, py] = await Promise.all([
      getShopkeepers(),
      getProducts(),
      getBills(),
      getPayments(),
    ]);
    setShopkeepers(sk);
    setProducts(pr);
    setBills(bl);
    setPayments(py);
    setIsLoading(false);
  };

  // Helper date filtering
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const isInFilter = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (timeFilter === 'today') {
      return dateStr.startsWith(todayStr);
    }
    if (timeFilter === 'week') {
      return d >= oneWeekAgo;
    }
    if (timeFilter === 'month') {
      return d >= startOfMonth;
    }
    return true;
  };

  const filteredBills = bills.filter((b) => isInFilter(b.billDate));
  const filteredPayments = payments.filter((p) => isInFilter(p.paymentDate));

  // Totals calculations
  const totalSales = filteredBills.reduce((acc, b) => acc + b.netAmount, 0);
  const immediateCashSales = filteredBills.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalCreditSales = filteredBills.reduce((acc, b) => acc + b.remainingBalance, 0);

  // Recovery received (cash/transfer received towards outstanding debt)
  const recoveryReceived = filteredPayments
    .filter((p) => p.type === 'recovery' || p.type === 'advance')
    .reduce((acc, p) => acc + p.amount, 0);

  // Total cash received = immediate cash on bills + recovery received
  const totalCashReceived = immediateCashSales + recoveryReceived;

  // Total outstanding balance across all active shopkeepers
  const totalOutstandingBalance = shopkeepers.reduce((acc, s) => acc + s.currentBalance, 0);

  // Total inventory value at cost price
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.currentStock * p.purchasePrice,
    0
  );

  // Low stock products
  const lowStockProducts = products.filter(
    (p) => p.currentStock <= p.minStockAlert && p.status === 'active'
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.dashboard}
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              Live Karobar
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {lang === 'ur'
              ? 'روزانہ کاروباری کارکردگی، وصولی اور کھاتوں کا خلاصہ'
              : 'Real-time sales, recoveries, customer credit & stock levels'}
          </p>
        </div>

        {/* Time period toggle buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200/60">
          {(['today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-150 capitalize cursor-pointer active:scale-95 ${
                timeFilter === period
                  ? period === 'today'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : period === 'week'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {period === 'today'
                ? lang === 'ur' ? 'آج' : 'Today'
                : period === 'week'
                ? lang === 'ur' ? 'اس ہفتے' : 'This Week'
                : lang === 'ur' ? 'اس مہینے' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Large Colorful & Tactile Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Record Daily Recovery Button - Lush Emerald Glow */}
        <button
          onClick={onOpenRecoveryModal}
          className="btn-vibrant-emerald flex flex-col items-start p-4 sm:p-5 rounded-3xl border border-emerald-300/40 text-left group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 text-emerald-200/40 group-hover:text-emerald-100/60 transition-colors">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <HandCoins className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <span className="text-[10px] uppercase font-black text-emerald-100 tracking-wider bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-300/30">
            {lang === 'ur' ? 'اہم ترین وصولی' : 'Daily Task'}
          </span>
          <span className="text-base sm:text-lg font-black leading-tight mt-1.5 text-white drop-shadow-xs">
            {t.recordRecovery}
          </span>
          <span className="text-[11px] text-emerald-100/80 font-medium mt-1">
            {lang === 'ur' ? 'نقد یا بینک وصولی درج کریں' : 'Instant receipt & ledger update'}
          </span>
        </button>

        {/* New Bill Button - Vibrant Sapphire / Indigo Glow */}
        <button
          onClick={onOpenNewBill}
          className="btn-vibrant-blue flex flex-col items-start p-4 sm:p-5 rounded-3xl border border-indigo-300/40 text-left group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 text-blue-200/40 group-hover:text-blue-100/60 transition-colors">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <PlusCircle className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <span className="text-[10px] uppercase font-black text-blue-100 tracking-wider bg-indigo-900/30 px-2 py-0.5 rounded-full border border-blue-300/30">
            {lang === 'ur' ? 'سیل انوائس' : 'Sales Bill'}
          </span>
          <span className="text-base sm:text-lg font-black leading-tight mt-1.5 text-white drop-shadow-xs">
            {t.newBill}
          </span>
          <span className="text-[11px] text-blue-100/80 font-medium mt-1">
            {lang === 'ur' ? 'نیا کریڈٹ یا کیش بل بنائیں' : 'Credit or cash bill'}
          </span>
        </button>

        {/* Add Shopkeeper - Amethyst Purple Glow */}
        <button
          onClick={onOpenNewShopkeeper}
          className="btn-vibrant-purple flex flex-col items-start p-4 sm:p-5 rounded-3xl border border-purple-300/40 text-left group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 text-purple-200/40 group-hover:text-purple-100/60 transition-colors">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <Users className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <span className="text-[10px] uppercase font-black text-purple-100 tracking-wider bg-purple-950/30 px-2 py-0.5 rounded-full border border-purple-300/30">
            {lang === 'ur' ? 'نیا کھاتہ دار' : 'Customers'}
          </span>
          <span className="text-base sm:text-lg font-black leading-tight mt-1.5 text-white drop-shadow-xs">
            {t.addCustomer}
          </span>
          <span className="text-[11px] text-purple-100/80 font-medium mt-1">
            {lang === 'ur' ? 'دکاندار پروفائل اور کھاتہ' : 'Ledger accounts & details'}
          </span>
        </button>

        {/* Add Product - Golden Amber Sunset Glow */}
        <button
          onClick={onOpenNewProduct}
          className="btn-vibrant-amber flex flex-col items-start p-4 sm:p-5 rounded-3xl border border-amber-300/40 text-left group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 text-amber-200/40 group-hover:text-amber-100/60 transition-colors">
            <Package className="h-5 w-5" />
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <Package className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <span className="text-[10px] uppercase font-black text-amber-100 tracking-wider bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-300/30">
            {lang === 'ur' ? 'اسٹاک آئٹم' : 'Inventory'}
          </span>
          <span className="text-base sm:text-lg font-black leading-tight mt-1.5 text-white drop-shadow-xs">
            {t.addProduct}
          </span>
          <span className="text-[11px] text-amber-100/80 font-medium mt-1">
            {lang === 'ur' ? 'نیا پروڈکٹ شامل کریں' : 'SKU rate & stock level'}
          </span>
        </button>
      </div>

      {/* Main KPI Stat Cards - Colorful & Tactile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Outstanding Balances - Rose / Coral Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-white via-rose-50/60 to-rose-100/50 border-2 border-rose-200 shadow-lg shadow-rose-500/10 flex flex-col justify-between relative overflow-hidden group hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between text-xs text-rose-800 font-extrabold uppercase tracking-wider">
            <span>{t.totalOutstanding}</span>
            <div className="h-9 w-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="my-3 text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {formatCurrency(totalOutstandingBalance, settings.currencySymbol)}
          </div>
          <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
            <span className="text-[11px] text-rose-800/90 font-bold">
              {shopkeepers.filter((s) => s.currentBalance > 0).length} {lang === 'ur' ? 'دکانداروں کے ذمے' : 'debtors'}
            </span>
            <button
              onClick={() => onSelectShopkeeper(shopkeepers[0]?.id || '')}
              className="text-[11px] font-black text-rose-700 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
            >
              View Ledgers →
            </button>
          </div>
        </div>

        {/* Total Recovery Today - Emerald / Mint Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-white via-emerald-50/60 to-teal-100/50 border-2 border-emerald-200 shadow-lg shadow-emerald-500/10 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-extrabold uppercase tracking-wider">
            <span>{t.totalRecoveryToday}</span>
            <div className="h-9 w-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <HandCoins className="h-4 w-4" />
            </div>
          </div>
          <div className="my-3 text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {formatCurrency(recoveryReceived, settings.currencySymbol)}
          </div>
          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
            <span className="text-[11px] text-emerald-800/90 font-bold">
              {filteredPayments.length} {lang === 'ur' ? 'وصولیاں درج' : 'payments'}
            </span>
            <button
              onClick={onOpenRecoveryModal}
              className="text-[11px] font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
            >
              + Collect →
            </button>
          </div>
        </div>

        {/* Total Sales in Filter - Sapphire / Blue Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-white via-blue-50/60 to-indigo-100/50 border-2 border-blue-200 shadow-lg shadow-blue-500/10 flex flex-col justify-between relative overflow-hidden group hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-xs text-blue-800 font-extrabold uppercase tracking-wider">
            <span>{t.todaySales}</span>
            <div className="h-9 w-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="my-3 text-2xl sm:text-3xl font-black text-blue-900 tracking-tight">
            {formatCurrency(totalSales, settings.currencySymbol)}
          </div>
          <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold">Cash: {formatCurrency(immediateCashSales, '')}</span>
            <button
              onClick={onOpenNewBill}
              className="text-[11px] font-black text-blue-800 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
            >
              + New Sale →
            </button>
          </div>
        </div>

        {/* Total Inventory Value - Purple / Violet Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-white via-violet-50/60 to-purple-100/50 border-2 border-violet-200 shadow-lg shadow-violet-500/10 flex flex-col justify-between relative overflow-hidden group hover:border-violet-400 transition-all">
          <div className="flex items-center justify-between text-xs text-violet-800 font-extrabold uppercase tracking-wider">
            <span>{t.inventoryValue}</span>
            <div className="h-9 w-9 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/30">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="my-3 text-2xl sm:text-3xl font-black text-violet-900 tracking-tight">
            {formatCurrency(totalInventoryValue, settings.currencySymbol)}
          </div>
          <div className="pt-2 border-t border-violet-200/60 flex items-center justify-between">
            <span className="text-[11px] text-violet-800/90 font-bold">
              {products.length} {lang === 'ur' ? 'پروڈکٹس' : 'SKUs at cost'}
            </span>
            <button
              onClick={onOpenNewProduct}
              className="text-[11px] font-black text-violet-800 bg-violet-100 hover:bg-violet-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
            >
              Catalog →
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-300/80 flex items-start gap-3.5 text-amber-950 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Flame className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-sm text-amber-900">
              {t.lowStockAlerts} ({lowStockProducts.length} items low)
            </h4>
            <p className="text-xs text-amber-800/90 font-medium mt-0.5">
              {lowStockProducts
                .map((p) => `${p.name} (${p.currentStock} left)`)
                .slice(0, 3)
                .join(', ')}
              {lowStockProducts.length > 3 && ` and ${lowStockProducts.length - 3} more`}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Recoveries & Top Outstanding Shopkeepers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Daily Recoveries Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HandCoins className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  {lang === 'ur' ? 'حالیہ وصولیاں' : 'Recent Daily Recoveries'}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Live payment feed</span>
              </div>
            </div>
            <button
              onClick={onOpenRecoveryModal}
              className="btn-vibrant-emerald text-xs font-black px-3.5 py-1.5 rounded-xl border border-emerald-300/40 transition cursor-pointer"
            >
              + {lang === 'ur' ? 'نئی وصولی' : 'Record'}
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {payments.slice(0, 5).map((pay) => (
              <div
                key={pay.id}
                onClick={() => onSelectShopkeeper(pay.shopkeeperId)}
                className="py-3.5 flex items-center justify-between hover:bg-emerald-50/70 px-3 rounded-2xl transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    {pay.paymentMethod === 'cash' ? <Banknote className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {pay.shopkeeperName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatDate(pay.paymentDate, settings.dateFormat)}</span>
                      <span>•</span>
                      <span className="uppercase font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">{pay.paymentMethod}</span>
                      {pay.billNumber && (
                        <span className="text-blue-600 font-semibold">Bill: {pay.billNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-emerald-700">
                    +{formatCurrency(pay.amount, settings.currencySymbol)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{pay.transactionId}</div>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                {lang === 'ur' ? 'ابھی تک کوئی وصولی درج نہیں کی گئی' : 'No recoveries recorded yet'}
              </div>
            )}
          </div>
        </div>

        {/* Highest Outstanding Balances (Top Debtors) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Users className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  {lang === 'ur' ? 'سب سے زیادہ واجب الادا کھاتے' : 'Highest Outstanding Balances'}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Debt aging priority</span>
              </div>
            </div>
            <span className="text-xs text-rose-700 font-black bg-rose-50 px-3 py-1 rounded-xl border border-rose-200/80">
              {lang === 'ur' ? 'ریکوری ترجیح' : 'Top Debtors'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {[...shopkeepers]
              .sort((a, b) => b.currentBalance - a.currentBalance)
              .slice(0, 5)
              .map((sk) => (
                <div
                  key={sk.id}
                  className="py-3.5 flex items-center justify-between hover:bg-rose-50/50 px-3 rounded-2xl transition group"
                >
                  <div
                    onClick={() => onSelectShopkeeper(sk.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                      {sk.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                        {sk.name}
                      </div>
                      <div className="text-xs text-slate-500">{sk.shopName} • {sk.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <div className="font-black text-sm text-rose-600">
                        {formatCurrency(sk.currentBalance, settings.currencySymbol)}
                      </div>
                      <span
                        onClick={() => onSelectShopkeeper(sk.id)}
                        className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Ledger <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenRecoveryModal()}
                      className="btn-vibrant-emerald text-xs font-black px-2.5 py-1.5 rounded-xl border border-emerald-300/40 transition cursor-pointer"
                      title="Collect Recovery Now"
                    >
                      + ₨
                    </button>
                  </div>
                </div>
              ))}
            {shopkeepers.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                {lang === 'ur' ? 'کوئی دکاندار رجسٹرڈ نہیں' : 'No shopkeepers found'}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

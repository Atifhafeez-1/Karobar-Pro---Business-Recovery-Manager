import React, { useState, useEffect } from 'react';
import {
  Shopkeeper,
  LedgerEntry,
  AppSettings,
  Language,
} from '../types';
import {
  getShopkeepers,
  getShopkeeperLedger,
  addShopkeeper,
  saveShopkeeper,
} from '../lib/storage';
import { translations, formatCurrency, formatDate } from '../lib/i18n';
import {
  Search,
  Plus,
  Users,
  Phone,
  MapPin,
  FileText,
  Printer,
  Share2,
  ArrowLeft,
  HandCoins,
  CheckCircle2,
  Calendar,
  Filter,
  Receipt,
  MessageCircle,
  Building2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface ShopkeeperLedgerViewProps {
  selectedShopkeeperId?: string | null;
  onSelectShopkeeper: (id: string | null) => void;
  onOpenRecoveryModal: (shopkeeperId?: string) => void;
  onOpenNewBill: (shopkeeperId?: string) => void;
  settings: AppSettings;
  lang: Language;
}

export const ShopkeeperLedgerView: React.FC<ShopkeeperLedgerViewProps> = ({
  selectedShopkeeperId,
  onSelectShopkeeper,
  onOpenRecoveryModal,
  onOpenNewBill,
  settings,
  lang,
}) => {
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLedger, setActiveLedger] = useState<{
    shopkeeper: Shopkeeper;
    entries: LedgerEntry[];
    totalDebit: number;
    totalCredit: number;
    finalBalance: number;
  } | null>(null);

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'month'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for new shopkeeper
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    loadShopkeepers();
  }, []);

  const loadShopkeepers = async () => {
    const list = await getShopkeepers();
    setShopkeepers(list);
  };

  useEffect(() => {
    if (selectedShopkeeperId) {
      loadLedger(selectedShopkeeperId);
    } else {
      setActiveLedger(null);
    }
  }, [selectedShopkeeperId]);

  const loadLedger = async (id: string) => {
    try {
      const data = await getShopkeeperLedger(id);
      setActiveLedger(data);
    } catch (err) {
      console.error('Error loading ledger:', err);
    }
  };

  const handleCreateShopkeeper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    try {
      const created = await addShopkeeper({
        businessId: 'biz_default',
        name: name.trim(),
        shopName: shopName.trim() || name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        openingBalance: Number(openingBalance) || 0,
        currentBalance: Number(openingBalance) || 0,
        status: 'active',
        notes: notes.trim(),
      });

      await loadShopkeepers();
      setIsAddModalOpen(false);
      setName('');
      setShopName('');
      setPhone('');
      setAddress('');
      setOpeningBalance('');
      setNotes('');
      onSelectShopkeeper(created.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating shopkeeper');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareStatement = () => {
    if (!activeLedger) return;
    const { shopkeeper, entries, finalBalance } = activeLedger;

    let statementText =
      `*--- ${settings.businessName} ---*\n` +
      `*CUSTOMER KHATA STATEMENT / کھاتہ*\n` +
      `Customer: ${shopkeeper.name} (${shopkeeper.shopName})\n` +
      `Phone: ${shopkeeper.phone}\n` +
      `Customer ID: ${shopkeeper.customerCode}\n` +
      `---------------------------\n` +
      `*Current Outstanding Balance: ${formatCurrency(finalBalance, settings.currencySymbol)}*\n` +
      `---------------------------\n` +
      `RECENT TRANSACTIONS:\n`;

    entries.slice(-5).forEach((e) => {
      statementText += `${formatDate(e.date, settings.dateFormat)} | ${e.type} | `;
      if (e.debit > 0) statementText += `Dr: ${formatCurrency(e.debit, '')} `;
      if (e.credit > 0) statementText += `Cr: ${formatCurrency(e.credit, '')} `;
      statementText += `| Bal: ${formatCurrency(e.runningBalance, '')}\n`;
    });

    statementText +=
      `---------------------------\n` +
      `Thank you for your business! / برائے رابطہ: ${settings.businessPhone}`;

    const url = `https://wa.me/${shopkeeper.phone.replace(/\D/g, '')}?text=${encodeURIComponent(statementText)}`;
    window.open(url, '_blank');
  };

  const filteredShopkeepers = shopkeepers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.customerCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Date filtering on ledger entries
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const displayedEntries = (activeLedger?.entries || []).filter((e) => {
    if (dateFilter === 'all') return true;
    if (dateFilter === 'today') return e.date.startsWith(todayStr);
    if (dateFilter === 'yesterday') return e.date.startsWith(yesterdayStr);
    if (dateFilter === 'month') return new Date(e.date) >= startOfMonth;
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* If a shopkeeper is selected, show their full Ledger Details */}
      {activeLedger ? (
        <div className="space-y-4">
          
          {/* Back button & Action controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/90 shadow-sm">
            <button
              onClick={() => onSelectShopkeeper(null)}
              className="flex items-center gap-2 text-xs font-black text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              {lang === 'ur' ? 'تمام دکاندار' : 'All Shopkeepers'}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenRecoveryModal(activeLedger.shopkeeper.id)}
                className="btn-vibrant-emerald flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer active:scale-95 border border-emerald-300/40"
              >
                <HandCoins className="h-4 w-4 stroke-[2.5]" />
                {t.recordRecovery}
              </button>
              <button
                onClick={() => onOpenNewBill(activeLedger.shopkeeper.id)}
                className="btn-vibrant-blue flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer active:scale-95 border border-indigo-300/40"
              >
                <Receipt className="h-4 w-4 stroke-[2.5]" />
                {t.newBill}
              </button>
              <button
                onClick={handleShareStatement}
                className="btn-vibrant-whatsapp flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer active:scale-95 border border-emerald-300/40"
                title="Share via WhatsApp"
              >
                <MessageCircle className="h-4 w-4 stroke-[2.5]" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => window.print()}
                className="btn-vibrant-cyan flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer active:scale-95 border border-cyan-300/40"
              >
                <Printer className="h-4 w-4 stroke-[2.5]" />
                <span>{t.printStatement}</span>
              </button>
            </div>
          </div>

          {/* Shopkeeper Summary Profile Card - Vivid Sapphire Gradient */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                    {activeLedger.shopkeeper.customerCode}
                  </span>
                  <span className="text-xs text-indigo-200 font-medium">
                    {activeLedger.shopkeeper.status === 'active' ? 'Active Ledger Account' : 'Inactive'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5">
                  {activeLedger.shopkeeper.name}
                </h2>
                <p className="text-sm sm:text-base text-cyan-200 font-semibold mt-0.5">
                  {activeLedger.shopkeeper.shopName}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3">
                  <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    {activeLedger.shopkeeper.phone}
                  </span>
                  {activeLedger.shopkeeper.address && (
                    <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      {activeLedger.shopkeeper.address}
                    </span>
                  )}
                </div>
              </div>

              {/* Outstanding Balance Badge */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right shadow-inner">
                <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                  {t.currentBalance}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">
                  {formatCurrency(activeLedger.finalBalance, settings.currencySymbol)}
                </div>
                <div className="flex items-center justify-end gap-2 text-xs text-slate-300 mt-1.5 font-medium">
                  <span>Total Bills: {formatCurrency(activeLedger.shopkeeper.totalBills, '')}</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-semibold">Recovery: {formatCurrency(activeLedger.shopkeeper.totalRecovery, '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table & Date Filter */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">
                  {t.ledgerTitle}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  ({displayedEntries.length} entries)
                </span>
              </div>

              {/* Colorful Filter pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
                {[
                  { id: 'all', label: t.dateFilterAll },
                  { id: 'today', label: t.dateFilterToday },
                  { id: 'yesterday', label: t.dateFilterYesterday },
                  { id: 'month', label: t.dateFilterThisMonth },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDateFilter(f.id as any)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 ${
                      dateFilter === f.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">{t.date}</th>
                    <th className="py-3 px-3">Ref #</th>
                    <th className="py-3 px-3">{t.type}</th>
                    <th className="py-3 px-4">{t.description}</th>
                    <th className="py-3 px-3 text-right text-rose-600">{t.debit}</th>
                    <th className="py-3 px-3 text-right text-emerald-600">{t.credit}</th>
                    <th className="py-3 px-4 text-right font-black text-slate-900">{t.balance}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {formatDate(entry.date, settings.dateFormat)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {entry.transactionId}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            entry.type === 'BILL'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : entry.type === 'RECOVERY' || entry.type === 'PAYMENT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {entry.type === 'BILL'
                            ? lang === 'ur' ? 'خرید بل' : 'Bill'
                            : entry.type === 'RECOVERY'
                            ? lang === 'ur' ? 'وصولی' : 'Recovery'
                            : entry.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        <div className="font-medium">{entry.description}</div>
                        {entry.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 italic">{entry.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-rose-600 whitespace-nowrap">
                        {entry.debit > 0 ? formatCurrency(entry.debit, '') : '-'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                        {entry.credit > 0 ? formatCurrency(entry.credit, '') : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                        {formatCurrency(entry.runningBalance, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                  {displayedEntries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        {lang === 'ur' ? 'اس مدت میں کوئی ٹرانزیکشن موجود نہیں' : 'No entries found for this filter'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Shopkeeper Directory List */
        <div className="space-y-4">
          
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t.shopkeepers}
                </h2>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                  {shopkeepers.length} Accounts
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {lang === 'ur'
                  ? 'تمام دکاندار، کھاتے، بقایا جات اور لین دین کا ریکارڈ'
                  : 'Manage customer accounts, balances, and individual ledgers'}
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-vibrant-purple flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black shadow-lg border border-purple-300/40 transition cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              {t.addCustomer}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchShopkeeper}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium focus:border-indigo-500 focus:outline-none shadow-sm"
            />
          </div>

          {/* Shopkeepers Cards Grid with Colorful Accents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShopkeepers.map((sk, idx) => {
              const hasDebt = sk.currentBalance > 0;
              const gradients = [
                'from-blue-500 to-indigo-600',
                'from-indigo-500 to-purple-600',
                'from-violet-500 to-pink-600',
                'from-emerald-500 to-teal-600',
              ];
              const avatarGrad = gradients[idx % gradients.length];

              return (
                <div
                  key={sk.id}
                  onClick={() => onSelectShopkeeper(sk.id)}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${avatarGrad} text-white flex items-center justify-center font-black text-sm shadow-md`}>
                          {sk.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            {sk.customerCode}
                          </span>
                          <h3 className="font-black text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {sk.name}
                          </h3>
                          <div className="text-xs text-slate-600 font-semibold">{sk.shopName}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          {t.currentBalance}
                        </span>
                        <div
                          className={`text-lg font-black tracking-tight ${
                            hasDebt ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {formatCurrency(sk.currentBalance, settings.currencySymbol)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {sk.phone}
                      </span>
                      {sk.address && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {sk.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Colorful Quick actions row */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 gap-2">
                    <span className="text-xs font-black text-indigo-600 group-hover:underline">
                      View Khata Ledger →
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNewBill(sk.id);
                        }}
                        className="btn-vibrant-blue flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black transition cursor-pointer active:scale-95 border border-indigo-300/40"
                        title="Create New Bill"
                      >
                        <Receipt className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>+ Bill</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRecoveryModal(sk.id);
                        }}
                        className="btn-vibrant-emerald flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black transition cursor-pointer active:scale-95 border border-emerald-300/40"
                        title="Record Recovery"
                      >
                        <HandCoins className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>+ Recovery</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredShopkeepers.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">{t.noShopkeepersFound}</p>
            </div>
          )}
        </div>
      )}

      {/* Add Shopkeeper Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6">
            <h3 className="text-lg font-black text-slate-900">{t.addShopkeeperTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'ur' ? 'دکاندار کی بنیادی معلومات درج کریں' : 'Register customer profile and opening balance'}
            </p>

            <form onSubmit={handleCreateShopkeeper} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.customerName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Haji Muhammad Aslam"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.shopName}
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Al-Madina Super Store"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.phone} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.openingBalance} ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Market name, city, chowk"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-vibrant-purple rounded-xl px-6 py-2.5 text-xs font-black cursor-pointer active:scale-95 border border-purple-300/40"
                >
                  {isSubmitting ? 'Saving...' : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

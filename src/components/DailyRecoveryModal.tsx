import React, { useState, useEffect } from 'react';
import { Shopkeeper, Bill, Payment, AppSettings, Language } from '../types';
import { getShopkeepers, getBillsByShopkeeper, recordRecoveryPayment } from '../lib/storage';
import { syncPendingData } from '../lib/sync';
import { translations, formatCurrency } from '../lib/i18n';
import { X, Search, Check, AlertTriangle, ArrowRight, HandCoins, Sparkles } from 'lucide-react';

interface DailyRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
  initialShopkeeperId?: string;
  settings: AppSettings;
  lang: Language;
}

export const DailyRecoveryModal: React.FC<DailyRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialShopkeeperId,
  settings,
  lang,
}) => {
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [selectedShopkeeperId, setSelectedShopkeeperId] = useState<string>('');
  const [shopkeeperBills, setShopkeeperBills] = useState<Bill[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'cheque' | 'other'>('cash');
  const [notes, setNotes] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdvanceWarning, setShowAdvanceWarning] = useState<boolean>(false);
  const [allowAdvance, setAllowAdvance] = useState<boolean>(false);

  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      loadShopkeepers();
      setAmount('');
      setNotes('');
      setErrorMessage(null);
      setShowAdvanceWarning(false);
      setAllowAdvance(false);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      if (initialShopkeeperId) {
        setSelectedShopkeeperId(initialShopkeeperId);
      }
    }
  }, [isOpen, initialShopkeeperId]);

  const loadShopkeepers = async () => {
    const list = await getShopkeepers();
    setShopkeepers(list.filter((s) => s.status === 'active'));
  };

  useEffect(() => {
    if (selectedShopkeeperId) {
      loadBills(selectedShopkeeperId);
      setSelectedBillId('');
      setShowAdvanceWarning(false);
    } else {
      setShopkeeperBills([]);
    }
  }, [selectedShopkeeperId]);

  const loadBills = async (skId: string) => {
    const bills = await getBillsByShopkeeper(skId);
    const pendingBills = bills.filter((b) => b.remainingBalance > 0);
    setShopkeeperBills(pendingBills);
  };

  const selectedShopkeeper = shopkeepers.find((s) => s.id === selectedShopkeeperId);
  const selectedBill = shopkeeperBills.find((b) => b.id === selectedBillId);

  const filteredShopkeepers = shopkeepers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.customerCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAmountChange = (val: string) => {
    setAmount(val);
    setErrorMessage(null);
    const num = Number(val);
    if (selectedShopkeeper && num > selectedShopkeeper.currentBalance) {
      setShowAdvanceWarning(true);
    } else {
      setShowAdvanceWarning(false);
    }
  };

  const handleQuickAmount = (val: number) => {
    handleAmountChange(String(val));
  };

  const handleFullBalance = () => {
    if (selectedBill) {
      handleAmountChange(String(selectedBill.remainingBalance));
    } else if (selectedShopkeeper) {
      handleAmountChange(String(Math.max(0, selectedShopkeeper.currentBalance)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopkeeperId) {
      setErrorMessage('Please select a shopkeeper.');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage('Please enter a recovery amount greater than zero.');
      return;
    }

    if (selectedShopkeeper && numAmount > selectedShopkeeper.currentBalance && !allowAdvance) {
      setShowAdvanceWarning(true);
      setErrorMessage(`Recovery amount (₨ ${numAmount.toLocaleString()}) exceeds total outstanding balance (₨ ${selectedShopkeeper.currentBalance.toLocaleString()}). Please check the advance payment checkbox to proceed.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payment = await recordRecoveryPayment({
        shopkeeperId: selectedShopkeeperId,
        billId: selectedBillId || undefined,
        amount: numAmount,
        paymentDate,
        paymentMethod,
        notes: notes.trim(),
        user: { uid: 'admin_1', name: 'Authorized Staff' },
        allowAdvance: allowAdvance || numAmount <= (selectedShopkeeper?.currentBalance || 0),
      });

      // Background cloud sync
      syncPendingData().catch(console.warn);

      onSuccess(payment);
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error recording payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl flex flex-col max-h-[94vh] overflow-hidden border border-emerald-500/20">
        
        {/* Header - Vivid Emerald to Teal Gradient */}
        <div className="flex items-center justify-between border-b border-emerald-500/30 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <HandCoins className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight leading-tight">{t.recoveryModalTitle}</h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                {lang === 'ur' ? 'کھاتے اور بل میں فوری وصولی کا اندراج' : 'Instant Khata & Bill Recovery Entry'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-emerald-800 hover:text-white transition cursor-pointer active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Select Shopkeeper */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. {t.selectShopkeeper} <span className="text-rose-500">*</span>
            </label>

            {!selectedShopkeeper ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchShopkeeper}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-inner">
                  {filteredShopkeepers.map((sk, idx) => (
                    <button
                      key={sk.id}
                      type="button"
                      onClick={() => setSelectedShopkeeperId(sk.id)}
                      className="w-full text-left p-3 hover:bg-emerald-50/70 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {sk.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {sk.name}
                          </div>
                          <div className="text-xs text-slate-500">{sk.shopName} • {sk.phone}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{t.currentBalance}</div>
                        <div className="text-sm font-black text-rose-600">
                          {formatCurrency(sk.currentBalance, settings.currencySymbol)}
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredShopkeepers.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500 font-medium">{t.noShopkeepersFound}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-emerald-200/80 shadow-xs">
                <div>
                  <div className="font-black text-base text-slate-900">{selectedShopkeeper.name}</div>
                  <div className="text-xs text-slate-600 font-medium">{selectedShopkeeper.shopName} • {selectedShopkeeper.phone}</div>
                  <div className="text-xs font-black text-rose-600 mt-1">
                    Current Outstanding: {formatCurrency(selectedShopkeeper.currentBalance, settings.currencySymbol)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedShopkeeperId('')}
                  className="text-xs font-black text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-xs cursor-pointer active:scale-95"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* 2. Bill Allocation (Optional) */}
          {selectedShopkeeper && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. {t.allocatedBill}
              </label>
              <select
                value={selectedBillId}
                onChange={(e) => setSelectedBillId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
              >
                <option value="">{t.overallBalancePayment} (مجموعی کھاتہ)</option>
                {shopkeeperBills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.billNumber} - Date: {b.billDate} (Unpaid: {formatCurrency(b.remainingBalance, settings.currencySymbol)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Recovery Amount & Colorful Tactile Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. {t.recoveryAmount} <span className="text-rose-500">*</span>
              </label>
              {selectedShopkeeper && (
                <button
                  type="button"
                  onClick={handleFullBalance}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer transition active:scale-95"
                >
                  Full Balance ({formatCurrency(selectedBill ? selectedBill.remainingBalance : selectedShopkeeper.currentBalance, settings.currencySymbol)})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-3.5 text-lg font-black text-emerald-600">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                min="1"
                step="any"
                className="w-full rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 py-3.5 pl-11 pr-4 text-2xl font-black text-slate-900 focus:bg-white focus:outline-none shadow-inner"
              />
            </div>

            {/* Colorful Tactile Quick Amount Chips */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[
                { val: 1000, cls: 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-200' },
                { val: 2000, cls: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border-indigo-200' },
                { val: 5000, cls: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border-emerald-200' },
                { val: 10000, cls: 'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border-purple-200' },
                { val: 20000, cls: 'bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border-amber-200' },
                { val: 50000, cls: 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-rose-200' },
              ].map(({ val, cls }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-xs ${cls}`}
                >
                  +{val.toLocaleString()}
                </button>
              ))}

              {selectedShopkeeper && selectedShopkeeper.currentBalance > 0 && (
                <button
                  type="button"
                  onClick={handleFullBalance}
                  className="rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 px-3 py-1.5 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  Full Balance ({formatCurrency(selectedShopkeeper.currentBalance, '')})
                </button>
              )}
            </div>

            {/* Advance warning */}
            {showAdvanceWarning && (
              <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Amount exceeds outstanding balance!</span>
                </div>
                <p className="font-medium">
                  You are entering ₨ {Number(amount).toLocaleString()} which is more than the current balance of ₨ {selectedShopkeeper?.currentBalance.toLocaleString()}.
                </p>
                <label className="flex items-center gap-2 font-bold text-amber-950 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={allowAdvance}
                    onChange={(e) => setAllowAdvance(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                  <span>Record excess as customer advance credit (پیشگی وصولی)</span>
                </label>
              </div>
            )}
          </div>

          {/* 4. Payment Date & Method */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. {t.paymentDate}
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                5. {t.paymentMethod}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
              >
                <option value="cash">{t.cash}</option>
                <option value="bank_transfer">{t.bankTransfer}</option>
                <option value="cheque">{t.cheque}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              6. {t.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Counter collection, Cash received by Bilal"
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit Button - Elevated Glowing Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedShopkeeperId || !amount}
              className="w-full flex items-center justify-center gap-2 rounded-2xl btn-vibrant-emerald font-black text-base py-4 border border-emerald-300/40 transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <Check className="h-5 w-5 stroke-[3]" />
              {isSubmitting ? 'Saving...' : t.savePayment}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

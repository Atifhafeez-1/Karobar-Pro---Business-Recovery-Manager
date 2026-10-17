import React, { useState, useEffect } from 'react';
import {
  Shopkeeper,
  Product,
  Bill,
  AppSettings,
  Language,
} from '../types';
import {
  getShopkeepers,
  getProducts,
  getBills,
  createBill,
} from '../lib/storage';
import { syncPendingData } from '../lib/sync';
import { translations, formatCurrency, formatDate } from '../lib/i18n';
import {
  Receipt,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Search,
  Printer,
  Eye,
  CreditCard,
  Banknote,
  Clock,
  Sparkles,
} from 'lucide-react';

interface BillingViewProps {
  onBillCreated: (bill: Bill) => void;
  onViewBillReceipt: (bill: Bill) => void;
  initialShopkeeperId?: string | null;
  settings: AppSettings;
  lang: Language;
}

interface LineItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export const BillingView: React.FC<BillingViewProps> = ({
  onBillCreated,
  onViewBillReceipt,
  initialShopkeeperId,
  settings,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  // Bill Form states
  const [selectedShopkeeperId, setSelectedShopkeeperId] = useState<string>('');
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { productId: '', quantity: 1, unitPrice: 0 },
  ]);
  const [discount, setDiscount] = useState<string>('0');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'credit' | 'partial'>('credit');
  const [paidAmount, setPaidAmount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    loadData();
    if (initialShopkeeperId) {
      setSelectedShopkeeperId(initialShopkeeperId);
      setActiveTab('create');
    }
  }, [initialShopkeeperId]);

  const loadData = async () => {
    const [sk, pr, bl] = await Promise.all([
      getShopkeepers(),
      getProducts(),
      getBills(),
    ]);
    setShopkeepers(sk.filter((s) => s.status === 'active'));
    setProducts(pr.filter((p) => p.status === 'active'));
    setBills(bl);
  };

  const selectedShopkeeper = shopkeepers.find((s) => s.id === selectedShopkeeperId);

  // Calculate bill totals
  const subtotal = lineItems.reduce((acc, item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return acc;
    return acc + item.quantity * item.unitPrice;
  }, 0);

  const numDiscount = Math.max(0, Number(discount) || 0);
  const netTotal = Math.max(0, subtotal - numDiscount);

  const handlePaymentModeChange = (mode: 'cash' | 'credit' | 'partial') => {
    setPaymentMode(mode);
    if (mode === 'cash') {
      setPaidAmount(String(netTotal));
    } else if (mode === 'credit') {
      setPaidAmount('0');
    }
  };

  const remainingOnKhata = Math.max(0, netTotal - (Number(paidAmount) || 0));

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...lineItems];
    updated[index].productId = productId;
    if (prod) {
      updated[index].unitPrice = prod.sellingPrice;
    }
    setLineItems(updated);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index].quantity = Math.max(1, qty);
    setLineItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...lineItems];
    updated[index].unitPrice = Math.max(0, price);
    setLineItems(updated);
  };

  const handleAddLine = () => {
    setLineItems([...lineItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopkeeperId) {
      setErrorMessage('Please select a shopkeeper.');
      return;
    }

    const validItems = lineItems.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setErrorMessage('Please add at least one product item to the bill.');
      return;
    }

    for (const item of validItems) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.currentStock < item.quantity) {
        setErrorMessage(`Insufficient stock for ${prod.name}! Only ${prod.currentStock} units available.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const billItems = validItems.map((item) => {
        const prod = products.find((p) => p.id === item.productId)!;
        return {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: prod.purchasePrice,
        };
      });

      const bill = await createBill({
        shopkeeperId: selectedShopkeeperId,
        items: billItems,
        discount: numDiscount,
        paymentMethod: paymentMode,
        paidAmount: Number(paidAmount) || 0,
        billDate,
        notes: notes.trim(),
        user: { uid: 'admin_1', name: 'Authorized Staff' },
      });

      syncPendingData().catch(console.warn);
      await loadData();

      setLineItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
      setDiscount('0');
      setPaidAmount('0');
      setNotes('');
      setPaymentMode('credit');

      onBillCreated(bill);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error creating bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Toggle: Create Bill vs Bill History */}
      <div className="flex items-center justify-between bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + {t.newSaleTitle}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ur' ? 'سابقہ بلات کی فہرست' : 'Bill History'} ({bills.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer & Bill Date Header */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                {t.selectShopkeeper} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedShopkeeperId}
                onChange={(e) => setSelectedShopkeeperId(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Choose Customer / Shopkeeper --</option>
                {shopkeepers.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.shopName}) - Current Debt: {formatCurrency(sk.currentBalance, settings.currencySymbol)}
                  </option>
                ))}
              </select>

              {selectedShopkeeper && (
                <div className="mt-2.5 text-xs font-bold text-slate-500 flex items-center gap-2">
                  <span>Previous Khata Debt:</span>
                  <span className="text-rose-600 font-black">
                    {formatCurrency(selectedShopkeeper.currentBalance, settings.currencySymbol)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                {lang === 'ur' ? 'بل کی تاریخ' : 'Bill Date'}
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">{t.selectProducts}</h3>
              <button
                type="button"
                onClick={handleAddLine}
                className="btn-vibrant-blue flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 border border-indigo-300/40 shadow-sm"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                {t.addItem}
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const lineTotal = item.quantity * item.unitPrice;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 grid grid-cols-12 gap-2.5 items-center hover:bg-slate-50 transition"
                  >
                    {/* Product Selection */}
                    <div className="col-span-12 sm:col-span-5">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.currentStock <= 0}>
                            {p.name} (Stock: {p.currentStock}) - Rate: {formatCurrency(p.sellingPrice, '')}
                          </option>
                        ))}
                      </select>
                      {prod && prod.currentStock <= prod.minStockAlert && (
                        <div className="text-[10px] text-amber-700 font-bold mt-1">
                          Alert: Only {prod.currentStock} left in stock!
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        max={prod ? prod.currentStock : 9999}
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-black text-center focus:border-blue-500 focus:outline-none"
                        placeholder="Qty"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-right focus:border-blue-500 focus:outline-none"
                        placeholder="Rate"
                      />
                    </div>

                    {/* Line Total */}
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <div className="text-xs font-black text-slate-900">
                        {formatCurrency(lineTotal, settings.currencySymbol)}
                      </div>
                    </div>

                    {/* Remove Action */}
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lineItems.length === 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-20 transition cursor-pointer p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Terms & Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Colorful Payment Mode Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t.paymentType}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handlePaymentModeChange('credit')}
                    className={`p-3.5 rounded-2xl border text-xs font-black text-center transition cursor-pointer active:scale-95 ${
                      paymentMode === 'credit'
                        ? 'border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-800 shadow-sm ring-2 ring-rose-400/30'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t.creditSale}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentModeChange('cash')}
                    className={`p-3.5 rounded-2xl border text-xs font-black text-center transition cursor-pointer active:scale-95 ${
                      paymentMode === 'cash'
                        ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-800 shadow-sm ring-2 ring-emerald-400/30'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t.cashSale}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentModeChange('partial')}
                    className={`p-3.5 rounded-2xl border text-xs font-black text-center transition cursor-pointer active:scale-95 ${
                      paymentMode === 'partial'
                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-800 shadow-sm ring-2 ring-blue-400/30'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t.partialPayment}
                  </button>
                </div>
              </div>

              {paymentMode === 'partial' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.amountPaidNow} ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={netTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full rounded-2xl border-2 border-blue-500 p-3 text-sm font-black focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.notes}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Driver info, special terms..."
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl p-5 border border-indigo-100/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>{t.subtotal}:</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal, settings.currencySymbol)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">{t.discount}:</span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs font-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-indigo-200/60">
                <span>{t.netTotal}:</span>
                <span className="text-blue-700">{formatCurrency(netTotal, settings.currencySymbol)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-bold">
                <span>{t.amountPaidNow}:</span>
                <span>{formatCurrency(Number(paidAmount) || 0, settings.currencySymbol)}</span>
              </div>

              <div className="flex justify-between text-rose-600 font-black">
                <span>{t.remainingCredit}:</span>
                <span>{formatCurrency(remainingOnKhata, settings.currencySymbol)}</span>
              </div>

              {selectedShopkeeper && (
                <div className="pt-2 border-t border-indigo-200/60 text-slate-700 flex justify-between font-black">
                  <span>New Total Khata Debt:</span>
                  <span className="text-rose-700">
                    {formatCurrency(selectedShopkeeper.currentBalance + remainingOnKhata, settings.currencySymbol)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button - Elevated Vibrant Gradient Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedShopkeeperId || subtotal <= 0}
            className="btn-vibrant-blue w-full flex items-center justify-center gap-2 rounded-2xl font-black text-base py-4 border border-indigo-300/40 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <Check className="h-5 w-5 stroke-[3]" />
            {isSubmitting ? 'Generating Bill...' : t.generateBill}
          </button>
        </form>
      ) : (
        /* Bill History View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900">
              {lang === 'ur' ? 'تمام سابقہ سیلز بلات' : 'Sales Bills & Invoices'}
            </h3>
            <span className="text-xs text-slate-400 font-medium">Total: {bills.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Bill #</th>
                  <th className="py-3.5 px-3">{t.date}</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-3 text-right">Total</th>
                  <th className="py-3.5 px-3 text-right">Paid</th>
                  <th className="py-3.5 px-3 text-right text-rose-600">Balance</th>
                  <th className="py-3.5 px-3 text-center">{t.status}</th>
                  <th className="py-3.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {b.billNumber}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(b.billDate, settings.dateFormat)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {b.shopkeeperName}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatCurrency(b.netAmount, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(b.paidAmount, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-rose-600 whitespace-nowrap">
                      {formatCurrency(b.remainingBalance, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          b.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : b.status === 'partial'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onViewBillReceipt(b)}
                        className="btn-vibrant-cyan inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black border border-cyan-300/40 transition cursor-pointer active:scale-95"
                      >
                        <Eye className="h-3.5 w-3.5 stroke-[2.5]" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No bills generated yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

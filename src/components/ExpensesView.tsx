import React, { useState, useEffect } from 'react';
import { Expense, AppSettings, Language } from '../types';
import { getExpenses, addExpense } from '../lib/storage';
import { syncPendingData } from '../lib/sync';
import { translations, formatCurrency, formatDate } from '../lib/i18n';
import { DollarSign, Plus, Calendar, Tag, CreditCard, AlertCircle } from 'lucide-react';

interface ExpensesViewProps {
  settings: AppSettings;
  lang: Language;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ settings, lang }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [category, setCategory] = useState('Transport & Fuel');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'other'>('cash');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const t = translations[lang];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const list = await getExpenses();
    setExpenses(list);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description) return;

    try {
      await addExpense({
        category,
        amount: Number(amount),
        expenseDate,
        paymentMethod,
        description: description.trim(),
        notes: notes.trim(),
        createdBy: 'Authorized Staff',
      });

      syncPendingData().catch(console.warn);
      await loadExpenses();
      setIsAddModalOpen(false);

      // Reset
      setAmount('');
      setDescription('');
      setNotes('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error logging expense');
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayTotal = expenses
    .filter((e) => e.expenseDate.startsWith(todayStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const monthTotal = expenses
    .filter((e) => new Date(e.expenseDate) >= startOfMonth)
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.expenseTitle}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span>
              Today's Expenses:{' '}
              <strong className="text-red-600 font-bold">
                {formatCurrency(todayTotal, settings.currencySymbol)}
              </strong>
            </span>
            <span>•</span>
            <span>
              This Month:{' '}
              <strong className="text-slate-900 font-bold">
                {formatCurrency(monthTotal, settings.currencySymbol)}
              </strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-vibrant-rose flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black border border-rose-300/40 shadow-lg transition cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          {t.addExpense}
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t.expenseDate}</th>
                <th className="py-3 px-3">{t.expenseCategory}</th>
                <th className="py-3 px-4">{t.description}</th>
                <th className="py-3 px-3">Paid Via</th>
                <th className="py-3 px-4 text-right text-red-600 font-bold">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {formatDate(e.expenseDate, settings.dateFormat)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    <div>{e.description}</div>
                    {e.notes && <div className="text-[11px] text-slate-400 italic">{e.notes}</div>}
                  </td>
                  <td className="py-3 px-3 uppercase text-slate-500 whitespace-nowrap">
                    {e.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-red-600 whitespace-nowrap">
                    {formatCurrency(e.amount, settings.currencySymbol)}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No operating expenses recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <h3 className="text-lg font-black text-slate-900">Record Business Expense</h3>
            <p className="text-xs text-slate-500 mt-0.5">Log operating overhead or utility cost</p>

            <form onSubmit={handleAddExpense} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Expense Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-red-500 focus:outline-none"
                >
                  <option value="Transport & Fuel">Transport & Fuel (گاڑی، پٹرول)</option>
                  <option value="Electricity / Utilities">Electricity / Utilities (بجلی، پانی، گیس)</option>
                  <option value="Staff Salaries">Staff Salaries (ملازمین کی تنخواہیں)</option>
                  <option value="Shop / Godown Rent">Shop / Godown Rent (دکان یا گودام کرایہ)</option>
                  <option value="Refreshment & Food">Refreshment & Food (چائے، کھانا)</option>
                  <option value="Maintenance & Repair">Maintenance & Repair (مرمت)</option>
                  <option value="Miscellaneous / Other">Miscellaneous / Other (متفرق)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount ({settings.currencySymbol}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full rounded-xl border-2 border-red-500 p-2.5 text-base font-black text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-red-500 focus:outline-none"
                  >
                    <option value="cash">Cash (نقد)</option>
                    <option value="bank_transfer">Bank Transfer (آن لائن)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Item <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Delivery van diesel for Friday route"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Additional Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional bill or voucher reference"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-vibrant-rose rounded-xl px-6 py-2.5 text-xs font-black border border-rose-300/40 cursor-pointer active:scale-95"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

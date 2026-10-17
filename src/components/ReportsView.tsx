import React, { useState, useEffect } from 'react';
import {
  Shopkeeper,
  Product,
  Bill,
  Payment,
  Expense,
  AppSettings,
  Language,
} from '../types';
import {
  getShopkeepers,
  getProducts,
  getBills,
  getPayments,
  getExpenses,
} from '../lib/storage';
import { translations, formatCurrency, formatDate } from '../lib/i18n';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

interface ReportsViewProps {
  settings: AppSettings;
  lang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ settings, lang }) => {
  const [reportType, setReportType] = useState<
    'overview' | 'shopkeeperDebt' | 'salesVsRecovery' | 'profit' | 'unpaidBills'
  >('overview');

  const [dateRange, setDateRange] = useState<'all' | 'today' | 'month'>('month');
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const t = translations[lang];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [sk, pr, bl, py, ex] = await Promise.all([
      getShopkeepers(),
      getProducts(),
      getBills(),
      getPayments(),
      getExpenses(),
    ]);
    setShopkeepers(sk);
    setProducts(pr);
    setBills(bl);
    setPayments(py);
    setExpenses(ex);
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const isInRange = (dStr: string) => {
    if (!dStr) return false;
    if (dateRange === 'all') return true;
    if (dateRange === 'today') return dStr.startsWith(todayStr);
    if (dateRange === 'month') return new Date(dStr) >= startOfMonth;
    return true;
  };

  const filteredBills = bills.filter((b) => isInRange(b.billDate));
  const filteredPayments = payments.filter((p) => isInRange(p.paymentDate));
  const filteredExpenses = expenses.filter((e) => isInRange(e.expenseDate));

  // Analytics Calculations
  const totalSalesRevenue = filteredBills.reduce((acc, b) => acc + b.netAmount, 0);

  // Cost of Goods Sold (COGS)
  const totalCOGS = filteredBills.reduce((acc, b) => {
    const billCost = b.items.reduce((iAcc, item) => iAcc + item.quantity * item.costPrice, 0);
    return acc + billCost;
  }, 0);

  const estimatedGrossProfit = Math.max(0, totalSalesRevenue - totalCOGS);
  const totalOperatingExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedNetProfit = estimatedGrossProfit - totalOperatingExpenses;

  const totalRecoveryReceived = filteredPayments
    .filter((p) => p.type === 'recovery' || p.type === 'advance')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalCreditIssued = filteredBills.reduce((acc, b) => acc + b.remainingBalance, 0);
  const totalImmediateCash = filteredBills.reduce((acc, b) => acc + b.paidAmount, 0);

  const totalOutstandingAllShopkeepers = shopkeepers.reduce((acc, s) => acc + s.currentBalance, 0);

  const unpaidOrPartialBills = bills.filter((b) => b.remainingBalance > 0);

  // CSV Export
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'shopkeeperDebt') {
      csvContent += 'Customer Code,Name,Shop Name,Phone,Opening Balance,Total Bills,Total Paid,Current Outstanding\n';
      shopkeepers.forEach((s) => {
        csvContent += `"${s.customerCode}","${s.name}","${s.shopName}","${s.phone}",${s.openingBalance},${s.totalBills},${s.totalPaid},${s.currentBalance}\n`;
      });
    } else if (reportType === 'unpaidBills') {
      csvContent += 'Bill Number,Date,Customer,Total Amount,Paid Amount,Remaining Balance,Status\n';
      unpaidOrPartialBills.forEach((b) => {
        csvContent += `"${b.billNumber}","${b.billDate}","${b.shopkeeperName}",${b.netAmount},${b.paidAmount},${b.remainingBalance},"${b.status}"\n`;
      });
    } else {
      csvContent += 'Date,Transaction Type,Reference,Customer,Debit,Credit,Notes\n';
      filteredBills.forEach((b) => {
        csvContent += `"${b.billDate}","BILL","${b.billNumber}","${b.shopkeeperName}",${b.netAmount},0,"${b.notes || ''}"\n`;
      });
      filteredPayments.forEach((p) => {
        csvContent += `"${p.paymentDate}","${p.type.toUpperCase()}","${p.transactionId}","${p.shopkeeperName}",0,${p.amount},"${p.notes || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Karobar_Report_${reportType}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header & Range Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {t.reportsTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ur'
              ? 'کاروباری منافع، وصولی بمقابلہ ادھار اور واجب الادا کھاتوں کی تفصیلی رپورٹ'
              : 'Financial audits, profit analysis, debt aging, and CSV data export'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Date range picker */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'month', 'today'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                  dateRange === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-vibrant-emerald flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black border border-emerald-300/40 transition cursor-pointer active:scale-95 shadow-sm"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={() => window.print()}
            className="btn-vibrant-cyan flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black border border-cyan-300/40 transition cursor-pointer active:scale-95 shadow-sm"
            title="Print Report"
          >
            <Printer className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Sub-report Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Financial Overview', activeCls: 'btn-vibrant-blue' },
          { id: 'profit', label: 'Profit & Loss (منافع)', activeCls: 'btn-vibrant-emerald' },
          { id: 'shopkeeperDebt', label: 'Shopkeeper Debt Ledger', activeCls: 'btn-vibrant-purple' },
          { id: 'salesVsRecovery', label: 'Recovery vs Credit Sales', activeCls: 'btn-vibrant-amber' },
          { id: 'unpaidBills', label: `Pending Bills (${unpaidOrPartialBills.length})`, activeCls: 'btn-vibrant-rose' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-150 cursor-pointer active:scale-95 ${
              reportType === tab.id
                ? `${tab.activeCls} shadow-md`
                : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview & Key Financial Indicators */}
      {reportType === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-400">Total Sales</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(totalSalesRevenue, settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{filteredBills.length} Invoices generated</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-400">Recovery Received</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(totalRecoveryReceived, settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{filteredPayments.length} Collections logged</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-400">New Credit Given</span>
              <div className="text-xl sm:text-2xl font-black text-red-600 mt-1">
                {formatCurrency(totalCreditIssued, settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Added to customer khata</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-400">Operating Expenses</span>
              <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
                {formatCurrency(totalOperatingExpenses, settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{filteredExpenses.length} Expense entries</div>
            </div>
          </div>

          {/* Ratio Comparison Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Cash Inflow vs Khata Credit Ratio</h3>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${
                    totalImmediateCash + totalRecoveryReceived > 0
                      ? Math.min(
                          100,
                          Math.round(
                            ((totalImmediateCash + totalRecoveryReceived) /
                              (totalSalesRevenue + 1)) *
                              100
                          )
                        )
                      : 0
                  }%`,
                }}
                className="bg-emerald-600 h-full transition-all"
                title="Cash Received"
              />
              <div
                style={{
                  width: `${
                    totalCreditIssued > 0
                      ? Math.min(
                          100,
                          Math.round((totalCreditIssued / (totalSalesRevenue + 1)) * 100)
                        )
                      : 0
                  }%`,
                }}
                className="bg-red-500 h-full transition-all"
                title="Credit Extended"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Cash Collected: {formatCurrency(totalImmediateCash + totalRecoveryReceived, settings.currencySymbol)}
              </span>
              <span className="flex items-center gap-1.5 text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Credit Pending: {formatCurrency(totalCreditIssued, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Profit & Loss Report */}
      {reportType === 'profit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-black text-lg text-slate-900">Estimated Gross & Net Profit</h3>
            <p className="text-xs text-slate-500">
              Calculated using purchase cost of goods sold (COGS) and logged expenses
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
              <span className="font-medium">1. Total Sales Revenue (سیلز آمدنی):</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(totalSalesRevenue, settings.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 text-red-600">
              <span className="font-medium">2. Less Cost of Goods Sold (مال کی خریداری لاگت):</span>
              <span className="font-bold">
                - {formatCurrency(totalCOGS, settings.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between py-2.5 bg-emerald-50 px-3 rounded-xl text-emerald-900 font-bold">
              <span>= Estimated Gross Profit (مجموعی منافع):</span>
              <span className="text-emerald-700 text-base">
                {formatCurrency(estimatedGrossProfit, settings.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 text-amber-700">
              <span className="font-medium">3. Less Operating Business Expenses (کاروباری اخراجات):</span>
              <span className="font-bold">
                - {formatCurrency(totalOperatingExpenses, settings.currencySymbol)}
              </span>
            </div>

            <div className="flex justify-between py-3 bg-slate-900 text-white px-4 rounded-xl font-black text-base shadow-sm">
              <span>= Net Business Profit (خالص منافع):</span>
              <span className={estimatedNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {formatCurrency(estimatedNetProfit, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Shopkeeper Debt Ranking */}
      {reportType === 'shopkeeperDebt' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Shopkeeper Outstanding Debt Ranking</h3>
            <span className="text-xs font-bold text-red-600">
              Total Debt: {formatCurrency(totalOutstandingAllShopkeepers, settings.currencySymbol)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Shop Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3 text-right">Total Bills</th>
                  <th className="py-3 px-3 text-right">Recovery Paid</th>
                  <th className="py-3 px-4 text-right text-red-600 font-bold">Outstanding Debt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...shopkeepers]
                  .sort((a, b) => b.currentBalance - a.currentBalance)
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{s.customerCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-3 text-slate-600">{s.shopName}</td>
                      <td className="py-3 px-3 text-slate-600">{s.phone}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        {formatCurrency(s.totalBills, '')}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(s.totalPaid, '')}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-red-600">
                        {formatCurrency(s.currentBalance, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unpaid / Partial Bills */}
      {reportType === 'unpaidBills' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Unpaid & Partially Paid Bills</h3>
            <span className="text-xs text-slate-400">Total: {unpaidOrPartialBills.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3 text-right">Bill Total</th>
                  <th className="py-3 px-3 text-right text-emerald-600">Paid</th>
                  <th className="py-3 px-4 text-right text-red-600 font-bold">Unpaid Balance</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unpaidOrPartialBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{b.billNumber}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(b.billDate, settings.dateFormat)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.shopkeeperName}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700">
                      {formatCurrency(b.netAmount, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(b.paidAmount, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-red-600">
                      {formatCurrency(b.remainingBalance, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

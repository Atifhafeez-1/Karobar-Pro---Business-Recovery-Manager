import React from 'react';
import { Bill, Payment, AppSettings } from '../types';
import { formatCurrency, formatDate } from '../lib/i18n';
import { Printer, Share2, X, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'bill' | 'recovery';
  bill?: Bill | null;
  payment?: Payment | null;
  settings: AppSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  type,
  bill,
  payment,
  settings,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let text = '';
    if (type === 'recovery' && payment) {
      text = `*--- ${settings.businessName} ---*\n` +
        `*RECOVERY RECEIPT / وصولی رسید*\n` +
        `Ref ID: ${payment.transactionId}\n` +
        `Date: ${formatDate(payment.paymentDate, settings.dateFormat)}\n` +
        `Shopkeeper: ${payment.shopkeeperName}\n` +
        `---------------------------\n` +
        `*Amount Received: ${formatCurrency(payment.amount, settings.currencySymbol)}*\n` +
        `Payment Method: ${payment.paymentMethod.toUpperCase()}\n` +
        (payment.billNumber ? `Allocated Bill: ${payment.billNumber}\n` : '') +
        `Previous Balance: ${formatCurrency(payment.previousBalance, settings.currencySymbol)}\n` +
        `*Remaining Balance: ${formatCurrency(payment.newBalance, settings.currencySymbol)}*\n` +
        `---------------------------\n` +
        `Thank you! / شکریہ\n` +
        `Contact: ${settings.businessPhone}`;
    } else if (type === 'bill' && bill) {
      let itemsList = bill.items
        .map((i) => `• ${i.productName} x ${i.quantity} = ${formatCurrency(i.totalPrice, settings.currencySymbol)}`)
        .join('\n');

      text = `*--- ${settings.businessName} ---*\n` +
        `*INVOICE / بل*\n` +
        `Bill #: ${bill.billNumber}\n` +
        `Date: ${formatDate(bill.billDate, settings.dateFormat)}\n` +
        `Customer: ${bill.shopkeeperName}\n` +
        `---------------------------\n` +
        `ITEMS:\n${itemsList}\n` +
        `---------------------------\n` +
        `Subtotal: ${formatCurrency(bill.subtotal, settings.currencySymbol)}\n` +
        (bill.discount > 0 ? `Discount: -${formatCurrency(bill.discount, settings.currencySymbol)}\n` : '') +
        `*Net Total: ${formatCurrency(bill.netAmount, settings.currencySymbol)}*\n` +
        `Amount Paid: ${formatCurrency(bill.paidAmount, settings.currencySymbol)}\n` +
        `*Balance Added to Khata: ${formatCurrency(bill.remainingBalance, settings.currencySymbol)}*\n` +
        `Previous Balance: ${formatCurrency(bill.previousBalance, settings.currencySymbol)}\n` +
        `*Total Outstanding: ${formatCurrency(bill.previousBalance + bill.remainingBalance, settings.currencySymbol)}*\n` +
        `---------------------------\n` +
        `${settings.invoiceFooterNote}\n` +
        `Contact: ${settings.businessPhone}`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:shadow-none print:max-h-full print:w-full print:border-none">
        
        {/* Header - Hidden on print */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50 px-5 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-lg">
              {type === 'recovery' ? 'Recovery Receipt (وصولی رسید)' : 'Sales Bill (سیل بل)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="receipt-content" className="p-6 overflow-y-auto space-y-4 text-sm text-gray-800 font-sans print:p-8">
          
          {/* Business Brand Header */}
          <div className="text-center pb-3 border-b border-dashed border-gray-300">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">{settings.businessName}</h2>
            <p className="text-xs text-gray-600 mt-0.5">{settings.businessAddress}</p>
            <p className="text-xs text-gray-600 font-medium">Tel / WhatsApp: {settings.businessPhone}</p>
            <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
              {type === 'recovery' ? 'Daily Recovery Voucher' : 'Cash / Credit Bill'}
            </div>
          </div>

          {/* Details Row */}
          {type === 'recovery' && payment && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Receipt #: <strong className="text-gray-900">{payment.transactionId}</strong></span>
                <span>Date: <strong className="text-gray-900">{formatDate(payment.paymentDate, settings.dateFormat)}</strong></span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-gray-500 uppercase font-semibold">Shopkeeper / دکاندار</span>
                <p className="text-base font-bold text-gray-900">{payment.shopkeeperName}</p>
                {payment.billNumber && (
                  <p className="text-xs text-blue-700 mt-0.5">Applied to Bill: {payment.billNumber}</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                  Amount Received (موصول رقم)
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {formatCurrency(payment.amount, settings.currencySymbol)}
                </div>
                <div className="text-xs text-emerald-600 mt-1 font-medium">
                  Payment Mode: {payment.paymentMethod.toUpperCase()}
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Previous Outstanding:</span>
                  <span className="font-semibold">{formatCurrency(payment.previousBalance, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Less Payment Received:</span>
                  <span>- {formatCurrency(payment.amount, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-200 text-gray-900">
                  <span>Current Outstanding Balance:</span>
                  <span className={payment.newBalance > 0 ? 'text-red-600 font-black' : 'text-emerald-700 font-black'}>
                    {formatCurrency(payment.newBalance, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {payment.notes && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="font-semibold text-gray-700">Remarks:</span> {payment.notes}
                </div>
              )}
            </div>
          )}

          {type === 'bill' && bill && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Bill #: <strong className="text-gray-900">{bill.billNumber}</strong></span>
                <span>Date: <strong className="text-gray-900">{formatDate(bill.billDate, settings.dateFormat)}</strong></span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-xs text-gray-500 uppercase font-semibold">Customer / خریدار</span>
                <p className="text-sm font-bold text-gray-900">{bill.shopkeeperName}</p>
              </div>

              {/* Items List */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500 text-left">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bill.items.map((item, idx) => (
                    <tr key={idx} className="py-1.5">
                      <td className="py-1.5 font-medium text-gray-900 pr-1">{item.productName}</td>
                      <td className="py-1.5 text-center text-gray-700 font-semibold">{item.quantity}</td>
                      <td className="py-1.5 text-right text-gray-600">{formatCurrency(item.unitPrice, '')}</td>
                      <td className="py-1.5 text-right font-bold text-gray-900">{formatCurrency(item.totalPrice, '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Breakdown */}
              <div className="border-t border-gray-300 pt-2 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(bill.subtotal, settings.currencySymbol)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatCurrency(bill.discount, settings.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-200">
                  <span>Bill Total:</span>
                  <span>{formatCurrency(bill.netAmount, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Paid Now:</span>
                  <span>{formatCurrency(bill.paidAmount, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-red-700 font-semibold">
                  <span>Added to Khata:</span>
                  <span>{formatCurrency(bill.remainingBalance, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <span>Previous Balance:</span>
                  <span>{formatCurrency(bill.previousBalance, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total Net Outstanding:</span>
                  <span className="text-red-600">
                    {formatCurrency(bill.previousBalance + bill.remainingBalance, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center pt-3 border-t border-dashed border-gray-300 text-xs text-gray-500 space-y-1">
            <p>{settings.invoiceFooterNote}</p>
            <p className="font-semibold text-gray-700">Software: Karobar Pro (کاروبار پرو)</p>
          </div>
        </div>

        {/* Action Buttons - Hidden on Print */}
        <div className="grid grid-cols-2 gap-3.5 p-4 bg-slate-50 border-t border-slate-100 print:hidden">
          <button
            onClick={handleWhatsAppShare}
            className="btn-vibrant-whatsapp flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black border border-emerald-300/40 transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Share2 className="h-4 w-4 stroke-[3]" />
            WhatsApp Share
          </button>
          <button
            onClick={handlePrint}
            className="btn-vibrant-blue flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black border border-indigo-300/40 transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Printer className="h-4 w-4 stroke-[2.5]" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

import { Language } from '../types';

export const translations = {
  en: {
    appTitle: 'Karobar Pro',
    appSubtitle: 'Business & Daily Recovery Manager',
    dashboard: 'Dashboard',
    shopkeepers: 'Shopkeepers',
    recovery: 'Daily Recovery',
    billing: 'Sales & Bills',
    inventory: 'Inventory',
    expenses: 'Expenses',
    reports: 'Reports',
    exportApk: 'Export APK',
    settings: 'Settings',
    
    // Dashboard Cards
    todaySales: "Today's Sales",
    cashReceivedToday: 'Cash Received Today',
    creditSalesToday: 'Credit Sales Today',
    totalOutstanding: 'Total Outstanding Balance',
    totalRecoveryToday: 'Recovery Received Today',
    inventoryValue: 'Total Inventory Value',
    lowStockAlerts: 'Low Stock Alerts',
    
    // Quick Actions
    newBill: '+ New Bill / Sale',
    recordRecovery: '+ Record Daily Recovery',
    addCustomer: '+ Add Shopkeeper',
    addProduct: '+ Add Product',
    viewLedger: 'View Khata Ledger',
    
    // Shopkeeper / Customer
    customerCode: 'Customer ID',
    customerName: 'Shopkeeper Name',
    shopName: 'Shop Name',
    phone: 'Mobile Number',
    address: 'Address / Market',
    openingBalance: 'Opening Balance',
    currentBalance: 'Outstanding Balance',
    totalBills: 'Total Bills',
    totalPaid: 'Total Paid',
    totalRecoveryCount: 'Total Recovery',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    searchShopkeeper: 'Search by name, shop, or phone...',
    noShopkeepersFound: 'No shopkeepers found',
    addShopkeeperTitle: 'Register New Shopkeeper',
    
    // Ledger & Transactions
    ledgerTitle: 'Customer Account Ledger (کھاتہ)',
    date: 'Date',
    txnId: 'Transaction ID',
    billNo: 'Bill #',
    type: 'Type',
    debit: 'Debit (بنام)',
    credit: 'Credit (جمع)',
    balance: 'Balance (بقایا)',
    method: 'Method',
    notes: 'Notes',
    shareLedgerWhatsapp: 'Share via WhatsApp',
    printStatement: 'Print Statement',
    dateFilterAll: 'All Time',
    dateFilterToday: 'Today',
    dateFilterYesterday: 'Yesterday',
    dateFilterThisMonth: 'This Month',
    
    // Recovery Entry
    recoveryModalTitle: 'Daily Recovery Payment Entry',
    selectShopkeeper: 'Select Shopkeeper',
    allocatedBill: 'Related Bill (Optional)',
    overallBalancePayment: 'Apply to Overall Account Balance',
    recoveryAmount: 'Recovery Amount',
    paymentDate: 'Payment Date',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    bankTransfer: 'Bank Transfer / Online',
    cheque: 'Cheque',
    other: 'Other',
    savePayment: 'Save Recovery Payment',
    printReceipt: 'Print Receipt',
    shareReceipt: 'Share Receipt on WhatsApp',
    
    // Billing & Sales
    newSaleTitle: 'Create Sales Bill / Invoice',
    selectProducts: 'Select Items / Products',
    addItem: '+ Add Line Item',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    itemTotal: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    netTotal: 'Net Grand Total',
    paymentType: 'Payment Mode',
    cashSale: 'Full Cash Sale',
    creditSale: 'Full Credit (Khata)',
    partialPayment: 'Partial Cash + Credit',
    amountPaidNow: 'Amount Paid Now',
    remainingCredit: 'Remaining Balance on Khata',
    generateBill: 'Complete Sale & Print Bill',
    insufficientStock: 'Insufficient Stock Available',
    
    // Inventory
    sku: 'SKU / Code',
    productName: 'Product Name',
    category: 'Category',
    purchasePrice: 'Cost Price',
    sellingPrice: 'Sale Price',
    currentStock: 'Current Stock',
    minStock: 'Alert Level',
    adjustStock: 'Adjust Stock',
    stockHistory: 'Stock Movement Audit',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    
    // Expenses
    expenseTitle: 'Business Expenses',
    expenseCategory: 'Category',
    amount: 'Amount',
    expenseDate: 'Date',
    description: 'Description',
    addExpense: '+ Log Expense',
    
    // Reports
    reportsTitle: 'Business Reports & Analytics',
    grossProfit: 'Estimated Gross Profit',
    netCashPosition: 'Net Cash Inflow Today',
    exportCsv: 'Export CSV',
    printReport: 'Print Report',
    
    // Status
    synced: 'Cloud Synced',
    syncing: 'Syncing to Cloud...',
    offline: 'Offline Mode (Local Storage)',
    pending: 'Pending Sync',
    syncNow: 'Sync Now',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    success: 'Saved successfully',
    error: 'An error occurred',
  },
  ur: {
    appTitle: 'کاروبار پرو',
    appSubtitle: 'بزنس کھاتہ اور ڈیلی ریکوری مینیجر',
    dashboard: 'ڈیش بورڈ',
    shopkeepers: 'دکاندار / کھاتہ دار',
    recovery: 'روزانہ وصولی',
    billing: 'سیلز اور بل',
    inventory: 'اسٹاک / گودام',
    expenses: 'اخراجات',
    reports: 'رپورٹس',
    exportApk: 'ای پی کے برآمد',
    settings: 'ترتیبات',
    
    // Dashboard Cards
    todaySales: 'آج کی کل فروخت',
    cashReceivedToday: 'آج موصول نقد رقم',
    creditSalesToday: 'آج ادھار کی فروخت',
    totalOutstanding: 'دکانداروں کا کل بقایا',
    totalRecoveryToday: 'آج کی کل وصولی',
    inventoryValue: 'اسٹاک کی کل مالیت',
    lowStockAlerts: 'کم اسٹاک کی وارننگ',
    
    // Quick Actions
    newBill: '+ نیا بل / فروخت',
    recordRecovery: '+ روزانہ وصولی درج کریں',
    addCustomer: '+ نیا دکاندار شامل کریں',
    addProduct: '+ نیا پروڈکٹ شامل کریں',
    viewLedger: 'کھاتہ دیکھیں',
    
    // Shopkeeper / Customer
    customerCode: 'گاہک کوڈ',
    customerName: 'دکاندار کا نام',
    shopName: 'دکان کا نام',
    phone: 'موبائل نمبر',
    address: 'پتہ / مارکیٹ',
    openingBalance: 'سابقہ بقایا',
    currentBalance: 'موجودہ واجب الادا بقایا',
    totalBills: 'کل بلات',
    totalPaid: 'کل ادا شدہ',
    totalRecoveryCount: 'کل وصولی',
    status: 'حیثیت',
    active: 'فعال',
    inactive: 'غیر فعال',
    searchShopkeeper: 'نام، دکان یا موبائل سے تلاش کریں...',
    noShopkeepersFound: 'کوئی دکاندار نہیں ملا',
    addShopkeeperTitle: 'نیا دکاندار رجسٹر کریں',
    
    // Ledger & Transactions
    ledgerTitle: 'دکاندار کا باقاعدہ کھاتہ',
    date: 'تاریخ',
    txnId: 'ٹرانزیکشن آئی ڈی',
    billNo: 'بل نمبر',
    type: 'قسم',
    debit: 'بنام (خریداری)',
    credit: 'جمع (ادائیگی)',
    balance: 'بقایا بیلنس',
    method: 'طریقہ',
    notes: 'تفصیل',
    shareLedgerWhatsapp: 'واٹس ایپ پر کھاتہ بھیجیں',
    printStatement: 'کھاتہ پرنٹ کریں',
    dateFilterAll: 'تمام ریکارڈ',
    dateFilterToday: 'آج',
    dateFilterYesterday: 'گزشتہ کل',
    dateFilterThisMonth: 'موجودہ مہینہ',
    
    // Recovery Entry
    recoveryModalTitle: 'روزانہ وصولی کی اندراجی',
    selectShopkeeper: 'دکاندار منتخب کریں',
    allocatedBill: 'متعلقہ بل (اختیاری)',
    overallBalancePayment: 'مجموعی کھاتے میں جمع کریں',
    recoveryAmount: 'وصولی رقم',
    paymentDate: 'وصولی کی تاریخ',
    paymentMethod: 'ادائیگی کا ذریعہ',
    cash: 'نقد (کیش)',
    bankTransfer: 'بینک ٹرانسفر / آن لائن',
    cheque: 'چیک',
    other: 'دیگر',
    savePayment: 'وصولی محفوظ کریں',
    printReceipt: 'رسید پرنٹ کریں',
    shareReceipt: 'واٹس ایپ پر رسید بھیجیں',
    
    // Billing & Sales
    newSaleTitle: 'نیا بل / فروخت بنائیں',
    selectProducts: 'پروڈکٹس شامل کریں',
    addItem: '+ نئی آئٹم شامل کریں',
    quantity: 'تعداد',
    unitPrice: 'فی یونٹ قیمت',
    itemTotal: 'کل قیمت',
    subtotal: 'ذیلی میزان',
    discount: 'رعایت (ڈسکاؤنٹ)',
    netTotal: 'کل واجب الادا رقم',
    paymentType: 'ادائیگی کی نوعیت',
    cashSale: 'مکمل نقد فروخت',
    creditSale: 'مکمل ادھار کھاتہ',
    partialPayment: 'کچھ نقد + باقی ادھار',
    amountPaidNow: 'موقع پر ادا شدہ رقم',
    remainingCredit: 'کھاتے میں شامل بقایا رقم',
    generateBill: 'بل مکمل اور پرنٹ کریں',
    insufficientStock: 'اسٹاک ناکافی ہے',
    
    // Inventory
    sku: 'پروڈکٹ کوڈ',
    productName: 'پروڈکٹ کا نام',
    category: 'کیٹیگری',
    purchasePrice: 'خرید قیمت',
    sellingPrice: 'فروخت قیمت',
    currentStock: 'موجودہ اسٹاک',
    minStock: 'کم از کم الرٹ',
    adjustStock: 'اسٹاک ایڈجسٹ کریں',
    stockHistory: 'اسٹاک کی نقل و حرکت',
    inStock: 'دستیاب',
    lowStock: 'کم اسٹاک',
    outOfStock: 'ختم ہوچکا',
    
    // Expenses
    expenseTitle: 'کاروباری اخراجات',
    expenseCategory: 'خرچ کی قسم',
    amount: 'رقم',
    expenseDate: 'تاریخ',
    description: 'تفصیل',
    addExpense: '+ خرچ درج کریں',
    
    // Reports
    reportsTitle: 'کاروباری رپورٹس اور منافع',
    grossProfit: 'تخمینہ شدہ مجموعی منافع',
    netCashPosition: 'آج موصولہ نقد رقم',
    exportCsv: 'سی ایس وی ڈاؤن لوڈ',
    printReport: 'رپورٹ پرنٹ کریں',
    
    // Status
    synced: 'کلاؤڈ سنک مکمل',
    syncing: 'کلاؤڈ پر محفوظ ہو رہا ہے...',
    offline: 'آف لائن موڈ (مقامی میموری)',
    pending: 'سنک باقی ہے',
    syncNow: 'ابھی سنک کریں',
    
    // Common
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    edit: 'ترمیم',
    delete: 'حذف',
    close: 'بند کریں',
    success: 'کامیابی سے محفوظ ہوگیا',
    error: 'کوئی خرابی پیش آئی',
  },
};

export function formatCurrency(amount: number, symbol: string = '₨'): string {
  const num = Math.round(Number(amount) || 0);
  return `${symbol} ${num.toLocaleString('en-PK')}`;
}

export function formatDate(dateStr: string, format: string = 'DD/MM/YYYY'): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  if (format === 'MM/DD/YYYY') return `${month}/${day}/${year}`;
  return `${day}/${month}/${year}`;
}

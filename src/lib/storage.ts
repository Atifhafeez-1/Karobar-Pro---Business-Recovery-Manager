import {
  Shopkeeper,
  Product,
  Bill,
  Payment,
  InventoryMovement,
  Expense,
  AuditLog,
  AppSettings,
  LedgerEntry,
} from '../types';

const DB_NAME = 'karobar_pro_db';
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  collection: string;
  operation: 'create' | 'update' | 'delete';
  documentId: string;
  data: any;
  timestamp: string;
  status: 'pending' | 'failed';
  retryCount: number;
}

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const stores = [
        'shopkeepers',
        'products',
        'bills',
        'payments',
        'inventoryMovements',
        'expenses',
        'auditLogs',
        'settings',
        'syncQueue',
      ];
      for (const store of stores) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function getFromStore<T>(storeName: string, id: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function putInStore<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Queue for offline to online sync
export async function addToSyncQueue(
  collection: string,
  operation: 'create' | 'update' | 'delete',
  documentId: string,
  data: any
): Promise<void> {
  const queueItem: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    collection,
    operation,
    documentId,
    data,
    timestamp: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };
  await putInStore('syncQueue', queueItem);
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const all = await getAllFromStore<SyncQueueItem>('syncQueue');
  return all.filter((item) => item.status === 'pending');
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  await deleteFromStore('syncQueue', id);
}

// Default Settings
export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  currency: 'PKR',
  currencySymbol: '₨',
  dateFormat: 'DD/MM/YYYY',
  businessName: 'Al-Rehman Wholesale & Distribution',
  businessPhone: '+92 300 1234567',
  businessAddress: 'Shop # 14, Main Wholesale Market, Lahore',
  invoiceFooterNote: 'Thank you for your business. Please verify items upon receipt.',
  enableStockAlerts: true,
  autoSync: true,
};

export async function getAppSettings(): Promise<AppSettings> {
  const settings = await getFromStore<AppSettings & { id: string }>('settings', 'app_config');
  if (settings) {
    const { id, ...rest } = settings;
    return rest;
  }
  await saveAppSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await putInStore('settings', { id: 'app_config', ...settings });
}

// SHOPKEEPER CRUD & LEDGER
export async function getShopkeepers(): Promise<Shopkeeper[]> {
  return getAllFromStore<Shopkeeper>('shopkeepers');
}

export async function getShopkeeper(id: string): Promise<Shopkeeper | null> {
  return getFromStore<Shopkeeper>('shopkeepers', id);
}

export async function saveShopkeeper(shopkeeper: Shopkeeper): Promise<void> {
  await putInStore('shopkeepers', shopkeeper);
  await addToSyncQueue('shopkeepers', 'update', shopkeeper.id, shopkeeper);
}

export async function addShopkeeper(data: Omit<Shopkeeper, 'id' | 'createdAt' | 'updatedAt' | 'customerCode' | 'totalBills' | 'totalPaid' | 'totalRecovery'>): Promise<Shopkeeper> {
  const existing = await getShopkeepers();
  const nextSeq = existing.length + 1001;
  const customerCode = `CUST-${nextSeq}`;
  const id = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newShopkeeper: Shopkeeper = {
    ...data,
    id,
    customerCode,
    totalBills: 0,
    totalPaid: 0,
    totalRecovery: 0,
    currentBalance: Number(data.openingBalance || 0),
    createdAt: now,
    updatedAt: now,
  };

  await putInStore('shopkeepers', newShopkeeper);
  await addToSyncQueue('shopkeepers', 'create', id, newShopkeeper);
  await logAudit('shopkeeper', id, 'Created shopkeeper account', `Added ${newShopkeeper.name} (${newShopkeeper.shopName})`);
  return newShopkeeper;
}

// PRODUCTS & INVENTORY
export async function getProducts(): Promise<Product[]> {
  return getAllFromStore<Product>('products');
}

export async function getProduct(id: string): Promise<Product | null> {
  return getFromStore<Product>('products', id);
}

export async function saveProduct(product: Product): Promise<void> {
  await putInStore('products', product);
  await addToSyncQueue('products', 'update', product.id, product);
}

export async function addProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await putInStore('products', newProduct);
  await addToSyncQueue('products', 'create', id, newProduct);

  if (newProduct.openingStock > 0) {
    await recordInventoryMovement({
      productId: newProduct.id,
      productName: newProduct.name,
      movementType: 'adjustment',
      quantity: newProduct.openingStock,
      previousStock: 0,
      newStock: newProduct.openingStock,
      reason: 'Opening stock entry',
      createdBy: 'Admin',
    });
  }

  await logAudit('product', id, 'Added new product', `${newProduct.name} (SKU: ${newProduct.sku})`);
  return newProduct;
}

export async function adjustProductStock(
  productId: string,
  newStockQty: number,
  reason: string,
  user: string
): Promise<Product> {
  const product = await getProduct(productId);
  if (!product) throw new Error('Product not found');

  const prev = product.currentStock;
  const diff = newStockQty - prev;
  product.currentStock = newStockQty;
  product.updatedAt = new Date().toISOString();

  await putInStore('products', product);
  await addToSyncQueue('products', 'update', product.id, product);

  await recordInventoryMovement({
    productId: product.id,
    productName: product.name,
    movementType: 'adjustment',
    quantity: diff,
    previousStock: prev,
    newStock: newStockQty,
    reason,
    createdBy: user,
  });

  await logAudit('product', product.id, 'Stock Adjustment', `${product.name}: ${prev} -> ${newStockQty} (${reason})`);
  return product;
}

// INVENTORY MOVEMENTS
export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  const list = await getAllFromStore<InventoryMovement>('inventoryMovements');
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function recordInventoryMovement(data: Omit<InventoryMovement, 'id' | 'businessId' | 'createdAt'>): Promise<InventoryMovement> {
  const id = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const movement: InventoryMovement = {
    ...data,
    id,
    businessId: 'biz_default',
    createdAt: new Date().toISOString(),
  };
  await putInStore('inventoryMovements', movement);
  await addToSyncQueue('inventoryMovements', 'create', id, movement);
  return movement;
}

// BILLS & SALES
export async function getBills(): Promise<Bill[]> {
  const list = await getAllFromStore<Bill>('bills');
  return list.sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getBill(id: string): Promise<Bill | null> {
  return getFromStore<Bill>('bills', id);
}

export async function getBillsByShopkeeper(shopkeeperId: string): Promise<Bill[]> {
  const all = await getBills();
  return all.filter((b) => b.shopkeeperId === shopkeeperId);
}

export interface CreateBillParams {
  shopkeeperId: string;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
  }>;
  discount: number;
  paymentMethod: 'cash' | 'credit' | 'partial';
  paidAmount: number;
  billDate: string; // YYYY-MM-DD
  notes?: string;
  user: { uid: string; name: string };
}

export async function createBill(params: CreateBillParams): Promise<Bill> {
  const shopkeeper = await getShopkeeper(params.shopkeeperId);
  if (!shopkeeper) throw new Error('Shopkeeper not found');

  // Verify stock
  for (const item of params.items) {
    const prod = await getProduct(item.productId);
    if (!prod) throw new Error(`Product ${item.productName} not found`);
    if (prod.currentStock < item.quantity) {
      throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, requested: ${item.quantity}`);
    }
  }

  const existingBills = await getBills();
  const nextNumber = `BILL-${String(existingBills.length + 101).padStart(5, '0')}`;
  const now = new Date().toISOString();
  const id = `bill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let subtotal = 0;
  const billItems = params.items.map((item, idx) => {
    const totalPrice = item.quantity * item.unitPrice;
    subtotal += totalPrice;
    return {
      ...item,
      id: `bi_${id}_${idx}`,
      totalPrice,
    };
  });

  const discount = Math.max(0, Number(params.discount || 0));
  const netAmount = Math.max(0, subtotal - discount);
  const paidAmount = Math.max(0, Number(params.paidAmount || 0));
  const remainingBalance = Math.max(0, netAmount - paidAmount);

  let status: Bill['status'] = 'unpaid';
  if (paidAmount >= netAmount) status = 'paid';
  else if (paidAmount > 0) status = 'partial';

  const previousBalance = shopkeeper.currentBalance;

  const newBill: Bill = {
    id,
    businessId: 'biz_default',
    billNumber: nextNumber,
    shopkeeperId: shopkeeper.id,
    shopkeeperName: shopkeeper.name,
    billDate: params.billDate || now.split('T')[0],
    items: billItems,
    subtotal,
    discount,
    netAmount,
    paidAmount,
    remainingBalance,
    previousBalance,
    status,
    paymentMethod: params.paymentMethod,
    notes: params.notes,
    createdBy: params.user.uid,
    createdByName: params.user.name,
    createdAt: now,
    updatedAt: now,
  };

  // 1. Save Bill
  await putInStore('bills', newBill);
  await addToSyncQueue('bills', 'create', id, newBill);

  // 2. Decrement Stock & Log Movements
  for (const item of billItems) {
    const prod = await getProduct(item.productId);
    if (prod) {
      const prevStock = prod.currentStock;
      prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
      prod.updatedAt = now;
      await putInStore('products', prod);
      await addToSyncQueue('products', 'update', prod.id, prod);

      await recordInventoryMovement({
        productId: prod.id,
        productName: prod.name,
        movementType: 'sale',
        quantity: -item.quantity,
        previousStock: prevStock,
        newStock: prod.currentStock,
        referenceId: newBill.id,
        referenceType: 'bill',
        reason: `Sold on ${newBill.billNumber}`,
        createdBy: params.user.name,
      });
    }
  }

  // 3. Update Shopkeeper Ledger & Totals
  shopkeeper.totalBills += netAmount;
  shopkeeper.totalPaid += paidAmount;
  shopkeeper.currentBalance = previousBalance + netAmount - paidAmount;
  shopkeeper.updatedAt = now;
  await putInStore('shopkeepers', shopkeeper);
  await addToSyncQueue('shopkeepers', 'update', shopkeeper.id, shopkeeper);

  // 4. If paidAmount > 0, record initial payment transaction
  if (paidAmount > 0) {
    const txnId = `TXN-${new Date().toISOString().replace(/\D/g, '').substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const paymentRecord: Payment = {
      id: paymentId,
      businessId: 'biz_default',
      transactionId: txnId,
      shopkeeperId: shopkeeper.id,
      shopkeeperName: shopkeeper.name,
      billId: newBill.id,
      billNumber: newBill.billNumber,
      amount: paidAmount,
      paymentDate: newBill.billDate,
      paymentMethod: params.paymentMethod === 'cash' ? 'cash' : 'bank_transfer',
      notes: `Immediate payment on Bill ${newBill.billNumber}`,
      type: 'bill_payment',
      allocations: [{ billId: newBill.id, billNumber: newBill.billNumber, amount: paidAmount }],
      previousBalance: previousBalance + netAmount,
      newBalance: shopkeeper.currentBalance,
      createdBy: params.user.uid,
      createdByName: params.user.name,
      createdAt: now,
    };
    await putInStore('payments', paymentRecord);
    await addToSyncQueue('payments', 'create', paymentId, paymentRecord);
  }

  await logAudit('bill', id, 'Created Bill', `${newBill.billNumber} for ${shopkeeper.name} (₨ ${netAmount})`);
  return newBill;
}

// PAYMENTS & RECOVERIES
export async function getPayments(): Promise<Payment[]> {
  const list = await getAllFromStore<Payment>('payments');
  return list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPaymentsByShopkeeper(shopkeeperId: string): Promise<Payment[]> {
  const all = await getPayments();
  return all.filter((p) => p.shopkeeperId === shopkeeperId);
}

export interface RecordRecoveryParams {
  shopkeeperId: string;
  billId?: string; // Optional: against a specific bill
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'other';
  notes?: string;
  user: { uid: string; name: string };
  allowAdvance?: boolean;
}

export async function recordRecoveryPayment(params: RecordRecoveryParams): Promise<Payment> {
  const shopkeeper = await getShopkeeper(params.shopkeeperId);
  if (!shopkeeper) throw new Error('Shopkeeper not found');

  const amount = Number(params.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Please enter a valid recovery payment amount greater than zero');
  }

  const prevBalance = shopkeeper.currentBalance;
  if (amount > prevBalance && !params.allowAdvance) {
    throw new Error(`Payment (₨ ${amount.toLocaleString()}) exceeds total outstanding balance (₨ ${prevBalance.toLocaleString()}). Confirm advance payment to proceed.`);
  }

  const now = new Date().toISOString();
  const dateStr = (params.paymentDate || now.split('T')[0]).replace(/-/g, '');
  const randSeq = Math.floor(1000 + Math.random() * 9000);
  const transactionId = `RCV-${dateStr}-${randSeq}`;
  const id = `rcv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let billNumber: string | undefined;
  const allocations: { billId: string; billNumber: string; amount: number }[] = [];

  // If specific bill selected
  if (params.billId) {
    const bill = await getBill(params.billId);
    if (bill) {
      billNumber = bill.billNumber;
      bill.paidAmount = Math.min(bill.netAmount, bill.paidAmount + amount);
      bill.remainingBalance = Math.max(0, bill.netAmount - bill.paidAmount);
      bill.status = bill.remainingBalance === 0 ? 'paid' : 'partial';
      bill.updatedAt = now;
      await putInStore('bills', bill);
      await addToSyncQueue('bills', 'update', bill.id, bill);

      allocations.push({
        billId: bill.id,
        billNumber: bill.billNumber,
        amount,
      });
    }
  }

  // Update shopkeeper balance
  const newBalance = prevBalance - amount;
  shopkeeper.currentBalance = newBalance;
  shopkeeper.totalPaid += amount;
  shopkeeper.totalRecovery += amount;
  shopkeeper.updatedAt = now;

  await putInStore('shopkeepers', shopkeeper);
  await addToSyncQueue('shopkeepers', 'update', shopkeeper.id, shopkeeper);

  const paymentRecord: Payment = {
    id,
    businessId: 'biz_default',
    transactionId,
    shopkeeperId: shopkeeper.id,
    shopkeeperName: shopkeeper.name,
    billId: params.billId,
    billNumber,
    amount,
    paymentDate: params.paymentDate || now.split('T')[0],
    paymentMethod: params.paymentMethod,
    notes: params.notes,
    type: amount > prevBalance ? 'advance' : 'recovery',
    allocations: allocations.length > 0 ? allocations : undefined,
    previousBalance: prevBalance,
    newBalance,
    createdBy: params.user.uid,
    createdByName: params.user.name,
    createdAt: now,
  };

  await putInStore('payments', paymentRecord);
  await addToSyncQueue('payments', 'create', id, paymentRecord);

  await logAudit(
    'payment',
    id,
    'Recovery Received',
    `₨ ${amount} from ${shopkeeper.name} (${params.paymentMethod}) - Ref: ${transactionId}`
  );

  return paymentRecord;
}

// EXPENSES
export async function getExpenses(): Promise<Expense[]> {
  const list = await getAllFromStore<Expense>('expenses');
  return list.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
}

export async function addExpense(data: Omit<Expense, 'id' | 'businessId' | 'createdAt'>): Promise<Expense> {
  const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const expense: Expense = {
    ...data,
    id,
    businessId: 'biz_default',
    createdAt: new Date().toISOString(),
  };

  await putInStore('expenses', expense);
  await addToSyncQueue('expenses', 'create', id, expense);
  await logAudit('expense', id, 'Logged Expense', `${expense.category}: ₨ ${expense.amount} (${expense.description})`);
  return expense;
}

// AUDIT LOGS
export async function getAuditLogs(): Promise<AuditLog[]> {
  const list = await getAllFromStore<AuditLog>('auditLogs');
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function logAudit(
  entityType: AuditLog['entityType'],
  entityId: string,
  action: string,
  details: string,
  performedBy: string = 'Authorized Staff'
): Promise<void> {
  const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const log: AuditLog = {
    id,
    businessId: 'biz_default',
    action,
    entityType,
    entityId,
    performedBy,
    details,
    createdAt: new Date().toISOString(),
  };
  await putInStore('auditLogs', log);
  await addToSyncQueue('auditLogs', 'create', id, log);
}

// SHOPKEEPER CHRONOLOGICAL LEDGER BUILDER
export async function getShopkeeperLedger(shopkeeperId: string): Promise<{
  shopkeeper: Shopkeeper;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  finalBalance: number;
}> {
  const shopkeeper = await getShopkeeper(shopkeeperId);
  if (!shopkeeper) throw new Error('Shopkeeper not found');

  const bills = await getBillsByShopkeeper(shopkeeperId);
  const payments = await getPaymentsByShopkeeper(shopkeeperId);

  const rawEntries: Array<{
    date: string;
    createdAt: string;
    id: string;
    transactionId: string;
    billNumber?: string;
    type: LedgerEntry['type'];
    description: string;
    debit: number;
    credit: number;
    paymentMethod?: string;
    notes?: string;
  }> = [];

  // Opening Balance Entry
  if (shopkeeper.openingBalance !== 0) {
    rawEntries.push({
      date: shopkeeper.createdAt.split('T')[0],
      createdAt: shopkeeper.createdAt,
      id: `open_${shopkeeper.id}`,
      transactionId: 'OPENING-BAL',
      type: 'OPENING',
      description: 'Opening Balance (سابقہ بقایا)',
      debit: shopkeeper.openingBalance > 0 ? shopkeeper.openingBalance : 0,
      credit: shopkeeper.openingBalance < 0 ? Math.abs(shopkeeper.openingBalance) : 0,
      notes: 'Initial account balance',
    });
  }

  // Bills (Debits)
  for (const b of bills) {
    rawEntries.push({
      date: b.billDate,
      createdAt: b.createdAt,
      id: b.id,
      transactionId: b.billNumber,
      billNumber: b.billNumber,
      type: 'BILL',
      description: `Sales Bill #${b.billNumber} (${b.items.length} items)`,
      debit: b.netAmount,
      credit: 0,
      paymentMethod: b.paymentMethod,
      notes: b.notes,
    });
  }

  // Payments / Recoveries (Credits)
  for (const p of payments) {
    rawEntries.push({
      date: p.paymentDate,
      createdAt: p.createdAt,
      id: p.id,
      transactionId: p.transactionId,
      billNumber: p.billNumber,
      type: p.type === 'advance' ? 'ADVANCE' : 'RECOVERY',
      description: p.billNumber ? `Payment on Bill ${p.billNumber}` : 'Account Recovery Payment (وصولی)',
      debit: 0,
      credit: p.amount,
      paymentMethod: p.paymentMethod,
      notes: p.notes,
    });
  }

  // Sort chronologically by date and creation time
  rawEntries.sort((a, b) => {
    const dDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dDiff !== 0) return dDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Calculate Running Balance
  let running = 0;
  let totalDebit = 0;
  let totalCredit = 0;

  const entries: LedgerEntry[] = rawEntries.map((item) => {
    running += item.debit - item.credit;
    totalDebit += item.debit;
    totalCredit += item.credit;
    return {
      id: item.id,
      date: item.date,
      transactionId: item.transactionId,
      billNumber: item.billNumber,
      type: item.type,
      description: item.description,
      debit: item.debit,
      credit: item.credit,
      runningBalance: running,
      paymentMethod: item.paymentMethod,
      notes: item.notes,
    };
  });

  return {
    shopkeeper,
    entries,
    totalDebit,
    totalCredit,
    finalBalance: running,
  };
}

// SEED INITIAL PRODUCTION-READY BUSINESS DATA IF EMPTY
export async function seedInitialDataIfNeeded(): Promise<void> {
  const existingShopkeepers = await getShopkeepers();
  if (existingShopkeepers.length > 0) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const d1 = new Date(now.getTime() - 86400000 * 2).toISOString().split('T')[0];
  const d2 = new Date(now.getTime() - 86400000 * 1).toISOString().split('T')[0];

  // 1. Initial Products (Pakistani Wholesale FMCG/General store items)
  const initialProducts: Product[] = [
    {
      id: 'prod_1',
      businessId: 'biz_default',
      sku: 'OIL-DALDA-5L',
      name: 'Dalda Cooking Oil 5L Tin',
      category: 'Edible Oil & Ghee',
      barcode: '896400010111',
      purchasePrice: 2450,
      sellingPrice: 2650,
      openingStock: 120,
      currentStock: 98,
      minStockAlert: 20,
      supplierName: 'Dalda Foods Ltd',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'prod_2',
      businessId: 'biz_default',
      sku: 'TEA-TAPAL-900G',
      name: 'Tapal Danedar Tea 900g Pouch',
      category: 'Beverages',
      barcode: '896400020222',
      purchasePrice: 1580,
      sellingPrice: 1720,
      openingStock: 200,
      currentStock: 164,
      minStockAlert: 30,
      supplierName: 'Tapal Tea Pvt Ltd',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'prod_3',
      businessId: 'biz_default',
      sku: 'RICE-BAS-50KG',
      name: 'Super Kernel Basmati Rice 50kg Bag',
      category: 'Grains & Pulses',
      barcode: '896400030333',
      purchasePrice: 16500,
      sellingPrice: 18200,
      openingStock: 40,
      currentStock: 12,
      minStockAlert: 15,
      supplierName: 'Punjab Rice Mills Gujranwala',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'prod_4',
      businessId: 'biz_default',
      sku: 'SOAP-LUX-140G',
      name: 'Lux Beauty Soap 140g (Pack of 12)',
      category: 'Toiletries & Cleaning',
      barcode: '896400040444',
      purchasePrice: 1450,
      sellingPrice: 1620,
      openingStock: 150,
      currentStock: 135,
      minStockAlert: 25,
      supplierName: 'Unilever Pakistan',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'prod_5',
      businessId: 'biz_default',
      sku: 'SUGAR-WHITE-50KG',
      name: 'White Refined Sugar 50kg Bag',
      category: 'Commodities',
      barcode: '896400050555',
      purchasePrice: 7200,
      sellingPrice: 7650,
      openingStock: 60,
      currentStock: 8,
      minStockAlert: 15,
      supplierName: 'Jauharabad Sugar Mills',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'prod_6',
      businessId: 'biz_default',
      sku: 'MILK-OLPERS-1L',
      name: 'Olper’s Milk 1L (Carton of 12)',
      category: 'Dairy',
      barcode: '896400060666',
      purchasePrice: 3250,
      sellingPrice: 3540,
      openingStock: 80,
      currentStock: 65,
      minStockAlert: 20,
      supplierName: 'FrieslandCampina Engro',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  for (const p of initialProducts) {
    await putInStore('products', p);
  }

  // 2. Initial Shopkeepers
  const initialShopkeepers: Shopkeeper[] = [
    {
      id: 'sk_1',
      businessId: 'biz_default',
      customerCode: 'CUST-1001',
      name: 'Haji Muhammad Aslam',
      shopName: 'Al-Madina General Store',
      phone: '0301-4455667',
      address: 'Main Chowk, Shahdara, Lahore',
      openingBalance: 45000,
      currentBalance: 87500,
      totalBills: 67500,
      totalPaid: 25000,
      totalRecovery: 25000,
      status: 'active',
      notes: 'Reliable weekly recovery on Thursdays',
      createdAt: new Date(now.getTime() - 86400000 * 30).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'sk_2',
      businessId: 'biz_default',
      customerCode: 'CUST-1002',
      name: 'Chaudhry Tariq Mehmood',
      shopName: 'Bismillah Cash & Carry',
      phone: '0321-9876543',
      address: 'G.T. Road, Gujranwala',
      openingBalance: 80000,
      currentBalance: 142000,
      totalBills: 112000,
      totalPaid: 50000,
      totalRecovery: 50000,
      status: 'active',
      notes: 'Large orders, recovery twice a month',
      createdAt: new Date(now.getTime() - 86400000 * 20).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'sk_3',
      businessId: 'biz_default',
      customerCode: 'CUST-1003',
      name: 'Malik Zeeshan',
      shopName: 'Rehman Kiryana & General Store',
      phone: '0333-5511223',
      address: 'Bohar Bazar, Rawalpindi',
      openingBalance: 20000,
      currentBalance: 34500,
      totalBills: 44500,
      totalPaid: 30000,
      totalRecovery: 30000,
      status: 'active',
      notes: 'Daily counter recovery Rs 2,000 - 5,000',
      createdAt: new Date(now.getTime() - 86400000 * 15).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'sk_4',
      businessId: 'biz_default',
      customerCode: 'CUST-1004',
      name: 'Sheikh Waqas Ahmed',
      shopName: 'New Rajput Mart',
      phone: '0345-7788990',
      address: 'College Road, Sialkot',
      openingBalance: 15000,
      currentBalance: 0,
      totalBills: 35000,
      totalPaid: 50000,
      totalRecovery: 50000,
      status: 'active',
      notes: 'Account fully clear, zero pending credit',
      createdAt: new Date(now.getTime() - 86400000 * 10).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  for (const s of initialShopkeepers) {
    await putInStore('shopkeepers', s);
  }

  // 3. Initial Sample Bills
  const sampleBill1: Bill = {
    id: 'bill_init_1',
    businessId: 'biz_default',
    billNumber: 'BILL-00101',
    shopkeeperId: 'sk_1',
    shopkeeperName: 'Haji Muhammad Aslam',
    billDate: d1,
    items: [
      {
        id: 'bi_1',
        productId: 'prod_1',
        productName: 'Dalda Cooking Oil 5L Tin',
        sku: 'OIL-DALDA-5L',
        quantity: 10,
        unitPrice: 2650,
        costPrice: 2450,
        totalPrice: 26500,
      },
      {
        id: 'bi_2',
        productId: 'prod_2',
        productName: 'Tapal Danedar Tea 900g Pouch',
        sku: 'TEA-TAPAL-900G',
        quantity: 15,
        unitPrice: 1720,
        costPrice: 1580,
        totalPrice: 25800,
      },
    ],
    subtotal: 52300,
    discount: 300,
    netAmount: 52000,
    paidAmount: 12000,
    remainingBalance: 40000,
    previousBalance: 45000,
    status: 'partial',
    paymentMethod: 'partial',
    notes: 'Order delivered via Suzuki van',
    createdBy: 'admin_1',
    createdByName: 'Admin Owner',
    createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
  };

  const sampleBill2: Bill = {
    id: 'bill_init_2',
    businessId: 'biz_default',
    billNumber: 'BILL-00102',
    shopkeeperId: 'sk_2',
    shopkeeperName: 'Chaudhry Tariq Mehmood',
    billDate: d2,
    items: [
      {
        id: 'bi_3',
        productId: 'prod_3',
        productName: 'Super Kernel Basmati Rice 50kg Bag',
        sku: 'RICE-BAS-50KG',
        quantity: 5,
        unitPrice: 18200,
        costPrice: 16500,
        totalPrice: 91000,
      },
      {
        id: 'bi_4',
        productId: 'prod_6',
        productName: 'Olper’s Milk 1L (Carton of 12)',
        sku: 'MILK-OLPERS-1L',
        quantity: 6,
        unitPrice: 3540,
        costPrice: 3250,
        totalPrice: 21240,
      },
    ],
    subtotal: 112240,
    discount: 240,
    netAmount: 112000,
    paidAmount: 30000,
    remainingBalance: 82000,
    previousBalance: 80000,
    status: 'partial',
    paymentMethod: 'partial',
    notes: 'Payment promise on next visit',
    createdBy: 'admin_1',
    createdByName: 'Admin Owner',
    createdAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
    updatedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
  };

  await putInStore('bills', sampleBill1);
  await putInStore('bills', sampleBill2);

  // 4. Initial Payments / Daily Recovery Entries
  const samplePayment1: Payment = {
    id: 'pay_init_1',
    businessId: 'biz_default',
    transactionId: 'RCV-20261016-1045',
    shopkeeperId: 'sk_1',
    shopkeeperName: 'Haji Muhammad Aslam',
    billId: 'bill_init_1',
    billNumber: 'BILL-00101',
    amount: 13000,
    paymentDate: d2,
    paymentMethod: 'cash',
    notes: 'Daily counter cash recovery',
    type: 'recovery',
    allocations: [{ billId: 'bill_init_1', billNumber: 'BILL-00101', amount: 13000 }],
    previousBalance: 100500,
    newBalance: 87500,
    createdBy: 'admin_1',
    createdByName: 'Bilal Recovery Officer',
    createdAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
  };

  const samplePayment2: Payment = {
    id: 'pay_init_2',
    businessId: 'biz_default',
    transactionId: 'RCV-20261017-2091',
    shopkeeperId: 'sk_2',
    shopkeeperName: 'Chaudhry Tariq Mehmood',
    billId: 'bill_init_2',
    billNumber: 'BILL-00102',
    amount: 20000,
    paymentDate: todayStr,
    paymentMethod: 'bank_transfer',
    notes: 'Meezan Bank online transfer recovery',
    type: 'recovery',
    allocations: [{ billId: 'bill_init_2', billNumber: 'BILL-00102', amount: 20000 }],
    previousBalance: 162000,
    newBalance: 142000,
    createdBy: 'admin_1',
    createdByName: 'Bilal Recovery Officer',
    createdAt: now.toISOString(),
  };

  await putInStore('payments', samplePayment1);
  await putInStore('payments', samplePayment2);

  // 5. Initial Expenses
  const sampleExpense1: Expense = {
    id: 'exp_1',
    businessId: 'biz_default',
    category: 'Transport & Fuel',
    amount: 3500,
    expenseDate: todayStr,
    paymentMethod: 'cash',
    description: 'Suzuki delivery van diesel and driver allowance',
    notes: 'Shahdara route delivery',
    createdBy: 'admin_1',
    createdAt: now.toISOString(),
  };

  const sampleExpense2: Expense = {
    id: 'exp_2',
    businessId: 'biz_default',
    category: 'Electricity / Utilities',
    amount: 14200,
    expenseDate: d1,
    paymentMethod: 'bank_transfer',
    description: 'LESCO Godown electricity bill',
    notes: 'Paid online via HBL',
    createdBy: 'admin_1',
    createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
  };

  await putInStore('expenses', sampleExpense1);
  await putInStore('expenses', sampleExpense2);

  await logAudit('setting', 'init', 'System Initialized', 'Database bootstrapped with initial catalog and customer ledgers.');
}

export type UserRole = 'admin' | 'staff' | 'viewer';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'other';
export type BillStatus = 'paid' | 'partial' | 'unpaid' | 'cancelled';
export type SaleType = 'cash' | 'credit' | 'partial';
export type MovementType = 'sale' | 'purchase' | 'adjustment' | 'return';
export type Language = 'en' | 'ur';

export interface Business {
  id: string;
  name: string;
  ownerUid: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  phone: string;
  address: string;
  tagline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  businessId: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Shopkeeper {
  id: string;
  businessId: string;
  customerCode: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  openingBalance: number;
  currentBalance: number;
  totalBills: number;
  totalPaid: number;
  totalRecovery: number;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  sku: string;
  name: string;
  category: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  openingStock: number;
  currentStock: number;
  minStockAlert: number;
  supplierName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  businessId: string;
  billNumber: string;
  shopkeeperId: string;
  shopkeeperName: string;
  billDate: string; // YYYY-MM-DD
  items: BillItem[];
  subtotal: number;
  discount: number;
  netAmount: number;
  paidAmount: number;
  remainingBalance: number;
  previousBalance: number;
  status: BillStatus;
  paymentMethod: SaleType;
  notes?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAllocation {
  billId: string;
  billNumber: string;
  amount: number;
}

export interface Payment {
  id: string;
  businessId: string;
  transactionId: string;
  shopkeeperId: string;
  shopkeeperName: string;
  billId?: string; // Optional if specific bill
  billNumber?: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  type: 'recovery' | 'bill_payment' | 'advance' | 'refund';
  allocations?: PaymentAllocation[];
  previousBalance: number;
  newBalance: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  movementType: MovementType;
  quantity: number; // positive or negative
  previousStock: number;
  newStock: number;
  referenceId?: string;
  referenceType?: 'bill' | 'purchase' | 'manual';
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  description: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  businessId: string;
  action: string;
  entityType: 'shopkeeper' | 'bill' | 'payment' | 'product' | 'expense' | 'setting';
  entityId: string;
  performedBy: string;
  details: string;
  createdAt: string;
}

export interface AppSettings {
  language: Language;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  invoiceFooterNote: string;
  enableStockAlerts: boolean;
  autoSync: boolean;
}

export interface LedgerEntry {
  id: string;
  date: string;
  transactionId: string;
  billNumber?: string;
  type: 'BILL' | 'RECOVERY' | 'PAYMENT' | 'OPENING' | 'ADVANCE';
  description: string;
  debit: number; // Amount shopkeeper owes (Bills)
  credit: number; // Amount shopkeeper paid (Recoveries)
  runningBalance: number;
  paymentMethod?: string;
  notes?: string;
}

export interface SyncStatus {
  state: 'synced' | 'pending' | 'syncing' | 'offline' | 'error';
  pendingCount: number;
  lastSyncedAt: string | null;
  errorMessage?: string;
}

import React, { useState, useEffect } from 'react';
import {
  Product,
  InventoryMovement,
  AppSettings,
  Language,
} from '../types';
import {
  getProducts,
  getInventoryMovements,
  addProduct,
  saveProduct,
  adjustProductStock,
} from '../lib/storage';
import { syncPendingData } from '../lib/sync';
import { translations, formatCurrency, formatDate } from '../lib/i18n';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  Tag,
  Check,
  X,
  Sliders,
} from 'lucide-react';

interface InventoryViewProps {
  settings: AppSettings;
  lang: Language;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ settings, lang }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'audit'>('catalog');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // New product form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [openingStock, setOpeningStock] = useState('0');
  const [minStockAlert, setMinStockAlert] = useState('10');
  const [supplierName, setSupplierName] = useState('');

  // Adjust stock form states
  const [newStockVal, setNewStockVal] = useState('');
  const [adjustReason, setAdjustReason] = useState('Inventory Physical Count');

  const t = translations[lang];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pr, mov] = await Promise.all([
      getProducts(),
      getInventoryMovements(),
    ]);
    setProducts(pr);
    setMovements(mov);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !purchasePrice || !sellingPrice) return;

    try {
      await addProduct({
        businessId: 'biz_default',
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category: category.trim(),
        barcode: barcode.trim(),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        openingStock: Number(openingStock) || 0,
        currentStock: Number(openingStock) || 0,
        minStockAlert: Number(minStockAlert) || 10,
        supplierName: supplierName.trim(),
        status: 'active',
      });

      syncPendingData().catch(console.warn);
      await loadData();
      setIsAddModalOpen(false);

      // Reset
      setSku('');
      setName('');
      setCategory('General');
      setBarcode('');
      setPurchasePrice('');
      setSellingPrice('');
      setOpeningStock('0');
      setMinStockAlert('10');
      setSupplierName('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adding product');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || newStockVal === '') return;

    try {
      await adjustProductStock(
        selectedProduct.id,
        Number(newStockVal),
        adjustReason,
        'Authorized Staff'
      );
      syncPendingData().catch(console.warn);
      await loadData();
      setIsAdjustModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adjusting stock');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery)) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.currentStock * p.purchasePrice,
    0
  );

  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minStockAlert && p.status === 'active'
  ).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header & Valuation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.inventory}
            </h2>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {products.length} Products
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
            <span>
              Total Valuation:{' '}
              <strong className="text-slate-900 font-black">
                {formatCurrency(totalInventoryValue, settings.currencySymbol)}
              </strong>
            </span>
            <span>•</span>
            <span className={lowStockCount > 0 ? 'text-amber-700 font-black' : 'text-emerald-700 font-bold'}>
              {lowStockCount} Low Stock Alerts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Movement History
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-vibrant-amber flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-xs font-black border border-amber-300/40 shadow-lg transition cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            {t.addProduct}
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by SKU, name, or barcode..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium focus:border-blue-500 focus:outline-none shadow-xs"
            />
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item & Code</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">{t.purchasePrice}</th>
                    <th className="py-3 px-3 text-right">{t.sellingPrice}</th>
                    <th className="py-3 px-3 text-center">{t.currentStock}</th>
                    <th className="py-3 px-3 text-right">Stock Value</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isLow = p.currentStock <= p.minStockAlert;
                    const isOut = p.currentStock <= 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>SKU: {p.sku}</span>
                            {p.barcode && <span>• Barcode: {p.barcode}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {p.category}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-600 whitespace-nowrap">
                          {formatCurrency(p.purchasePrice, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                          {formatCurrency(p.sellingPrice, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                              isOut
                                ? 'bg-red-100 text-red-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.currentStock} units
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800 whitespace-nowrap">
                          {formatCurrency(p.currentStock * p.purchasePrice, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setNewStockVal(String(p.currentStock));
                              setIsAdjustModalOpen(true);
                            }}
                            className="btn-vibrant-amber inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black border border-amber-300/40 cursor-pointer active:scale-95 shadow-xs"
                          >
                            <Sliders className="h-3.5 w-3.5 stroke-[2.5]" />
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Inventory Movements Audit Trail */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Stock Movement Audit Trail</h3>
            <span className="text-xs text-slate-400">Total logs: {movements.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-center">Change</th>
                  <th className="py-3 px-3 text-center">Before → After</th>
                  <th className="py-3 px-4">Reason / Ref</th>
                  <th className="py-3 px-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(m.createdAt, settings.dateFormat)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.productName}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.movementType === 'sale'
                            ? 'bg-red-50 text-red-700'
                            : m.movementType === 'purchase'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold whitespace-nowrap">
                      <span className={m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 font-mono whitespace-nowrap">
                      {m.previousStock} → {m.newStock}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{m.reason || '-'}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{m.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900">Add New Inventory Product</h3>
            <p className="text-xs text-slate-500 mt-0.5">Register stock item with cost and retail prices</p>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SKU / Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. OIL-5L"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="8964000..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Habib Cooking Oil 5L"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Edible Oil, Beverages..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Distributor / Mill"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cost Price (₨) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="2500"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Selling Price (₨) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="2750"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-blue-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Opening Stock (Units)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={openingStock}
                    onChange={(e) => setOpeningStock(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-vibrant-amber rounded-xl px-6 py-2.5 text-xs font-black border border-amber-300/40 cursor-pointer active:scale-95"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
            <h3 className="text-lg font-black text-slate-900">Adjust Stock</h3>
            <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.name}</p>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                <span>Current Recorded Stock:</span>
                <span className="font-bold text-slate-900">{selectedProduct.currentStock} units</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Stock Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full rounded-xl border-2 border-blue-500 p-3 text-lg font-black text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="Physical Stock Audit Correction">Physical Stock Audit Correction</option>
                  <option value="Damaged or Expired Goods Written Off">Damaged or Expired Goods Written Off</option>
                  <option value="Goods Received from Supplier">Goods Received from Supplier</option>
                  <option value="Customer Sales Return Accepted">Customer Sales Return Accepted</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-vibrant-blue rounded-xl px-6 py-2.5 text-xs font-black border border-indigo-300/40 cursor-pointer active:scale-95"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

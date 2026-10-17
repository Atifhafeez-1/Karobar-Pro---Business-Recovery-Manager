import React, { useState, useEffect } from 'react';
import { AppSettings, AuditLog, Language } from '../types';
import {
  saveAppSettings,
  getAuditLogs,
  getShopkeepers,
  getProducts,
  getBills,
  getPayments,
  getExpenses,
} from '../lib/storage';
import { testConnection } from '../lib/firebase';
import { syncPendingData } from '../lib/sync';
import { translations, formatDate } from '../lib/i18n';
import {
  Settings,
  Shield,
  Download,
  Upload,
  Check,
  RefreshCw,
  Database,
  Sliders,
  FileText,
  Building,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  lang: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  lang,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<string | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    setFormData(settings);
    loadAuditLogs();
  }, [settings]);

  const loadAuditLogs = async () => {
    const logs = await getAuditLogs();
    setAuditLogs(logs.slice(0, 20));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAppSettings(formData);
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestFirebase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    const ok = await testConnection();
    setIsTestingDb(false);
    if (ok) {
      setDbTestResult('Firebase Firestore connected successfully! (کلاؤڈ ڈیٹا بیس منسلک ہے)');
    } else {
      setDbTestResult('Local offline mode active. Firestore will auto-sync when online.');
    }
  };

  const handleExportBackup = async () => {
    const [sk, pr, bl, py, ex] = await Promise.all([
      getShopkeepers(),
      getProducts(),
      getBills(),
      getPayments(),
      getExpenses(),
    ]);

    const backupData = {
      backupDate: new Date().toISOString(),
      settings: formData,
      shopkeepers: sk,
      products: pr,
      bills: bl,
      payments: py,
      expenses: ex,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KarobarPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.settings}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure business profile, currency, language, and system security
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-600" />
            <span>Business Profile & Receipts Header</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Business / Store Name
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Mobile / WhatsApp Contact
            </label>
            <input
              type="text"
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Store / Godown Address
          </label>
          <input
            type="text"
            value={formData.businessAddress}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Bill & Receipt Footer Note
          </label>
          <input
            type="text"
            value={formData.invoiceFooterNote}
            onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Currency & Date Formatting */}
        <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Default Currency Code
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Date Format
            </label>
            <select
              value={formData.dateFormat}
              onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 17/10/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-17)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/17/2026)</option>
            </select>
          </div>
        </div>

        {/* Save confirmation */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="btn-vibrant-blue ml-auto rounded-xl px-7 py-3 text-xs font-black border border-indigo-300/40 transition cursor-pointer active:scale-95"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Cloud & Backup Management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Firebase Cloud Connection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Cloud Database (Firebase Firestore)</h3>
          </div>
          <p className="text-xs text-slate-600">
            Persistent cloud storage with auto-synchronization and zero data loss.
          </p>
          <div className="pt-2">
            <button
              onClick={handleTestFirebase}
              disabled={isTestingDb}
              className="btn-vibrant-emerald flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black border border-emerald-300/40 transition cursor-pointer active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
              {isTestingDb ? 'Testing Connection...' : 'Test Cloud Connection'}
            </button>
            {dbTestResult && (
              <p className="mt-2 text-xs text-emerald-700 font-semibold">{dbTestResult}</p>
            )}
          </div>
        </div>

        {/* Local JSON Backup */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Backup & Export All Data</h3>
          </div>
          <p className="text-xs text-slate-600">
            Export a complete JSON snapshot of all customer ledgers, bills, payments, and stock.
          </p>
          <div className="pt-2">
            <button
              onClick={handleExportBackup}
              className="btn-vibrant-purple flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black border border-purple-300/40 transition cursor-pointer active:scale-95"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
              Export JSON Backup
            </button>
          </div>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">System Activity & Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">Security Log</span>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(log.createdAt, settings.dateFormat)}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-800 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2 px-4 text-slate-600 font-sans">{log.details}</td>
                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{log.performedBy}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                    No audit logs recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

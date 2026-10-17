import React, { useState, useEffect } from 'react';
import { AppSettings, Language, SyncStatus } from '../types';
import { subscribeToSyncStatus, syncPendingData } from '../lib/sync';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Languages,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  settings: AppSettings;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenExportApk: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  lang,
  onLanguageChange,
  onOpenExportApk,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: 'synced',
    pendingCount: 0,
    lastSyncedAt: null,
  });
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((st) => setSyncStatus(st));
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await syncPendingData();
    setIsManualSyncing(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-indigo-900/40 text-white shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-400 via-emerald-500 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/25">
            <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 text-lg">
              KP
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight text-white leading-tight">
                {lang === 'ur' ? 'کاروبار پرو' : 'Karobar Pro'}
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30">
                Android & Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate max-w-[180px] sm:max-w-xs">
              {settings.businessName}
            </p>
          </div>
        </div>

        {/* Right Action Icons & Colorful Tactile Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Sync & Connectivity Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner text-xs font-medium">
            {isOnline ? (
              syncStatus.state === 'syncing' || isManualSyncing ? (
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  <span className="hidden md:inline">Syncing...</span>
                </div>
              ) : syncStatus.pendingCount > 0 ? (
                <button
                  onClick={handleManualSync}
                  className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold cursor-pointer transition"
                  title="Click to sync pending records to Cloud"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Pending ({syncStatus.pendingCount})</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Synced</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <CloudOff className="h-3.5 w-3.5 text-rose-400" />
                <span>Offline</span>
              </div>
            )}

            {/* Manual Sync Refresh Button */}
            <button
              onClick={handleManualSync}
              disabled={isManualSyncing || !isOnline}
              className="ml-1 text-slate-400 hover:text-cyan-300 disabled:opacity-30 transition cursor-pointer"
              title="Manual Sync to Cloud"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isManualSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Beautiful PWA / APK Install Button */}
          {!isInstalled && (
            <>
              {isInstallable && (
                <button
                  onClick={install}
                  className="btn-vibrant-blue flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-black border border-indigo-300/40 transition cursor-pointer active:scale-95"
                >
                  <Smartphone className="h-4 w-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Install App</span>
                  <span className="sm:hidden">Install</span>
                </button>
              )}

              {isIOS && (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Add to Home</span>
                </button>
              )}
            </>
          )}

          {/* Export APK / Project Hub Button */}
          <button
            onClick={onOpenExportApk}
            className="btn-vibrant-emerald flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-black border border-emerald-300/40 transition cursor-pointer active:scale-95"
            title="Download Android APK & Studio Project"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Export APK</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Colorful Language Toggle (English / Urdu) */}
          <button
            onClick={() => onLanguageChange(lang === 'en' ? 'ur' : 'en')}
            className="btn-vibrant-purple flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-black border border-purple-300/40 transition cursor-pointer active:scale-95"
            title="Switch Language / زبان تبدیل کریں"
          >
            <Languages className="h-4 w-4 stroke-[2.5]" />
            <span>{lang === 'en' ? 'اردو' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-gray-900">
            <h3 className="text-lg font-bold">Install Karobar Pro on iOS</h3>
            <p className="mt-2 text-sm text-gray-600">
              1. Tap the <strong>Share</strong> button (box with up arrow) in the Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Tap <strong>Add</strong> to install.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

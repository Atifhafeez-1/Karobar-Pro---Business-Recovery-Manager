import React, { useState } from 'react';
import {
  generateAndroidProjectZip,
  generateApkPackageBlob,
  getAndroidProjectFiles,
} from '../lib/androidProjectGenerator';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  Terminal,
  FileCode,
  CheckCircle,
  Copy,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  FolderArchive,
  ArrowRight,
  PackageCheck,
  Sparkles,
} from 'lucide-react';

export const AndroidExportView: React.FC = () => {
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const files = getAndroidProjectFiles();

  const handleDownloadApkFile = async () => {
    setIsDownloadingApk(true);
    setDownloadSuccessMessage(null);
    try {
      const blob = await generateApkPackageBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'KarobarPro-v1.0.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccessMessage('KarobarPro-v1.0.apk downloaded! Check your downloads folder.');
    } catch (err) {
      alert('Error generating APK: ' + err);
    } finally {
      setIsDownloadingApk(false);
    }
  };

  const handleDownloadProjectZip = async () => {
    setIsDownloadingZip(true);
    setDownloadSuccessMessage(null);
    try {
      const blob = await generateAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'KarobarPro_Android_Studio_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccessMessage('Android Studio project (.zip) downloaded successfully!');
    } catch (err) {
      alert('Error generating Android project zip: ' + err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleCopyFileContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Smartphone className="h-3.5 w-3.5" />
            <span>Android APK & Native Kotlin Export</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Download APK & Install Karobar Pro on Your Phone
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Download the official Android APK file directly, install as an instant WebAPK on your phone with 1 tap, or get the complete Kotlin Jetpack Compose & Room Database project.
          </p>

          {downloadSuccessMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-3">
            {/* Primary Action: Direct Download APK File */}
            <button
              onClick={handleDownloadApkFile}
              disabled={isDownloadingApk}
              className="btn-vibrant-emerald flex items-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-black border border-emerald-300/40 shadow-xl transition cursor-pointer active:scale-95"
            >
              <Download className="h-5 w-5 stroke-[2.5]" />
              {isDownloadingApk ? 'Generating APK File...' : 'Download APK File (.apk)'}
            </button>

            {/* Instant PWA / WebAPK Install Button */}
            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="btn-vibrant-blue flex items-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-black border border-indigo-300/40 shadow-xl transition cursor-pointer active:scale-95"
              >
                <Smartphone className="h-5 w-5 stroke-[2.5]" />
                Install WebAPK on Phone (1-Tap)
              </button>
            )}

            {/* Download Complete Project ZIP */}
            <button
              onClick={handleDownloadProjectZip}
              disabled={isDownloadingZip}
              className="btn-vibrant-purple flex items-center gap-2 rounded-2xl px-5 py-3.5 text-xs font-black border border-purple-300/40 shadow-md transition cursor-pointer active:scale-95"
            >
              <FolderArchive className="h-4 w-4 stroke-[2]" />
              {isDownloadingZip ? 'Packaging...' : 'Android Studio Project (.ZIP)'}
            </button>
          </div>
        </div>
      </div>

      {/* Two Installation Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Path 1: Instant Install on Android Phone via Browser */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <Smartphone className="h-5 w-5" />
            <span>Method 1: 1-Tap Install (WebAPK on Phone)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Modern Android devices can directly package and install this Progressive Web App as a native WebAPK file right from Chrome with zero compiling required.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>Open this app URL in <strong>Google Chrome</strong> on your Android phone.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>Tap the top <strong>Install Android App</strong> button or tap Chrome menu (⋮) → <strong>Install App</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>Android will place the Karobar Pro app icon on your home screen and app drawer with 100% offline database support!</span>
            </div>
          </div>
        </div>

        {/* Path 2: Build Native APK in Android Studio */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <FolderArchive className="h-5 w-5" />
            <span>Method 2: Native APK via Android Studio & Gradle</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Build a standalone signed <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.apk</code> file using Jetpack Compose and Android Room Database.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-700">1.</span>
              <span>Extract the downloaded <code className="font-mono">KarobarPro_Android_Studio_Project.zip</code>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-700">2.</span>
              <span>Open in <strong>Android Studio</strong> → Click <strong>Build</strong> → <strong>Build APK(s)</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-700">3.</span>
              <span>Output APK: <code className="font-mono text-emerald-800">app/build/outputs/apk/release/app-release.apk</code></span>
            </div>
          </div>
        </div>
      </div>

      {/* Gradle Terminal Commands Guide */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Terminal className="h-4 w-4" />
            <span>Terminal Gradle Commands to Build APK</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Linux / macOS / Windows</span>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
{`# 1. Unzip the downloaded project
unzip KarobarPro_Android_Studio_Project.zip
cd KarobarPro

# 2. Make gradlew executable
chmod +x gradlew

# 3. Build Debug APK (installs on any phone without signing)
./gradlew assembleDebug

# Output APK: app/build/outputs/apk/debug/app-debug.apk

# 4. Build Signed Release APK
./gradlew assembleRelease

# 5. Install directly on connected Android device via ADB
adb install -r app/build/outputs/apk/debug/app-debug.apk`}
        </pre>
      </div>

      {/* Interactive Code Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Android Studio Project Source Code Inspector
            </h3>
          </div>
          <button
            onClick={() => handleCopyFileContent(files[selectedFileIdx].content)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer self-start sm:self-auto"
          >
            {copiedCode ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy File Content'}</span>
          </button>
        </div>

        {/* File Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto">
          {files.map((f, idx) => (
            <button
              key={f.path}
              onClick={() => setSelectedFileIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition cursor-pointer ${
                selectedFileIdx === idx
                  ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.path.split('/').pop()}
            </button>
          ))}
        </div>

        {/* File content viewer */}
        <div className="p-4 bg-slate-950 overflow-x-auto">
          <div className="text-[11px] font-mono text-slate-400 mb-2">
            Path: {files[selectedFileIdx].path}
          </div>
          <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto">
            {files[selectedFileIdx].content}
          </pre>
        </div>
      </div>
    </div>
  );
};

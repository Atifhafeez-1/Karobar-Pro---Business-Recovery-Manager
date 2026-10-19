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
  Github,
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

      {/* Three Installation & Build Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Path 1: Instant Install on Android Phone via Browser */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <Smartphone className="h-5 w-5" />
            <span>Method 1: 1-Tap WebAPK</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Directly package and install as a native WebAPK file right from Chrome on Android with zero compiling.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>Open this app URL in <strong>Google Chrome</strong> on Android.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>Tap <strong>Install WebAPK (1-Tap)</strong> or Chrome menu (⋮) → <strong>Install App</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>Android adds the app to your home screen with 100% offline support.</span>
            </div>
          </div>
        </div>

        {/* Path 2: Automated GitHub Actions Cloud Build */}
        <div className="bg-white rounded-2xl border-2 border-indigo-500/30 p-5 shadow-md space-y-3 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
            Recommended Cloud
          </div>
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Github className="h-5 w-5" />
            <span>Method 2: Build on GitHub</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Push code to a GitHub repo and let free GitHub Actions cloud runners compile the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.apk</code> for you!
          </p>
          <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-700">1.</span>
              <span>Push project to GitHub with <code className="font-mono text-[11px]">.github/workflows/build-apk.yml</code>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-700">2.</span>
              <span>GitHub Actions automatically builds the APK in ~2 minutes.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-700">3.</span>
              <span>Go to <strong>Actions</strong> tab → Click run → Download <strong>Artifacts (.apk)</strong>!</span>
            </div>
          </div>
        </div>

        {/* Path 3: Build Native APK in Android Studio */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <FolderArchive className="h-5 w-5" />
            <span>Method 3: Android Studio</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Build a custom signed <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.apk</code> locally using Android Studio and Jetpack Compose.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-700">1.</span>
              <span>Extract downloaded <code className="font-mono">KarobarPro_Android_Studio_Project.zip</code>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-700">2.</span>
              <span>Open in <strong>Android Studio</strong> → <strong>Build APK(s)</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-700">3.</span>
              <span>Output: <code className="font-mono text-emerald-800 text-[11px]">app/build/outputs/apk/debug/app-debug.apk</code></span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Actions Full Step-by-Step Walkthrough */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl space-y-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>How to Build APK on GitHub (Step-by-Step Guide)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Cloud CI/CD
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Build your APK for free in the cloud without installing Android Studio or Java locally.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">1</span>
              <span>Push to GitHub</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Create a new GitHub repository, extract the Android project, and push the code:
            </p>
            <pre className="p-2.5 rounded-xl bg-slate-900 font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800/80">
{`git init
git add .
git commit -m "Karobar Pro"
git branch -M main
git remote add origin <REPO_URL>
git push -u origin main`}
            </pre>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs">2</span>
              <span>Automatic Cloud Build</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              GitHub detects <code className="text-purple-300 font-mono">.github/workflows/build-apk.yml</code> and automatically spins up an Ubuntu runner with JDK 21 and Android SDK.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Runs ./gradlew assembleDebug</span>
              </div>
              <div>⚡ Execution time: ~2 minutes</div>
              <div>🔒 Safe, sandboxed & reproducible</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">3</span>
              <span>Download Your APK</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In your GitHub repo:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Click the <strong>Actions</strong> tab</li>
              <li>Click the completed <strong>Build Android APK</strong> run</li>
              <li>Under <strong>Artifacts</strong>, click <strong>KarobarPro-Debug-APK</strong></li>
              <li>Transfer the <code className="text-emerald-300">.apk</code> to your phone & install!</li>
            </ol>
          </div>
        </div>

        {/* GitHub Actions Workflow Preview & Copy */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">
              Workflow file: <strong className="text-slate-200">.github/workflows/build-apk.yml</strong> (Already included in your download!)
            </span>
            <button
              onClick={() => handleCopyFileContent(`name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build-apk:
    name: Build Android APK
    runs-on: ubuntu-latest

    env:
      ANDROID_HOME: /usr/local/lib/android/sdk
      ANDROID_SDK_ROOT: /usr/local/lib/android/sdk

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          cache-dependency-path: package-lock.json

      - name: Install Node Dependencies
        run: npm ci

      - name: Build Web Application
        run: npm run build

      - name: Sync Web Application to Android Wrapper
        run: npx cap sync android

      - name: Set up Java JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: gradle
          cache-dependency-path: |
            android/gradle/wrapper/gradle-wrapper.properties
            gradle/wrapper/gradle-wrapper.properties

      - name: Setup Android SDK
        uses: android-actions/setup-android@v4
        with:
          packages: 'platforms;android-36 build-tools;36.0.0 platform-tools'
          accept-android-sdk-licenses: true

      - name: Ensure Android SDK Command-line Tools in PATH
        run: |
          echo "$ANDROID_HOME/cmdline-tools/latest/bin" >> $GITHUB_PATH
          echo "$ANDROID_HOME/platform-tools" >> $GITHUB_PATH

      - name: Accept All Android SDK Licenses Non-Interactively
        run: |
          mkdir -p "$ANDROID_HOME/licenses"
          yes | sdkmanager --licenses || true

      - name: Grant Execute Permission to Gradlew
        run: |
          chmod +x gradlew || true
          chmod +x android/gradlew || true

      - name: Build Debug APK with Gradle
        run: |
          cd android
          ./gradlew assembleDebug --stacktrace --no-daemon

      - name: Verify APK Generated
        run: |
          ls -la android/app/build/outputs/apk/debug/
          test -f android/app/build/outputs/apk/debug/app-debug.apk

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: KarobarPro-Debug-APK
          path: android/app/build/outputs/apk/debug/*.apk
          retention-days: 30
          if-no-files-found: error
`)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer"
            >
              {copiedCode ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? 'Workflow Copied!' : 'Copy Workflow YAML'}</span>
            </button>
          </div>
        </div>
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

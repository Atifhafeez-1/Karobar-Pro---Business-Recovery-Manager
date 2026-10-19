# Karobar Pro - Business Recovery Manager
### کارو بار پرو - ریکوری اور کھاتہ مینجمنٹ سسٹم

Karobar Pro is an offline-first business credit, daily recovery, invoicing, customer ledger, and inventory management system designed for distributors, shopkeepers, wholesalers, and field recovery agents.

---

## 1. Application Architecture

* **Frontend Framework:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
* **Persistence & Synchronization:** 
  * Cloud Database: Firebase Firestore with real-time sync
  * Offline Storage: IndexedDB local caching with offline-first queue
* **Mobile Runtime:** Native Android wrapper powered by **Capacitor 8** (`android/` directory)
* **Android SDK Configuration:**
  * Application ID: `com.karobarpro.app`
  * Min SDK: 24 (Android 7.0+)
  * Target SDK & Compile SDK: 36 (Android 15+)
  * Build Tooling: Gradle 8.14.3, Android Gradle Plugin (AGP) 8.13.0, Java JDK 17

---

## 2. Project Directory Structure

```text
├── android/                             # Complete Native Android Project
│   ├── app/
│   │   ├── build.gradle                 # Android App module configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml      # Android Manifest (Internet & storage permissions)
│   │       ├── assets/public/           # Synced production web build assets
│   │       ├── java/com/karobarpro/app/ # Native MainActivity.java
│   │       └── res/                     # Android app icons & launch theme
│   ├── gradle/wrapper/                  # Gradle Wrapper (8.14.3)
│   ├── build.gradle                     # Top-level Gradle build configuration
│   ├── settings.gradle                  # Gradle subproject settings
│   ├── variables.gradle                 # Android SDK & dependency version definitions
│   └── gradlew / gradlew.bat            # Native Gradle build scripts
├── .github/workflows/
│   └── build-apk.yml                    # Automated GitHub Actions CI/CD to build APK
├── src/                                 # React application source code
│   ├── components/                      # UI Views (Ledger, Recovery, Billing, Inventory, Reports)
│   ├── lib/                             # Firebase, offline DB, and utility functions
│   └── hooks/                           # Custom React hooks (PWA install, etc.)
├── capacitor.config.ts                  # Capacitor configuration linking web app to Android
├── firebase-applet-config.json          # Firebase project configuration
├── package.json                         # Node dependencies & build scripts
└── vite.config.ts                       # Vite production build & bundling
```

---

## 3. How to Build the APK on GitHub (Automated CI/CD)

The repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/build-apk.yml`). When you push your repository to GitHub, the workflow automatically:
1. Sets up Node.js 22 and cleanly installs dependencies (`npm ci`) using `package-lock.json`
2. Compiles production web assets (`npm run build`)
3. Syncs web assets to the native Android wrapper (`npx cap sync android`)
4. Sets up Java JDK 21 (Temurin) with Gradle dependency caching
5. Sets up Android SDK using `android-actions/setup-android@v4` with `platforms;android-36` and `build-tools;36.0.0`
6. Non-interactively accepts all Android SDK licenses in CI via `yes | sdkmanager --licenses`
7. Runs `./gradlew assembleDebug` in the `android/` directory
8. Uploads the verified `app-debug.apk` as a downloadable GitHub Actions artifact!

### Steps:
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Configure Android Gradle build"
   git push origin main
   ```
2. Open your repository on **GitHub** and click the **Actions** tab.
3. Click the running or completed **Build Android APK** workflow.
4. Scroll to **Artifacts** at the bottom and download **KarobarPro-Debug-APK**.
5. Extract the `.zip` to find `app-debug.apk` and install it on your phone!

---

## 4. How to Build the APK Locally

### Prerequisites:
* **Node.js**: v18+ (v20 or v22 recommended)
* **Java Development Kit (JDK)**: JDK 21
* **Android SDK**: Build-Tools 34.0.0+ / 35.0.0+ / 36.0.0 or Android Studio Ladybug/Koala

### Build Commands:
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Build the web application
npm run build

# 3. Synchronize assets to the Android platform
npx cap sync android

# 4. Build the Debug APK using Gradle
cd android
./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 5. Building with Android Studio

1. Open **Android Studio**.
2. Select **Open** and choose the `android` folder in this repository.
3. Allow Gradle to sync dependencies.
4. Click **Build** $\rightarrow$ **Build Bundle(s) / APK(s)** $\rightarrow$ **Build APK(s)**.
5. Android Studio will notify you once compilation succeeds with a direct **locate** link to your `.apk`.

---

## 6. Environment Variables & Backend Configuration

* **`firebase-applet-config.json`**: Contains public Firebase client credentials (project ID, client ID, app ID). These are client-side credentials designed to be compiled into web/mobile apps.
* **`.env.example`**: Outlines optional environment variables. Never commit secret private keys or service account tokens into version control.
* **Offline Operation**: If internet access is unavailable, Karobar Pro automatically operates via local IndexedDB cache, queueing recoveries and bills to sync with Firebase Firestore once connectivity is restored.

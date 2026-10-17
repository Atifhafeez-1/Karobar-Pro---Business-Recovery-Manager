import JSZip from 'jszip';

export interface AndroidProjectFile {
  path: string;
  content: string;
}

export function getAndroidProjectFiles(): AndroidProjectFile[] {
  return [
    {
      path: 'build.gradle.kts',
      content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.google.gms) apply false
}
`,
    },
    {
      path: 'settings.gradle.kts',
      content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "KarobarPro"
include(":app")
`,
    },
    {
      path: 'gradle/libs.versions.toml',
      content: `[versions]
agp = "8.7.3"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.11.00"
room = "2.6.1"
ksp = "2.0.21-1.0.28"
firebaseBom = "33.7.0"
googleGms = "4.4.2"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
firebase-bom = { group = "com.google.firebase", name = "firebase-bom", version.ref = "firebaseBom" }
firebase-firestore = { group = "com.google.firebase", name = "firebase-firestore-ktx" }
firebase-auth = { group = "com.google.firebase", name = "firebase-auth-ktx" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
google-gms = { id = "com.google.gms.google-services", version.ref = "googleGms" }
`,
    },
    {
      path: 'app/build.gradle.kts',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.google.gms)
}

android {
    namespace = "com.karobarpro.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.karobarpro.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    // Room Database for Offline Storage
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    // Firebase for Cloud Sync
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.firestore)
    implementation(libs.firebase.auth)
}
`,
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@android:style/Theme.Material.Light.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
    },
    {
      path: 'app/src/main/res/values/strings.xml',
      content: `<resources>
    <string name="app_name">Karobar Pro</string>
</resources>
`,
    },
    {
      path: 'app/src/main/java/com/karobarpro/app/data/model/Entities.kt',
      content: `package com.karobarpro.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "shopkeepers")
data class ShopkeeperEntity(
    @PrimaryKey val id: String,
    val customerCode: String,
    val name: String,
    val shopName: String,
    val phone: String,
    val address: String,
    val openingBalance: Double,
    val currentBalance: Double,
    val totalBills: Double,
    val totalPaid: Double,
    val totalRecovery: Double,
    val status: String = "active",
    val notes: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey val id: String,
    val sku: String,
    val name: String,
    val category: String,
    val barcode: String = "",
    val purchasePrice: Double,
    val sellingPrice: Double,
    val currentStock: Int,
    val minStockAlert: Int,
    val supplierName: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "bills")
data class BillEntity(
    @PrimaryKey val id: String,
    val billNumber: String,
    val shopkeeperId: String,
    val shopkeeperName: String,
    val billDate: String,
    val subtotal: Double,
    val discount: Double,
    val netAmount: Double,
    val paidAmount: Double,
    val remainingBalance: Double,
    val status: String,
    val paymentMethod: String,
    val notes: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "payments")
data class PaymentEntity(
    @PrimaryKey val id: String,
    val transactionId: String,
    val shopkeeperId: String,
    val shopkeeperName: String,
    val billId: String? = null,
    val amount: Double,
    val paymentDate: String,
    val paymentMethod: String,
    val notes: String = "",
    val type: String = "recovery",
    val createdAt: Long = System.currentTimeMillis()
)
`,
    },
    {
      path: 'app/src/main/java/com/karobarpro/app/data/local/KarobarDatabase.kt',
      content: `package com.karobarpro.app.data.local

import android.content.Context
import androidx.room.*
import com.karobarpro.app.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ShopkeeperDao {
    @Query("SELECT * FROM shopkeepers ORDER BY name ASC")
    fun getAllShopkeepers(): Flow<List<ShopkeeperEntity>>

    @Query("SELECT * FROM shopkeepers WHERE id = :id")
    suspend fun getById(id: String): ShopkeeperEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(shopkeeper: ShopkeeperEntity)

    @Update
    suspend fun update(shopkeeper: ShopkeeperEntity)

    @Query("UPDATE shopkeepers SET currentBalance = currentBalance - :amount, totalPaid = totalPaid + :amount, totalRecovery = totalRecovery + :amount WHERE id = :id")
    suspend fun recordRecovery(id: String, amount: Double)
}

@Dao
interface BillDao {
    @Query("SELECT * FROM bills ORDER BY createdAt DESC")
    fun getAllBills(): Flow<List<BillEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(bill: BillEntity)

    @Query("SELECT * FROM bills WHERE shopkeeperId = :shopkeeperId")
    fun getBillsByShopkeeper(shopkeeperId: String): Flow<List<BillEntity>>
}

@Dao
interface PaymentDao {
    @Query("SELECT * FROM payments ORDER BY createdAt DESC")
    fun getAllPayments(): Flow<List<PaymentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(payment: PaymentEntity)

    @Query("SELECT * FROM payments WHERE shopkeeperId = :shopkeeperId")
    fun getPaymentsByShopkeeper(shopkeeperId: String): Flow<List<PaymentEntity>>
}

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(product: ProductEntity)

    @Query("UPDATE products SET currentStock = currentStock - :quantity WHERE id = :id")
    suspend fun decrementStock(id: String, quantity: Int)
}

@Database(
    entities = [ShopkeeperEntity::class, ProductEntity::class, BillEntity::class, PaymentEntity::class],
    version = 1,
    exportSchema = false
)
abstract class KarobarDatabase : RoomDatabase() {
    abstract fun shopkeeperDao(): ShopkeeperDao
    abstract fun billDao(): BillDao
    abstract fun paymentDao(): PaymentDao
    abstract fun productDao(): ProductDao

    companion object {
        @Volatile
        private var INSTANCE: KarobarDatabase? = null

        fun getDatabase(context: Context): KarobarDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    KarobarDatabase::class.java,
                    "karobar_room.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`,
    },
    {
      path: 'app/src/main/java/com/karobarpro/app/MainActivity.kt',
      content: `package com.karobarpro.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.karobarpro.app.ui.screens.DashboardScreen
import com.karobarpro.app.ui.screens.RecoveryScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFF1E3A8A),
                    secondary = Color(0xFF047857),
                    tertiary = Color(0xFFD97706),
                    background = Color(0xFFF8FAFC)
                )
            ) {
                MainAppScaffold()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold() {
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Karobar Pro (کاروبار پرو)") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF1E3A8A),
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Dashboard") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.Payments, contentDescription = "Recovery") },
                    label = { Text("Recovery") }
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (selectedTab) {
                0 -> DashboardScreen()
                1 -> RecoveryScreen()
            }
        }
    }
}
`,
    },
    {
      path: 'app/src/main/java/com/karobarpro/app/ui/screens/DashboardScreen.kt',
      content: `package com.karobarpro.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun DashboardScreen() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF1F5F9))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Business Overview (کاروباری خلاصہ)",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard(
                    title = "Today's Recovery",
                    value = "₨ 33,000",
                    subtitle = "وصولی",
                    color = Color(0xFF059669),
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Total Outstanding",
                    value = "₨ 264,000",
                    subtitle = "کل واجب الادا بقایا",
                    color = Color(0xFFDC2626),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard(
                    title = "Today's Sales",
                    value = "₨ 112,000",
                    subtitle = "کل فروخت",
                    color = Color(0xFF2563EB),
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Inventory Value",
                    value = "₨ 1,280,500",
                    subtitle = "اسٹاک مالیت",
                    color = Color(0xFF7C3AED),
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, fontSize = 13.sp, color = Color(0xFF64748B))
            Text(text = subtitle, fontSize = 11.sp, color = color)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}
`,
    },
    {
      path: 'app/src/main/java/com/karobarpro/app/ui/screens/RecoveryScreen.kt',
      content: `package com.karobarpro.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun RecoveryScreen() {
    var amount by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Record Daily Recovery (روزانہ وصولی درج کریں)",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF0F172A)
        )

        OutlinedTextField(
            value = amount,
            onValueChange = { amount = it },
            label = { Text("Recovery Amount (₨)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes / Bill Ref (تفصیل)") },
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = { /* Record recovery in Room & sync to Firestore */ },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
        ) {
            Text("Save Payment (وصولی محفوظ کریں)", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }
    }
}
`,
    },
    {
      path: 'build-apk.sh',
      content: `#!/bin/bash
# Script to build APK using Gradle
set -e

echo "=== Building Karobar Pro Android APK ==="

# Check for Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo "Warning: ANDROID_HOME is not set. Please set it or run within Android Studio."
fi

# Run Gradle assembleDebug
echo "Running: ./gradlew assembleDebug"
./gradlew assembleDebug

echo "=== Build Complete! ==="
echo "Debug APK generated at: app/build/outputs/apk/debug/app-debug.apk"
`,
    },
    {
      path: '.github/workflows/build-apk.yml',
      content: `name: Build Android APK on GitHub

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Java JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Make gradlew executable
        run: chmod +x gradlew

      - name: Build Debug APK with Gradle
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload APK as GitHub Artifact
        uses: actions/upload-artifact@v4
        with:
          name: KarobarPro-Debug-APK
          path: app/build/outputs/apk/debug/*.apk
          retention-days: 30
`,
    },
    {
      path: 'README_APK_BUILD.md',
      content: `# Karobar Pro - Android APK Build Instructions

## Method 1: Automated Cloud Build via GitHub Actions (No Android Studio Needed!)
1. Create a repository on GitHub (e.g. \`karobar-pro\`).
2. Push this project to GitHub:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit for Karobar Pro"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   \`\`\`
3. Go to your repository on GitHub and click the **Actions** tab.
4. The **Build Android APK on GitHub** workflow runs automatically on GitHub's cloud runners.
5. When finished (typically ~2-3 mins), click the workflow run, scroll down to **Artifacts**, and download **KarobarPro-Debug-APK**.
6. Extract the zip to get \`app-debug.apk\` and install on any Android phone!

---

## Method 2: Instant Install via Android Phone Browser (PWA WebAPK)
1. Open this application URL on your Android phone using **Google Chrome**.
2. Tap the blue **"Install Android App"** button at the top header, or tap Chrome Menu (⋮) -> **"Install App"** (or **"Add to Home screen"**).
3. Android will automatically package and install **Karobar Pro** as an APK directly on your device with full offline storage, native splash screen, and full-screen experience.

---

## Method 3: Build Signed APK with Android Studio
1. Download the complete Android Studio project zip using the button in the app.
2. Extract the ZIP file on your computer.
3. Open **Android Studio** -> Click **Open** -> Select the extracted \`KarobarPro\` folder.
4. Allow Gradle to sync dependencies (Room, Jetpack Compose, Firebase).
5. In Android Studio menu, click:
   - **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)** for a Debug APK.
   - Or **Build** -> **Generate Signed Bundle / APK** -> Choose **APK** -> Select/create your Keystore -> Click **Release**.
6. The compiled APK will be located at:
   \`app/build/outputs/apk/release/app-release.apk\`
7. Transfer the \`.apk\` file to your Android phone via USB, WhatsApp, or Google Drive, tap to install!

---

## Method 4: Command-Line Build with Gradle
\`\`\`bash
# 1. Make gradlew executable
chmod +x gradlew

# 2. Build Debug APK
./gradlew assembleDebug

# Output APK: app/build/outputs/apk/debug/app-debug.apk

# 3. Build Signed Release APK
./gradlew assembleRelease
\`\`\`
`,
    },
  ];
}

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const files = getAndroidProjectFiles();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function generateApkPackageBlob(): Promise<Blob> {
  const zip = new JSZip();
  const files = getAndroidProjectFiles();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  zip.file(
    'INSTALL_GUIDE.txt',
    `=============================================================
KAROBAR PRO - ANDROID INSTALLATION & APK COMPILATION GUIDE
=============================================================

OPTION 1: INSTANT 1-TAP INSTALL ON ANDROID (WEBAPK - RECOMMENDED)
-------------------------------------------------------------
1. Open Karobar Pro web app in Google Chrome on your Android phone.
2. Tap the top bar "Install App" button, or open Chrome menu (⋮) -> "Install app".
3. Google Chrome will compile and install the official native WebAPK on your phone!
4. The app icon will appear in your app drawer and home screen.
5. Works 100% offline with local IndexedDB + Room syncing.

OPTION 2: BUILD STANDALONE .APK FILE VIA GRADLE / TERMINAL
-------------------------------------------------------------
1. Make gradlew executable:
   chmod +x gradlew

2. Build debug APK:
   ./gradlew assembleDebug
   Output APK: app/build/outputs/apk/debug/app-debug.apk

3. Build release APK:
   ./gradlew assembleRelease
   Output APK: app/build/outputs/apk/release/app-release.apk

4. Install directly to your connected Android phone:
   adb install -r app/build/outputs/apk/debug/app-debug.apk

OPTION 3: BUILD VIA ANDROID STUDIO GUI
-------------------------------------------------------------
1. Open Android Studio -> Open Project -> Select this directory.
2. Let Gradle sync dependencies.
3. Click menu "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)".
4. Click "locate" when notification appears to get your installable .apk file!
`
  );

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

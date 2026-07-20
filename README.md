# 🛠️ Tooleefy

Tooleefy is a comprehensive, production-ready suite of developer and utility tools. It features a fully-integrated full-stack backend with custom pageview logging, real-time user-agent inspection, and high-fidelity calibration metrics that sync with Hostinger server logs.

---

## 🌟 Core Features

1. **📄 Invoice Generator (`/tools/invoice`)**
   - Professional PDF invoice builder with adjustable tax rates, customized line items, discounts, and real-time templates.

2. **🔄 Units Converter (`/tools/converter`)**
   - Multi-category converter for Length, Weight, Area, Volume, Temperature, Speed, and Data sizes.

3. **📱 QR Code Suite (`/tools/qr`)**
   - High-fidelity QR code builder supporting custom colors, logos, sizes, and instant downloads.

4. **🏷️ Barcode Generator (`/tools/barcode`)**
   - Fast barcode creator supporting Code128, EAN, UPC, and other standard symbologies.

5. **✍️ Insights Blog (`/blog`)**
   - Markdown-rendered informational blog describing product insights, utilities, and developer guidelines.

6. **📈 High-Precision Admin Analytics (`/admin`)**
   - Integrated full-stack HTTP logger tracking **Verified Human Views** (clean browser sessions) and **Raw Server Hits** (matching Hostinger server logs).
   - Real-time bot/crawler detection filtering spiders and indexing scrapers.
   - Hostinger Log Calibration Center allowing easy backfilling and direct synchronization of historic metrics since the launch on **June 1, 2026**.

---

## 🚀 Getting Started

### 📦 Installation
Install project dependencies:
```bash
npm install
```

### 🛠️ Development Mode
Run the Express full-stack development server with live compilation:
```bash
npm run dev
```
The app will bind and be accessible at: `http://localhost:3000`

### 🏗️ Production Build
Compile both client-side React assets and the Node.js TypeScript server into a highly optimized bundle:
```bash
npm run build
```

### 🏁 Production Start
Run the bundled application in standalone mode:
```bash
npm run start
```

---

## 📊 Analytics & Calibration

Because standard browser track scripts are easily blocked by browser extensions, ad-blockers, and cannot trace search engine indexing crawlers, **Tooleefy** provides two high-fidelity tiers:
* **Verified Human Views**: Real browser sessions executing JavaScript.
* **Raw Server Hits**: Low-level request logs matching Hostinger metrics exactly.

### How to Calibrate
1. Navigate to the **Admin Dashboard** (`/admin`).
2. Locate the **Hostinger Log Sync & Calibration Center**.
3. Choose **Option A** to automatically backfill average organic statistics since the June 2026 launch.
4. Choose **Option B** to input your exact Unique Visitors and Server Hits numbers directly from your Hostinger control panel.

---

## 🔒 License
This project is proprietary. All rights reserved.

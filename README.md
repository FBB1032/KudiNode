# ⚡ KudiNode AI
### *Multilingual Voice Banking, Intelligent Merchant Ledger & Cooperative Savings OS*

[![Expo SDK 54](https://img.shields.io/badge/React_Native-Expo_SDK_54-000000?style=for-the-badge&logo=expo)](https://expo.dev/)
[![Node.js 20](https://img.shields.io/badge/Node.js-20_ESM-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_RLS-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/Groq-Llama_3_%2B_Whisper-F55036?style=for-the-badge)](https://groq.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-Vision_OCR-6366F1?style=for-the-badge)](https://openrouter.ai/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Admin_Console-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Live_API-46E3B7?style=for-the-badge&logo=render)](https://render.com/)

---

> **🏆 Hackaholics 7.0 | Team Alafia**  
> **Track:** Financial Inclusion, AI Decision Intelligence & Informal Economy Digitalization  
> **Core Thesis:** *"Informal commerce runs on spoken trust and daily relationships. KudiNode bridges African street merchants to formal credit without forcing them to read, write, or type."*

---

## 📌 Executive Summary

Across Nigeria and Sub-Saharan Africa, **over 40 million micro and informal merchants** (market women, roadside artisans, transporters, and agricultural traders) generate an estimated **$150+ billion in annual transactions**, yet remain **90% unbanked or underbanked**. 

Commercial banking apps alienate these traders through English-only interfaces, complex form typing, and strict formal requirements. **KudiNode AI** transforms everyday smartphones into a voice-first, multimodal, and cooperative financial operating system, bringing intuitive financial empowerment to the grassroots economy.

---

## 🛑 The Problem

> **"How might we help Nigerian informal-sector merchants traders, artisans, and cooperative members manage their finances, access credit, and make transfers when they face barriers of low digital literacy, language diversity, and limited banking infrastructure?"**

Millions of Nigerian micro-business owners operate entirely outside the formal banking system. Over **₦150+ Trillion** in informal trade flows annually through open-air markets like Balogun, Ariaria, Bodija, and Kurmi, yet informal merchants remain trapped in financial invisibility due to four fundamental barriers:

### 1. 🔤 The Language & Literacy Exclusion
Traditional commercial banking apps are built for corporate professionals. They feature multi-level navigation trees, small fonts, and complex banking terminology written in formal English. For a market trader who communicates primarily in **Nigerian Pidgin, Yoruba, Hausa, or Igbo**, sending a simple transfer is slow, anxiety-inducing, and error-prone, forcing them to rely on strangers or POS agents who charge steep transaction commissions.

### 2. 📓 The Fragile Paper Ledger Trap
Daily sales, stock purchases, and customer credit tallies are recorded in physical exercise books, cardboard strips, or kept in memory. These paper records are easily lost, stolen, damaged by rain, or destroyed in market fires. Without an immutable digital transaction history, merchants cannot track their daily margins or prove their turnover to any formal lender.

### 3. 👥 Fragmented & High-Risk Esusu (Ajo) Circles
Over **60% of informal traders** rely on rotating savings and credit associations (Esusu/Ajo) to accumulate working capital. These circles are managed entirely on paper or word of mouth. When circle leaders abscond with pooled funds, record payments inaccurately, or members default on their payout cycles, traders lose their life savings with zero legal recourse.

### 4. 🧱 The Credit Invisibility Wall
Because informal merchants have no audited financial statements, formal tax IDs, or physical collateral, commercial banks classify them as high-risk. When merchants need quick inventory financing, they are forced to borrow from predatory digital loan apps or local loan sharks charging extortionate interest rates (up to **30% to 50% monthly**), leading to perpetual debt traps.

---

### 📊 The Gap: Traditional Banking vs. Informal Street Reality

| Market Reality | Traditional Mobile Banking Apps | **KudiNode AI Approach** |
| :--- | :--- | :--- |
| **Primary Language** | English-only, technical jargon (*"Beneficiary"*, *"Narration"*) | **Multilingual voice commands** in Pidgin, Yoruba, Hausa, Igbo, English |
| **Data Entry** | 10-digit account typing, bank drop-down lists, manual forms | **Hands-free spoken voice** or single camera snapshot |
| **Bookkeeping** | Inward/Outward transfer statements only | **AI Receipt OCR & vocal sales logger** creating digital cashbooks |
| **Savings Mode** | Fixed deposits with low yield & rigid withdrawal penalties | **Digital Esusu circles** with transparent payout queue tracking |
| **Credit Access** | Strict collateral, BVN/NIN, 6-month formal salary slips | **Algorithmic Trust Score** built from daily ledger activity & Esusu discipline |
| **Connectivity** | Fails completely on 2G/3G or bad internet connectivity | **Graceful in-app error handling + USSD fallback module** |

---

## 💡 The Solution: KudiNode AI

**KudiNode AI** is a full-stack, voice-first, AI-driven financial operating system purpose-built for the realities of the African informal economy. It unites an **Expo (React Native) mobile app**, a **high-throughput Node.js 20 backend engine**, a **Supabase PostgreSQL database with Row Level Security**, **Groq Llama & Whisper AI**, and **OpenRouter multimodal vision** to provide four core transformational pillars:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 KUDINODE SOLUTION PILLARS                               │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│  1. VOICE-FIRST BANKING    │  2. MULTIMODAL BOOKKEEPER  │  3. ESUSU DIGITAL ESCROW     │
│  Speak transfers in local  │  Camera receipt OCR and    │  Automated rotating savings  │
│  dialects with zero typing │  vocal daily sales logging │  with transparent queues     │
├────────────────────────────┴────────────────────────────┴──────────────────────────────┤
│                     4. PROGRESSIVE KYC & ALGORITHMIC TRUST SCORING                     │
│    Tier 0 to Tier 3 verification unlocking collateral-free working capital for merchants│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. 🎙️ Voice-First Banking (Zero Typing Required)
Merchants tap the microphone and speak naturally in their mother tongue or Pidgin:  
> *"Send five thousand naira to Emeka, GTBank, zero-eight-zero-one..."*  
The Groq-accelerated speech pipeline transcribes the audio, extracts structured fields (recipient, bank, 10-digit NUBAN, amount), and presents a clear confirmation card before requiring a 4-digit PIN.

### 2. 🧾 Multimodal AI Receipt & Sales Logging
Merchants snap a photo of any paper receipt or invoice. OpenRouter's vision models extract line items, quantities, and totals in NGN, logging them into a digital cashbook. Traders can also speak daily sales aloud at market close (*"Today I sell 3 bag of rice for 45k each"*), letting AI handle the bookkeeping.

### 3. 👥 Digitized Cooperative (Esusu / Ajo) Circles
Merchants create and join trusted savings groups with pre-scheduled contribution periods and automated payout queues. Contribution logs and pool releases are visible to every participant, eliminating treasurer fraud and payment disputes.

### 4. 📈 Tiered KYC & Algorithmic Trust Score Engine
Merchants start at **Tier 0** with just a mobile phone number and gradually unlock higher transfer limits and micro-loans as they upload identity credentials (NIN, BVN, storefront selfie). Every on-time transfer, recorded sale, and Esusu contribution feeds a dynamic **Trust Score (0 to 100)** that serves as an alternative credit rating for microfinance lenders.

---

## 🌟 The KudiNode Tri-Platform Ecosystem

```text
                                  ┌─────────────────────────────────────────┐
                                  │           KUDINODE FINTECH OS           │
                                  └────────────────────┬────────────────────┘
                                                       │
             ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
             │                                         │                                         │
             ▼                                         ▼                                         ▼
┌───────────────────────────┐             ┌───────────────────────────┐             ┌───────────────────────────┐
│    MERCHANT MOBILE APP    │             │   SECURE BACKEND ENGINE   │             │   ADMIN OPERATIONS HUB    │
│   (React Native / Expo)   │             │   (Node.js 20 / Express)  │             │   (React + Vite / Tailwind)│
├───────────────────────────┤             ├───────────────────────────┤             ├───────────────────────────┤
│ • Multilingual Voice Pay  │             │ • In-Memory File Buffer   │             │ • 5-Tier RBAC Access Ctrl │
│ • AI Paper Receipt Scan   │ ──REST /──► │ • Groq Multilingual NLU   │ ◄──REST───► │ • KYC Verification Queue  │
│ • Real-time Sales Intake  │   Multipart │ • OpenRouter Vision OCR   │             │ • Credit Underwriting Engine│
│ • Digital Esusu Circles   │             │ • Zod Strict Validation   │             │ • Cooperative Oversight   │
│ • Trust Score & Loan Hub  │             │ • Helmet & Rate Limiter   │             │ • Immutable Audit Logs    │
└───────────────────────────┘             └─────────────┬─────────────┘             └───────────────────────────┘
                                                        │
                                                        ▼
                                          ┌───────────────────────────┐
                                          │  SUPABASE POSTGRES + RLS  │
                                          ├───────────────────────────┤
                                          │ • Profiles & Trust Scores │
                                          │ • KYC Document Metadata   │
                                          │ • Encrypted Storage Vault │
                                          │ • Row-Level Security Rules│
                                          └───────────────────────────┘
```

---

## 🚀 Key Innovation Highlights

### 1. 🎙️ Multilingual Voice-First Banking Pipeline
- **Zero-Typing Bank Transfers:** Merchants speak natural commands in **Nigerian Pidgin, Yoruba, Hausa, Igbo, or English** (e.g., *"Send five thousand naira to Emeka, GTBank, zero-eight-zero-one..."*).
- **Groq Llama & Whisper NLU:** Audio clips recorded via `expo-av` are routed to the Groq acceleration engine, extracting recipient name, target bank, 10-digit NUBAN account number, and amount into validated JSON in milliseconds.
- **Confidence Scoring & Safe PIN Gating:** The app displays parsed values for instant vocal/visual verification before prompting for the encrypted 4-digit security PIN.

### 2. 🧾 Multimodal AI Receipt & Sales Logging
- **Instant Camera Receipt Extraction:** Merchants snap a photo of paper invoices, POS receipts, or handwritten tallies. `OpenRouter` vision models analyze the image and extract merchant name, line items, unit prices, and total amounts in NGN.
- **Vocal Daily Bookkeeping:** At market close, traders simply speak their daily sales aloud (*"Today I sell 3 bag of rice for 45k each, and 2 keg of oil for 30k"*). The AI turns natural spoken tallies into structured ledger credits and debits.
- **Autonomous Financial Statements:** Generates digital cash-flow logs that serve as verified transaction records for micro-lenders.

### 3. 👥 Digital Cooperative (Esusu / Ajo) Savings Architecture
- **Digitized Rotational Savings:** Digitizes traditional Nigerian rotating credit and savings associations (ROSCAs).
- **Automated Payout Queues:** Members form circles, establish periodic contribution schedules (daily/weekly/monthly), and lock in transparent payout slots.
- **Tamper-Proof Ledger:** Real-time visibility into who has paid, who is pending, and who receives the next pooled disbursement, eliminating disputes and treasurer fraud.

### 4. 📈 Progressive KYC & Dynamic Trust Score Engine
- **Graduated Onboarding (Tier 0 → Tier 3):** Allows unbanked merchants to start immediately with phone verification (Tier 0), unlocking higher transfer ceilings and micro-loans as they provide NIN, BVN, proof of address, and store selfies.
- **Algorithmic Trust Score (0 to 100):** Continuously recalculated based on transaction regularity, Esusu repayment discipline, ledger depth, and verified KYC documents.
- **Collateral-Free Micro-Credit:** Trust Scores power an automated credit-readiness gate, allowing compliant traders to apply for working-capital loans directly in the app.

### 5. 🛡️ Institutional Role-Based Admin Operations Hub
- **Enterprise-Grade Governance:** Dedicated web portal providing separate, cryptographically enforced views for **Super Admins**, **Operations Managers**, **Risk Officers**, **Credit Analysts**, and **Compliance Officers**.
- **Document Review Console:** High-resolution modal with document zoom, NIN verification status, approve/reject reasoning, and instant user profile synchronization.
- **Audit Trail Module:** Super Admins have immutable forensic logs tracking every review, tier change, and risk escalation across all 9 modules.

### 6. 🔒 In-Memory Zero-Disk Security & Privacy
- **Zero Disk Retention:** Audio and receipt images uploaded through Multer are processed entirely in server RAM buffers and streamed to AI APIs. No biometric voice data or customer receipt photos remain on server disk.
- **Defense in Depth:** Production Helmet security headers, global 120 req/min rate limiting, Supabase Row-Level Security (RLS), and on-device encrypted key storage via `expo-secure-store`.
- **Service Role Isolation:** The backend strictly shields the `SUPABASE_SERVICE_ROLE_KEY` from public exposure; the mobile client only holds short-lived user JWTs.

### 7. 📶 Low-Bandwidth & USSD Fallback Resilience
- **Offline & Feature Phone Ready:** Integrated USSD fallback service (`ussdFallbackService.ts`) allows basic transfers and balance queries even in remote rural markets with zero internet coverage.
- **Lightweight Payloads:** Optimized mobile payloads and cached local tokens enable snappy app performance on entry-level Android smartphones common in Nigerian open-air markets.

---

## 🌐 Live Demos & Production Deployments

| Component | Live Production Link | Description |
| :--- | :--- | :--- |
| **Admin Operations Portal** | [https://kudinode.vercel.app](https://kudinode.vercel.app/) | Full management dashboard with role-based access control |
| **Backend API Gateway** | [https://kudinode.onrender.com](https://kudinode.onrender.com) | Live Node.js/Express service on Render |
| **API Health Check** | [https://kudinode.onrender.com/health](https://kudinode.onrender.com/health) | Real-time service uptime & timestamp endpoint |
| **Mobile App Video Demo** | [Watch Loom Video (Mobile)](https://www.loom.com/share/e5f4028b610749d28616dadc9db76521) | Step-by-step walkthrough of Voice Transfer & Ledger |
| **Admin Panel Video Demo** | [Watch Loom Video (Admin)](https://www.loom.com/share/66d71a3e8c1449399bd0b1d13ceff61b) | Complete walkthrough of KYC queues & audit trails |

---

### 🔐 Admin Demo Accounts (Role-Based Access Control)

Experience role-tailored governance by logging into the [Admin Dashboard](https://kudinode.vercel.app/) with any of these pre-configured accounts:

> **Universal Password:** `KudiNode@2026!`

| Role | Officer Name | Demo Email | Assigned Modules & Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Super Admin | `demo.superadmin@kudinode.ng` | **Unrestricted Access:** All 9 modules, system settings, staff creation, and global Audit Trails. |
| **Operations Manager** | Peace Okon | `demo.ops@kudinode.ng` | **Daily Ops:** Dashboard, Merchants, Credit oversight, Esusu Co-Ops, Reports, and System Settings. |
| **Risk Officer** | Ahmad Lawal | `demo.risk@kudinode.ng` | **Risk & Fraud:** Real-time transaction monitoring, high-risk flag queues, and exposure reports. |
| **Credit Analyst** | Funke Abikin | `demo.credit@kudinode.ng` | **Underwriting:** Loan application pipeline, credit score evaluation, and disbursement approvals. |
| **Compliance Officer** | Taiwo Balogun | `demo.compliance@kudinode.ng` | **Regulatory AML/KYC:** Merchant verification checks, regulatory reporting, and compliance audit trail. |

---

## 💻 Tech Stack Matrix

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Mobile Client** | **React Native, Expo SDK 54, TypeScript** | High-performance cross-platform mobile companion designed for low-end hardware. |
| **Mobile Navigation** | **React Navigation v6 (Native Stack + Bottom Tabs)** | Gesture-driven screen transitions with state preservation and persistent tabs. |
| **Audio Hardware & Media**| **`expo-av`, `expo-camera`, `expo-file-system`** | Native hardware microphone audio recording, receipt photo capture, and buffer conversion. |
| **Secure Device Storage** | **`expo-secure-store`** | Hardware-backed encrypted storage for authentication tokens and biometric credentials. |
| **Admin Web Console** | **React 18, Vite 5, Tailwind CSS, Recharts, Lucide** | Real-time institutional desktop dashboard with analytics charts and responsive data tables. |
| **Backend API Gateway** | **Node.js 20+, Express 4, ESM Modules, Zod** | Secure REST service handling authentication, validation, and AI orchestration. |
| **AI Text & Voice NLU** | **Groq Llama 3 / Whisper OpenAI-Compatible API** | Ultra-low latency voice transcription, Nigerian dialect NLU, and intent extraction. |
| **AI Computer Vision** | **OpenRouter Multimodal Vision Models** | Automatic receipt OCR, line-item extraction, and total balance recognition in NGN. |
| **Database & Identity** | **Supabase (PostgreSQL 15), GoTrue Auth, Storage** | Managed database with Row Level Security (RLS), auto-triggers, and private document buckets. |
| **API Security** | **Helmet, Express-Rate-Limit, CORS, Multer Memory** | OWASP-compliant security headers, memory-only file processing, and rate limiting. |
| **Cloud Hosting** | **Render (Backend), Vercel (Admin Web), Expo EAS (APK)** | High-availability cloud infrastructure with continuous deployment pipelines. |

---

## 🤖 AI Architecture & Data Pipeline

```text
       [MERCHANT MOBILE APP]
                 │
                 ├── 1. Spoken Transfer Audio (expo-av .m4a)
                 ├── 2. Spoken Sales Voice Log (expo-av .m4a)
                 └── 3. Paper Receipt Photo (expo-camera .jpg)
                 │
                 ▼ (Multipart / Streaming HTTPS)
       [KUDINODE BACKEND API]
                 │
                 ├── Multer in-memory RAM buffer (Zero Disk Write)
                 │
                 ├──► [GROQ LLAMA + WHISPER API]
                 │      ├── Fast speech-to-text with Pidgin/Hausa/Yoruba/Igbo NLU
                 │      └── Structured extraction: { recipient, bank, account, amount, confidence }
                 │
                 └──► [OPENROUTER MULTIMODAL VISION]
                        ├── High-resolution optical character parsing
                        └── Structured ledger entry: { merchant, date, items[], total_ngn }
                 │
                 ▼
       [STRUCTURED JSON RESPONSE]
                 │
                 ├── Verified against Zod Schema
                 ├── Written to Supabase PostgreSQL (RLS Protected)
                 └── Returned to Mobile Client for PIN Confirmation / Instant UI Update
```

---

## 📁 Project Structure & Blueprint

```text
kudinode/
├── src/                               # React Native Mobile Application (Expo SDK 54)
│   ├── screens/                       # 21 Production Screens
│   │   ├── HomeScreen.tsx             # Wallet balance, quick actions, and recent activity
│   │   ├── VoiceTransferScreen.tsx    # Hardware mic listener with live audio visualization
│   │   ├── ManualTransferScreen.tsx   # Direct NUBAN transfer flow with bank selector
│   │   ├── TransferPinScreen.tsx      # Secure 4-digit PIN confirmation keypad
│   │   ├── SalesIntakeScreen.tsx      # Multimodal receipt scanner & voice sales logger
│   │   ├── LedgerScreen.tsx           # Cashbook debits/credits & auto-calculated net profit
│   │   ├── CoopEsusuScreen.tsx        # Rotational savings circle manager & cycle tracker
│   │   ├── CoopCreateScreen.tsx       # New Esusu group wizard with rule definitions
│   │   ├── TrustScoreScreen.tsx       # Interactive trust breakdown & score tier metrics
│   │   ├── ApplyLoanScreen.tsx        # In-app micro-credit application powered by Trust Score
│   │   ├── RegisterKYCScreen.tsx      # Multi-step merchant identity verification wizard
│   │   ├── KYCDocumentsScreen.tsx     # Secure camera capture for NIN, CAC & store photos
│   │   ├── VerificationScreen.tsx     # Live status of uploaded KYC documents
│   │   ├── ProfileScreen.tsx          # Merchant business profile & language preference
│   │   ├── SecuritySettingsScreen.tsx # Biometric lock, PIN reset, and session settings
│   │   └── AllTransactionsScreen.tsx  # Filterable transaction history with receipt downloads
│   ├── components/                    # Reusable UI widgets (Modals, Tabs, Custom Icons)
│   ├── services/                      # API clients (kudiApi, aiApi, tokenStore, ussdFallback)
│   ├── context/                       # LanguageContext (English, Pidgin, Yoruba, Hausa, Igbo)
│   ├── theme/                         # Centralized design tokens (colors, typography, spacing)
│   └── AppNavigator.tsx               # Full navigation hierarchy (Stack + Bottom Tabs)
│
├── server/                            # Node.js 20 Express Backend Engine
│   └── src/
│       ├── controllers/               # Handlers for auth, profile, AI, admin, and uploads
│       ├── routes/                    # authRoutes, profileRoutes, uploadRoutes, adminRoutes, aiRoutes
│       ├── services/                  # aiService.js (Groq speech parsing & OpenRouter vision)
│       ├── middleware/                # JWT auth guards, admin role validators, error handlers
│       ├── schemas/                   # Zod validation schemas for all inbound payloads
│       └── config/                    # Typed environment variables and Supabase admin client
│
├── admin/                             # Institutional Operations Console (React + Vite)
│   └── src/
│       ├── screens/                   # 11 Operations Modules
│       │   ├── DashboardScreen.tsx    # Executive KPIs, transaction volumes, and live alerts
│       │   ├── MerchantsScreen.tsx    # Merchant directory with full KYC review drawer
│       │   ├── CreditScreen.tsx       # Credit underwriting queue & loan portfolio tracker
│       │   ├── CoopScreen.tsx         # Cooperative group oversight & escrow tracking
│       │   ├── RiskScreen.tsx         # Anomaly detection, suspicious volume alerts & freeze tools
│       │   ├── ReportsScreen.tsx      # Regulatory compliance, AML logs, and exportable reports
│       │   ├── AuditLogScreen.tsx     # Forensic trail of every staff action in the system
│       │   ├── AdminUsersScreen.tsx   # Staff provisioning and role assignment console
│       │   └── SettingsScreen.tsx     # Platform fee configuration and system controls
│       ├── components/                # Sidebar, StatCards, StatusBadges, ModalDrawers
│       └── services/                  # Supabase auth & administrative API clients
│
├── supabase/
│   └── schema.sql                     # Complete PostgreSQL DDL (Tables, Enums, RLS & Triggers)
└── assets/                            # App icons, splash screens, and localized imagery
```

---

## ⚡ Quickstart: Running the Platform Locally

Follow these steps to run the entire KudiNode ecosystem on your local machine.

### Prerequisites
- **Node.js 20+** installed on your system
- **npm 9+** or **yarn**
- **Git**
- **Expo Go** app installed on your physical Android or iOS device
- A free **Supabase** project ([supabase.com](https://supabase.com))
- A free **Groq** API key ([groq.com](https://groq.com))
- A free **OpenRouter** API key ([openrouter.ai](https://openrouter.ai))

---

### Step 1: Clone Repository & Database Setup

```bash
# Clone the repository
git clone https://github.com/your-org/kudinode.git
cd kudinode
```

1. Log into your **Supabase Dashboard** and navigate to the **SQL Editor**.
2. Open [`supabase/schema.sql`](file:///c:/Users/acer/Desktop/KUDINODE/supabase/schema.sql) in this repository.
3. Paste the contents into the SQL Editor and click **Run**.
4. This script sets up all tables (`profiles`, `kyc_documents`, `admin_actions`, etc.), Row Level Security policies, storage buckets (`kyc-documents`, `ledger-images`), and user signup triggers.

---

### Step 2: Start the Backend Gateway

Open a terminal window and start the Express server on **Port 4000**:

```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Configure your `.env` file with your credentials:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:19006,exp://127.0.0.1:19000,https://kudinode.vercel.app

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

KYC_BUCKET=kyc-documents
LEDGER_BUCKET=ledger-images

GROQ_API_BASE=https://api.groq.com/openai/v1
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b

OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_VISION_MODEL=minimax/minimax-m3:free
```

Seed the default admin team accounts:
```bash
npm run seed:admins
```

Start the server in watch mode:
```bash
npm run dev
```

Verify that the backend is live:
```bash
curl http://localhost:4000/health
# Expected: {"status":"ok","ts":...}
```

---

### Step 3: Start the Institutional Admin Dashboard

Open a second terminal window to start the React + Vite admin web app on **Port 5173**:

```bash
# Navigate to admin directory
cd admin

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser to `http://localhost:5173` and log in with any of the demo accounts listed above (e.g. `demo.superadmin@kudinode.ng` / `KudiNode@2026!`).

---

### Step 4: Launch the Merchant Mobile App (Expo SDK 54)

Open a third terminal window at the root of the project:

```bash
# In the project root directory
npm install

# Start the Expo development server with cache cleared
npx expo start -c
```

#### How to Preview the Mobile App:
- **On Physical Phone (Recommended):** Scan the terminal QR code using **Expo Go** (Android) or the native Camera app (iOS).
- **Pointing to Local Backend:** If testing with your local backend instead of the cloud deployment, set `EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:4000` in a `.env` file in the root directory.

---

## 🎬 Hackathon Demo Walkthrough (For Judges)

### Scenario A: Voice Transfer in Nigerian Pidgin
1. Open the **KudiNode Mobile App** on your phone.
2. From the Home screen, tap the prominent green **"Voice Transfer"** action button.
3. Hold the microphone button and speak naturally:  
   *"Send two thousand five hundred naira to Chidi, Access Bank, zero-seven-zero-three-two-one..."*
4. Watch the Groq AI engine transcribe your speech in real time, extract the recipient, bank name, account number, and amount, and display the populated confirmation card.
5. Tap **"Confirm & Continue"** and enter your PIN `1234` on the secure numeric pad to simulate the instant transfer.

### Scenario B: AI Paper Receipt Scanning & Instant Bookkeeping
1. From the bottom navigation bar, tap the **"Ledger"** tab.
2. Tap **"Scan Receipt"** to open the in-app camera.
3. Snap a photo of any receipt, supermarket invoice, or handwritten bill.
4. Watch OpenRouter vision automatically isolate items, compute the total in Naira, and log the transaction into your digital cashbook.
5. Observe the Net Daily Balance update instantly at the top of your ledger.

### Scenario C: Voice Sales Logging
1. In the **Sales Intake** screen, tap **"Voice Sales Log"**.
2. Speak your sales for the day: *"I sell two carton of indomie for ten thousand naira and five bread for four thousand naira."*
3. The AI parses both line items, computes the ₦14,000 subtotal, and creates permanent ledger entries with zero manual writing.

### Scenario D: Digital Cooperative (Esusu) Cycle
1. Navigate to the **"Co-Op"** tab.
2. View your active circles (e.g., *"Balogun Market Traders Association"*).
3. Observe the circular contribution schedule, payout order queue, and cycle maturity dates.
4. Tap **"Make Daily Contribution"** to simulate an automated locked savings deduction.

### Scenario E: Tiered KYC Verification & Admin Underwriting
1. Go to **Profile** → **"Verification & KYC Tier"**.
2. Review the four tiers (Tier 0 to Tier 3) and see the requirements to increase daily transfer limits.
3. Upload a sample document (ID card or business storefront).
4. Switch to the **Admin Dashboard** (`http://localhost:5173`), navigate to **Merchants**, click on the newly submitted merchant, inspect the document in the high-res viewer, and click **"Approve Tier Upgrade"**.
5. Return to the mobile app to see the merchant's trust score and transaction limits increase instantly.

---

## 🏆 Hackathon Judging Criteria Alignment

| Criteria | How KudiNode AI Excels |
| :--- | :--- |
| **Real-World Impact** | Bridges the financial exclusion gap for 40M+ informal merchants by eliminating the literacy barrier through spoken-language banking in Pidgin, Hausa, Yoruba, and Igbo. |
| **Technical Depth & AI Innovation** | Real multimodal dual-AI pipeline: Groq Llama + Whisper for ultra-fast low-resource dialect NLU combined with OpenRouter multimodal vision for automated receipt extraction. |
| **Execution & Inclusivity** | Mobile UX purposefully crafted with large touch targets, high-contrast visual status badges, audio playback confirmations, and low-end device optimization. |
| **Security & Architecture** | Defense-in-depth architecture: In-memory RAM buffer streaming (zero disk storage of customer biometrics), Row-Level Security on PostgreSQL, and 5-tier role-based administrative control with forensic audit trails. |
| **Business Viability & Scalability** | Sustainable B2B2C business model: ₦25 to ₦50 micro-fee on voice transfers, 1.2% processing fee on digital cooperative escrow disbursements, and credit analytics API fees from microfinance banks. |

---

## 🔮 Roadmap & Future Horizons

- [x] **Phase 1: Voice Transfer & Multilingual NLU** (Complete: Pidgin, Yoruba, Hausa, Igbo)
- [x] **Phase 2: Multimodal Receipt Scanning & Smart Ledger** (Complete: OpenRouter Vision)
- [x] **Phase 3: Digital Cooperative (Esusu) Management** (Complete: Rotational Circles & Payouts)
- [x] **Phase 4: Progressive KYC & Institutional Admin Console** (Complete: 5 RBAC Roles & Audit Trail)
- [ ] **Phase 5: Direct NIBSS / NIP Instant Settlement:** Live inter-bank instant settlement rails via direct integration with Nigerian payment switches.
- [ ] **Phase 6: Audio USSD & Interactive Voice Response (IVR):** Extending voice banking to basic 2G feature phones using Africa's Talking voice API for completely offline transactions.
- [ ] **Phase 7: Embedded Micro-Inventory & Supplier Financing:** Enabling merchants to order inventory from FMCG distributors directly with one-click credit lines backed by their KudiNode Trust Score.

---

## 👥 Team Alafia & Acknowledgements

Proudly developed for **Hackaholics 7.0** by **Team Alafia**:

- 🌟 **ABDULMUHAIMIN SIYAKA (TEAM LEAD)** 08144733943
- 💡 **FAUSIAT SIYAKA** 07061101500
- ⚙️ **FAHD BADAMASI** 07049963476
- 🎨 **YAHAYA ABUBAKAR ADEBAYO** 08077048651

*Special thanks to the Wema Bank Hackaholics organizers, the Groq team for ultra-fast Llama inference, OpenRouter, and the Supabase community for powering our mission to empower African street merchants.*

---

<p align="center">
  <b>⚡ KudiNode AI: Bringing Spoken Trust & Modern Finance to Every African Merchant ⚡</b>
</p>

# KudiNode AI

> **Hackaholics 7.0 — Team Alafia**  
> Empowering Nigerian informal-sector merchants with AI-driven financial tools voice transfers, smart ledger capture, cooperative savings, and a tiered trust system built to work for everyone, even in low-literacy environments.

---

## Team Members

- **ABDULMUHAIMIN SIYAKA(TEAM LEAD)** 08144733943
- **FAUSIAT SIYAKA** 07061101500
- **FAHD Badamasi** 07049963476
- **YAHAYA ABUBAKAR ADEBAYO** 08077048651

---

##  Live Demo
- **Admin Dashboard:** https://kudinode-admin.vercel.app/
- **Admin login details** : email=fahdbadamasi320@gmail.com  password=*FahdBad2026#
- **Backend API:** https://kudinode.onrender.com
- **Recorded Demo:**: MOBILE DEMO =https://www.loom.com/share/3f71d6329cd0439d93a882309708cf81
                      Admin panel demo: https://www.loom.com/share/58414d7194d6490f9c4b98680d899192

---

##  The Problem

> **How might we help Nigerian informal-sector merchants traders, artisans, and cooperative members manage their finances, access credit, and make transfers when they face barriers of low digital literacy, language diversity, and limited banking infrastructure?**

Millions of Nigerian small-business owners operate entirely outside the formal financial system. They keep accounts in paper ledgers, describe transactions verbally in Yoruba, Hausa, Igbo, or Pidgin, and belong to informal cooperative savings groups (Esusu) that run without any digital trail. Without a verifiable financial history, they cannot access credit, and without credit, they cannot grow.

At the same time, transferring money still requires navigating complex bank apps in a language many users are not comfortable with a process that is slow, error-prone, and exclusionary.

---

##  Our Solution

**KudiNode AI** is a full-stack mobile-first fintech platform purpose-built for Nigerian informal merchants. It combines a React Native (Expo) mobile app, a Node.js secure backend, a Supabase PostgreSQL database, Groq for text and audio AI, and Gemini for receipt images to deliver three transformational capabilities:

1. **Voice-First Banking**: Users speak a transfer command in *any* Nigerian language or Pidgin (e.g., *"Send five thousand naira to Emeka, GTBank, zero-eight-zero-one..."*). Groq powers the speech parsing pipeline and converts the command into structured transfer fields recipient name, bank, account number, and amount before routing to a PIN confirmation screen. No typing required.

2. **AI Receipt & Sales Logging**: Merchants point their phone camera at a paper receipt or speak their daily sales aloud. Groq handles the voice sales log flow, while Gemini handles receipt image extraction, turning itemized transaction data (merchant name, items, quantities, unit prices, totals in NGN) into ledger entries.

3. **Cooperative (Esusu) Management**: Members can create and join Esusu savings circles digitally. Contribution schedules, payout queues, and balances are tracked in real time, giving cooperative groups the digital infrastructure they have always lacked.

Underpinning everything is a **KYC Tier System** (Tier 0 → Tier 3) and a **Trust Score** that grow as merchants upload identity documents (NIN, BVN, driver's licence, passport, selfie), enabling progressive access to credit and higher transaction limits through a dedicated Admin Dashboard used by KudiNode staff.

---

##  Tech Stack

### Mobile App
- **Framework:** React Native with Expo SDK 54 (TypeScript)
- **Navigation:** React Navigation v6 — Native Stack + Bottom Tabs
- **UI / Styling:** Vanilla StyleSheet API with a centralized design-token theme (`colors`, `spacing`, `radius`, `typography`, `shadows`)
- **Animations:** React Native Animated API (micro-pulse, wave rings, fade transitions)
- **Audio Recording:** `expo-av` (Audio API) — records `.m4a` voice clips for transfer parsing
- **Camera:** `expo-camera` — live camera view for receipt scanning
- **File Handling:** `expo-file-system` — local URI → binary buffer conversion before upload
- **Secure Storage:** `expo-secure-store` — encrypted JWT token persistence across sessions
- **Gradients:** `expo-linear-gradient`
- **Gestures:** `react-native-gesture-handler`, `react-native-reanimated`

### Backend
- **Runtime:** Node.js 20+ (ESM modules)
- **Framework:** Express 4 with Helmet (security headers), CORS, Morgan (HTTP logging), `express-rate-limit`
- **Validation:** Zod schema validation on all incoming request bodies
- **File Uploads:** Multer (in-memory) — audio buffers go to Groq-backed parsing and image buffers go to Gemini, never written to disk
- **API Routes:** `/api/auth`, `/api/profile`, `/api/uploads`, `/api/admin`, `/api/ai`

### Database
- **Supabase (PostgreSQL)** — managed, hosted database:
  - `profiles` — 1:1 with `auth.users`; stores KYC tier, trust score, trade name, Wema account, region, language preference
  - `kyc_documents` — file metadata for uploaded identity and business documents
  - `admin_actions` — full audit trail of every KYC approval, rejection, and suspension
  - Row Level Security (RLS) on all tables; users can only access their own data
  - PostgreSQL trigger auto-creates a `profiles` row on every new Supabase Auth signup
- **Supabase Storage** — two private buckets: `kyc-documents` and `ledger-images`, with per-user folder RLS

### AI / APIs
- **Groq Llama models** via the Groq OpenAI-compatible API:
  - Voice transfer parsing (audio → multilingual transcript → structured JSON)
  - Voice sales logging (audio → structured ledger entries)
  - Supports English, Pidgin, Yoruba, Hausa, Igbo, and mixed code-switching
  - Optional faster-whisper sidecar for offline-capable transcription, with Groq as the primary AI provider for text and audio
- **Gemini 2.0 Flash** via Google AI Studio REST API:
  - Receipt extraction (image → itemized NGN ledger entry)

### Admin Dashboard
- **Framework:** React + Vite (TypeScript)
- **Screens:** Dashboard, Merchants (KYC review queue), Credit management, Cooperative oversight, Reports, Risk, Settings
- **Auth:** Supabase Auth — admin and super-admin roles enforced at both UI and RLS level

### Deployment
- **Backend:** Render (Node.js web service)
- **Admin Dashboard:** Vercel / Netlify (static Vite build)
- **Database & Auth:** Supabase (cloud-hosted PostgreSQL + GoTrue Auth)
- **Mobile App:** Expo Go (development) / Expo EAS Build (production APK/IPA)

---

##  How to Set Up and Run Locally

### Prerequisites

- Node.js 20+
- npm 9+
- Expo Go app installed on a physical Android or iOS device
- A Supabase project
- A Groq API key
- A Google AI Studio Gemini API key for receipt images

---

### 1. Clone the Repository

```bash
git clone [your-repo-link]
cd kudinode
```

---

### 2. Apply the Database Schema

Open your Supabase project → **SQL Editor** and run the full contents of `supabase/schema.sql`.

This creates all tables, enums, RLS policies, storage buckets, and PostgreSQL triggers.

---

### 3. Set Up the Backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:19006,exp://127.0.0.1:19000,https://kudinode.vercel.app/

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

KYC_BUCKET=kyc-documents
LEDGER_BUCKET=ledger-images

GROQ_API_BASE=https://api.groq.com/openai/v1
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

Receipt image extraction still uses Gemini, while voice transfer and voice sales logging use Groq.

Run the dev server:

```bash
npm run dev
```

Verify it is running:

```bash
curl https://kudinode.onrender.com/health
# Expected: {"status":"ok","ts":...}
```

---

### 4. Set Up the Mobile App

From the project root:

```bash
npm install
```

The app is pre-configured to use the production backend at `https://kudinode.onrender.com`.
No manual IP configuration is needed for the production build.

**Option A — Install the development build (recommended)**

Download and install the pre-built development APK from EAS:

Or scan the QR code on that page to install directly on your Android device.

**Option B — Run with Expo Go (local dev only)**

If you want to point at a local backend instead, set `EXPO_PUBLIC_API_URL` in a `.env` file at the project root:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
```

Then start the Expo dev server:

```bash
npx expo start -c
```

Scan the QR code with **Expo Go** on your device.

---

### 5. Set Up the Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

Dashboard available at `https://kudinode.vercel.app/`.

---

##  Key Features

| Feature | Description |
|---|---|
| **Voice Transfer** | Speak a bank transfer in any Nigerian language; Groq parses it to structured fields with confidence score |
| **AI Receipt Scan** | Camera captures a paper receipt; Gemini returns itemized NGN ledger entry |
| **Voice Sales Log** | Speak daily sales aloud; Groq converts it to ledger entries in real time |
| **Esusu / Cooperative** | Create or join digital savings circles with contribution tracking and payout queues |
| **KYC Tier System** | Progressive verification (Tier 0–3) — each tier unlocks higher limits and new features |
| **Trust Score** | Numerical reputation score built from verified activity; gates credit access |
| **Loan Application** | In-app credit application backed by Trust Score and KYC tier |
| **Admin Dashboard** | Full merchant management — approve/reject KYC, audit trail, credit management, risk monitoring |
| **Multilingual UI** | Language context system supporting English, Yoruba, Hausa, Igbo, and Pidgin |
| **Secure Auth** | Supabase Auth (JWT) + `expo-secure-store` for encrypted, persistent sessions |
| **USSD Fallback Module** | Scaffolded service to extend KudiNode to feature phones via USSD when internet is unavailable |

---

##  Project Structure

```
kudinode/
├── src/                        # React Native mobile app (Expo SDK 54)
│   ├── screens/                # 21 screens (Onboarding, Home, VoiceTransfer, Ledger, Coop, KYC…)
│   ├── components/             # Shared UI (Icon, BottomTabBar, AiAdvisorModal…)
│   ├── services/               # API clients (kudiApi, aiApi, tokenStore, USSD fallback)
│   ├── context/                # LanguageContext (multilingual i18n)
│   ├── theme/                  # Design tokens (colors, spacing, typography, shadows, radius)
│   └── AppNavigator.tsx        # Full navigation tree (Native Stack + Bottom Tabs)
├── server/                     # Node.js Express backend
│   └── src/
│       ├── routes/             # authRoutes, profileRoutes, uploadRoutes, adminRoutes, aiRoutes
│       ├── controllers/        # Request handlers for each domain
│       ├── services/           # aiService.js — Groq voice parsing & Gemini receipt extraction
│       ├── middleware/         # errorHandler, auth guards
│       ├── schemas/            # Zod validation schemas
│       ├── utils/              # AppError, helpers
│       └── config/             # env.js — typed, validated environment loader
├── admin/                      # React + Vite admin dashboard
│   └── src/
│       ├── screens/            # Dashboard, Merchants, Credit, Coop, Reports, Risk, Settings
│       └── components/         # Sidebar, shared admin UI components
├── supabase/
│   └── schema.sql              # Full PostgreSQL schema (tables, enums, RLS, triggers, storage)
└── assets/                     # App icons and splash screen images
```

---

## 🤖 AI Architecture

```
Mobile App
    │
    ▼
[Voice / Image captured]
  expo-av (audio .m4a)  |  expo-camera (photo)
    │
    ▼ multipart/form-data upload
Node.js Backend (Express)
    │
    ├── [faster-whisper sidecar] ─── if configured: speech-to-text first
    │           │
    │           └── transcript text ──────────────────────────────┐
    │                                                             │
    ├── [Groq Llama + Groq Whisper] ─ audio STT + NLU for voice flows │
    │                                                             │
    └── [Gemini 2.0 Flash] ─── receipt image extraction            │
                │                                                 │
                └──────────────── structured JSON response ◄──────┘
                                  (transfer fields / receipt items)
                                        │
                                        ▼
                               Returned to mobile app
                         → Pre-fills transfer form or ledger entry
```

---

##  Security Highlights

- **Helmet** — sets production-grade HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting** — global 120 req/min cap via `express-rate-limit`; tighter limits on auth endpoints
- **Supabase RLS** — Row Level Security on all tables; users are strictly scoped to their own records
- **Service Role isolation** — the `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS) lives on the server only; never shipped to the mobile client
- **JWT Auth** — tokens issued by Supabase Auth, stored encrypted on-device via `expo-secure-store`
- **In-memory file processing** — Multer holds uploaded files in RAM and streams them to Groq-backed audio parsing or Gemini image extraction; nothing is ever written to the server's disk

**Admin login details** : email=fahdbadamasi320@gmail.com  password=*FahdBad2026#
---

*Built by Team Alafia — Hackaholics 7.0*

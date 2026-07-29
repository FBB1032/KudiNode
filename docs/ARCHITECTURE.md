# KudiNode — Auth, KYC & Admin Approval Architecture

This document explains how the three moving parts of the KudiNode account system
fit together:

1. **Mobile app** — React Native (Expo) merchant client
2. **Backend** — Node.js/Express secure middleware layer
3. **Supabase** — Postgres database, Auth, and private Storage
4. **Admin dashboard** — Vite + React web console for KYC review

```
┌──────────────────┐     HTTPS/JWT      ┌───────────────────┐   service-role   ┌──────────────┐
│  Expo Mobile App │  ───────────────►  │  Node.js Backend  │  ─────────────►  │   Supabase   │
│  (merchant)      │  ◄───────────────  │  (Express API)    │  ◄─────────────  │  DB/Auth/Storage │
└──────────────────┘   session token    └───────────────────┘   admin client   └──────────────┘
         ▲                                        ▲
         │                                        │
         │            HTTPS/JWT                    │
┌──────────────────┐  ───────────────►  ──────────┘
│  Admin Dashboard │  ◄───────────────
│  (web console)   │   session token
└──────────────────┘
```

The mobile app and admin dashboard **never** talk to Supabase directly. All
traffic flows through the Node backend, which is the only component holding the
Supabase **service-role key**. Clients only ever hold a short-lived user session
(access) token.

---

## 1. Supabase schema (`supabase/schema.sql`)

### Tables

- **`profiles`** — 1:1 with `auth.users` (PK `id` references `auth.users.id`).
  Holds all merchant profile data captured during signup/KYC:
  - Personal: `full_name`, `phone`, `email`, `preferred_language`
  - Regulatory: `bvn`, `nin`
  - Trade: `trade_name`, `market_cluster`, `commodity_type`, `esusu_coop_name`, `region`
  - Settlement: `wema_account_number`, `wema_account_name`
  - Workflow: `role` (`merchant`/`admin`/`super_admin`), `kyc_tier`,
    **`approval_status`** (`pending`/`approved`/`rejected`/`suspended`),
    `rejection_reason`, `liveness_score`, `trust_score`
- **`documents`** — N:1 with `profiles` (FK `user_id`). One row per uploaded
  artifact: `doc_type` (`id_nin`, `id_passport`, `selfie`, `ledger`, …),
  `storage_path`, `file_name`, `mime_type`, `created_at`.

### Trigger

`handle_new_user()` fires `AFTER INSERT ON auth.users` and auto-creates the
matching `profiles` row with `approval_status = 'pending'` and
`role = 'merchant'`, copying `full_name`/`phone` from the signup metadata.

### Storage

A **private** bucket `kyc-documents` stores all ID/selfie/ledger images. Objects
are namespaced per user: `{user_id}/{doc_type}-{timestamp}.jpg`. Because the
bucket is private, the admin dashboard views documents through **signed URLs**
minted on demand by the backend.

### Row Level Security

RLS is enabled on both tables. Merchants can only `select`/`update` their own
`profiles` row and `select`/`insert` their own `documents`. All privileged
operations (listing every merchant, approving, minting signed URLs) run through
the backend using the service-role key, which bypasses RLS by design.

---

## 2. Node.js backend (`server/`)

Clean, modular layout:

```
server/src/
  config/       env loading + Supabase clients (admin + per-request)
  middleware/   auth (JWT verify), validate (zod), errorHandler
  schemas/      zod request validators
  controllers/  authController, profileController, uploadController, adminController
  routes/       authRoutes, profileRoutes, uploadRoutes, adminRoutes
  utils/        AppError, asyncHandler
  app.js        express app (helmet, cors, rate-limit, routes)
  index.js      server bootstrap
```

### Key endpoints

| Method & Path                       | Auth   | Purpose                                                                                                                                                                           |
| ----------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/signup`             | public | Create Supabase auth user (trigger seeds pending profile). Returns a session so the still-pending user can complete KYC.                                                          |
| `POST /api/auth/login`              | public | **Approval gate.** Exchanges credentials for a session, then checks `approval_status`. Non-approved merchants are denied (403) and their session revoked. Admins bypass the gate. |
| `POST /api/auth/logout`             | user   | Revoke current session token.                                                                                                                                                     |
| `GET  /api/profile`                 | user   | Fetch own profile + documents.                                                                                                                                                    |
| `PUT  /api/profile`                 | user   | Update own profile (KYC fields).                                                                                                                                                  |
| `POST /api/profile/submit`          | user   | Mark KYC as submitted for review.                                                                                                                                                 |
| `POST /api/uploads`                 | user   | Multipart upload → proxies file into private Storage, records `documents` row.                                                                                                    |
| `GET  /api/admin/stats`             | admin  | Counts by approval status.                                                                                                                                                        |
| `GET  /api/admin/users`             | admin  | Paginated/filterable merchant list.                                                                                                                                               |
| `GET  /api/admin/users/:id`         | admin  | Full dossier: profile + documents with **signed URLs**.                                                                                                                           |
| `POST /api/admin/users/:id/approve` | admin  | Set `approval_status = 'approved'`.                                                                                                                                               |
| `POST /api/admin/users/:id/reject`  | admin  | Set `rejected` + `rejection_reason`.                                                                                                                                              |
| `POST /api/admin/users/:id/suspend` | admin  | Set `suspended`.                                                                                                                                                                  |

### Security practices

- **JWT validation** — `middleware/auth.js` verifies the Bearer token with
  Supabase and loads the caller's profile/role; `requireAdmin` guards admin routes.
- **Service-role isolation** — only the backend holds the service key
  (`config/supabase.js`), never shipped to clients.
- **Input validation** — every write endpoint validates the body with zod
  (`schemas/`) via the `validate` middleware.
- **Hardening** — `helmet`, CORS allowlist, and rate limiting in `app.js`.
- **Uniform errors** — `AppError` + `errorHandler` return `{ error: { message } }`
  and never leak stack traces.

---

## 3. Mobile app (`src/`)

### Service layer

- **`services/config.ts`** — API base URL.
- **`services/tokenStore.ts`** — persists the session token in
  `expo-secure-store`.
- **`services/apiClient.ts`** — thin fetch wrapper that attaches the Bearer
  token, handles JSON + multipart, and normalizes errors.
- **`services/kudiApi.ts`** — typed domain functions: `signup`, `login`,
  `logout`, `getProfile`, `updateProfile`, `submitForReview`, `uploadDocument`.
- **`context/AuthContext.tsx`** — exposes `user`, `signIn`, `register`,
  `signOut`, and bootstraps the session on launch.

### Screens

- **`RegisterKYCScreen`** — 3-step wizard:
  1. **Personal** — creates the account (`register`) then saves name/phone/BVN/NIN.
  2. **Trade** — saves market cluster, commodity, Esusu, Wema settlement account.
  3. **Documents** — uses **`expo-camera`** (`CameraView.takePictureAsync`) to
     capture the ID document, live selfie, and optional ledger, uploading each
     via `uploadDocument`. Finally calls `submitForReview`.
     On completion the merchant is **pending** and routed back to Login (not into
     the app).
- **`LoginScreen`** — email/password. On success `signIn` is called; the backend
  only returns a session if the merchant is **approved**, otherwise the screen
  shows the returned reason (pending/rejected/suspended).

---

## 4. Admin dashboard (`admin/`)

- **`services/api.ts`** — fetch client with `adminLogin`, `listUsers`,
  `getDossier`, `approveUser`, `rejectUser`, `suspendUser`, and token storage in
  `localStorage`. `adminLogin` rejects non-admin accounts.
- **`screens/AdminLoginScreen`** — email/password sign-in against the same
  `/auth/login` endpoint; only `admin`/`super_admin` roles are accepted.
- **`screens/MerchantsScreen`** — the approval workflow:
  - Loads merchants from `/admin/users` (filterable by status).
  - "Inspect Full KYC" opens `getDossier`, rendering the merchant's data and the
    **actual uploaded selfie/ID images** via signed URLs.
  - "Accept" → `approveUser`; "Reject" (with reason) → `rejectUser`. These flip
    `approval_status`, which is exactly what the login gate enforces.
- **`App.tsx`** — restores the session from the stored token and clears it on logout.

---

## End-to-end flow

1. **Signup** — merchant fills step 1 → `POST /auth/signup` creates the auth
   user; the DB trigger creates a `pending` profile. The app receives a session
   token so it can keep saving KYC data.
2. **KYC capture** — steps 2–3 call `PUT /profile` and `POST /uploads`; images
   land in the private `kyc-documents` bucket and `documents` rows link them to
   the user. `POST /profile/submit` marks it ready for review.
3. **Login attempt (pending)** — merchant tries to sign in → backend authenticates
   but sees `approval_status = 'pending'` → **403** with a clear message; no
   session is returned.
4. **Admin review** — admin signs into the dashboard, opens the dossier (signed
   URLs render the real photos), and clicks **Approve** or **Reject**.
5. **Login (approved)** — merchant signs in again → backend returns a valid
   session → app grants access to the Merchant Hub.

Everything is persisted and linked: `auth.users` ↔ `profiles` (via `id`) ↔
`documents` (via `user_id`) ↔ Storage objects (via `storage_path`), keeping
Supabase Auth and the custom profile tables consistent.

---

## Running locally

```bash
# 1. Create the schema + bucket in Supabase (SQL editor)
#    → paste supabase/schema.sql

# 2. Backend
cd server
cp .env.example .env         # fill SUPABASE_URL, keys, etc.
npm install
node scripts/createAdmin.js  # seed the first admin account
npm run dev                  # http://localhost:4000

# 3. Mobile app (repo root)
npm install
npx expo start               # set EXPO_PUBLIC_API_URL to your machine's LAN IP

# 4. Admin dashboard
cd admin
npm install
npm run dev                  # set VITE_API_URL to the backend URL
```

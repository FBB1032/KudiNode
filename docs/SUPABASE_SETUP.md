# Supabase Setup — Make KudiNode Fully Functional

Follow these steps on the Supabase website to wire the database, auth, and
storage that the backend, mobile app, and admin dashboard depend on.

---

## 1. Create the project

1. Go to https://supabase.com and sign in (or create an account).
2. Click **New project**.
3. Pick an organization, name it `kudinode`, choose a **strong database
   password** (save it), and select the region closest to your users
   (e.g. `West EU (London)` or the nearest available to Nigeria).
4. Wait ~2 minutes for provisioning to finish.

## 2. Grab your API keys

1. In the project, open **Settings → API** (or **Project Settings → API keys**).
2. Copy these three values — you'll paste them into the backend `.env`:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret; never ship
     to the mobile app or dashboard)

## 3. Run the database schema

1. Open **SQL Editor → New query**.
2. Copy the entire contents of `supabase/schema.sql` from this repo and paste it in.
3. Click **Run**. This creates:
   - the `profiles`, `kyc_documents`, and `admin_actions` tables
   - the enums (`approval_status`, `kyc_tier`, `document_type`, `user_role`)
   - the `handle_new_user` trigger (auto-creates a `pending` profile on signup)
   - Row Level Security policies
   - the private storage buckets `kyc-documents` and `ledger-images`
4. Confirm success under **Table Editor** — you should see the three tables.

## 4. Configure Auth

Merchants **register** with a real email + password (their Supabase Auth
credentials) plus a phone number. They then **sign in** with their phone number
and a 4-digit PIN: the backend looks up the account by phone and mints a
Supabase session server-side (via the admin API), so no password is re-entered
on the phone. Admins sign in with their real email + password. So:

1. Open **Authentication → Providers → Email** and make sure **Email** is
   enabled.
2. Open **Authentication → Sign In / Providers** (or **Settings**) and, for the
   sandbox, turn **Confirm email** OFF. The backend creates users with
   `email_confirm: true` already, but disabling confirmation avoids friction.
3. Leave phone/OTP provider **off** — we do not use Supabase's SMS OTP; the PIN
   is a lightweight app-level factor and the phone is the sign-in identifier.

## 5. Verify the storage buckets

1. Open **Storage**. You should see `kyc-documents` and `ledger-images` (created
   by the schema).
2. Confirm both are **Private** (not public). The backend serves images to the
   admin via short-lived signed URLs.

## 6. Configure the backend `.env`

In `server/`, copy `.env.example` to `.env` and fill in:

```
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173

SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

KYC_BUCKET=kyc-documents
LEDGER_BUCKET=ledger-images
```

Then install and start:

```bash
cd server
npm install
npm run dev        # http://localhost:4000
```

## 7. Seed the two admin accounts

With the backend `.env` in place, run:

```bash
cd server
npm run seed:admins
```

This creates (or updates) the two dashboard admins in Supabase Auth and marks
their profiles as `role=admin`, `approval_status=approved`:

| Email                     | Password        |
| ------------------------- | --------------- |
| fahdbadamasi320@gmail.com | `*FahdBad2026#` |
| yahabubakar2504@gmail.com | `*AbuYah2026#`  |

You can verify them under **Authentication → Users** in the Supabase dashboard.

## 8. Run the admin dashboard

```bash
cd admin
npm install
# optional: create admin/.env with VITE_API_URL=http://localhost:4000
npm run dev        # http://localhost:5173
```

Sign in with either admin email/password above.

## 9. Run the mobile app

```bash
# repo root
npm install
# point the app at your machine's LAN IP so a physical device can reach it:
#   set EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
npx expo start
```

## 10. End-to-end smoke test

1. **Mobile — Register:** open the app → _Create Tier-1 Account_. Enter an
   email + password and a phone number, fill personal + trade details, and
   capture the ID document and selfie with the camera. Submit.
2. **Mobile — Login blocked:** try to sign in with that phone + any 4-digit PIN.
   You should

   be denied with _"pending admin approval"_.

3. **Admin — Review:** open the dashboard → **Merchants**. The new merchant
   appears as _Pending_. Click **Inspect Full KYC** to see the uploaded selfie
   and ID (served via signed URLs), then click **Accept & Verify Tier-1 KYC**.
4. **Mobile — Login works:** sign in again with the same phone + PIN. You now
   reach the Merchant Hub.

That confirms the full loop: Supabase Auth ↔ `profiles` (via `id`) ↔
`kyc_documents` (via `user_id`) ↔ private Storage, gated by the admin approval
workflow.

---

### Production hardening (later)

- Turn **Confirm email** back on only if you switch merchants to real emails.
- Store `bvn`/`nin` hashed or in a restricted column, not plaintext.
- Rotate the service-role key and keep it only on the backend host.
- Add a custom SMTP provider under **Authentication → Emails** if you send real
  notifications.

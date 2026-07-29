-- ============================================================================
-- KudiNode AI — Supabase Schema
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- It provisions:
--   * enums for approval / KYC / document types
--   * profiles table (1:1 with auth.users)
--   * kyc_documents table (uploaded files metadata)
--   * admin_actions audit log
--   * Row Level Security (RLS) policies
--   * a trigger that auto-creates a profile row on auth signup
--   * private storage buckets for kyc docs & ledgers
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type approval_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type kyc_tier as enum ('tier_0', 'tier_1', 'tier_2', 'tier_3');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_type as enum (
    'id_nin', 'id_driver_license', 'id_passport', 'id_voter_card',
    'selfie', 'ledger', 'proof_of_business'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('merchant', 'admin', 'super_admin');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 2. profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  role                user_role       not null default 'merchant',
  -- Personal details
  full_name           text,
  phone               text unique,
  email               text,
  preferred_language  text            default 'English',
  -- Regulatory identity (store hashed/masked in prod; kept plain here for sandbox)
  bvn                 text,
  nin                 text,
  -- Trade / settlement details
  trade_name          text,
  market_cluster      text,
  commodity_type      text,
  esusu_coop_name     text,
  wema_account_number text,
  wema_account_name   text,
  region              text,
  -- Verification / status
  kyc_tier            kyc_tier        not null default 'tier_0',
  approval_status     approval_status not null default 'pending',
  rejection_reason    text,
  liveness_score      numeric(5,2),
  trust_score         int             default 0,
  -- Lifecycle
  reviewed_by         uuid references auth.users(id),
  reviewed_at         timestamptz,
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now()
);

create index if not exists profiles_approval_status_idx on public.profiles(approval_status);
create index if not exists profiles_role_idx            on public.profiles(role);

-- ---------------------------------------------------------------------------
-- 3. kyc_documents  (uploaded file metadata, many per profile)
-- ---------------------------------------------------------------------------
create table if not exists public.kyc_documents (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  doc_type      document_type not null,
  bucket        text not null,
  storage_path  text not null,        -- path inside the bucket
  file_name     text,
  mime_type     text,
  size_bytes    bigint,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists kyc_documents_user_idx on public.kyc_documents(user_id);

-- ---------------------------------------------------------------------------
-- 4. admin_actions  (audit trail for approvals / rejections)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_actions (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid not null references auth.users(id),
  target_user uuid not null references public.profiles(id) on delete cascade,
  action      text not null,          -- 'approve' | 'reject' | 'suspend'
  reason      text,
  created_at  timestamptz not null default now()
);

create index if not exists admin_actions_target_idx on public.admin_actions(target_user);

-- ---------------------------------------------------------------------------
-- 5. updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Auto-create profile on new auth user
--    Reads metadata passed at signup (raw_user_meta_data).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'phone', null),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'merchant')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 7. Helper: is_admin()
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- 8. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.admin_actions enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "own profile read"   on public.profiles;
create policy "own profile read"   on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "admin profile update" on public.profiles;
create policy "admin profile update" on public.profiles
  for update using (public.is_admin());

-- kyc_documents -------------------------------------------------------------
drop policy if exists "own docs read" on public.kyc_documents;
create policy "own docs read" on public.kyc_documents
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "own docs insert" on public.kyc_documents;
create policy "own docs insert" on public.kyc_documents
  for insert with check (auth.uid() = user_id);

-- admin_actions -------------------------------------------------------------
drop policy if exists "admin actions read" on public.admin_actions;
create policy "admin actions read" on public.admin_actions
  for select using (public.is_admin());

drop policy if exists "admin actions insert" on public.admin_actions;
create policy "admin actions insert" on public.admin_actions
  for insert with check (public.is_admin());

-- NOTE: the Node backend uses the SERVICE ROLE key which bypasses RLS.
-- These policies protect direct client (anon key) access from the mobile app.

-- ---------------------------------------------------------------------------
-- 9. Storage buckets (private)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('ledger-images', 'ledger-images', false)
on conflict (id) do nothing;

-- Storage RLS: users may manage files under a folder named after their uid.
drop policy if exists "user reads own kyc files" on storage.objects;
create policy "user reads own kyc files" on storage.objects
  for select using (
    bucket_id in ('kyc-documents','ledger-images')
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );

drop policy if exists "user uploads own kyc files" on storage.objects;
create policy "user uploads own kyc files" on storage.objects
  for insert with check (
    bucket_id in ('kyc-documents','ledger-images')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

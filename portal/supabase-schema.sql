-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Clients table (legacy — portal now uses leads table directly)
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  company text,
  role text,
  status text default 'prospect' check (status in ('prospect', 'active', 'inactive')),
  notes text,
  advisor_id uuid references auth.users(id)
);

-- Assessments table (for advisor-initiated assessments sent via link)
create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid references clients(id) on delete cascade,
  advisor_id uuid references auth.users(id),
  token text unique default encode(gen_random_bytes(32), 'hex'),
  status text default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  responses jsonb
);

-- Enable Row Level Security
alter table clients enable row level security;
alter table assessments enable row level security;

create policy "Advisors manage their clients"
  on clients for all
  using (advisor_id = auth.uid());

create policy "Advisors manage their assessments"
  on assessments for all
  using (advisor_id = auth.uid());

-- ============================================================
-- LEADS TABLE — primary table used by the portal
-- ============================================================
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  responses jsonb,
  score integer,
  -- Advisor-editable profile fields
  first_name text,
  last_name text,
  company text,
  linkedin text,
  phone text,
  city text,
  country text
);

alter table leads enable row level security;

-- Anyone can insert (public form)
create policy "Public can insert leads"
  on leads for insert
  with check (true);

-- Authenticated advisors can read all leads
create policy "Advisors can read leads"
  on leads for select
  using (auth.role() = 'authenticated');

-- Authenticated advisors can update leads (for profile editing)
create policy "Advisors can update leads"
  on leads for update
  using (auth.role() = 'authenticated');

-- ============================================================
-- ADMINS TABLE — controls who can access the portal
-- ============================================================
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  invited_by uuid references auth.users(id),
  role text default 'advisor' check (role in ('advisor', 'admin'))
);

alter table admins enable row level security;

-- Any authenticated user can see the admins list (to verify their own access)
create policy "Admins can read admins table"
  on admins for select
  using (auth.role() = 'authenticated');

-- Only admins can insert/update/delete
create policy "Admins can manage admins"
  on admins for all
  using (exists (
    select 1 from admins where user_id = auth.uid() and role = 'admin'
  ));

-- ============================================================
-- ALTER TABLE MIGRATIONS — run these if leads table already exists
-- ============================================================
-- alter table leads add column if not exists first_name text;
-- alter table leads add column if not exists last_name text;
-- alter table leads add column if not exists company text;
-- alter table leads add column if not exists linkedin text;
-- alter table leads add column if not exists phone text;
-- alter table leads add column if not exists city text;
-- alter table leads add column if not exists country text;

-- Add update policy if using existing table:
-- create policy "Advisors can update leads"
--   on leads for update
--   using (auth.role() = 'authenticated');

-- Create admins table if not exists (see above), then seed your own account:
-- insert into admins (user_id, email, role)
-- select id, email, 'admin' from auth.users where email = 'your@email.com';

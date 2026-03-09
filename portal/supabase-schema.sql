-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Clients table
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

-- Assessments table
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

-- Advisors can only see their own clients
create policy "Advisors manage their clients"
  on clients for all
  using (advisor_id = auth.uid());

-- Advisors can only see their own assessments
create policy "Advisors manage their assessments"
  on assessments for all
  using (advisor_id = auth.uid());

-- Public leads (from reigniteadvisors.com/assessment/)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  responses jsonb,
  score integer
);

alter table leads enable row level security;

-- Anyone can insert (public form), only authenticated advisors can read
create policy "Public can insert leads"
  on leads for insert
  with check (true);

create policy "Advisors can read leads"
  on leads for select
  using (auth.role() = 'authenticated');

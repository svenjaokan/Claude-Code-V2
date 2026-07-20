-- ============================================================
-- ClosePilot Webinar CRM — Supabase Setup
-- Im Supabase Dashboard: SQL Editor → dieses Skript einfügen → Run
-- ============================================================

-- Team-Freischaltung: nur E-Mails in dieser Tabelle dürfen die App nutzen.
create table if not exists public.allowed_users (
  email text primary key,
  is_admin boolean not null default false
);

-- Admin (Svenja) + Closer eintragen. Weitere Closer: Zeilen ergänzen.
insert into public.allowed_users (email, is_admin) values
  ('hello@svenjaokan.de', true),          -- Svenja Okan (Admin)
  ('keller.danny1990@gmail.com', false),  -- Danny Keller
  ('deliaraphael@icloud.com', false)      -- Raphael
  -- ,('vierter-closer@mail.de', false)
on conflict (email) do nothing;

-- Leads-Tabelle (gemeinsame Daten für das ganze Team)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text default '',
  tel text default '',
  webinar text not null default 'offen',   -- offen | erschienen | nicht
  call1 text not null default 'offen',     -- offen | done | noshow
  call2 text not null default 'offen',
  result text not null default 'offen',    -- offen | close | noclose
  sum numeric not null default 0,
  via text not null default '',            -- '' | ablefy | contract
  paid text not null default 'offen',      -- offen | ja | nein
  note text default '',
  created_by_email text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at automatisch pflegen
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- Hilfsfunktionen für die Zugriffsregeln
create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(select 1 from allowed_users where email = auth.jwt()->>'email') $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(select 1 from allowed_users where email = auth.jwt()->>'email' and is_admin) $$;

-- Row Level Security: nur freigeschaltete Team-Mitglieder sehen/bearbeiten,
-- löschen darf nur der Admin.
alter table public.leads enable row level security;
drop policy if exists leads_select on public.leads;
drop policy if exists leads_insert on public.leads;
drop policy if exists leads_update on public.leads;
drop policy if exists leads_delete on public.leads;
create policy leads_select on public.leads for select to authenticated using (public.is_allowed());
create policy leads_insert on public.leads for insert to authenticated with check (public.is_allowed());
create policy leads_update on public.leads for update to authenticated using (public.is_allowed());
create policy leads_delete on public.leads for delete to authenticated using (public.is_admin());

-- Jeder darf nur den eigenen Freischaltungs-Eintrag lesen (für das Admin-Badge in der App).
alter table public.allowed_users enable row level security;
drop policy if exists allowed_self on public.allowed_users;
create policy allowed_self on public.allowed_users for select to authenticated
  using (email = auth.jwt()->>'email');

-- Live-Updates: damit alle Closer Änderungen sofort sehen.
do $$ begin
  alter publication supabase_realtime add table public.leads;
exception when duplicate_object then null; end $$;

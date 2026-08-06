-- ============================================================
-- ClosePilot CRM — Supabase Setup (v2: Pipelines, Rollen, Notizen)
-- Im Supabase Dashboard: SQL Editor → dieses Skript einfügen → Run
-- ============================================================

-- Team-Freischaltung: nur E-Mails in dieser Tabelle dürfen die App nutzen.
-- is_admin = volle Rechte (löschen, Kosten bearbeiten).
create table if not exists public.allowed_users (
  email text primary key,
  is_admin boolean not null default false
);

insert into public.allowed_users (email, is_admin) values
  ('hello@svenjaokan.de', true),          -- Svenja Okan (Admin)
  ('keller.danny1990@gmail.com', true),   -- Danny Keller (Admin)
  ('deliaraphael@icloud.com', false),     -- Raphael
  ('khato.1983@gmail.com', false),        -- Khato
  ('dettmardominic@gmail.com', false)     -- Dominic Dettmar
on conflict (email) do nothing;

-- Leads (beide Pipelines in einer Tabelle)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text default '',
  tel text default '',
  pipeline text not null default 'webinar',      -- webinar | evergreen
  stage text not null default 'neuer_termin',    -- neuer_termin | ersttermin | zweittermin | noshow | close | noclose | onboarding
  closer text default '',
  wert numeric not null default 0,               -- Lead-Wert (Deal-Summe)
  bezahlt numeric not null default 0,            -- davon tatsächlich bezahlt
  zahlungsart text not null default '',          -- '' | komplett | klarna
  produkt text not null default '',              -- '' | kurs | selbstlernkurs
  kosten numeric not null default 0,             -- Lead-Kosten (Reseller-Partnermodus)
  notes jsonb not null default '[]',             -- [{t, by, text}]
  onboarding_info text default '',               -- Infos für die Assistentin
  ob_termin date,                                -- Onboarding-Termin
  ob_termin_gemacht boolean not null default false,
  ob_stattgefunden boolean not null default false,
  ob_zugaenge boolean not null default false,    -- Zugänge zum Programm versendet
  start_datum date,                              -- wann angefangen
  created_by_email text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(select 1 from allowed_users where email = auth.jwt()->>'email') $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(select 1 from allowed_users where email = auth.jwt()->>'email' and is_admin) $$;

-- Rechte: Team darf lesen, anlegen und bearbeiten (Pipeline-Schritte,
-- Notizen, Lead-Daten). Löschen darf nur ein Admin.
alter table public.leads enable row level security;
drop policy if exists leads_select on public.leads;
drop policy if exists leads_insert on public.leads;
drop policy if exists leads_update on public.leads;
drop policy if exists leads_delete on public.leads;
create policy leads_select on public.leads for select to authenticated using (public.is_allowed());
create policy leads_insert on public.leads for insert to authenticated with check (public.is_allowed());
create policy leads_update on public.leads for update to authenticated using (public.is_allowed());
create policy leads_delete on public.leads for delete to authenticated using (public.is_admin());

-- Jeder liest nur den eigenen Freischaltungs-Eintrag (für das Admin-Badge).
alter table public.allowed_users enable row level security;
drop policy if exists allowed_self on public.allowed_users;
create policy allowed_self on public.allowed_users for select to authenticated
  using (email = auth.jwt()->>'email');

-- Live-Updates für alle Team-Mitglieder
do $$ begin
  alter publication supabase_realtime add table public.leads;
exception when duplicate_object then null; end $$;

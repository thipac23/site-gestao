-- ============================================================
-- REFRAMAX PORTAL - Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'supervisor' check (role in ('admin', 'gerente', 'coordenador', 'supervisor', 'planejamento', 'lider', 'cliente', 'cliente_financeiro', 'logistica')),
  company text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- CONTRACTS
-- ============================================================
create table if not exists public.contracts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  client text not null default 'Ternium',
  type text not null check (type in ('aderencia', 'disponibilidade', 'pu')),
  target numeric(5,2) not null default 90,
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.contracts enable row level security;
create policy "contracts_select_all" on public.contracts for select to authenticated using (true);
create policy "contracts_manage_admin" on public.contracts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'gerente', 'coordenador'))
);

-- ============================================================
-- TEAMS
-- ============================================================
create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contract_id uuid references public.contracts(id) on delete set null,
  leader_id uuid references public.profiles(id) on delete set null,
  leader_name text,
  member_count integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.teams enable row level security;
create policy "teams_select_all" on public.teams for select to authenticated using (true);
create policy "teams_manage_admin" on public.teams for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'gerente', 'coordenador'))
);

-- ============================================================
-- BATTERIES
-- ============================================================
create table if not exists public.batteries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  furnace_count integer not null default 67,
  status text not null default 'operational' check (status in ('operational', 'partial', 'maintenance', 'idle')),
  created_at timestamp with time zone default now()
);

alter table public.batteries enable row level security;
create policy "batteries_select_all" on public.batteries for select to authenticated using (true);
create policy "batteries_manage_admin" on public.batteries for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'gerente', 'coordenador', 'supervisor'))
);

-- ============================================================
-- FURNACES
-- ============================================================
create table if not exists public.furnaces (
  id uuid primary key default uuid_generate_v4(),
  battery_id uuid references public.batteries(id) on delete cascade,
  number integer not null,
  status text not null default 'operational' check (status in ('operational', 'repair', 'maintenance', 'idle')),
  region text,
  last_repair timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.furnaces enable row level security;
create policy "furnaces_select_all" on public.furnaces for select to authenticated using (true);
create policy "furnaces_manage_admin" on public.furnaces for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'gerente', 'coordenador', 'supervisor'))
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid references public.contracts(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  furnace_id uuid references public.furnaces(id) on delete set null,
  region text,
  description text not null,
  planned_hh numeric(6,2) not null default 0,
  actual_hh numeric(6,2),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
  deviation_reason text,
  scheduled_date date not null,
  completed_at timestamp with time zone,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.activities enable row level security;
create policy "activities_select_all" on public.activities for select to authenticated using (true);
create policy "activities_insert_auth" on public.activities for insert to authenticated with check (true);
create policy "activities_update_auth" on public.activities for update to authenticated using (true);

-- ============================================================
-- KPIs
-- ============================================================
create table if not exists public.kpis (
  id uuid primary key default uuid_generate_v4(),
  contract_id uuid references public.contracts(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  hh_programmed numeric(10,2) default 0,
  hh_realized numeric(10,2) default 0,
  adherence numeric(5,2) default 0,
  activities_planned integer default 0,
  activities_completed integer default 0,
  deviations integer default 0,
  deviations_resolved integer default 0,
  availability numeric(5,2) default 0,
  workforce integer default 0,
  attendance numeric(5,2) default 0,
  labor_cost numeric(12,2),
  material_cost numeric(12,2),
  pu_revenue numeric(12,2),
  created_at timestamp with time zone default now()
);

alter table public.kpis enable row level security;
create policy "kpis_select_all" on public.kpis for select to authenticated using (true);
create policy "kpis_manage_admin" on public.kpis for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'gerente', 'coordenador', 'planejamento'))
);

-- ============================================================
-- MATERIALS
-- ============================================================
create table if not exists public.materials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  unit text not null default 'un',
  quantity numeric(10,2) default 0,
  min_quantity numeric(10,2) default 0,
  location text,
  created_at timestamp with time zone default now()
);

alter table public.materials enable row level security;
create policy "materials_select_all" on public.materials for select to authenticated using (true);
create policy "materials_manage_logistica" on public.materials for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'logistica'))
);

-- ============================================================
-- MATERIAL MOVEMENTS
-- ============================================================
create table if not exists public.material_movements (
  id uuid primary key default uuid_generate_v4(),
  material_id uuid references public.materials(id) on delete cascade,
  type text not null check (type in ('entrada', 'saida', 'transferencia')),
  quantity numeric(10,2) not null,
  origin text,
  destination text,
  responsible_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.material_movements enable row level security;
create policy "movements_select_all" on public.material_movements for select to authenticated using (true);
create policy "movements_insert_logistica" on public.material_movements for insert to authenticated with check (true);

-- ============================================================
-- ATTENDANCE
-- ============================================================
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  date date not null,
  check_in time,
  check_out time,
  status text not null default 'present' check (status in ('present', 'absent', 'late', 'excused')),
  notes text,
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

alter table public.attendance enable row level security;
create policy "attendance_select_all" on public.attendance for select to authenticated using (true);
create policy "attendance_manage_auth" on public.attendance for all to authenticated using (true);

-- ============================================================
-- ACCESS REQUESTS
-- ============================================================
create table if not exists public.access_requests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  company text,
  requested_role text not null default 'supervisor',
  justification text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.access_requests enable row level security;
create policy "access_requests_insert_anon" on public.access_requests for insert to anon with check (true);
create policy "access_requests_select_admin" on public.access_requests for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "access_requests_update_admin" on public.access_requests for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- PROFILE TRIGGER (auto-create on signup)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, company)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'supervisor'),
    coalesce(new.raw_user_meta_data ->> 'company', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

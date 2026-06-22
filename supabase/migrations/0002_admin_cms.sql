-- CozyBuilder Admin CMS (1차) — 콘텐츠 관리 테이블 + RLS
-- Supabase Dashboard > SQL Editor 에서 1회 실행.
-- 결제/Billing 아님. program_subscriptions(구독)와 무관.

-- ── 관리자 명단 ──
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

-- 관리자 판별 함수 (admin_users RLS 재귀 방지 위해 SECURITY DEFINER)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

-- 관리자는 자신의 관리자 여부 조회 가능 (insert/delete 는 SQL editor 에서 수동)
create policy "admin_users_select_self_or_admin"
  on public.admin_users for select
  using (auth.uid() = user_id or public.is_admin());

-- ── programs ──
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('web','mobile')),
  name text not null,
  subtitle text,
  summary text,
  description text,
  image text,
  features jsonb not null default '[]',
  screenshots jsonb not null default '[]',
  updates jsonb not null default '[]',
  app_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.programs enable row level security;
create policy "programs_select_published" on public.programs for select using (status = 'published');
create policy "programs_admin_all" on public.programs for all using (public.is_admin()) with check (public.is_admin());

-- ── products ──
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null check (category in ('website','ebook')),
  name text not null,
  summary text,
  image text,
  contents jsonb not null default '[]',
  screenshots jsonb not null default '[]',
  long_description text,
  price text,
  cta text not null default 'contact' check (cta in ('buy','contact')),
  cta_label text,
  cta_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "products_select_published" on public.products for select using (status = 'published');
create policy "products_admin_all" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- ── marketing_channels ──
create table if not exists public.marketing_channels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null check (category in ('sns','blog')),
  name text not null,
  description text,
  image text,
  external_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.marketing_channels enable row level security;
create policy "marketing_select_published" on public.marketing_channels for select using (status = 'published');
create policy "marketing_admin_all" on public.marketing_channels for all using (public.is_admin()) with check (public.is_admin());

-- 관리자 등록 (본인 user.id 로 교체 후 실행):
-- insert into public.admin_users (user_id) values ('<YOUR-AUTH-USER-UUID>');

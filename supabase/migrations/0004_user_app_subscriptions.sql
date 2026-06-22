-- 웹프로그램(앱) 접근 권한 — app_key 기반 구독 상태 (결제 없음, DB값 기반)
-- Supabase Dashboard > SQL Editor 에서 실행. is_admin() 은 0002 에서 생성됨.

create table if not exists public.user_app_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  app_key text not null,
  plan text not null default 'free',
  status text not null default 'inactive'
    check (status in ('inactive', 'active', 'trialing', 'canceled', 'expired')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, app_key)
);

alter table public.user_app_subscriptions enable row level security;

-- 사용자는 자기 구독만 읽기 / 관리자는 전체 읽기
create policy "uas_select_own_or_admin"
  on public.user_app_subscriptions
  for select
  using (auth.uid() = user_id or public.is_admin());

-- 쓰기(insert/update/delete)는 관리자만 (일반 사용자 불가)
create policy "uas_admin_write"
  on public.user_app_subscriptions
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- 접근 허용 상태: active, trialing / 차단: inactive, canceled, expired
--
-- 테스트(관리자 SQL): 특정 사용자에게 앱 권한 부여
--   insert into public.user_app_subscriptions (user_id, app_key, plan, status)
--   values ('<USER_ID>', 'ebook', 'beta', 'active')
--   on conflict (user_id, app_key) do update
--     set status = 'active', plan = 'beta', updated_at = now();
--
-- 접근 차단 테스트:
--   update public.user_app_subscriptions set status = 'inactive'
--   where user_id = '<USER_ID>' and app_key = 'ebook';

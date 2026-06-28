-- CozyBuilder Platform Analytics v1 — 공통 사용량 분석 (웹/모바일/데스크톱 공용)
-- 설계 SSOT: docs/platform/PLATFORM_ANALYTICS_ARCHITECTURE.md
-- Supabase Dashboard > SQL Editor 에서 1회 실행. is_admin() 은 0002 에서 생성됨.
--
-- 개인정보 최소수집 원칙:
--   - 이메일/이름/전화/위치/IP/기기고유번호 저장 금지.
--   - 식별자는 익명 UUID(anonymous_id) + 단방향 HMAC 해시(auth_user_hash)만.
--   - 원본 auth user_id 는 절대 저장하지 않는다.
--   - 직접 insert 정책 없음 → 적재는 서버(service_role)가 /api/analytics/track 로만 수행.

-- ── 원본 이벤트 (append-only) ──
create table if not exists public.analytics_events (
  id              bigint generated always as identity primary key,
  app_key         text not null,
  platform        text not null check (platform in ('web','mobile','desktop')),
  app_version     text,
  event_name      text not null,
  anonymous_id    text not null,                 -- 익명 UUID 또는 로그인 사용자의 해시
  auth_user_hash  text,                          -- HMAC(user_id) — 원본 user_id 저장 안 함
  session_id      text,
  occurred_at     timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  event_date      date generated always as ((occurred_at at time zone 'Asia/Seoul')::date) stored,
  country         text,                          -- 선택(IP 자체는 저장 안 함). v1 미사용.
  metadata        jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_app_date_idx on public.analytics_events (app_key, event_date);
create index if not exists analytics_events_date_anon_idx on public.analytics_events (event_date, anonymous_id);
create index if not exists analytics_events_name_idx on public.analytics_events (event_name);

alter table public.analytics_events enable row level security;

-- 조회: 관리자만. (insert/update/delete 정책 없음 → anon/authenticated 직접 쓰기 불가)
drop policy if exists "analytics_events_admin_select" on public.analytics_events;
create policy "analytics_events_admin_select"
  on public.analytics_events for select
  using (public.is_admin());

-- ── 일별 사전집계 (v1.1 rollup 대상 — 구조만 선반영, 현재 대시보드는 RPC 실시간 집계) ──
create table if not exists public.analytics_daily_stats (
  event_date    date not null,
  app_key       text not null,
  platform      text not null,
  app_version   text not null default '',
  event_name    text not null,
  event_count   bigint not null default 0,
  unique_users  bigint not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (event_date, app_key, platform, app_version, event_name)
);

alter table public.analytics_daily_stats enable row level security;

drop policy if exists "analytics_daily_stats_admin_select" on public.analytics_daily_stats;
create policy "analytics_daily_stats_admin_select"
  on public.analytics_daily_stats for select
  using (public.is_admin());

-- ── 집계 RPC (SECURITY INVOKER 기본 → RLS 적용: 관리자만 실데이터, 그 외 빈/0) ──

create or replace function public.analytics_overview()
returns table (total_users bigint, today_active bigint, active_7d bigint, active_30d bigint)
language sql stable
set search_path = public
as $$
  with t as (select (now() at time zone 'Asia/Seoul')::date as today)
  select
    (select count(distinct anonymous_id) from public.analytics_events),
    (select count(distinct anonymous_id) from public.analytics_events e, t where e.event_date = t.today),
    (select count(distinct anonymous_id) from public.analytics_events e, t where e.event_date > t.today - 7),
    (select count(distinct anonymous_id) from public.analytics_events e, t where e.event_date > t.today - 30);
$$;

create or replace function public.analytics_by_program()
returns table (app_key text, users bigint, launches bigint, downloads bigint, events bigint)
language sql stable
set search_path = public
as $$
  select app_key,
    count(distinct anonymous_id) as users,
    count(*) filter (where event_name = 'app_launch') as launches,
    count(*) filter (where event_name = 'download') as downloads,
    count(*) as events
  from public.analytics_events
  group by app_key
  order by users desc;
$$;

create or replace function public.analytics_daily_active(days int default 30)
returns table (day date, active bigint, events bigint)
language sql stable
set search_path = public
as $$
  select event_date as day,
    count(distinct anonymous_id) as active,
    count(*) as events
  from public.analytics_events
  where event_date > (now() at time zone 'Asia/Seoul')::date - days
  group by event_date
  order by event_date;
$$;

create or replace function public.analytics_by_version()
returns table (app_key text, app_version text, users bigint)
language sql stable
set search_path = public
as $$
  select app_key,
    coalesce(nullif(app_version, ''), '(unknown)') as app_version,
    count(distinct anonymous_id) as users
  from public.analytics_events
  group by app_key, coalesce(nullif(app_version, ''), '(unknown)')
  order by app_key, users desc;
$$;

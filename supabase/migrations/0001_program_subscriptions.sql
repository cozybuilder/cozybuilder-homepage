-- 프로그램 무료 구독 상태 저장 테이블 (결제 없음 — 무료 flag).
-- Supabase Dashboard > SQL Editor 에서 1회 실행하세요.
-- 추후 Billing 도입 시, 결제 성공 여부에 따라 subscribed 를 갱신하면 됩니다.

create table if not exists public.program_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_slug text not null,
  subscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, program_slug)
);

-- 행 단위 보안: 본인 데이터만 접근.
alter table public.program_subscriptions enable row level security;

create policy "program_subscriptions_select_own"
  on public.program_subscriptions
  for select
  using (auth.uid() = user_id);

create policy "program_subscriptions_insert_own"
  on public.program_subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy "program_subscriptions_update_own"
  on public.program_subscriptions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

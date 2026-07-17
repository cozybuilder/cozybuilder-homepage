-- 코지임대(CozyRent) 출시 전 사전신청 v1
-- 설계 SSOT: docs/landing/COZYRENT_PRELAUNCH.md
-- Supabase Dashboard > SQL Editor 에서 1회 실행. is_admin() 은 0002 에서 생성됨.
--
-- 개인정보 원칙:
--   - 수집 최소화: 이름/연락처/건물유형 + 선택 항목만 저장.
--   - 클라이언트 직접 쓰기 정책 없음 → insert 는 서버(service_role)가
--     /api/cozyrent/preregister 로만 수행 (Platform Analytics 와 동일 패턴).
--   - 조회는 관리자만(is_admin()).
--   - 중복 신청은 정규화 연락처(contact_normalized) unique 로 차단 — 덮어쓰기 금지(upsert 없음).

create table if not exists public.cozyrent_prelaunch_signups (
  id                  bigint generated always as identity primary key,
  name                text not null check (char_length(name) between 1 and 40),
  contact_type        text not null check (contact_type in ('phone','email')),
  contact             text not null check (char_length(contact) between 1 and 254),  -- 입력 원문(trim) — 연락용
  contact_normalized  text not null,  -- phone: 숫자만(+82→0) / email: lowercase
  building_type       text not null check (building_type in ('oneroom','dagagu','sanggajutaek','etc')),
  unit_count          text check (unit_count in ('1-5','6-10','11-20','21+')),
  pain_point          text check (pain_point in ('rent','contract','repair','moveout','expense','etc')),
  source              text not null default 'landing_cozyrent' check (source ~ '^[a-z0-9_-]{1,40}$'),
  consent_at          timestamptz not null,          -- 개인정보 수집·이용 동의 시각(서버 기록)
  created_at          timestamptz not null default now()
);

-- 중복 신청 방지: 정규화된 동일 연락처 1건만 허용.
create unique index if not exists cozyrent_prelaunch_signups_contact_uq
  on public.cozyrent_prelaunch_signups (contact_normalized);

create index if not exists cozyrent_prelaunch_signups_created_idx
  on public.cozyrent_prelaunch_signups (created_at);

alter table public.cozyrent_prelaunch_signups enable row level security;

-- 조회: 관리자만. (insert/update/delete 정책 없음 → anon/authenticated 직접 쓰기 불가)
drop policy if exists "cozyrent_prelaunch_signups_admin_select" on public.cozyrent_prelaunch_signups;
create policy "cozyrent_prelaunch_signups_admin_select"
  on public.cozyrent_prelaunch_signups for select
  using (public.is_admin());

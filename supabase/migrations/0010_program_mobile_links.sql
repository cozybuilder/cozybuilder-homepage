-- 0010_program_mobile_links — Programs 스키마 v2: Web/Mobile 공통 실행/다운로드 링크 구조
--
-- 배경: 기존 programs 는 web 기준 단일 실행 URL(app_url)만 있어 모바일앱(스토어 배포)을
-- 표현하지 못했다. 모바일앱(예: 감사일기) 등록을 위해 스토어 링크 + 출시 상태를 추가한다.
--
-- 하위 호환(중요):
--   - 기존 `type` 컬럼(web|mobile)을 그대로 플랫폼 구분값으로 사용한다(별도 platform_type 신설 안 함).
--   - 기존 `app_url` 을 web 실행 URL 로 그대로 사용한다(별칭 web_url 신설/rename 안 함 — 깨짐 방지).
--   - 아래 3개 컬럼만 add column if not exists 로 비파괴 추가한다.
--   - 기존 행은 release_status = null(레거시) → 앱 코드에서 released 로 취급한다.

alter table public.programs
  add column if not exists play_store_url text,
  add column if not exists app_store_url text,
  add column if not exists release_status text;

-- release_status 는 정해진 3개 값 또는 null(레거시)만 허용한다.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'programs_release_status_check'
  ) then
    alter table public.programs
      add constraint programs_release_status_check
      check (
        release_status is null
        or release_status in ('development', 'coming_soon', 'released')
      );
  end if;
end $$;

-- 0011_program_release_by_store_url — Mobile App Release Model v3
--
-- 배경: v2 의 release_status(development/coming_soon/released) 단일 enum 은
-- Android 출시 완료 + iOS 미출시 같은 플랫폼별 상이한 상태를 표현하지 못했다.
-- v3 는 스토어 URL 존재 여부 자체를 출시 상태의 단일 진실로 삼는다:
--   play_store_url 있음 = Android 출시 / app_store_url 있음 = iOS 출시.
--
-- 주의: 운영 DB 에 0010 이 적용된 적이 없어(컬럼 부재 확인됨) 0010 은 dead 처리한다.
-- 이 마이그레이션은 idempotent 하게 0010 미적용/적용 환경 모두를 커버한다.

-- 1) 스토어 URL 컬럼 보장 (0010 미적용 환경 커버)
alter table public.programs
  add column if not exists play_store_url text,
  add column if not exists app_store_url text;

-- 2) release_status 모델 제거 (v3: 스토어 URL 존재로 출시 추론)
alter table public.programs
  drop constraint if exists programs_release_status_check;

alter table public.programs
  drop column if exists release_status;

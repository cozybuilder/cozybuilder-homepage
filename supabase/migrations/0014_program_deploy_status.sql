-- 0014_program_deploy_status — 프로그램 배포 상태 + 사전신청 CTA
-- 설계 SSOT: docs/platform/PROGRAM_OPERATING_MODEL.md §9
--
-- 배경: 프로그램 등록이 스토어 URL 중심(Release Model v3)이라 출시 전 제품의
-- "사전신청" 상태를 표현하지 못했다. 배포 상태를 명시적으로 추가한다.
--
-- 하위 호환(중요):
--   - add column if not exists 로 비파괴 추가. 기본값 없음(null 허용).
--   - 기존 행은 deploy_status = null(레거시) → 앱 코드가 released(기존 로직)로 취급:
--     기존 프로그램의 스토어 버튼/실행 버튼 동작이 전혀 바뀌지 않는다.
--   - 0011 의 Release Model v3(스토어 URL 존재=출시)는 released 상태 안에서 그대로 유지.
--
-- 영향: 기존 4개 행(감사일기/전자책/코지렌트/ClipMiner) 데이터 무변경(컬럼만 추가, 값 null).

alter table public.programs
  add column if not exists deploy_status text,
  add column if not exists prereg_url text,        -- 사전신청 랜딩 URL (내부 경로 또는 https)
  add column if not exists prereg_cta_label text,  -- 사전신청 버튼 문구 (빈값이면 "사전신청하기")
  add column if not exists prereg_benefit text;    -- 혜택 문구 (선택)

-- deploy_status 는 정해진 3개 값 또는 null(레거시=released 취급)만 허용.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'programs_deploy_status_check'
  ) then
    alter table public.programs
      add constraint programs_deploy_status_check
      check (
        deploy_status is null
        or deploy_status in ('preregistration', 'released', 'preparing')
      );
  end if;
end $$;

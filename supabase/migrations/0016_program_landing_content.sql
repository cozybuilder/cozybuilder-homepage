-- 0016_program_landing_content — 프로그램 상세 홍보 콘텐츠 (선택)
-- 설계 SSOT: docs/platform/PROGRAM_OPERATING_MODEL.md §10
--
-- 배경: /programs/[slug] 를 상시 제품 홍보·전환 상세페이지로 확장하면서
-- 문제 공감·핵심 가치·추천 대상·신뢰 지표·제작 배경·후기·이용 안내·FAQ·최종 CTA 문구가 필요해졌다.
--
-- 결정: 마케팅 문구마다 컬럼을 늘리지 않고 jsonb 한 컬럼이 소유한다.
--   구조·검증 SSOT = lib/program-landing.ts (version: 1).
--   서버가 저장·조회 양쪽에서 정규화하며, v1 은 일반 문자열만 받는다(HTML/Markdown 불허).
--
-- 하위 호환:
--   - add column if not exists 로 비파괴 추가. 기본값 없음(null 허용).
--   - 기존 행은 landing_content = null → 공개 상세는 기존 데이터(summary/description/features/
--     screenshots/updates)로 그대로 렌더된다. 선택 섹션은 비어 있으면 숨긴다.
--   - 잘못된/레거시 값이 들어 있어도 정규화 단계에서 걸러지고 공개페이지는 500 이 되지 않는다.
--
-- 영향: 기존 행 데이터 무변경(컬럼만 추가, 값 null). backfill·update·delete 0.

alter table public.programs
  add column if not exists landing_content jsonb;

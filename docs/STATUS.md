# STATUS — CozyBuilder Homepage

## 현재 상태

- 상태: 🟢 active
- 운영 도메인: https://cozybuilder.co.kr
- 배포: Vercel 자동 배포 (`main`)
- 저장소: `cozybuilder/cozybuilder-homepage`

## 홈페이지 역할

CozyBuilder 홈페이지는 단순 소개 사이트가 아니라 다음을 담당하는 중앙 플랫폼이다.

- CozyBuilder 브랜드 허브
- 공통 회원가입·로그인
- 무료 프로그램 유입
- 프로그램 탐색·소개
- 마이페이지의 `내 프로그램` 통합 조회
- 무료 이용·무료 체험·구독·구매 상태 표시
- 유료·독립 서비스의 실행 진입점
- 프로그램별 이용·전환 분석

홈페이지 자체의 일괄 구독을 기본 수익모델로 삼지 않는다. 유료 프로그램은 각 프로그램별로 결제·구독한다.

## 완료된 핵심 기능

### 인증
- 이메일 로그인/회원가입
- Google OAuth
- 비밀번호 재설정
- 보호 라우트 (`/dashboard`, `/profile`, `/settings`, `/admin`)

### 프로그램 플랫폼
- `/apps/[appKey]` 공통 런처
- 무료 구독 기반 접근 제어
- 웹 프로그램 공통 구조

### 관리자 CMS
- Programs
- Product
- Marketing
- Analytics

### 코지임대 사전신청 랜딩 (2026-07-17)
- `/cozyrent` — 출시 전 사전신청 랜딩페이지 (설계 SSOT: [docs/landing/COZYRENT_PRELAUNCH.md](landing/COZYRENT_PRELAUNCH.md))
- `POST /api/cozyrent/preregister` — service_role 적재, 정규화 연락처(unique) 중복 차단, 연락처 로그 미출력
- migration `0013_cozyrent_prelaunch_v1.sql` **운영 DB 적용 완료** (2026-07-17 22:28 KST경 · 코지 승인 후 Supabase Dashboard SQL Editor 원문 실행 · 대상 Cozybuilder-homepage PRODUCTION 확인)
- 운영 E2E 검증 완료 (2026-07-17 · 코지 실제 정보 1건 — 원문은 기록하지 않음):
  실제 신청 201 성공·완료 화면 확인 / 동일 연락처(대소문자 변형 포함) 재제출 409 "이미 신청되어 있습니다" /
  DB 1행 유지(덮어쓰기 없음·created_at 불변) / RLS enabled·admin select 정책 1개·쓰기 정책 0 확인 /
  anon SELECT 빈 결과·anon INSERT 401 차단 / unique·created_at 인덱스 존재 / 연타 5회 → API 1회 호출
- 실앱 화면·OG 이미지는 교체 슬롯(placeholder) — 목록은 설계 문서 §12

### Platform Analytics v1
- `analytics_events`
- `analytics_daily_stats`
- `/api/analytics/track`
- `/admin/analytics`
- 프로그램별 사용량 그래프
- app_launch / download_click 계측

## 프로그램 운영 모델

프로그램은 아래 두 방식으로 운영한다.

### A형 — 홈페이지 귀속형

- 무료·소형 프로그램
- 회원 유입과 재방문을 만드는 프로그램
- 홈페이지 내부 URL과 인증·세션 사용
- 마이페이지 `내 프로그램`에 무료 이용 상태로 표시

### B형 — 독립 서비스형

- 유료 SaaS 또는 자체 운영비·데이터·결제가 있는 서비스
- 별도 저장소·별도 배포·서브도메인 또는 독립 도메인 사용
- CozyBuilder 공통 계정과 사용자 ID 재사용
- 마이페이지에서 이용 상태와 실행 링크 통합 제공

상세 SSOT: [docs/platform/PROGRAM_OPERATING_MODEL.md](platform/PROGRAM_OPERATING_MODEL.md)

## v1.1 백로그

- Analytics v1.1 백로그 상세는 [docs/platform/PLATFORM_ANALYTICS_ARCHITECTURE.md §15](platform/PLATFORM_ANALYTICS_ARCHITECTURE.md) 가 SSOT다. (이 문서는 목록을 직접 소유하지 않는다.)
- 광고 지표(CTR/수익)는 v1.1이 아니라 v2 범위.

## 다음 구조 작업

- 마이페이지 상위 명칭을 `내 프로그램`으로 통일
- 상태를 `무료 이용 중 / 무료 체험 중 / 구독 중 / 구매 완료 / 이용 종료`로 구분
- 독립 서비스의 외부 실행 URL과 이용권 상태를 프로그램 등록정보에 포함
- 신규 프로그램 등록 시 A형·B형 판정 필수화
- 홈페이지 전체 구독과 프로그램별 구독의 개념 분리

## 운영 원칙

- 공통 운영 SSOT: `cozybuilder-ops`
- 홈페이지 프로그램 구조 SSOT: `docs/platform/PROGRAM_OPERATING_MODEL.md`
- 프로젝트 사실은 이 문서가 소유
- 역사와 변경 내역은 Git commit이 소유

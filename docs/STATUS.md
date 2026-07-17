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

### 공용 랜딩페이지 플랫폼 (2026-07-17)
- 공용 구조 SSOT: [docs/landing/LANDINGPAGE_PLATFORM.md](landing/LANDINGPAGE_PLATFORM.md)
- 공식 공개 URL: `/landingpage/[slug]` (설정 레지스트리 `lib/landingpage/config.ts` + 공용 렌더러 — 페이지 복사 금지)
- 관리자: `/admin/landingpage` (랜딩별 요약 카드) · `/admin/landingpage/[slug]` (신청 내역)
- 기존 URL 호환(308 redirect · query 유지): `/cozyrent`→`/landingpage/cozyrent` ·
  `/admin/cozyrent-prelaunch`→`/admin/landingpage/cozyrent` · `/image/cozyrent/*`→`/image/landingpage/cozyrent/*`
- DB·API 는 제품별 유지(범용화는 별도 승인) — 기존 테이블·`/api/cozyrent/preregister` 무변경
- 디자인 수정: 히어로 제목 의미 단위 2줄 고정(clamp 글자 크기·break-keep·nowrap — 320~1280 넘침 0) ·
  기능 카드 앱 화면을 세로형 9:19 규격(카드 상단 중앙·5개 동일)으로 변경 · 320px CTA 줄바꿈 제거
- 검증(2026-07-17): 320/360/375/390/430/768/1280 가로 overflow 0 · redirect 3종 query 유지 ·
  canonical/OG 새 주소 · 미등록 slug 404 · 폼 검증 회귀 · 기존 신청 1건 유지

### 프로그램 배포 상태 (2026-07-18)
- programs 에 배포 상태 추가: `deploy_status`(사전신청 preregistration / 출시됨 released / 준비 중 preparing)
  + 사전신청 CTA 필드(`prereg_url`·`prereg_cta_label`·`prereg_benefit`) — 규칙 SSOT:
  [docs/platform/PROGRAM_OPERATING_MODEL.md §9](platform/PROGRAM_OPERATING_MODEL.md)
- 레거시(null)=released 취급 — 기존 프로그램 동작·데이터 무변경. 출시 전환은 관리자 설정만으로 가능
- URL 검증: 내부 경로 또는 https 만 허용(위험 scheme 차단). 숨겨진 상태의 URL 값은 hidden 보존
- migration `0014_program_deploy_status.sql` **운영 DB 적용 완료** (2026-07-18 · 코지 승인 후
  Supabase Dashboard SQL Editor 원문 실행). 적용 후 확인: 컬럼 4개 존재 ·
  programs_deploy_status_check 제약(3개 값+null) · 기존 4행 무변경(신규 컬럼 전부 null·스토어 URL 보존)
- 코지렌트 프로그램 사전신청 전환 완료 (2026-07-18 · 관리자 화면에서 저장):
  deploy_status=preregistration · prereg_url=/landingpage/cozyrent · 버튼 "사전신청하기" ·
  혜택 "출시 전 사전신청 시 6,900P 지급" · 이름/slug/이미지/설명/정렬/공개 상태 유지 · 가짜 스토어 URL 없음
- 운영 실측: 목록 카드 "사전신청" 배지 · 상세 배지+CTA→/landingpage/cozyrent 이동(같은 탭) ·
  스토어 버튼 미노출 · 혜택 문구 표시 · 감사일기 등 타 프로그램 회귀 0 · 관리자 수정 화면 값 정상

### 코지임대 사전신청 랜딩 (2026-07-17)
- `/landingpage/cozyrent` (구 `/cozyrent` — redirect 호환) — 출시 전 사전신청 랜딩페이지 (설계 SSOT: [docs/landing/COZYRENT_PRELAUNCH.md](landing/COZYRENT_PRELAUNCH.md))
- `POST /api/cozyrent/preregister` — service_role 적재, 정규화 연락처(unique) 중복 차단, 연락처 로그 미출력
- migration `0013_cozyrent_prelaunch_v1.sql` **운영 DB 적용 완료** (2026-07-17 22:28 KST경 · 코지 승인 후 Supabase Dashboard SQL Editor 원문 실행 · 대상 Cozybuilder-homepage PRODUCTION 확인)
- 운영 E2E 검증 완료 (2026-07-17 · 코지 실제 정보 1건 — 원문은 기록하지 않음):
  실제 신청 201 성공·완료 화면 확인 / 동일 연락처(대소문자 변형 포함) 재제출 409 "이미 신청되어 있습니다" /
  DB 1행 유지(덮어쓰기 없음·created_at 불변) / RLS enabled·admin select 정책 1개·쓰기 정책 0 확인 /
  anon SELECT 빈 결과·anon INSERT 401 차단 / unique·created_at 인덱스 존재 / 연타 5회 → API 1회 호출
- 폼 선택 칩 시각 피드백 강화 (2026-07-18): 선택 칩 = accent 배경·흰 글자·체크 아이콘·절제된 glow /
  미선택 = 기존 중립색 · hover/pressed 분리(active scale). 제출 버튼 pressed 피드백 +
  필수 누락 시 첫 오류 필드로 스크롤 + 버튼 아래 "필수 항목을 확인해주세요" 요약 · 건물 유형 선택 시
  오류 즉시 제거. (원인: Tailwind v4에서 구식 `-[--var]` 축약이 무효라 기존 선택색이 미적용 —
  해당 칩은 `var()` 표기로 수정. 사이트 전반 일괄 전환은 별도 후속 작업)
- 실앱 이미지 적용 완료 (2026-07-18): cozyrent/public/img 원본(온보딩이미지.png · 1~6.jpg)을
  public/image/landingpage/cozyrent/ 로 복사(hero.png · home/rent/building/moveout/repair/expense.jpg —
  번호 순서 1→6 유지 · 7번 미사용 · 원본 무변경). 기능 카드 6개(홈 상황판 추가 — AI_CONTEXT §5·§6 근거),
  실캡처 비율 보존(1080×2111 · 히어로 941×1672 · 잘림 0). og.png 는 임시본 유지(교체 대기)
- 관리자 조회 화면 `/admin/landingpage/cozyrent` (구 `/admin/cozyrent-prelaunch` — redirect) (2026-07-17 · 1차 조회 전용 — 설계 문서 §13):
  기존 관리자 체계 재사용(requireAdmin + 서버 액션별 getAdminUser 이중 검증 · RLS admin select · service_role 미사용) /
  요약 통계(DB count) · 건물/유입/호실 분포 · 서버 측 pagination(20/50/100) · 검색·필터(서버 액션 body — URL 미노출) ·
  CSV 내보내기(필터 결과만·contact_normalized 제외·경고 후 다운로드) · force-dynamic(정적 캐시 금지) /
  수정·삭제·발송 등은 범위 제외(후속 설계)

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

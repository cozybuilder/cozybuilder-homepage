# 공용 랜딩페이지 플랫폼

> 제품별 사전신청/마케팅 랜딩페이지의 **공용 구조 SSOT**.
> 개별 랜딩의 내용(문구·혜택·폼 필드)은 각 랜딩 문서가 소유한다 — 코지임대: [COZYRENT_PRELAUNCH.md](COZYRENT_PRELAUNCH.md).

## 1. URL 규칙

- 공개 공식 URL: `/landingpage/[slug]` (예: `https://cozybuilder.co.kr/landingpage/cozyrent`)
- 관리자: `/admin/landingpage` (목록) · `/admin/landingpage/[slug]` (신청 내역)
- canonical·Open Graph URL은 항상 공식 URL을 사용한다.

### slug 규칙

- 소문자·숫자·하이픈(`^[a-z0-9-]+$`), 제품 영문명 기준 (예: `cozyrent`)
- slug 는 `lib/landingpage/config.ts` 레지스트리에 등록된 것만 유효 — 미등록 slug 는 404.

### 기존 URL redirect 정책

기존 광고·공유 링크는 끊지 않는다. `next.config.ts` redirects(308 permanent, query 자동 유지):

| 기존 | 신규 |
|------|------|
| `/cozyrent` | `/landingpage/cozyrent` |
| `/admin/cozyrent-prelaunch` | `/admin/landingpage/cozyrent` |
| `/image/cozyrent/*` | `/image/landingpage/cozyrent/*` |

- `?src=` 등 query parameter 는 redirect 시 그대로 유지된다(Next.js 기본 동작).
- redirect loop 금지 — 신규 경로는 어떤 redirect 의 source 도 아니다.

## 2. 설정 기반 구조

- 랜딩 1개 = 설정 1개. **페이지 파일 복사 금지** — 공용 렌더러가 설정을 읽어 그린다.
- 설정 SSOT: `lib/landingpage/config.ts` (`LANDING_CONFIGS` 레지스트리)
- 렌더러: `components/landingpage/LandingRenderer.tsx` (+ `AppScreenSlot`, `MobileCtaBar`)
- 설정이 분리하는 항목: slug · 제품명 · 관리자 표시명 · eyebrow · hero 제목/설명 · 혜택 문구 ·
  CTA 문구 · 문제 공감 · 기능 목록 · 제작 신뢰 · FAQ · 이미지 경로 · 폼 종류 · source 기본값 ·
  metadata(title/description) · 신청 데이터 조회 어댑터(현재: 테이블명)
- 폼 종류(`formKind`)는 렌더러의 폼 컴포넌트 맵으로 연결한다 (현재: `cozyrent-preregister` →
  `components/cozyrent/PreRegisterForm`, `POST /api/cozyrent/preregister`).

## 3. 관리자 공용 구조

- `/admin/landingpage`: 레지스트리의 랜딩별 요약 카드(이름·제품명·slug·전체/오늘/7일 신청 ·
  주요 유입 경로·공개 랜딩/신청 내역 링크). 새 랜딩은 레지스트리 등록만으로 카드가 추가된다.
- `/admin/landingpage/[slug]`: KPI · 분포 통계 · 검색 · 필터 · 페이지네이션 · CSV (조회 전용).
- 권한: admin layout `requireAdmin()` + 서버 액션별 `getAdminUser()` 이중 검증 + RLS admin select.
- 서버 액션(`app/admin/landingpage/actions.ts`)은 slug 를 받아 레지스트리에서 조회 어댑터
  (테이블명)를 해석한다. 미등록 slug 는 거부.

## 4. 자산 경로 규칙

- 공용 기본 경로: `public/image/landingpage/[slug]/`
- 권장 파일명: `hero.png` · 기능별(`rent.png` 등) · `og.png`
- 기존 `public/image/cozyrent/` 는 파일을 신규 경로로 이전하고 redirect 로 호환한다(§1).
- 실앱 화면 미확보 슬롯은 설정에서 `null` — 렌더러가 세로형(9:19) 중립 placeholder 표시.
  **가짜 앱 UI 제작 금지.**

## 5. DB 정책

- **DB 는 현재 제품별 테이블 유지가 원칙이다.** (코지임대: `cozyrent_prelaunch_signups`)
- 범용 signups 테이블 전환·데이터 이전·테이블 rename 은 **별도 설계·코지 승인 후**에만 진행한다.
- API 도 현재 제품별 유지(`/api/cozyrent/preregister`). 공용 API 전환은 후속 과제.

## 6. 신규 랜딩 추가 절차

1. 랜딩 문서 작성(문구·폼·저장 구조 — Document First) 및 승인.
2. DB: 제품별 signups 테이블 migration 작성 → 승인 → 운영 적용 (RLS: 쓰기 정책 없음 + admin select).
3. API: 제품별 등록 라우트 추가(service_role 적재·정규화·중복 차단·연타 방지 패턴 재사용).
4. 폼 컴포넌트 추가 + `formKind` 를 렌더러 폼 맵에 등록.
5. `lib/landingpage/config.ts` 레지스트리에 설정 추가 (`/landingpage/[slug]`·관리자 카드 자동 활성).
6. `public/image/landingpage/[slug]/` 자산 준비(없으면 placeholder).
7. lint·build·QA·문서·STATUS 갱신 후 배포.

## 7. 후속 과제

- 공용 API(`/api/landingpage/[slug]/register`) 및 범용 DB 설계 — 별도 승인 필요.
- 신청자 상태·메모·포인트 지급 등 관리 기능 — 별도 설계.

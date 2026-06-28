# PLATFORM_ANALYTICS_ARCHITECTURE — CozyBuilder Platform Analytics 설계 (v1 분석)

> **상태: v1 구현 완료 (commit 3065354) · 운영 적용 진행 중.** 설계 + 구현이 반영된 문서다.
> 운영 적용(0012 SQL 실행 + env 설정)은 코비 승인됨(2026-06-29). v1.1 백로그는 아래 §15.
>
> **관계:** 이 문서는 `PLATFORM_APP_ARCHITECTURE.md`(플랫폼/프로그램 분리 원칙)의 하위 구현 설계다.
> 플랫폼 경계·런처·launch token·RLS·HMAC 패턴은 그 문서를 따르며 같은 사실을 복제하지 않는다.
> SSOT 승격 여부는 코비 검토 후 결정.

---

## 0. 한 문장 요약

**ClipMiner 단독 통계가 아니다.** 모든 프로그램(웹/모바일/데스크톱)이 단일 공용 인제스트 API
(`/api/analytics/track`)로 익명 이벤트를 보내고, 홈페이지가 받아 저장·집계하며, 관리자만 조회하는
**플랫폼 공통 분석 시스템**이다. 기존 게이트(`/apps/[appKey]`)·HMAC(`lib/launch-token.ts`)·
RLS(`is_admin()`) 패턴을 그대로 재사용해 0원 운영·개인정보 최소수집·점진 확장을 모두 만족한다.

---

## 1. 전체 구조

```
[각 프로그램]                  [홈페이지(플랫폼)]              [관리자]
ClipMiner(데스크톱) ─┐
감사일기(모바일)    ─┤  POST   ┌─────────────────────┐
Ebook(웹앱)         ─┼───────▶│ /api/analytics/track │  (서버 전용, service_role)
ShortsFactory(웹앱) ─┤        │  - app_key 검증       │
향후 모든 앱        ─┘        │  - rate limit         │
                              │  - auth_user_hash 계산 │
                              └──────────┬───────────┘
                                         ▼
                              analytics_events (원본, append-only, 90일 보존)
                                         │  (1일 1회 rollup)
                                         ▼
                              analytics_daily_stats (집계, 영구 보존)
                                         ▼
                              /admin/analytics (is_admin() 만 조회)
```

**3대 설계 결정**

1. **이벤트는 anon 키로 테이블에 직접 insert하지 않는다.** 반드시 `/api/analytics/track` API Route 경유.
2. **원본 저장 + 일별 집계 테이블 병행.** Free tier 보호를 위해 대시보드는 사전집계를 읽는다.
3. **개인정보는 익명 UUID + HMAC 해시로만.** 이메일/이름/전화/위치/기기고유번호 미수집.

---

## 2. 웹프로그램 집계 방식 (Ebook, ShortsFactory)

독립 앱은 `*.cozybuilder.co.kr` 서브도메인에서 돌고, 홈페이지는 런처 게이트만 담당한다.
이벤트는 두 지점에서 발생한다.

| 발생 지점 | 잡히는 이벤트 | 전송 방식 |
|---|---|---|
| **홈페이지 런처** `/apps/[appKey]` | `app_launch` (권한 통과·redirect 직전) | 서버에서 직접 insert (이미 서버 컨텍스트, user_id 보유) |
| **독립 앱 내부** | `session_start`, `feature_click`, `export_pdf`, `subscription_*` | 독립 앱 클라이언트 → 홈페이지 `/api/analytics/track` |

- **로그인↔익명 연결:** 웹앱은 launch token으로 진입 → `sub`(user_id)을 안다. 이벤트 전송 시
  `auth_user_hash`(= HMAC(user_id))와 브라우저 `cb_anon_id`(localStorage UUID v4)를 함께 보내
  로그인 전/후를 같은 기기로 연결.
- **iframe 없음.** 현 아키텍처는 iframe 내장 실행 금지 → "iframe 앱 이벤트"는 해당 없음.
- **CORS:** 인제스트 엔드포인트는 `*.cozybuilder.co.kr` Origin 허용(서브도메인 간 호출).
- **1차 신뢰 지표:** 홈페이지가 직접 찍는 `app_launch`(서버가 user_id 확신, 위변조 불가).
  독립 앱 내부 이벤트는 앱 분리 배포 일정에 맞춰 점진 도입.

---

## 3. 모바일앱 집계 방식 (감사일기)

- **식별:** 최초 실행 시 `cb_anon_id`(UUID v4) 생성 → 안전 저장소
  (`expo-secure-store` / `Capacitor Preferences` / Android Keystore).
- **핵심 지표:**
  - 앱 실행 수 = `app_open` 카운트
  - DAU = `event_date` 기준 distinct `anonymous_id`
  - 버전별 사용자 = `app_version`별 distinct `anonymous_id`
- **다운로드 vs 실행:** Play Store 다운로드 수는 앱이 측정 불가(스토어 콘솔에만 존재).
  → 관리자에서 "스토어 다운로드(콘솔/수기 입력)"와 "앱 내부 실행(우리 이벤트)"를 **별도 지표로 분리**.
- **오프라인 큐:** 네트워크 없을 때 로컬(AsyncStorage/SQLite) 큐잉 → 온라인 복귀 시 배치 전송.
  각 이벤트는 발생 시각(`occurred_at`)을 자체 보유, 서버 `created_at`과 분리(지연 전송 정확도 유지).
- **익명 추적:** 로그인 없는 앱도 `anonymous_id`만으로 DAU/리텐션/버전 분포 산출 가능.

---

## 4. 데스크톱 프로그램 집계 방식 (ClipMiner, Electron)

- **식별:** 최초 실행 시 UUID 생성 → `app.getPath('userData')` 하위 파일 또는 SQLite 저장
  (localStorage보다 영속적).
- **다운로드 ≠ 실행 (핵심 구분):**
  - **다운로드**: 홈페이지 다운로드 버튼 클릭 시 홈페이지 서버가 `download` 기록(앱 없이도 측정).
  - **설치 후 첫 실행**: 앱이 `first_run`(1회) + 이후 `app_open` 전송.
  - 둘의 비율 = "다운로드 대비 실제 사용 전환율".
- **오프라인 → 온라인 전송:** 가능. 로컬 큐 + 배치 전송. ClipMiner는 오프라인 사용이 잦아 큐가 특히 중요.
- **버전별 사용자:** 모든 이벤트에 `app_version` 포함 → v0.1.0 / v0.1.1 사용자 수를 distinct anon_id로 산출.

---

## 5. Supabase 테이블 설계 초안

**결론: v1은 2개 테이블이면 충분하다 (`analytics_events` + `analytics_daily_stats`).** 나머지는 뷰 또는 v2.

| 후보 테이블 | v1 채택 | 판정 근거 |
|---|---|---|
| `analytics_events` | ✅ 필수 | 원본 append-only, 모든 분석의 단일 진실 |
| `analytics_daily_stats` | ✅ 필수 | Free tier 보호용 일별 사전집계, 대시보드가 읽음 |
| `analytics_app_versions` | ⚠️ 뷰로 | events에서 `app_version` distinct **뷰**면 충분 |
| `analytics_downloads` | ❌ 불필요 | `event_name='download'`으로 events에 통합 |
| `analytics_sessions` | ❌ v2 | `session_id`로 events에서 파생 가능, 본격 세션 분석은 v2 |

### `analytics_events` 스키마 초안

```sql
create table public.analytics_events (
  id              bigint generated always as identity primary key,
  app_key         text not null,              -- lib/apps.ts 레지스트리와 일치 검증
  platform        text not null,              -- 'web' | 'mobile' | 'desktop'
  app_version     text,
  event_name      text not null,              -- §6 네이밍 규칙
  anonymous_id    text not null,              -- 익명 UUID (PII 아님)
  auth_user_hash  text,                       -- HMAC(user_id) — 원본 user_id 저장 안 함
  session_id      text,
  occurred_at     timestamptz not null,       -- 기기 발생 시각(오프라인 큐 대응)
  created_at      timestamptz not null default now(),  -- 서버 수신 시각
  event_date      date generated always as ((occurred_at at time zone 'Asia/Seoul')::date) stored,
  country         text,                        -- IP→국가 (선택, IP 자체는 저장 안 함)
  metadata        jsonb default '{}'::jsonb    -- 이벤트별 가변 필드
);
create index on public.analytics_events (app_key, event_date);
create index on public.analytics_events (event_date, anonymous_id);
```

### 설계 포인트 답변

- **원본만 vs 집계 별도:** **별도 둔다.** 대시보드가 매번 raw full-scan하면 Free tier에서 느림/부담.
  일 1회 rollup으로 `daily_stats` 갱신.
- **비용/성능:** 원본 무한 증가 → **보존 정책 필수.** raw 90일 경과분 삭제, 집계는 영구 보존.
  `user_agent` 풀 문자열 저장 금지(platform/version만 파싱) → 용량·PII 동시 절감.
- **`auth_user_hash`:** `user_id` 원본 저장 금지 → HMAC만. (§8)

### `analytics_daily_stats` 초안

복합키 `(event_date, app_key, platform, app_version, event_name)` + `event_count`,
`unique_users`(distinct anon_id). 신규/재방문은 anon_id 최초 출현일 비교로 산출.

---

## 6. 이벤트 네이밍 규칙

- **형식:** `snake_case`, 전부 소문자, 동사_명사.
- **공통 이벤트:** `app_open`, `app_close`, `session_start`, `session_end`, `download`(홈페이지),
  `install`/`first_run`(앱), `update_check`, `feature_click`, `export_pdf`, `export_docx`,
  `save_project`, `create_project`, `subscription_start`, `subscription_cancel`.
  광고(v2): `ad_impression`, `ad_click`.
- **공통 필드(채택):** `app_key`, `platform`, `app_version`, `event_name`, `anonymous_id`,
  `auth_user_hash`, `session_id`, `occurred_at`, `metadata`.
- **초안 대비 조정:**
  - `id` → DB 자동 생성(클라이언트 전송 불필요). 멱등용 `event_uuid`는 v2.
  - `event_date` → 클라이언트가 보내지 말고 서버가 `occurred_at`에서 파생(조작 방지).
  - `user_agent` → 풀 문자열 저장 비권장, platform/version만 추출.
  - `country` → 저장 가능. 단 **IP 저장 금지**, 서버에서 IP→국가 변환 후 IP 폐기.
  - 가변 정보(어떤 기능/포맷)는 전부 `metadata` jsonb로. 이벤트마다 컬럼 추가 금지.

---

## 7. 관리자페이지 UI 구조

기존 admin 메뉴(ADMIN / Programs / Product / Marketing)에 **Analytics** 추가.

| 화면 | v1 | 카드/그래프 |
|---|---|---|
| **Overview** | ✅ | KPI 4카드(누적/오늘/7일/30일 활성) + 일별 활성 라인차트 + 신규vs재방문 + 최근 기능 순위 |
| **Programs (Compare)** | ✅ | 프로그램별 사용자/실행/다운로드 표 + 막대 비교 |
| **App Versions** | ⚠️ 간단 | 프로그램×버전 사용자 수 표(뷰 기반) |
| **Downloads** | ⚠️ 간단 | 프로그램별 다운로드 수 vs 실행자 수 분리 표 |
| **Events** | ❌ v2 | 원본 이벤트 탐색/필터(디버그용) |
| **Ads** | ❌ v2 | CTR·노출·수익 |

차트는 외부 의존 최소화(Recharts 또는 SVG). 라이브러리 선택은 구현 단계에서 확정.

---

## 8. 개인정보 / 보안 고려사항 (최우선)

### A. 식별자 정책

- **Supabase `user_id` 그대로 사용 → ❌ 금지.** 관리자 통계 raw user_id 노출 원칙 위반.
- **별도 매핑 테이블 → 불필요.** `auth_user_hash = HMAC-SHA256(user_id, ANALYTICS_SALT)` 사용.
  단방향 역추적 불가, 동일 사용자는 항상 같은 해시 → 집계 가능. `lib/launch-token.ts` HMAC 계열 재사용.
- **비로그인 anon UUID:** 웹=localStorage, 모바일=secure-store, 데스크톱=userData 파일. UUID v4(난수).
- **앱 삭제·재설치 시 신규로 잡히는 문제:** 익명 추적의 구조적 한계.
  로그인 앱은 `auth_user_hash`로 동일인 식별되어 영향 적음. 비로그인 앱(감사일기)은 재설치 시 신규 집계
  → 지표 정의에 "기기 기준 추정치" 명시. 광고 ID/기기 지문 같은 침습적 보정은 **하지 않음**.

### B. RLS / 접근 제어

- `analytics_events`, `analytics_daily_stats`: RLS 활성 + select는 `is_admin()`만(0002 헬퍼·0004 패턴).
- **anon 키 직접 insert 절대 금지.** insert 정책 없음 → anon으로 못 씀.
- **insert는 오직 `/api/analytics/track`이 service_role로 수행.** 클라이언트는 API만 호출.
  - 웹/데스크톱 클라이언트의 "키"는 진짜 비밀이 될 수 없음 → 인제스트는 준공개로 간주,
    방어를 API 계층에 둠: `app_key` 화이트리스트(`lib/apps.ts`), Origin 검증, anon_id/IP rate limit,
    비정상 payload 차단.
- `ANALYTICS_SALT`/인제스트 시크릿은 **서버 전용**(절대 `NEXT_PUBLIC_` 금지) — launch-token 규칙과 동일.

### C. 개인정보처리방침 추가 항목(권고)

서비스 개선용 익명 사용 통계 수집(앱 실행/기능 사용/버전), 개인 식별정보
(이메일·이름·전화·위치·기기고유번호) 미수집, 익명 식별자 사용, 보관 기간(원본 90일/집계 익명 영구),
제3자 미제공 명시. 플랫폼 차원 1건 추가(전자책 분리 원칙과 별개).

---

## 9. 다운로드 수 집계

- **다운로드 ≠ 실행.** 홈페이지 다운로드 버튼 클릭 시 서버가 `download` 기록(앱 없이도 측정).
- **완료 여부:** 버튼 클릭(=의도)은 100% 측정, 파일 다운로드 "완료"는 브라우저가 안 알려줘 정확 측정 불가
  → "다운로드 시작 수"로 정의.
- **링크 종류별:** Supabase Storage/Vercel는 우리 서버 경유라 측정 쉬움. 외부 링크(GitHub Releases 등)는
  가능하면 우리 라우트(`/download/[appKey]`) 경유 후 redirect시켜 일괄 계측.
- **중복:** 같은 anon_id/IP 단시간 반복은 rate limit 1회 처리(또는 집계 시 distinct).
- **표기:** "다운로드 수"와 "실제 실행자 수(first_run/app_open distinct)"를 나란히 별도 컬럼 → 전환율 가시화.

---

## 10. 버전별 사용자 수

- 모든 이벤트에 `app_version` 포함 → `(app_key, app_version)`별 distinct `anonymous_id` = 버전 사용자 수.
- ClipMiner v0.1.0/v0.1.1, 감사일기 v1.8.0, 전자책 웹앱 모두 동일 공식.
- **최신 버전 판단:** `lib/apps.ts`에 앱별 `latestVersion` 메타를 두고 비교(레지스트리가 단일 진실).
  또는 최근 30일 최다 관측 버전.
- **활용:** 구버전 비율 높으면 업데이트 안내/강제 업데이트 판단 근거. 실제 강제 업데이트 로직은
  각 앱 책임 — 플랫폼은 지표만 제공.

---

## 11. 광고 확장성 (v2)

- **구조:** 광고도 `analytics_events`의 한 이벤트 타입(`ad_impression`/`ad_click`)으로 흡수.
- **공급자 독립성:** `metadata`에 `{provider, ad_placement, ad_unit, estimated_revenue}` →
  공급자 교체에도 스키마 불변.
- **지표:** CTR = click/impression, 프로그램별 성과 = `app_key`별 집계, ARPU = revenue/unique_users.
- **광고 증설 판단:** 사용량(DAU·실행수) 임계 이상 + 리텐션 안정 시 노출 확대 — Overview에서 함께 비교.

---

## 12. v1 범위 (승인 후 구현)

1. `analytics_events` + `analytics_daily_stats` 테이블 (마이그레이션 `0012`).
2. `/api/analytics/track` 인제스트 API Route (검증·해시·service_role insert).
3. 일별 rollup + 90일 보존.
4. 홈페이지 자체 계측 2종: `app_launch`(런처) + `download`(다운로드 버튼) → **앱 수정 0으로 첫 지표**.
5. `/admin/analytics` Overview + Programs.
6. 공용 클라이언트 SDK 스니펫(anon_id 생성 + 큐 + POST).

## 13. v2 이후 범위

- 광고 지표, `analytics_sessions` 전용 테이블, 세션 길이/이탈, 이벤트 멱등성(`event_uuid`),
  리텐션 코호트/퍼널, 유료/무료 비교·ARPU, Admin Events 탐색기, 스토어 콘솔 다운로드 자동 동기화.

## 15. v1.1 최우선 백로그 (2026-06-29 코비 승인 등록)

> v1 운영 적용 시 인정·수용한 한계. v1.1에서 우선 해소한다.

1. **daily_stats rollup** — 현재 `analytics_daily_stats`는 비어 있고 대시보드는 `analytics_events`
   원본을 RPC로 실시간 집계한다. v1.1에서 일 1회 rollup(cron/Edge Function 또는 pg_cron) +
   PK 기준 upsert(중복 집계 방지) + 90일 원본 보존 정책을 구현한다.
2. **anonymous_id 통합 전략** — 현재 `app_launch`=`auth_user_hash`, `download`=device UUID 로
   식별자 체계가 이원화되어 동일인이 두 체계로 분리 집계될 수 있다. v1.1에서 로그인 사용자의
   device UUID ↔ auth_user_hash 매핑/병합 규칙을 정해 distinct 사용자 과대집계를 제거한다.
3. **download 라벨 정리** — v1.1에서 "스토어 클릭 / 다운로드 클릭 / (가능 시) 설치 추정"을
   명확히 구분하는 지표·UX 정리. (v1에서는 관리자 표 헤더를 "다운로드 클릭"으로 1차 표기.)
4. **ClipMiner 다운로드 계측** — 데스크톱 전용 다운로드 경로(`/download/[appKey]` 라우트 등)로
   다운로드 시작을 서버 측 계측. (v1은 모바일 스토어 CTA 클릭만 계측.)
5. **감사일기 내부 SDK** — 모바일 앱 내부 이벤트(`app_open`/DAU/버전) 전송용 경량 SDK
   (anon UUID secure-store + 오프라인 큐 + 배치 전송) 도입.

---

## 14. 추천 구현 순서

> 원칙: **앱을 안 건드려도 첫 지표가 나오게 → 점진 확장.**

1. **STEP 0** — 이 문서 승인(스키마·이벤트명·개인정보 방향 확정).
2. **STEP 1 — DB:** 마이그레이션 `0012` (RLS: admin select, anon insert 금지, 보존 90일).
3. **STEP 2 — 인제스트:** `/api/analytics/track` + `ANALYTICS_SALT`/시크릿 env.
4. **STEP 3 — 무앱수정 지표:** 런처 `app_launch` + 다운로드 라우트 `download` 계측. → 대시보드에 숫자 등장.
5. **STEP 4 — 관리자 화면:** `/admin/analytics` Overview + Programs, rollup cron.
6. **STEP 5 — 공용 SDK:** 감사일기 → ClipMiner → Ebook → ShortsFactory 순 채택.
7. **STEP 6 — 정교화:** 버전 뷰, 다운로드 vs 실행 전환율.
8. **STEP 7 (v2):** 광고·세션·코호트.

**최우선 가치: STEP 1~4** (DB + API + 홈페이지 자체 계측 + 대시보드). 앱 4종 미수정으로 즉시 지표 산출.

---

## 부록 — 기존 코드베이스 재사용 매핑

| 새 설계 요소 | 재사용할 기존 자산 |
|---|---|
| `app_key` 검증 | `lib/apps.ts` (`APP_DEFINITIONS`, `getApp`) |
| HMAC 해시/시크릿 패턴 | `lib/launch-token.ts` (HS256, 서버 전용 시크릿) |
| RLS admin-only 조회 | `is_admin()` (0002), `user_app_subscriptions` 정책(0004) |
| 관리자 진입 가드 | `lib/admin.ts` `requireAdmin()`, `app/admin/layout.tsx` |
| 런처 계측 지점 | `app/apps/[appKey]/page.tsx` (`app_launch`) |
| 마이그레이션 컨벤션 | `supabase/migrations/*.sql` (다음 번호 `0012`) |

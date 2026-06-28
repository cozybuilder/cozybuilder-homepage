# PLATFORM_APP_ARCHITECTURE — 플랫폼 / 프로그램 분리 (Homepage 구현)

> **정책 SSOT는 cozybuilder-ops의 `PROGRAM_INTEGRATION.md`다.**
> (Homepage↔독립 프로그램 경계의 상위 정책은 그 문서가 단독 소유한다.)
> 이 문서는 그 정책의 **Homepage 측 구현 상세**를 소유한다 — `/apps/[appKey]` 런처 게이트,
> launch token(HS256) 발급·검증, `user_app_subscriptions`/`canAccessApp` 권한 판정, app_key 레지스트리 등.
> 정책 변경은 ops 문서에서, 구현 변경은 이 문서에서. 같은 사실을 양쪽에 복제하지 않는다.

## 핵심 원칙 (한 문장)

**CozyBuilder Homepage는 모든 프로그램을 흡수하는 저장소가 아니다.**
Homepage는 **플랫폼(앱스토어/런처)**이고, 각 Program은 **독립 웹앱**이다.
Homepage는 프로그램을 발견·구독·실행시키되, **프로그램 엔진은 절대 소유하지 않는다.**

비유: Homepage는 **집**, 각 Program은 **집 안에 들어오는 독립된 방**.
방을 새로 설계하지 않는다 — 기존 방을 집 안으로 **이식(porting)**할 뿐이다.
더 정확히는, Homepage는 **앱스토어/런처**이고 각 프로그램은 자체 도메인에서 도는 독립 앱이다.

---

## 1. Homepage = 플랫폼

CozyBuilder Homepage(`cozybuilder-homepage`, 이 저장소)의 책임:

- 회원가입 / 로그인
- 무료 구독
- 권한 / 앱 접근 제어
- Profile
- Dashboard
- Programs CMS
- `/apps/[appKey]` — 프로그램 실행 진입점(게이트)

Homepage는 **플랫폼/권한/진입점만** 담당한다. 그 이상을 흡수하지 않는다.

## 2. Program = 독립 제품

각 Program은 별도 저장소 또는 별도 패키지로 유지되는 독립 제품이다:

- Ebook Publishing System (`ebook-publishing-system`)
- ShortsFactory
- ClipMiner
- Gratitude Diary
- 향후 모든 웹앱

Program의 **핵심 엔진**(조립/변환/출력 등)은 독립 프로젝트 또는 별도 패키지로 유지한다.
**프로그램별 독립 저장소 + 독립 배포를 기본 원칙으로 한다.**

---

## 3. 최종 구조 — 앱스토어/런처 + 독립 앱(서브도메인)

Homepage는 앱스토어/런처, 각 프로그램은 자체 서브도메인에서 도는 독립 배포 앱이다.

| 도메인 | 역할 |
| --- | --- |
| `cozybuilder.co.kr` | **플랫폼**(회원/로그인/무료구독/권한/Dashboard/Programs CMS/런처) |
| `ebook.cozybuilder.co.kr` | Ebook Publishing System (독립 앱) |
| `shortsfactory.cozybuilder.co.kr` | ShortsFactory (독립 앱) |
| `clipminer.cozybuilder.co.kr` | ClipMiner (독립 앱) |

- 각 프로그램은 **독립 저장소 / 독립 배포**로 유지된다(플랫폼 배포와 분리).
- Homepage는 이 독립 앱들을 **발견·구독·실행(launch)**시키는 게이트만 담당한다.
- 즉 Homepage 저장소 안에 프로그램 엔진/소스를 흡수하지 않는다.

---

## 규칙 (조항)

1. **Homepage와 각 Program은 분리한다.** 하나로 보지 않는다.
2. **Homepage는 플랫폼/권한/진입점(런처)만 담당한다.**
3. **Program의 핵심 엔진은 독립 프로젝트 또는 별도 패키지로 유지한다.**
4. **Homepage는 프로그램 엔진을 소유하지 않는다.** Homepage 안에 각 프로그램 엔진 전체를 흡수하지 않는다.
5. **프로그램별 독립 저장소 / 독립 배포를 기본 원칙으로 한다.**
6. **`/apps/[appKey]`는 권한 가드 + launch token 발급 + 독립 앱 redirect 게이트**다.
7. **홈페이지는 독립 앱을 iframe 으로 내장 실행하지 않는다.** 권한 통과 후 독립 앱 도메인으로 보낸다.
8. **독립 앱(예: `ebook.cozybuilder.co.kr`)은 자체 저장소/도메인에서 실행되며, 기능/데이터/출력 UI 를 소유한다.**
9. **권한 전달은 절대 `?allowed=true` 같은 단순 파라미터로 하지 않는다.**
10. **권한 전달은 단명 signed launch token(HS256) — 독립 앱이 자체 `/api/verify-launch` 로 서버 검증한다.**
11. **권한 판정의 단일 진실은 플랫폼(`user_app_subscriptions` + `canAccessApp`)이다.** 독립 앱은 검증만 한다.
12. **직접 URL 접근(토큰 없음/위조/만료)은 독립 앱이 차단한다.**

---

## `/apps/[appKey]`의 역할 (런처 게이트)

`/apps/[appKey]`(`app/apps/[appKey]/page.tsx`)는 **모든 웹앱 공통 런처 게이트**다. ebook 전용
라우트는 없다 — 같은 게이트가 `appKey` 로 분기한다. 매 요청 다음 순서로 동작한다:

1. **로그인 확인** — 미로그인 시 `/login?next=/apps/[appKey]` (`requireAppAccess` 내부).
2. **무료 구독 / 권한 확인** — `requireAppAccess(appKey)`. 미구독 시 `/programs/[slug]` 로.
3. **launch token 발급** — 권한 통과 사용자에게 단명(90초) signed token 발급(`signLaunchToken`).
4. **독립 앱으로 redirect** — `getAppLaunchUrl(appKey)` 로 해석한 도메인으로
   `https://<app>.cozybuilder.co.kr/?launch_token=<token>` 이동. **iframe 내장 실행 없음.**

독립 배포 전(앱에 `launchUrl` 없음)인 경우에만 "준비 중" 플레이스홀더를 보여준다.
Homepage는 게이트(1~2)와 진입 트리거(3~4)까지만 책임진다. 기능/데이터/출력은 독립 앱의 책임.

런치 URL 해석: `getAppLaunchUrl(key)` = env `\<KEY\>_APP_URL`(스테이징 오버라이드) → 정의의 `launchUrl`.
사용자에게 `*.vercel.app` 임시 주소는 노출하지 않는다(정식 도메인 사용).

---

## launch token (권한 전달 — 구현됨)

플랫폼이 독립 앱에 "이 사용자는 접근 권한이 있다"를 전달하는 방식:

- ❌ **금지:** `?allowed=true` 같은 단순 쿼리. (위조·우회 자명)
- ✅ **사용:** 단명 **signed launch token (HS256/HMAC-SHA256)**.
  - 발급: 홈페이지 `lib/launch-token.ts` `signLaunchToken(sub, appKey)`.
    payload `{ sub, app_key, iat, exp(iat+90s), jti }`. 시크릿 `LAUNCH_TOKEN_SECRET`(**서버 전용**, NEXT_PUBLIC 금지).
  - 검증: 독립 앱의 **자체 serverless** `/api/verify-launch` 가 동일 시크릿으로 서명·`exp`·`iat`·`app_key` 검증.
    토큰 없음/위조/만료 → 앱이 차단 화면. (jti 재사용 차단은 v2 확장 지점)
- 권한 판정의 **단일 진실은 플랫폼**(`user_app_subscriptions` + `canAccessApp`). 독립 앱은 토큰을 **검증**만 한다.
- 홈페이지는 토큰을 발급할 뿐 독립 앱 엔진/데이터를 소유하지 않는다.

---

## 현재 상태: Ebook (독립 분리 완료)

- **Ebook Publishing System = 독립 앱.** `ebook.cozybuilder.co.kr`(저장소 `ebookPublishingSystem`)에서 실행.
  엔진/원고/이미지/PDF·DOCX·EPUB 출력 UI 전부 독립 앱 소유.
- 홈페이지 책임은 **진입점만**: Programs 전자책 카드 / 상세 / 무료구독·취소 /
  `/apps/[appKey]` 게이트(권한 → launch token → redirect).
- **제거됨(구버전 내장 실행 잔재):** `public/apps/ebook/`(studio.html·engine.bundle.js·home-hero.png),
  `app/apps/ebook/page.tsx`(전용 iframe 라우트), `components/AppFrame.tsx`(고아 실행창).
  → 내장형 마지막 정상본은 태그 `ebook-inhouse-last` 로 보존.
- 즉, **Homepage does not own the Ebook engine.** 홈페이지는 발견·구독·실행(launch)만 한다.

---

## Programs Admin 스키마 — Web / Mobile 링크 구조

Programs 관리자(`/admin/programs`)가 컴퓨터 웹앱과 모바일앱(스토어 배포)을 **공통 구조**로
등록한다. 모바일앱(예: 감사일기, Gratitude Diary)도 홈페이지 Programs 에 올릴 수 있다.

- **플랫폼 구분은 기존 `type` 컬럼(`web` | `mobile`)을 그대로 사용한다.** (별도 `platform_type` 신설 안 함 — 하위 호환)
- **Web App** — 실행 URL은 기존 `app_url` 사용. 있으면 "실행하기", 없으면 "준비 중".
  (별칭 `web_url` 을 새로 만들지 않는다. `app_url` 이 그 역할.)
- **Mobile App** — 스토어 링크 2개 컬럼만 사용:
  - `play_store_url text` (Google Play)
  - `app_store_url text` (App Store, 선택)

### Release Model v3 — 스토어 URL 존재로 출시 상태 추론 (2026-06)

**설계 근거.** v2 는 `release_status`(development/coming_soon/released) 단일 enum 으로 출시 상태를
표현했으나, **Android 출시 완료 + iOS 미출시** 같은 플랫폼별 상이한 상태를 표현하지 못했다.
또한 단일 상태값과 실제 스토어 URL 유무가 **이중 진실(two sources of truth)**이 되어 불일치 위험이 있었다.
→ v3 는 `release_status` 를 **제거**하고, **스토어 URL의 존재 여부 자체를 출시 상태의 단일 진실**로 삼는다.

- `play_store_url` 있음 = **Android 출시됨**.
- `app_store_url` 있음 = **iOS 출시됨**.
- 별도 상태 컬럼 없음 → 관리자가 출시 시 스토어 URL만 채우면 끝(상태 동기화 불필요).

**표시 규칙 (상세/카드 공통):**

| play_store_url | app_store_url | 표시 |
| --- | --- | --- |
| 없음 | 없음 | "출시 준비 중" (비활성) |
| 있음 | 없음 | "Google Play에서 받기" 버튼 + "iOS 출시 예정" 보조 문구 |
| 없음 | 있음 | "App Store에서 받기" 버튼 |
| 있음 | 있음 | 두 버튼 모두 표시 |

**감사일기 등록 형태**: `type=mobile`, `play_store_url=Google Play 링크`, `app_store_url=빈 값`
→ 상세에서 Google Play 버튼 + "iOS 출시 예정" 보조 문구 노출. 향후 iOS 출시 시 `app_store_url` 만 채우면 됨.

### 운영 적용 (마이그레이션)

- `supabase/migrations/0011_program_release_by_store_url.sql` (idempotent):
  - `play_store_url` / `app_store_url` 컬럼을 보장(`add column if not exists`) — 0010 미적용 환경도 커버.
  - `release_status` 컬럼 + CHECK 제약을 **제거**(`drop ... if exists`).
- **0010 은 dead 처리.** (운영 DB에 적용된 적 없음 — 아래 근본원인 참조. 0011 이 상위 집합.)

### 근본원인 기록 — "출시 상태 변경이 반영되지 않음" (해결됨)

- 증상: 관리자에서 모바일 출시 상태/스토어 링크를 저장해도 공개 화면에 반영되지 않음.
- 조사: anon 키로 운영 `programs` 테이블 컬럼 probe →
  `release_status` / `play_store_url` / `app_store_url` 모두 `42703 column does not exist`.
- **확정 원인: 마이그레이션 0010 이 운영 Supabase 에 적용되지 않았다.**
  → `saveProgram` 의 컬럼-부재 폴백이 모바일 필드를 **조용히 제외**하고 저장(값 유실),
  `rowToProgram` 은 미존재 값을 읽어 출시 상태가 항상 기본값으로 표시됨.
- 해결: 0011 적용으로 스토어 URL 컬럼이 실제 생성되어야 모바일 링크가 저장·표시된다.
  코드 배포만으로는 컬럼이 생기지 않는다 — **0011 적용이 필수 후속 작업.**

---

## 판정 기준 (의사결정 시 참고)

새 기능/코드를 Homepage에 넣기 전 자문한다:

> "이것은 **플랫폼(권한/진입점)**의 일인가, 아니면 **Program 엔진**의 일인가?"

- 플랫폼의 일 → Homepage에 둔다.
- Program 엔진의 일 → 독립 프로젝트/패키지에 두고, Homepage는 게이트로만 연결한다.

확신이 서지 않으면 흡수하지 말고 **분리 쪽**을 택한다.

# PLATFORM_APP_ARCHITECTURE — 플랫폼 / 프로그램 분리 원칙

> CozyBuilder Homepage(플랫폼)와 각 Program(독립 제품)의 경계를 규정한다.
> 이 문서는 "어디까지가 Homepage의 책임이고, 어디부터가 Program의 책임인가"의 **권위 기준**이다.

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
6. **`/apps/[appKey]`는 권한 가드 + 실행 셸 / 연결 게이트 역할**이다.
7. **AppFrame은 독립 앱을 보여주는 공통 실행창이다.**
8. **현재 `/apps/ebook`의 `studio.html`은 임시 UX Shell이다.**
9. **장기적으로 iframe `src`는 `ebook.cozybuilder.co.kr` 같은 독립 앱 URL로 교체 가능해야 한다.**
10. **Ebook engine / PDF / DOCX / EPUB / Puppeteer / Chrome / local FS 는 아직 연결하지 않았다.**
11. **권한 전달은 절대 `?allowed=true` 같은 단순 파라미터로 하지 않는다.**
12. **권한 전달은 launch token / signed token / Supabase session 검증 중 하나로 설계한다.**
13. **엔진 연결(독립 앱 URL 연결 포함) 전 반드시 별도 설계한다.**

---

## `/apps/[appKey]`의 역할 (실행 게이트 4단계)

`/apps/[appKey]`는 독립 앱을 실행시키는 **런처 게이트**다. 매 요청 다음 순서로 동작한다:

1. **로그인 확인** — 미로그인 시 `/login` 으로.
2. **무료 구독 / 권한 확인** — `requireAppAccess(appKey)` (미통과 시 `/subscribe`).
3. **AppFrame 표시** — 플랫폼 공통 실행창을 띄운다.
4. **독립 앱 실행** — iframe 또는 launch 방식으로 해당 프로그램을 실행/연결한다.

Homepage는 게이트(1~3)와 "실행 트리거"(4)까지만 책임진다.
게이트 너머의 엔진 동작은 Program(독립 앱)의 책임이다.

---

## AppFrame — 공통 실행창

`components/AppFrame.tsx` 는 **모든 웹프로그램이 공유하는 실행창**이다.

- 떠 있는 글래스 앱 윈도우 + 상단 앱바(뒤로 / 아이콘·이름·설명 / 상태 배지 · 홈으로).
- 내부에 독립 앱을 **iframe `src`** 로 띄운다. (CSS/JS 격리 → 앱 고유 톤 유지)
- 좁은 화면(<768px)에서는 앱 실행 대신 "데스크톱 권장" 안내를 표시(실행 표면만 제한, 구독/권한 무관).
- AppFrame은 "어떤 앱이냐"와 무관한 **공통 껍데기**다. 앱 고유 로직을 넣지 않는다.

향후 ShortsFactory · ClipMiner · Movie Maker 등 모든 독립 앱이 같은 AppFrame으로 실행된다.

---

## 권한 전달(보안) 설계 원칙 — 엔진/독립 앱 연결 전 필독

플랫폼이 독립 앱에 "이 사용자는 접근 권한이 있다"를 전달할 때:

- ❌ **절대 금지:** `?allowed=true` 같은 단순 쿼리 파라미터. (위조·우회 자명)
- ✅ **다음 중 하나로 설계한다:**
  - **launch token** — 플랫폼이 발급한 일회성/단기 토큰을 앱이 플랫폼에 검증.
  - **signed token** — 서명된 토큰(JWT 등)을 앱이 공개키/시크릿으로 검증.
  - **Supabase session** — 공유 세션(같은 도메인 쿠키 또는 세션 전달)으로 앱이 직접 사용자/구독 확인.
- 권한 판정의 **단일 진실은 여전히 플랫폼(`user_app_subscriptions` + `canAccessApp`)**.
  독립 앱은 그 판정을 신뢰 가능한 방식으로 **검증**할 뿐, 자체적으로 권한을 만들어내지 않는다.
- **엔진 연결(독립 앱 URL 연결 포함) 전 이 토큰/세션 설계를 반드시 별도로 먼저 한다.**

---

## 현재 상태: `/apps/ebook`

- **상태: UX shell only. Engine NOT connected.**
- `app/apps/ebook/page.tsx` = `requireAppAccess("ebook")` 가드 + `AppFrame`(iframe) 실행창.
- 셸 = `public/apps/ebook/studio.html` — **임시 UX Shell**이다.
  원본 Ebook Publishing System GUI(`gui/index.html`)의 Hero Home + 9단계 Wizard를
  원본 톤(paper/navy) 그대로 이식한 것. CSS/JS는 iframe으로 격리.
- 원본 권위 소스: `C:\projects\ebookPublishingSystem\gui\index.html` (별도 저장소).
- **장기 방향:** 이 iframe `src`(현재 `/apps/ebook/studio.html`, 같은 오리진 임시 셸)는
  **`ebook.cozybuilder.co.kr` 같은 독립 앱 URL로 교체 가능**해야 한다.
  AppFrame은 그대로 두고 `src`만 독립 앱으로 바꾸는 형태가 목표.
- **미연결(연결 전 별도 설계):** 출력 엔진, PDF / DOCX / EPUB, Puppeteer, Chrome 의존, 로컬 파일 시스템,
  그리고 위 "권한 전달(보안) 설계 원칙"의 launch/signed token 또는 Supabase session 검증.
- 즉, **Homepage does not own the Ebook engine.** 이번까지의 작업은 최종 Ebook 웹앱 완성이 아니라
  데스크톱 UX를 임시 셸로 이식하고 공통 실행창(AppFrame)에 얹은 단계다.

---

## 판정 기준 (의사결정 시 참고)

새 기능/코드를 Homepage에 넣기 전 자문한다:

> "이것은 **플랫폼(권한/진입점)**의 일인가, 아니면 **Program 엔진**의 일인가?"

- 플랫폼의 일 → Homepage에 둔다.
- Program 엔진의 일 → 독립 프로젝트/패키지에 두고, Homepage는 게이트로만 연결한다.

확신이 서지 않으면 흡수하지 말고 **분리 쪽**을 택한다.

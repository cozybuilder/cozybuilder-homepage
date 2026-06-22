# PLATFORM_APP_ARCHITECTURE — 플랫폼 / 프로그램 분리 원칙

> CozyBuilder Homepage(플랫폼)와 각 Program(독립 제품)의 경계를 규정한다.
> 이 문서는 "어디까지가 Homepage의 책임이고, 어디부터가 Program의 책임인가"의 **권위 기준**이다.

## 핵심 원칙 (한 문장)

**CozyBuilder Homepage는 모든 프로그램을 흡수하는 저장소가 아니다.**
Homepage는 **플랫폼**이고, 각 Program은 **독립 제품**이다.
Homepage는 회원·권한·진입점만 담당하고, Program의 엔진은 흡수하지 않는다.

비유: Homepage는 **집**, 각 Program은 **집 안에 들어오는 독립된 방**.
방을 새로 설계하지 않는다 — 기존 방을 집 안으로 **이식(porting)**할 뿐이다.

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

---

## 규칙 (8개 조항)

1. **Homepage와 각 Program은 분리한다.** 하나로 보지 않는다.
2. **Homepage는 플랫폼/권한/진입점만 담당한다.**
3. **Program의 핵심 엔진은 독립 프로젝트 또는 별도 패키지로 유지한다.**
4. **Homepage 안에 각 프로그램 엔진 전체를 흡수하지 않는다.**
5. **`/apps/[appKey]`는 권한 가드 + 실행 셸 / 연결 게이트 역할**이다.
6. **현재 `/apps/ebook`은 UX shell only 상태다.**
7. **Ebook engine / PDF / DOCX / EPUB / Puppeteer / Chrome / local FS 는 아직 연결하지 않았다.**
8. **향후 엔진 연결 전 반드시 별도 설계한다.**

---

## `/apps/[appKey]`의 역할

`/apps/[appKey]`는 다음 두 가지 중 하나다:

- **권한 가드**: `requireAppAccess(appKey)` — 로그인 + 무료 구독 검증(매 요청 서버 측).
- **실행 셸 / 연결 게이트**: 검증 통과 후 해당 Program의 UI 셸을 띄우거나, 외부/독립 엔진으로 연결.

Homepage는 게이트까지만 책임진다. 게이트 너머의 엔진 동작은 Program의 책임이다.

---

## 현재 상태: `/apps/ebook`

- **상태: UX shell only. Engine NOT connected.**
- `app/apps/ebook/page.tsx` = `requireAppAccess("ebook")` 가드 + 풀블리드 `<iframe>`.
- 셸 = `public/apps/ebook/studio.html` — 원본 Ebook Publishing System GUI(`gui/index.html`)의
  Hero Home + 9단계 Wizard를 원본 톤(paper/navy) 그대로 이식. CSS/JS는 iframe으로 격리.
- 원본 권위 소스: `C:\projects\ebookPublishingSystem\gui\index.html` (별도 저장소).
- **미연결(다음 Phase에서 별도 설계):** 출력 엔진, PDF / DOCX / EPUB, Puppeteer, Chrome 의존, 로컬 파일 시스템.
- 즉, **Homepage does not own the Ebook engine.** 이번 작업은 최종 Ebook 웹앱 완성이 아니라
  데스크톱 UX를 Homepage 안으로 이식한 단계다.

---

## 판정 기준 (의사결정 시 참고)

새 기능/코드를 Homepage에 넣기 전 자문한다:

> "이것은 **플랫폼(권한/진입점)**의 일인가, 아니면 **Program 엔진**의 일인가?"

- 플랫폼의 일 → Homepage에 둔다.
- Program 엔진의 일 → 독립 프로젝트/패키지에 두고, Homepage는 게이트로만 연결한다.

확신이 서지 않으면 흡수하지 말고 **분리 쪽**을 택한다.

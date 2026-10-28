# 코지임대(CozyRent) 출시 전 사전신청 랜딩페이지

> 코지임대 사전신청 랜딩페이지의 **홈페이지 측 SSOT**.
> 혜택 정책의 원본은 `cozyrent/docs/SUBSCRIPTION.md` §9.1(`D-184`), 홍보 문구의 원본은 `cozyrent/docs/MARKETING.md` §8이 소유한다.
> 이 문서는 홈페이지 구현(URL·폼·저장 구조·동의·검증 범위)만 소유한다.

## 1. 목적

- 유튜브 광고·네이버 블로그·SNS에서 사용할 코지임대 **출시 전 사전신청 착지 페이지**.
- 방문자가 10초 안에 이해해야 할 것: 어떤 앱인지 / 누구를 위한 앱인지 / 사전신청 혜택 / 신청 위치.
- 범위: **랜딩페이지 + 사전신청 수집까지만.** 로그인·결제·추천인 기능은 범위 밖.

## 2. URL

- 공식 경로: `/landingpage/cozyrent` (공용 랜딩 구조 — [LANDINGPAGE_PLATFORM.md](LANDINGPAGE_PLATFORM.md))
- 공식 공개 URL: `https://cozybuilder.co.kr/landingpage/cozyrent`
- 기존 URL `/cozyrent` 는 공식 경로로 308 redirect (query 유지 — 광고·공유 링크 호환)
- 유입 출처: `?src=<출처>` query parameter (예: `?src=youtube`, `?src=naver_blog`).
  - 허용 형식 `^[a-z0-9_-]{1,40}$`. 형식 불일치·미지정 시 기본값 `landing_cozyrent`.

## 3. 확정 문구·정책 (요약 — 원본은 cozyrent 문서)

- 제품: 코지임대 — 원룸·다가구·상가주택 개인 임대인을 위한 임대·건물관리 앱. Android 우선 개발 중. **정식 출시 전.**
- 혜택: 출시 전 **사전신청자 30일 무료 이용** + 일반 신규 가입 시 **7일 무료체험**(둘 다 카드 등록 없음·자동결제 없음).
  - **서로 다른 혜택이며 기간을 합산하지 않는다** — 무료 이용은 지급 즉시 기간이 시작되고 이미 시작된 체험 시계를 멈추지 않는다(`cozyrent` `D-156`·`D-184`).
  - 적용은 **정식 출시 후 가입 계정 확인 뒤 운영자가 적용**한다. 랜딩에서 **자동 지급이라고 쓰지 않는다.**
- 적용 조건·회수 규칙 등 정책 상세는 `cozyrent/docs/SUBSCRIPTION.md` §9.1이 소유. 세부 조건은 정식 출시 시 안내.
- 금지 표현: 첫 달 무료 / 자동결제 / 구독료 자동 차감 / 현금처럼 사용 / 세금 자동신고 / 세무·법률 대행 / 수익 보장 / 이미 출시된 것처럼 보이는 표현 / **사전신청 `6,900P`(폐기)** / **`총 37일`·`7일 + 추가 30일` 같은 합산 표현**.

## 4. 사전신청 폼 필드

| 필드 | 필수 | 형식 | 저장 컬럼 |
|------|------|------|-----------|
| 이름 또는 닉네임 | ✅ | 1~40자 | `name` |
| 연락 수단 | ✅ | `phone` / `email` 선택 | `contact_type` |
| 연락처 값 | ✅ | 휴대전화(01X) 또는 이메일 | `contact`(입력 원문 trim), `contact_normalized`(정규화) |
| 건물 유형 | ✅ | 원룸/다가구/상가주택/기타 | `building_type` (`oneroom`/`dagagu`/`sanggajutaek`/`etc`) |
| 개인정보 동의 | ✅ | 체크 필수 | `consent_at` (서버 시각) |
| 관리 호실 수 | 선택 | `1-5`/`6-10`/`11-20`/`21+` | `unit_count` |
| 가장 불편한 업무 | 선택 | 월세·미납/계약/수선/퇴실/지출/기타 | `pain_point` (`rent`/`contract`/`repair`/`moveout`/`expense`/`etc`) |
| 유입 출처 | 자동 | query `src` | `source` (기본 `landing_cozyrent`) |

### 정규화 규칙
- 휴대전화: 숫자만 추출, `+82` 국가번호는 `0`으로 치환. 검증 `^01[016789][0-9]{7,8}$`.
- 이메일: trim + 소문자. 기본 형식 검증(`local@domain.tld`), 254자 이하.

## 5. 저장 구조

- 테이블: `public.cozyrent_prelaunch_signups` (migration `supabase/migrations/0013_cozyrent_prelaunch_v1.sql`)
- RLS 활성. **insert/update/delete 정책 없음** → 클라이언트 직접 쓰기 불가. 적재는 서버 라우트(`/api/cozyrent/preregister`)의 service_role만 수행(Platform Analytics와 동일 패턴).
- 조회는 관리자만(`is_admin()` select 정책).
- `created_at`, `consent_at`, `source` 기록.

## 6. 중복 처리 기준

- **정규화된 연락처(`contact_normalized`) 기준 unique index.**
- 중복 insert 시 DB unique 위반(23505) → API가 `duplicate` 응답 → 화면에 "이미 신청되어 있습니다" 안내.
- **기존 데이터 덮어쓰기 금지** — upsert 사용하지 않음.

## 7. 개인정보 동의 구조

- 폼에 동의 체크박스 + 동의문 전문 표시(접기 없이 항상 노출).
- 동의문 명시 항목:
  - 수집 항목: 이름 또는 닉네임, 연락처(휴대전화 또는 이메일), 건물 유형, (선택) 관리 호실 수·불편 업무.
  - 수집 목적: 코지임대 출시 소식 안내, 사전신청자 30일 무료 이용 혜택 적용 안내.
  - 보유 기간: 목적 달성(출시 안내·혜택 적용) 후 지체 없이 파기, 삭제 요청 시 즉시 파기.
- 동의 미체크 시 제출 차단(클라이언트 + 서버 이중 검증).
- 서버는 연락처 원문을 로그에 출력하지 않는다.

## 8. API

- `POST /api/cozyrent/preregister`
  - 서버 검증(필수값·형식·allowlist) 실패 → 400 + 필드 오류.
  - 중복 → 409 `{ ok:false, error:"duplicate" }`.
  - 성공 → 201 `{ ok:true }`.
  - 서버 설정/DB 오류 → 500 (연락처 미포함 일반 메시지만 로그).

## 9. 페이지 구성·UX

- 섹션: 상단 바(코지임대 텍스트 로고 + 사전신청 버튼) → 히어로(앱 화면 슬롯) → 문제 공감 → 주요 기능(5) → 사용자 매뉴얼(「사용자 매뉴얼 보기」·「PDF 다운로드」 · 2026-10-28 추가) → 제작 신뢰 → 혜택(30일 무료 이용) → 사전신청 폼 → FAQ(5) → 마지막 CTA → 하단(전역 Footer 재사용: 사업자 정보·개인정보처리방침·홈페이지 연결).
- `/cozyrent`에서는 전역 Header를 숨기고 랜딩 전용 상단 바를 사용한다(광고 착지 집중 — Footer는 전역 재사용).
- 모바일 우선 · CTA 최소 높이 52px · 모바일 하단 고정 CTA(폼 보이면 자동 숨김) · 부드러운 스크롤 이동 · 인라인 오류 표시 · 제출 중 중복 클릭 방지 · 성공/중복/실패 상태 구분 표시 · 50~70대 가독성(큰 글자·높은 대비).
- **실앱 이미지 슬롯**: 가짜 UI를 만들지 않는다. `public/image/landingpage/cozyrent/` 아래 교체용 슬롯 경로만 준비하고, 자산이 없으면 세로형(9:19) placeholder 표시. 기능 카드의 앱 화면은 카드 상단 중앙 세로형(9:19) 규격 5개 동일.
  - 히어로 폰 목업: `hero.png`
  - 기능 이미지: `rent.png` / `building.png` / `repair.png` / `moveout.png` / `expense.png`
- OG 이미지: `public/image/landingpage/cozyrent/og.png` (1200×630, 교체 가능 전용 경로). 구 경로 `/image/cozyrent/*` 는 redirect 호환.

## 10. SEO·공유

- title: `코지임대 사전신청 | 건물주를 위한 임대관리 앱` (absolute — 사이트 템플릿 미적용)
- description: `월세, 관리비, 미납, 계약, 수선 기록까지 한곳에서. 코지임대 출시 전 사전신청하고 30일 무료 이용 혜택을 받아보세요.`
- canonical: `https://cozybuilder.co.kr/landingpage/cozyrent` (공식 URL — OG url 동일)
- Open Graph + Twitter card 설정. robots/index는 기존 홈페이지 기준(별도 차단 없음 = 색인 허용) 준수.

## 11. 구현·검증 범위

- 구현: 페이지 · 폼 · API · migration(파일 준비) · OG · 문서.
- **운영 DB 적용은 승인 후 별도 수행** — 기존 migration 운영 방식(Supabase Dashboard SQL Editor 수동 실행)과 동일. 적용 전까지 폼 제출은 "잠시 후 다시 시도" 서버 오류 안내로 동작.
- 검증: lint · build · 데스크톱/모바일 QA · 필수값/형식/동의 차단 · 제출 연타 방지 · 상태(성공/중복/실패) 표시 · 기존 페이지 회귀.

## 12. 교체 대기 자산

- `public/image/cozyrent/app-home.png` 외 기능 스크린샷 5종 — 실앱 화면 확보 시 교체(placeholder 자동 대체).
- `public/image/cozyrent/og.png` — 임시 텍스트 기반 이미지. 브랜드 디자인 확정 시 교체.

## 13. 관리자 화면 (1차: 조회 전용)

- 경로: `/admin/landingpage/cozyrent` (관리자 메뉴 "랜딩페이지" → 카드 "신청 내역 보기". 구 경로 `/admin/cozyrent-prelaunch` 는 308 redirect)
- 권한: 기존 관리자 체계 재사용 — admin layout `requireAdmin()` + **모든 서버 액션에서 `getAdminUser()` 재검증**(서버 액션은 직접 POST 가능하므로 이중 게이트). 별도 인증 체계 없음.
- 조회: 관리자 쿠키 클라이언트(RLS `is_admin()` select 정책) — service_role 미사용.
- 목록: 서버 측 pagination(기본 20건, 20/50/100 선택) · 최신순 · 표시 항목은 신청/동의 일시·이름·연락 방식·연락처·건물 유형·호실 수·불편 업무·유입 경로. `contact_normalized` 는 조회(select)·표시하지 않는다(검색 조건으로만 사용).
- 검색·필터: 이름/연락처 검색 + 연락 방식·건물 유형·호실 수·유입 경로·기간(KST) 필터 + 초기화. **검색어·목록 데이터는 URL query 가 아니라 서버 액션 body 로만 전달**된다. localStorage 미사용.
- 통계: 전체/오늘/최근 7일/전화/이메일 = DB count 쿼리. 건물 유형·유입 경로·호실 규모 분포 = 개인정보 없는 코드 컬럼만 서버에서 조회해 집계(상한 20,000행).
- 캐시: 페이지 `force-dynamic` — 정적 캐시 금지.
- CSV 내보내기: 서버 액션에서 관리자 검증 후 현재 필터 결과만(최대 5,000건) 생성. 파일명 `cozyrent-prelaunch-YYYYMMDD.csv`. `contact_normalized` 제외. 다운로드 전 개인정보 경고 확인.
- 1차 범위 제외(후속 설계): 수정·삭제·포인트 지급·CozyRent 계정 연결·문자/이메일 발송·메모/상태 관리·일괄 처리.

## 14. 사용자 매뉴얼 진입 (2026-10-28 · Preview 검수 대기)

- 위치: 주요 기능 섹션 아래 `#manual` 카드 — 「사용자 매뉴얼 보기」(새 탭 `/manual/cozyrent/index.html`) · 「PDF 다운로드 (26.4MB)」(`/manual/cozyrent/cozyrent-user-manual.pdf`).
- 산출물 원본: `cozybuilder/cozyrent` `docs/manual`(브랜치 `docs/manual-vc79-20261028` · 커밋 `eb6b5571` · Play VC79 기준). 홈페이지에는 확정 산출물만 둔다(웹 보기 HTML 1개 + WebP 그림 359장 + 휴대폰 공유용 PDF). 원본 수정은 cozyrent에서 하고 다시 생성해 교체한다.
- 매뉴얼 표지 상태는 「검토용·공개 전」이다. 프로덕션 공개(`main` 병합)는 코비 독립검수·코지 공개 승인 뒤에만 한다.
- 문구: 매뉴얼 카드는 출시 여부를 말하지 않는다(이 문서 §3 금지 표현 유지). 사전신청 히어로·FAQ의 「출시 전」 문구와 실제 Google Play 공개 상태의 차이는 별도 승인 대상이라 이번 변경에 넣지 않았다(STATUS 참고).

## 15. 출시 전환 후속 승인 — 코지 2026-10-28 (Preview 구현 단계)

> **이번 절은 §1·§3·§9·§10의 출시 전 사전신청 공개 문구를 후속 대체하는 결정이다.**
> 본 절 기록은 **작업 범위 승인**이고 코드 구현·Preview 화면 검증·운영 배포/DB 변경 완료가 아니다.
> 작업 추적: [cozyrent Issue #74](https://github.com/cozybuilder/cozyrent/issues/74#issuecomment-6459875946).

### 승인된 사용자 경험

1. 코지임대가 공식 Google Play 등록 페이지에서 일반 사용자에게 **실제 설치 가능한 사실을 확인한 뒤**, 기존 공개 랜딩(/landingpage/cozyrent)의 「출시 전 사전신청 진행 중」과 「지금 Android 앱을 개발 중」을 **출시 안내 + 「Google Play에서 설치」**로 전환한다. 현행 제품명은 코지임대, Android 패키지는 com.cozybuilder.cozyrent. Google Play 직접 URL은 **등록된 해당 앱 실제 링크를 확인하여 채택**한다. Play 공개 여부를 새로 검증하지 않은 채 출시됨이라고 단정하거나 가짜 URL을 만들지 않는다.
2. 현재 LandingRenderer의 상단/히어로/마지막/모바일 고정 CTA가 전부 #apply를 향하므로, 코지임대 랜딩만 설치 전환할 수 있는 **선택적 opt-in**을 설계하고 모든 CTA의 목적지·텍스트·접근성·320px 레이아웃을 함께 검수한다. 기존 다른 랜딩·폼 기능은 바꾸지 않는다. 사전신청 폼을 출시 이후 새 사용자에게 **계속 주요 CTA로 보여주지 않되**, 기존 신청 내역·운영자 조회/CSV·API·개인정보 보존/삭제 계약은 임의로 변경하거나 삭제하지 않는다.
3. **30일 무료 이용은 출시 전 접수된 기존 사전신청자에게만 적용되는 약속**(cozyrent/docs/SUBSCRIPTION.md §9.1 — 운영자 별도 수동 지급, 7일 일반 무료체험과 합산 금지)이다. 신규 설치자에게 자동 30일 제공·현재 신규 사전신청 모집이라고 오표기하지 않는다. 기존 신청자를 위한 혜택 안내는 대상과 지급 방법·문의 경로를 구분해 정확히 보존한다.
4. 매뉴얼 웹보기·PDF 다운로드는 /landingpage/cozyrent와 **코지임대 프로그램 상세 /programs/[slug] 두 진입점**에서 접근 가능해야 한다. 제품 상세는 코지임대만 표시하는 opt-in으로 별도 프로그램·스토어/구독 권한·기존 화면 변경 0.
5. 매뉴얼 원본은 cozyrent/docs/manual-vc79-20261028이 소유한다. 공개용 표지 「검토용·공개 전」 문구를 정리한 뒤 PC/휴대폰 PDF와 웹 HTML·WebP를 **동일 원고로 재생성**하고 public/manual/cozyrent 공유본 복사본과 크기/SHA 및 모바일·PC 실제 열람/다운로드를 검증한다. 테스트가 확인한 구버전 수치를 최신 산출물로 갱신한다.

### 공개·권한 게이트

- 이번 코지 승인은 **홈페이지 작업 브랜치/Preview 구현 및 검수 진행 승인**이다. main 병합(=Vercel production 자동 배포), 운영 DB programs.deploy_status 또는 prereg/신청자 자료 수정, 약관/개인정보 처리 변경은 **최종 Preview 실사용 검수 결과를 보고하고 코지에게 별도 실행 승인을 받은 뒤**에만 수행한다.
- 프로그램 등록정보의 deploy_status는 기존 [PROGRAM_OPERATING_MODEL.md §9](../platform/PROGRAM_OPERATING_MODEL.md) 절차를 따른다. 프론트 랜딩 문구 교체만으로 DB의 상태·스토어 URL을 바꿨다고 간주하지 않는다. 실제 운영 CMS 값은 공개 전 읽기 전용으로 확인한다.
- Preview는 Vercel 로그인 보호가 켜져 있다. 접근 권한 있는 계정으로 Preview 페이지와 매뉴얼·PDF를 검수하고, 우회용 비밀값을 코드/문서/공개 채팅에 저장하지 않는다. **배포 성공(빌드)과 실제 페이지 열람·다운로드 검증을 분리**한다. 접근 불가면 BLOCKED이고 최종 공개 HOLD.
- 기존 Play VC79 운영앱·사용자/구독/원장·Supabase 운영 DB·사전신청 내역·AAB/versionCode는 이번 마케팅/매뉴얼 작업으로 변경하지 않는다.

## 16. 사전신청 종료로 범위 재확정 — 코지 2026-10-28 (최신 결정 · §15 대체)

> 코지 결정: 사전신청 광고 URL은 모두 철수했다. **기존 랜딩페이지는 그대로 유지**하되 **신규 사전신청 접수를 종료**한다. 이 절이 §15의 "랜딩 전체 출시 안내·Google Play 설치 CTA로 전환" 지시를 **대체/취소**한다. 프로그램 상세에 이미 적용된 출시 안내·Google Play 스토어 버튼은 절대 덮어쓰지 않는다.

### 랜딩 변경 허용 범위
- 대상: 기존 `/landingpage/cozyrent`와 구 주소 redirect. 페이지 구조/기존 이미지·설명·과거 혜택 약속·기존 링크 보존.
- 현재 접수 중인 것처럼 보이는 상단/히어로/마지막/모바일 고정 CTA의 신청 행동을 모두 없애고, 클릭 불가능한 **「사전신청 종료」** 표시로 교체한다. 이미 제출된 신청자에게만 적용되는 30일 수동 무료 이용 혜택은 그대로 안내하되 신규 신청·자동 지급을 약속하지 않는다. 본문/SEO/FAQ 중 "지금 사전신청 가능"이라고 오해하게 하는 최소한의 안내 문구만 실제 종료 상태에 맞게 정리한다.
- 신청 폼은 입력·제출이 불가능한 종료 안내로 교체한다(접수 종료를 우회하는 활성 입력 항목을 남기지 않는다). **서버 `POST /api/cozyrent/preregister`에서도 신규 등록을 거절**(예: 410 / `closed`); 새 개인정보 입력 없이 응답할 것. 기존 관리자 조회·검색·CSV, 이전 신청자 데이터 및 동의·개인정보 처리 계약은 그대로 보존, 데이터 삭제/이전/수정 0. 이 서버 검증은 종료 표시와 일치하도록 하기 위한 접수 차단이며 운영 DB 직접 변경을 승인한 것은 아니다.
- 매뉴얼을 기존 랜딩에 둔 것은 허용하지만 **홍보·매뉴얼의 주 진입점은 홈페이지 `/programs/[slug]`의 코지임대 상세**로 한다. 랜딩에서는 새 Google Play CTA를 개발하거나 전체 마케팅 개편을 하지 않는다.

### 별도 제품 상세 및 공개 게이트
- 상세페이지의 기존 Google Play 설치 경로·설명·실제 화면·마케팅·배포상태는 그대로 유지한다. **사용 설명서 전용 보조 카드**에서 `/manual/cozyrent/index.html` 웹 보기(추천) + `/manual/cozyrent/cozyrent-user-manual.pdf` (휴대폰 공유본 다운로드)로 연결한다. 상세는 실제 대상 프로그램 한정, 다른 프로그램 무영향. 디자인·조건/위치는 [PROGRAM_OPERATING_MODEL.md §10](../platform/PROGRAM_OPERATING_MODEL.md)을 따른다.
- 두 PDF는 같은 19장/326쪽 본문·목차·링크이며, 원본 약 40.3MiB(인쇄용)와 공유본 약 26.4MiB(이미지 색 팔레트·그림자 최적화). 홈페이지에는 **웹 보기 + 공유본 PDF 1개**를 기본으로 둔다. 공개본 표지 교정 후 PDF 두 종류·HTML 다시 생성하고 동일성 검사.
- 브랜치 Preview 검증·코비 독립검수까지 승인. **`main` 병합/프로덕션 공개, 운영 CMS/DB 및 실사용자 데이터 변경은 별도 최종 승인 전 수행 금지.** 이전 §15의 출시형 랜딩 변경 지시서가 아직 미전달이면 사용하지 않고, 전달됐다면 이 최신 결정을 먼저 교체 전달한다.

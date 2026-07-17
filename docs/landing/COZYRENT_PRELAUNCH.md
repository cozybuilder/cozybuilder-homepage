# 코지임대(CozyRent) 출시 전 사전신청 랜딩페이지

> 코지임대 사전신청 랜딩페이지의 **홈페이지 측 SSOT**.
> 혜택·포인트 정책의 원본은 `cozyrent/docs/SUBSCRIPTION.md`, 홍보 문구의 원본은 `cozyrent/docs/MARKETING.md` §8이 소유한다.
> 이 문서는 홈페이지 구현(URL·폼·저장 구조·동의·검증 범위)만 소유한다.

## 1. 목적

- 유튜브 광고·네이버 블로그·SNS에서 사용할 코지임대 **출시 전 사전신청 착지 페이지**.
- 방문자가 10초 안에 이해해야 할 것: 어떤 앱인지 / 누구를 위한 앱인지 / 사전신청 혜택 / 신청 위치.
- 범위: **랜딩페이지 + 사전신청 수집까지만.** 로그인·결제·추천인 기능은 범위 밖.

## 2. URL

- 경로: `/cozyrent`
- 공개 URL: `https://cozybuilder.co.kr/cozyrent`
- 유입 출처: `?src=<출처>` query parameter (예: `?src=youtube`, `?src=naver_blog`).
  - 허용 형식 `^[a-z0-9_-]{1,40}$`. 형식 불일치·미지정 시 기본값 `landing_cozyrent`.

## 3. 확정 문구·정책 (요약 — 원본은 cozyrent 문서)

- 제품: 코지임대 — 원룸·다가구·상가주택 개인 임대인을 위한 임대·건물관리 앱. Android 우선 개발 중. **정식 출시 전.**
- 혜택: 출시 전 사전신청자 **6,900P**(베이직 이용기간 30일 연장 상당) + 출시 후 가입 시 **15일 무료체험**(카드 등록 없음·자동결제 없음).
- 포인트: 이용기간 연장 전용 · 현금화·양도·환불 불가 · 세부 조건은 정식 출시 시 안내.
- 금지 표현: 첫 달 무료 / 자동결제 / 구독료 자동 차감 / 현금처럼 사용 / 세금 자동신고 / 세무·법률 대행 / 수익 보장 / 이미 출시된 것처럼 보이는 표현.

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
  - 수집 목적: 코지임대 출시 소식 안내, 사전신청 혜택(6,900P) 적용 안내.
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

- 섹션: 상단 바(코지임대 텍스트 로고 + 사전신청 버튼) → 히어로(앱 화면 슬롯) → 문제 공감 → 주요 기능(5) → 제작 신뢰 → 혜택(6,900P) → 사전신청 폼 → FAQ(5) → 마지막 CTA → 하단(전역 Footer 재사용: 사업자 정보·개인정보처리방침·홈페이지 연결).
- `/cozyrent`에서는 전역 Header를 숨기고 랜딩 전용 상단 바를 사용한다(광고 착지 집중 — Footer는 전역 재사용).
- 모바일 우선 · CTA 최소 높이 52px · 모바일 하단 고정 CTA(폼 보이면 자동 숨김) · 부드러운 스크롤 이동 · 인라인 오류 표시 · 제출 중 중복 클릭 방지 · 성공/중복/실패 상태 구분 표시 · 50~70대 가독성(큰 글자·높은 대비).
- **실앱 이미지 슬롯**: 가짜 UI를 만들지 않는다. `public/image/cozyrent/` 아래 교체용 슬롯 경로만 준비하고, 자산이 없으면 placeholder 표시.
  - 히어로 폰 목업: `public/image/cozyrent/app-home.png`
  - 기능 이미지: `app-rent.png` / `app-building.png` / `app-repair.png` / `app-moveout.png` / `app-expense.png`
- OG 이미지: `public/image/cozyrent/og.png` (1200×630, 교체 가능 전용 경로).

## 10. SEO·공유

- title: `코지임대 사전신청 | 건물주를 위한 임대관리 앱` (absolute — 사이트 템플릿 미적용)
- description: `월세, 관리비, 미납, 계약, 수선 기록까지 한곳에서. 코지임대 출시 전 사전신청하고 6,900P 혜택을 받아보세요.`
- canonical: `https://cozybuilder.co.kr/cozyrent`
- Open Graph + Twitter card 설정. robots/index는 기존 홈페이지 기준(별도 차단 없음 = 색인 허용) 준수.

## 11. 구현·검증 범위

- 구현: 페이지 · 폼 · API · migration(파일 준비) · OG · 문서.
- **운영 DB 적용은 승인 후 별도 수행** — 기존 migration 운영 방식(Supabase Dashboard SQL Editor 수동 실행)과 동일. 적용 전까지 폼 제출은 "잠시 후 다시 시도" 서버 오류 안내로 동작.
- 검증: lint · build · 데스크톱/모바일 QA · 필수값/형식/동의 차단 · 제출 연타 방지 · 상태(성공/중복/실패) 표시 · 기존 페이지 회귀.

## 12. 교체 대기 자산

- `public/image/cozyrent/app-home.png` 외 기능 스크린샷 5종 — 실앱 화면 확보 시 교체(placeholder 자동 대체).
- `public/image/cozyrent/og.png` — 임시 텍스트 기반 이미지. 브랜드 디자인 확정 시 교체.

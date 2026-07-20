# CozyBuilder Homepage

CozyBuilder 홈페이지/플랫폼 저장소.

- Stack: Next.js App Router + TypeScript + Tailwind CSS
- Auth/DB/Storage: Supabase
- Deploy: Vercel
- Domain: `https://cozybuilder.co.kr`

## 문서 기준

- 현재 상태: [`docs/STATUS.md`](./docs/STATUS.md)
- Analytics 설계/운영: [`docs/platform/PLATFORM_ANALYTICS_ARCHITECTURE.md`](./docs/platform/PLATFORM_ANALYTICS_ARCHITECTURE.md)
- Auth 정책: [`AUTH_POLICY.md`](./AUTH_POLICY.md)
- 배포/Auth 체크리스트: [`DEPLOY_AUTH_CHECKLIST.md`](./DEPLOY_AUTH_CHECKLIST.md)

운영/문서 규칙의 SSOT는 `cozybuilder-ops`를 따른다.

## 법적 페이지 (서비스별 소유 분리)

| 문서 | 경로 | 적용 대상 | 소유 |
|------|------|-----------|------|
| 공용 개인정보처리방침 | `/privacy` (`app/privacy/page.tsx`) | CozyBuilder 일반 | 공용 |
| 공용 이용약관 | `/terms` (`app/terms/page.tsx`) — "결제/구독 미제공" 명시 | CozyBuilder 일반 | 공용 |
| **코지임대 개인정보처리방침** | `/cozyrent/privacy` (`app/cozyrent/privacy/page.tsx`) | **코지임대(CozyRent) 앱 전용** | 코지임대 |
| **코지임대 이용약관** | `/cozyrent/terms` (`app/cozyrent/terms/page.tsx`) — 40일 무료체험·Google Play 구독 반영 | **코지임대(CozyRent) 앱 전용** | 코지임대 |

- 코지임대는 40일 무료체험 + 구독을 제공하므로 공용 약관(결제 미제공)이 적용되지 않으며, **전용 라우트로 분리**한다. 공용 문서를 코지임대 기준으로 덮어쓰지 않는다.
- 공개 URL(Vercel 배포): `https://cozybuilder.co.kr/cozyrent/privacy` · `https://cozybuilder.co.kr/cozyrent/terms`. 코지임대 앱(`cozyrent`) 설정 화면의 개인정보처리방침·이용약관 링크가 이 URL을 사용한다.
- 코지임대 고객지원 이메일 = `siteConfig.contactEmail`(`lib/site.ts`) — 앱·홈페이지·Play 등록정보 공통 SSOT.
- 접근: 전역 Footer(`components/Footer.tsx`)에 코지임대 법적 링크 노출. 검색엔진 색인 허용(noindex 없음).

## 환경변수

`.env.local.example` 를 `.env.local` 로 복사 후 실제 값을 입력한다.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 서버 전용 — 절대 NEXT_PUBLIC 금지
LAUNCH_TOKEN_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=...
ANALYTICS_SALT=...
```

- `LAUNCH_TOKEN_SECRET`: `/apps` 런처 실행 토큰 서명(HS256)용 서버 전용 시크릿.
- `SUPABASE_SERVICE_ROLE_KEY`: Platform Analytics 이벤트 적재용 서버 전용 키.
- `ANALYTICS_SALT`: 사용자 해시(HMAC)용 고정 솔트. 변경하면 과거 통계 식별자가 끊긴다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포

Vercel은 GitHub `main` 브랜치 push 기준으로 자동 배포한다.

환경변수를 변경한 경우 반드시 Vercel에서 재배포한다.

```text
Vercel → Deployments → 최신 배포 → Redeploy
```

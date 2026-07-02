# 배포(Auth) 체크리스트 — Vercel + Supabase

로컬 Auth 구현 완료 후, **Vercel 배포 시** 필요한 설정 체크리스트.
인프라: Supabase Free(Auth/DB/Storage) + Vercel(배포). 정책: [AUTH_POLICY.md](./AUTH_POLICY.md)

> 아래에서 `배포도메인` = 실제 Vercel 도메인(예: `cozybuilder.co.kr` 또는 `xxx.vercel.app`)
> `supabase-project-ref` = `zniktvkdqaxqmgwmogyb`

---

## 1. Vercel 환경변수

Vercel > Project > Settings > Environment Variables 에 등록 (Production/Preview/Development 모두):

| Key | Value | 노출 범위 |
|-----|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zniktvkdqaxqmgwmogyb.supabase.co` | 공개(클라이언트) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon(public) key | 공개(클라이언트) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (Project Settings > API) | **서버 전용** |
| `ANALYTICS_SALT` | 임의의 긴 난수(HMAC 솔트, 로컬/운영 동일 값) | **서버 전용** |

- [ ] 위 변수 등록 (`NEXT_PUBLIC_*` 2개 + 서버 전용 2개)
- [ ] 등록 후 **재배포(Redeploy)** 해야 반영됨
- [ ] `service_role` 키는 **클라이언트/`NEXT_PUBLIC_` 로 절대 노출 금지.**
      단 **서버 전용(Platform Analytics 인제스트 `/api/analytics/track`)** 용도로는
      `SUPABASE_SERVICE_ROLE_KEY` 를 서버 환경변수로 등록·사용한다. (`NEXT_PUBLIC_` 접두 금지)
- [ ] `ANALYTICS_SALT` 도 서버 전용. 로컬 `.env.local` 과 Vercel 에 **동일 값**을 넣어야 해시가 일치.

---

## 2. Supabase — Authentication > URL Configuration

- **Site URL**: `https://배포도메인`
- **Redirect URLs** (Add URL):
  - `https://배포도메인/auth/callback`
  - `https://배포도메인/dashboard`
  - `https://배포도메인/profile`
  - `https://배포도메인/settings`
  - 로컬 개발용:
    - `http://localhost:3000/**`
    - `http://localhost:3000/auth/callback`

- [ ] Site URL 설정
- [ ] Redirect URLs 등록 (특히 `/auth/callback` 필수 — OAuth 코드 교환 경로)

---

## 3. Google Cloud — OAuth 클라이언트 설정

Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client ID (Web):

- **Authorized JavaScript origins**:
  - `https://배포도메인`
  - `http://localhost:3000`
- **Authorized redirect URIs**:
  - `https://zniktvkdqaxqmgwmogyb.supabase.co/auth/v1/callback`
    (Supabase 콜백 URL — 앱 도메인이 아니라 **Supabase** 도메인)

그리고 Supabase > Authentication > Providers > **Google** 에
Client ID / Client Secret 입력 후 Enable.

- [ ] JavaScript origins 등록(배포 + 로컬)
- [ ] redirect URI 에 Supabase 콜백 등록
- [ ] Supabase Google Provider 활성화

---

## 4. 배포 후 테스트 절차

- [ ] 이메일 회원가입 → 확인 메일 수신 → 인증
- [ ] 이메일 로그인 → `/dashboard` 진입
- [ ] 비밀번호 찾기 → 메일 링크 → `/reset-password` → 변경 → 재로그인
- [ ] Google 로그인 → 동의 → `/auth/callback` 경유 → `/dashboard`
- [ ] 보호 라우트: 로그아웃 상태에서 `/dashboard`·`/profile`·`/settings`
      접근 → `/login?error=auth&next=...` 이동 → 로그인 후 원래 경로 복귀
- [ ] 로그아웃 → `/` 이동, 이후 보호 라우트 재접근 시 다시 로그인 요구
- [ ] Profile → "로그인 방식"(Email/Google) 및 Google 프로필 이미지 표시

---

## 5. 주의사항 (보안)

- ⚠️ `service_role` key **프론트/클라이언트 노출 금지** (`NEXT_PUBLIC_` 금지).
  - 단 **서버 전용**(Analytics 인제스트 등 서버 코드/라우트 핸들러)에서는 사용 허용.
    번들에 새지 않도록 `import "server-only"` 모듈에서만 참조한다.
- ⚠️ Secret key / Google Client Secret **프론트 노출 금지**
  - Client Secret 은 Supabase Provider 설정에만 입력(서버측 보관)
- ⚠️ `.env.local` **GitHub 업로드 금지** (이미 `.gitignore` 에 `.env*` 포함)
- ⚠️ 프론트에 노출되는 값은 `NEXT_PUBLIC_` 의 URL/anon key 뿐
  (anon key 는 공개되어도 되는 키, RLS 로 데이터 보호)

---

## 참고: 로컬과 배포 차이

- 코드의 `redirectTo` 는 `window.location.origin` 기반이라 도메인 하드코딩 없음
  → 로컬/배포 모두 자동으로 올바른 콜백 사용.
- 따라서 **코드 변경 없이** 위 콘솔 설정 + 환경변수만 맞추면 동작.

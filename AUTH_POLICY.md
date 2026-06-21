# CozyBuilder 인증(Auth) 정책

CozyBuilder 홈페이지의 사용자 인증 정책을 정리한다.
인프라: **Supabase Free**(Auth/DB/Storage) + **Vercel**(배포). 운영비 0원 유지.

## 로그인 방식

- **기본 로그인**: 이메일 + 비밀번호 (Supabase Auth)
- **소셜 로그인**: **Google 만 사용**
- **보류**: Kakao / Naver / 휴대폰(SMS) 인증
  - 휴대폰 인증 등 **비용이 발생하는 기능은 현재 사용하지 않는다.**

## 사용자 식별 기준

- 사용자 식별의 기본 기준은 **이메일(email)** 이다.
- 이메일 회원가입과 Google 로그인에서 **같은 이메일**이 들어오면
  **같은 사용자**로 취급하는 것을 원칙으로 한다.
- 내부 식별자는 Supabase 사용자 ID(`auth.users.id`)를 사용하고,
  비즈니스 식별/표시는 이메일을 기준으로 한다.

## Google 로그인 시 활용 정보

- 가능하면 이름(name), 이메일(email), 프로필 이미지(avatar_url / picture)를 활용한다.
- 프로필 이미지가 없으면 기본 placeholder 를 사용한다.

## 향후 확장(현재 미구현)

- 구독 / 권한 시스템은 추후 **Supabase 사용자 ID + 이메일** 기준으로 확장한다.
- 결제 / 구독, Kakao·Naver OAuth, 휴대폰 인증은 정책 확정 후 별도 설계한다.
  - 특히 Google 가입 계정과 이메일 가입 계정의 **중복/통합**은
    휴대폰 인증 정책과 함께 다룬다.

## 보호 라우트

- `/dashboard`, `/profile`, `/settings` 는 로그인 필요.
- 비로그인 접근 시 `/login?error=auth&next=<원래경로>` 로 이동하고,
  로그인 성공 후 `next` 경로로 복귀한다. (`next` 는 내부 경로만 허용)

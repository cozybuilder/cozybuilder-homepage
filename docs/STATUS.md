# STATUS — CozyBuilder Homepage

## 현재 상태

- 상태: 🟢 active
- 운영 도메인: https://cozybuilder.co.kr
- 배포: Vercel 자동 배포 (`main`)
- 저장소: `cozybuilder/cozybuilder-homepage`

## 완료된 핵심 기능

### 인증
- 이메일 로그인/회원가입
- Google OAuth
- 비밀번호 재설정
- 보호 라우트 (`/dashboard`, `/profile`, `/settings`, `/admin`)

### 프로그램 플랫폼
- `/apps/[appKey]` 공통 런처
- 무료 구독 기반 접근 제어
- 웹 프로그램 공통 구조

### 관리자 CMS
- Programs
- Product
- Marketing
- Analytics

### Platform Analytics v1
- `analytics_events`
- `analytics_daily_stats`
- `/api/analytics/track`
- `/admin/analytics`
- 프로그램별 사용량 그래프
- app_launch / download_click 계측

## v1.1 백로그

1. daily_stats rollup
2. anonymous_id 통합 전략
3. ClipMiner 다운로드 계측
4. 감사일기 모바일 SDK 연동
5. 광고 지표(CTR/수익)

## 운영 원칙

- 문서 SSOT: cozybuilder-ops
- 프로젝트 사실은 이 문서가 소유
- 역사와 변경 내역은 Git commit이 소유

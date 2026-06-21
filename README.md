# CozyBuilder Homepage

Next.js (App Router) + TypeScript + Tailwind CSS · Auth: Supabase · 배포: Vercel

## 환경변수

`.env.local.example` 를 `.env.local` 로 복사 후 Supabase 값 입력:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 배포 (Vercel)

1. GitHub 저장소 연결 후 Vercel 프로젝트 생성 (프레임워크 자동 감지: Next.js)
2. Vercel 환경변수 2개 등록: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 배포 후 Supabase / Google OAuth URL 설정 → 자세한 절차는
   [DEPLOY_AUTH_CHECKLIST.md](./DEPLOY_AUTH_CHECKLIST.md)
4. 인증 정책: [AUTH_POLICY.md](./AUTH_POLICY.md)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

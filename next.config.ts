import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (cms-images) public URLs
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // 랜딩페이지 공용화 — 기존 광고·공유 링크 보호 (query 는 자동 유지, loop 없음).
  // 정책: docs/landing/LANDINGPAGE_PLATFORM.md §1
  async redirects() {
    return [
      { source: "/cozyrent", destination: "/landingpage/cozyrent", permanent: true },
      {
        source: "/admin/cozyrent-prelaunch",
        destination: "/admin/landingpage/cozyrent",
        permanent: true,
      },
      {
        source: "/image/cozyrent/:file*",
        destination: "/image/landingpage/cozyrent/:file*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

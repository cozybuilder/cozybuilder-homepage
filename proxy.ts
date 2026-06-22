import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: "middleware" → "proxy" 컨벤션.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // 보호가 필요한 경로에서만 세션 갱신/검증 (공개 페이지는 Supabase Auth 왕복 없음)
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/auth/:path*",
  ],
};

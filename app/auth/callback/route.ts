import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth-redirect";

// OAuth(PKCE) 콜백: ?code 를 세션으로 교환한 뒤 목적지로 이동.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 코드 없음 / 교환 실패 → 로그인으로.
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}

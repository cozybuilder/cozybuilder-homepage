import { redirect } from "next/navigation";
import { getApp } from "@/lib/apps";
import { canAccessApp } from "@/lib/app-access";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

/**
 * 무료 구독 게이트 (UI 없음 — 항상 redirect).
 *
 * 흐름: 프로그램 상세의 "무료 구독"(비로그인) → /login?next=/subscribe?app=KEY → 로그인 후 여기로.
 * 여기서 멱등 구독 처리 후, 곧바로 프로그램 상세로 돌려보낸다.
 * → "이미 구독 중입니다" 같은 임시 결과 페이지를 렌더하지 않는다.
 *
 * app_key / programSlug 기반 공통 구조: ebook 전용 하드코딩 없음.
 * 다른 웹프로그램(ShortsFactory/ClipMiner 등)에도 동일하게 동작한다.
 * 권한 단일 진실은 플랫폼(user_app_subscriptions + canAccessApp).
 */
export default async function SubscribeGate({
  searchParams,
}: {
  searchParams: Promise<{ app?: string; returnTo?: string }>;
}) {
  const { app: appKey, returnTo } = await searchParams;
  const app = appKey ? getApp(appKey) : null;
  if (!app) redirect("/dashboard");

  // 최종 도착지 = 프로그램 상세(또는 명시된 returnTo). 임시 결과 페이지로 보내지 않는다.
  const dest = safeNextPath(returnTo, `/programs/${app.programSlug}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 → 로그인 후 다시 이 게이트로(돌아오면 구독 처리).
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/subscribe?app=${app.key}`)}`);
  }

  // 이미 접근 가능하면 구독 처리 없이 상세로(중복 구독/UI 없음).
  const access = await canAccessApp(user.id, app.key);
  if (!access.allowed) {
    // 무료 베타 구독(멱등 upsert). RLS 가 본인 row 만 쓰도록 강제.
    const { error } = await supabase.from("user_app_subscriptions").upsert(
      {
        user_id: user.id,
        app_key: app.key,
        status: "active",
        plan: "beta",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,app_key" }
    );
    if (error) {
      console.error("[subscribe-gate] upsert failed", {
        appKey: app.key,
        userId: user.id,
        error: error.message,
      });
      // 실패해도 임시 페이지로 보내지 않고 상세로(상세의 CTA가 다시 '무료 구독'으로 보임 → 재시도).
      redirect(`/programs/${app.programSlug}`);
    }
    // 주의: revalidatePath 는 Server Action/Route Handler 전용 — 페이지 렌더 중 호출 시 throw.
    // 구독 상태는 canAccessApp(캐시 없는 DB 조회) + /apps/* force-dynamic 으로 즉시 반영되므로 불필요.
  }

  redirect(dest);
}

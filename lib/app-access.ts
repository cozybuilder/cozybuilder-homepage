import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getApp } from "@/lib/apps";

export type AccessReason =
  | "active"
  | "trialing"
  | "not_subscribed"
  | "inactive"
  | "canceled"
  | "expired"
  | "unauthenticated"
  | "unknown_app";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AppSubscription = {
  id: string;
  user_id: string;
  app_key: string;
  plan: string;
  status: string;
  current_period_end: string | null;
} | null;

export type AccessResult = {
  allowed: boolean;
  reason: AccessReason;
  subscription: AppSubscription;
};

const ACTIVE_STATES = ["active", "trialing"];

export async function getUserAppSubscription(
  userId: string,
  appKey: string
): Promise<AppSubscription> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_app_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("app_key", appKey)
    .maybeSingle();
  return (data as any) ?? null;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** app_key 공통 접근 판정. 결제 없음 — DB status 기반. */
export async function canAccessApp(
  userId: string | null,
  appKey: string
): Promise<AccessResult> {
  if (!getApp(appKey)) {
    return { allowed: false, reason: "unknown_app", subscription: null };
  }
  if (!userId) {
    return { allowed: false, reason: "unauthenticated", subscription: null };
  }
  const sub = await getUserAppSubscription(userId, appKey);
  if (!sub) {
    return { allowed: false, reason: "not_subscribed", subscription: null };
  }
  if (ACTIVE_STATES.includes(sub.status)) {
    // 기간 만료 체크 (있을 때만)
    if (sub.current_period_end && new Date(sub.current_period_end) < new Date()) {
      return { allowed: false, reason: "expired", subscription: sub };
    }
    return {
      allowed: true,
      reason: sub.status === "trialing" ? "trialing" : "active",
      subscription: sub,
    };
  }
  const blocked: AccessReason =
    sub.status === "canceled"
      ? "canceled"
      : sub.status === "expired"
        ? "expired"
        : "inactive";
  return { allowed: false, reason: blocked, subscription: sub };
}

/**
 * 앱 페이지 공통 가드 — 로그인 + 구독 권한을 매 요청 검증.
 * 미로그인 → /login, 권한 없음 → /subscribe 로 redirect.
 * 통과 시 인증된 user 를 반환한다. (앱 라우트들이 동일 진입 규칙을 공유)
 */
export async function requireAppAccess(appKey: string): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/apps/${appKey}`);

  const access = await canAccessApp(user.id, appKey);
  if (!access.allowed) redirect(`/subscribe?app=${appKey}`);
  return user;
}

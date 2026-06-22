"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getApp } from "@/lib/apps";

// 베타 셀프 구독 토글. user_id 는 항상 서버 세션에서만 취득(클라이언트 입력 금지).
// appKey 는 APP_DEFINITIONS 에 있는 값만 허용. RLS 가 본인 row 만 쓰도록 강제.
// 실패 시 redirect 하지 않고 /subscribe?...&error= 로 사유를 표시한다.

function loginNext(appKey: string) {
  return `/login?next=${encodeURIComponent(`/subscribe?app=${appKey}`)}`;
}

function failTo(appKey: string, message: string): never {
  redirect(`/subscribe?app=${appKey}&error=${encodeURIComponent(message)}`);
}

export async function startBetaSubscription(formData: FormData) {
  const appKey = String(formData.get("app") ?? "");
  if (!getApp(appKey)) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginNext(appKey));

  const { data, error } = await supabase
    .from("user_app_subscriptions")
    .upsert(
      {
        user_id: user.id,
        app_key: appKey,
        status: "active",
        plan: "beta",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,app_key" }
    )
    .select();

  console.log("[startBetaSubscription] called", {
    appKey,
    userId: user.id,
    error: error?.message,
    rows: data?.length ?? 0,
    data,
  });

  if (error) failTo(appKey, `구독 시작 실패: ${error.message}`);
  if (!data || data.length === 0) {
    failTo(appKey, "구독 시작 실패: 변경된 row 없음 (RLS/권한 확인 — 0005 적용 필요)");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/apps/${appKey}`);
  redirect(`/apps/${appKey}`);
}

export async function cancelBetaSubscription(formData: FormData) {
  const appKey = String(formData.get("app") ?? "");
  if (!getApp(appKey)) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginNext(appKey));

  const { data, error } = await supabase
    .from("user_app_subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("app_key", appKey)
    .select();

  // 같은 액션 안에서 update 후 즉시 재조회하여 실제 반영 확인
  const { data: after } = await supabase
    .from("user_app_subscriptions")
    .select("status,plan,updated_at,user_id")
    .eq("user_id", user.id)
    .eq("app_key", appKey)
    .maybeSingle();

  console.log("[cancelBetaSubscription] called", {
    appKey,
    userId: user.id,
    error: error?.message,
    rows: data?.length ?? 0,
    afterStatus: after?.status,
    afterUpdatedAt: after?.updated_at,
    afterUserId: after?.user_id,
  });

  if (error) failTo(appKey, `구독 취소 실패: ${error.message}`);
  if (!data || data.length === 0) {
    failTo(appKey, "구독 취소 실패: 변경된 row 없음 (구독 내역 없음 또는 RLS/권한)");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/apps/${appKey}`);
  redirect(`/subscribe?app=${appKey}`);
}

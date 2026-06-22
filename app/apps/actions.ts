"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getApp } from "@/lib/apps";

// 베타 셀프 구독 토글. user_id 는 항상 서버 세션에서만 취득(클라이언트 입력 금지).
// appKey 는 APP_DEFINITIONS 에 있는 값만 허용. RLS 가 본인 row 만 쓰도록 강제.

function loginNext(appKey: string) {
  return `/login?next=${encodeURIComponent(`/subscribe?app=${appKey}`)}`;
}

export async function startBetaSubscription(formData: FormData) {
  const appKey = String(formData.get("app") ?? "");
  if (!getApp(appKey)) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginNext(appKey));

  await supabase.from("user_app_subscriptions").upsert(
    {
      user_id: user.id,
      app_key: appKey,
      status: "active",
      plan: "beta",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,app_key" }
  );

  revalidatePath("/dashboard");
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

  await supabase
    .from("user_app_subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("app_key", appKey);

  revalidatePath("/dashboard");
  redirect(`/subscribe?app=${appKey}`);
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getApp } from "@/lib/apps";
import { cancelBetaSubscription } from "@/app/apps/actions";

// 구독 상태가 매 요청 반영되어야 하므로 동적 렌더.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "프로필" };

function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth&next=/profile");
  }

  const name = (user.user_metadata?.name as string | undefined) || "이름 미설정";

  // 사용자 식별 기준은 email. provider 는 표시용.
  const provider = user.app_metadata?.provider;
  const providerLabel = provider === "google" ? "Google" : "Email";

  // Google 로그인 시 제공되는 프로필 이미지(있으면 사용, 없으면 placeholder).
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined);

  // 무료 구독 중인 웹프로그램 — user_app_subscriptions 의 active/trialing row 를
  // 앱 정의와 매칭해서 정리. (canAccessApp 와 동일한 활성 상태 기준)
  const { data: subRows } = await supabase
    .from("user_app_subscriptions")
    .select("app_key, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"]);

  const subscribedApps = (subRows ?? [])
    .map((row) => getApp(row.app_key as string))
    .filter((app): app is NonNullable<typeof app> => app !== null);

  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="Account" title="프로필" />

      <div className="mx-auto mt-14 max-w-2xl space-y-6">
        {/* 아바타 + 이름 */}
        <div className="card flex items-center gap-5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[--surface-2] text-2xl">
              🙂
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-sm text-[--muted-2]">{user.email}</p>
          </div>
        </div>

        {/* 정보 목록 */}
        <div className="card divide-y divide-[--border] p-0">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-[--muted]">이름</span>
            <span className="text-sm">{name}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-[--muted]">이메일</span>
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-[--muted]">로그인 방식</span>
            <span className="text-sm">{providerLabel}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-[--muted]">가입일</span>
            <span className="text-sm">{formatDate(user.created_at)}</span>
          </div>
        </div>

        {/* 무료 구독 중인 프로그램 */}
        <div className="card">
          <h2 className="text-lg font-semibold">무료 구독 중인 프로그램</h2>
          {subscribedApps.length === 0 ? (
            <p className="mt-3 text-sm text-[--muted-2]">
              아직 무료 구독 중인 프로그램이 없습니다.{" "}
              <Link href="/programs" className="text-[--accent] hover:underline">
                프로그램 둘러보기 →
              </Link>
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[--border]">
              {subscribedApps.map((app) => (
                <li
                  key={app.key}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{app.name}</p>
                    <p className="text-xs text-[--accent]">무료 구독 중</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/apps/${app.key}`}
                      className="btn btn-accent px-4 py-2"
                    >
                      실행하기
                    </Link>
                    <form action={cancelBetaSubscription}>
                      <input type="hidden" name="app" value={app.key} />
                      <input type="hidden" name="returnTo" value="/profile" />
                      <button
                        type="submit"
                        className="text-xs text-[--muted-2] hover:text-[--muted] hover:underline"
                      >
                        구독 해제
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-sm">
          <Link href="/settings" className="text-[--accent] hover:underline">
            프로필 수정 →
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { programs } from "@/lib/site";
import { listApps } from "@/lib/apps";
import { canAccessApp, type AccessReason } from "@/lib/app-access";
import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import {
  startBetaSubscription,
  cancelBetaSubscription,
} from "@/app/apps/actions";

// 단일 진실: canAccessApp 의 reason → 라벨
const REASON_LABEL: Record<AccessReason, string> = {
  active: "사용 가능",
  trialing: "체험 중",
  canceled: "구독 취소됨",
  expired: "만료됨",
  not_subscribed: "구독 필요",
  inactive: "구독 필요",
  unauthenticated: "구독 필요",
  unknown_app: "-",
};

export const metadata: Metadata = { title: "대시보드" };

export default async function DashboardPage() {
  // 로그인하지 않은 사용자는 로그인 페이지로 보낸다.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth&next=/dashboard");
  }

  const displayName =
    (user.user_metadata?.name as string | undefined) || user.email;

  // 앱별 접근 판정 — 단일 진실 canAccessApp 사용
  const appAccess = await Promise.all(
    listApps().map(async (app) => ({
      app,
      access: await canAccessApp(user.id, app.key),
    }))
  );

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Dashboard"
        title="대시보드"
        description={`${displayName} 님, 환영합니다.`}
      />

      {/* 웹프로그램 (app_key 기반 구독 상태) */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">웹프로그램</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appAccess.map(({ app, access }) => {
            const canUse = access.allowed;
            return (
              <Card key={app.key}>
                <h3 className="text-base font-semibold">{app.name}</h3>
                <p className="mt-2 text-sm text-[--muted]">{app.description}</p>
                <p className="mt-3 text-xs text-[--muted-2]">
                  상태: {REASON_LABEL[access.reason] ?? access.reason}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {canUse ? (
                    <>
                      <Link
                        href={`/apps/${app.key}`}
                        className="btn btn-accent px-4 py-2"
                      >
                        열기
                      </Link>
                      <form action={cancelBetaSubscription}>
                        <input type="hidden" name="app" value={app.key} />
                        <button type="submit" className="btn btn-ghost px-4 py-2">
                          구독 취소
                        </button>
                      </form>
                    </>
                  ) : (
                    <form action={startBetaSubscription}>
                      <input type="hidden" name="app" value={app.key} />
                      <button type="submit" className="btn btn-accent px-4 py-2">
                        구독 시작
                      </button>
                    </form>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 프로그램 바로가기 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">프로그램</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <Card key={p.slug} hover href={`/programs/${p.slug}`}>
              <div className="mb-4 text-3xl">{p.emoji}</div>
              <h3 className="text-base font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-[--muted]">{p.summary}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/profile" className="text-[--muted] hover:text-foreground">
          프로필
        </Link>
        <Link href="/settings" className="text-[--muted] hover:text-foreground">
          설정
        </Link>
      </div>
    </div>
  );
}

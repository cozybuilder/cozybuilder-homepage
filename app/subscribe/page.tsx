import type { Metadata } from "next";
import Link from "next/link";
import { getApp } from "@/lib/apps";
import { canAccessApp } from "@/lib/app-access";
import { createClient } from "@/lib/supabase/server";
import { startBetaSubscription } from "@/app/apps/actions";
import { PageHeader, Card } from "@/components/ui";

export const metadata: Metadata = { title: "구독 안내" };
export const dynamic = "force-dynamic";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const { app: appKey } = await searchParams;
  const app = appKey ? getApp(appKey) : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 단일 진실: canAccessApp 로 현재 접근 가능 여부 판정
  const access = app && user ? await canAccessApp(user.id, app.key) : null;
  const alreadySubscribed = access?.allowed ?? false;

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Subscribe"
        title={alreadySubscribed ? "이미 구독 중입니다" : "구독이 필요한 프로그램입니다"}
        description={app ? app.name : "웹프로그램"}
      />

      <div className="mx-auto mt-12 max-w-xl">
        <Card>
          <p className="text-sm leading-relaxed text-[--muted]">
            {alreadySubscribed ? (
              <>이 프로그램을 사용할 수 있는 상태입니다. 바로 실행해 보세요.</>
            ) : (
              <>
                이 프로그램은 구독 사용자에게 제공되는 웹프로그램입니다.
                <br />
                현재는 결제 시스템 준비 중이며, 베타 기간 동안 무료로 사용할 수
                있습니다.
              </>
            )}
          </p>
        </Card>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {app && alreadySubscribed && (
            <Link href={`/apps/${app.key}`} className="btn btn-accent min-w-[140px]">
              앱 열기
            </Link>
          )}

          {app && user && !alreadySubscribed && (
            <form action={startBetaSubscription}>
              <input type="hidden" name="app" value={app.key} />
              <button type="submit" className="btn btn-accent min-w-[140px]">
                베타 구독 시작
              </button>
            </form>
          )}

          {app && !user && (
            <Link
              href={`/login?next=${encodeURIComponent(`/subscribe?app=${app.key}`)}`}
              className="btn btn-accent min-w-[140px]"
            >
              로그인하고 시작
            </Link>
          )}

          <Link href="/dashboard" className="btn btn-ghost min-w-[140px]">
            대시보드로 돌아가기
          </Link>
          <Link href="/contact" className="btn btn-ghost min-w-[140px]">
            문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}

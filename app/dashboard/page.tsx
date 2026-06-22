import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { programs } from "@/lib/site";
import { listApps } from "@/lib/apps";
import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Dashboard"
        title="대시보드"
        description={`${displayName} 님, 환영합니다.`}
      />

      {/* 웹프로그램 (app_key 기반) */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">웹프로그램</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listApps().map((app) => (
            <Card key={app.key} hover href={`/apps/${app.key}`}>
              <h3 className="text-base font-semibold">{app.name}</h3>
              <p className="mt-2 text-sm text-[--muted]">{app.description}</p>
              <span className="mt-4 inline-block text-sm text-[--accent]">열기 →</span>
            </Card>
          ))}
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

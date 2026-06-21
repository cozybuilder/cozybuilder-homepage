import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { programs } from "@/lib/site";
import { PageHeader } from "@/components/ui";
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

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {programs.map((p) => (
          <Link key={p.slug} href={`/programs/${p.slug}`} className="card card-hover">
            <div className="mb-4 text-3xl">{p.emoji}</div>
            <h2 className="text-base font-semibold">{p.name}</h2>
            <p className="mt-2 text-sm text-[--muted]">{p.summary}</p>
            <span className="mt-4 inline-block text-sm text-[--accent]">열기 →</span>
          </Link>
        ))}
      </div>

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

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

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

        <div className="text-sm">
          <Link href="/settings" className="text-[--accent] hover:underline">
            프로필 수정 →
          </Link>
        </div>
      </div>
    </div>
  );
}

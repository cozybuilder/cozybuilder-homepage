import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 비로그인 → /login?error=auth, 비관리자 → /
  await requireAdmin();

  return (
    <div className="container-page py-16">
      <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[--border] pb-6 text-sm">
        <Link href="/admin" className="font-semibold tracking-[0.18em]">
          ADMIN
        </Link>
        <Link href="/admin/programs" className="text-[--muted] hover:text-foreground">
          Programs
        </Link>
        <Link href="/admin/product" className="text-[--muted] hover:text-foreground">
          Product
        </Link>
        <Link href="/admin/marketing" className="text-[--muted] hover:text-foreground">
          Marketing
        </Link>
        <Link href="/admin/analytics" className="text-[--muted] hover:text-foreground">
          Analytics
        </Link>
        <Link href="/admin/cozyrent-prelaunch" className="text-[--muted] hover:text-foreground">
          코지임대 사전신청
        </Link>
        <Link href="/" className="ml-auto text-[--muted-2] hover:text-foreground">
          사이트로 →
        </Link>
      </div>
      {children}
    </div>
  );
}

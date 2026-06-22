import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteMarketing } from "@/app/admin/actions";

export default async function AdminMarketingList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_channels")
    .select("id, slug, category, name, status, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Marketing</h1>
        <Link href="/admin/marketing/new" className="btn btn-accent px-5 py-2">
          + 새 채널
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          marketing_channels 테이블을 찾을 수 없습니다.
          supabase/migrations/0002_admin_cms.sql 를 먼저 실행하세요.
        </p>
      )}

      <div className="mt-6 divide-y divide-[--border] rounded-2xl border border-[--border]">
        {(data ?? []).map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-5 py-4">
            <span className="w-16 text-xs uppercase text-[--muted-2]">
              {m.category}
            </span>
            <span className="flex-1 text-sm font-medium">{m.name}</span>
            <span
              className={`text-xs ${
                m.status === "published" ? "text-green-400" : "text-[--muted-2]"
              }`}
            >
              {m.status}
            </span>
            <Link
              href={`/admin/marketing/${m.id}`}
              className="text-sm text-[--accent] hover:underline"
            >
              수정
            </Link>
            <form action={deleteMarketing}>
              <input type="hidden" name="id" value={m.id} />
              <button className="text-sm text-red-400 hover:underline" type="submit">
                삭제
              </button>
            </form>
          </div>
        ))}
        {!error && (data ?? []).length === 0 && (
          <p className="px-5 py-6 text-sm text-[--muted-2]">등록된 채널이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

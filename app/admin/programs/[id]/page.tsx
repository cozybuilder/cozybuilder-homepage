import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { saveProgram } from "@/app/admin/actions";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ProgramForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let row: any = null;
  if (!isNew) {
    const supabase = await createClient();
    const { data } = await supabase.from("programs").select("*").eq("id", id).maybeSingle();
    row = data;
  }

  const features = Array.isArray(row?.features) ? row.features.join("\n") : "";
  const screenshots = Array.isArray(row?.screenshots) ? row.screenshots.join("\n") : "";
  const updates = Array.isArray(row?.updates)
    ? row.updates.map((u: any) => `${u.date ?? ""} | ${u.text ?? ""}`).join("\n")
    : "";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/programs" className="text-sm text-[--muted] hover:text-foreground">
        ← Programs
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {isNew ? "새 프로그램" : "프로그램 수정"}
      </h1>

      <form action={saveProgram} className="mt-8 space-y-5">
        {!isNew && <input type="hidden" name="id" value={row?.id} />}

        <div>
          <label className="label">구분</label>
          <select name="type" defaultValue={row?.type ?? "web"} className="input">
            <option value="web">컴퓨터 웹프로그램</option>
            <option value="mobile">모바일앱</option>
          </select>
        </div>
        <div>
          <label className="label">slug</label>
          <input name="slug" defaultValue={row?.slug ?? ""} required className="input" />
        </div>
        <div>
          <label className="label">이름</label>
          <input name="name" defaultValue={row?.name ?? ""} required className="input" />
        </div>
        <div>
          <label className="label">부제</label>
          <input name="subtitle" defaultValue={row?.subtitle ?? ""} className="input" />
        </div>
        <div>
          <label className="label">요약</label>
          <input name="summary" defaultValue={row?.summary ?? ""} className="input" />
        </div>
        <div>
          <label className="label">설명</label>
          <textarea name="description" defaultValue={row?.description ?? ""} rows={3} className="input" />
        </div>
        <div>
          <label className="label">대표 이미지 URL</label>
          <input name="image" defaultValue={row?.image ?? ""} placeholder="/image/ebook.png" className="input" />
        </div>
        <div>
          <label className="label">주요 기능 (줄마다 1개)</label>
          <textarea name="features" defaultValue={features} rows={4} className="input" />
        </div>
        <div>
          <label className="label">스크린샷 URL (줄마다 1개)</label>
          <textarea name="screenshots" defaultValue={screenshots} rows={3} className="input" />
        </div>
        <div>
          <label className="label">업데이트 내역 (줄마다 &quot;날짜 | 내용&quot;)</label>
          <textarea name="updates" defaultValue={updates} rows={3} className="input" />
        </div>
        <div>
          <label className="label">appUrl (web 실행 경로)</label>
          <input name="app_url" defaultValue={row?.app_url ?? ""} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">상태</label>
            <select name="status" defaultValue={row?.status ?? "draft"} className="input">
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </div>
          <div>
            <label className="label">정렬 순서</label>
            <input name="sort_order" type="number" defaultValue={row?.sort_order ?? 0} className="input" />
          </div>
        </div>

        <button type="submit" className="btn btn-accent w-full">
          저장
        </button>
      </form>
    </div>
  );
}

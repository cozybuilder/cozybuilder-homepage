import { createClient } from "@/lib/supabase/server";
import { saveMarketing } from "@/app/admin/actions";
import AdminBackButton from "@/components/admin/AdminBackButton";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function MarketingForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let row: any = null;
  if (!isNew) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("marketing_channels")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    row = data;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <AdminBackButton href="/admin/marketing" label="Marketing 목록" />
      <h1 className="mt-5 mb-2 text-2xl font-semibold tracking-tight">
        {isNew ? "새 채널" : "채널 수정"}
      </h1>

      <form action={saveMarketing} className="mt-8 space-y-5">
        {!isNew && <input type="hidden" name="id" value={row?.id} />}

        <div>
          <label className="label">구분</label>
          <select name="category" defaultValue={row?.category ?? "sns"} className="input">
            <option value="sns">SNS</option>
            <option value="blog">Blog</option>
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
          <label className="label">설명</label>
          <input name="description" defaultValue={row?.description ?? ""} className="input" />
        </div>
        <div>
          <label className="label">대표 이미지 URL</label>
          <input name="image" defaultValue={row?.image ?? ""} className="input" />
        </div>
        <div>
          <label className="label">외부 링크</label>
          <input
            name="external_url"
            defaultValue={row?.external_url ?? ""}
            placeholder="https://..."
            className="input"
          />
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

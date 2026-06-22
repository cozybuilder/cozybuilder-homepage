import { createClient } from "@/lib/supabase/server";
import { saveProduct } from "@/app/admin/actions";
import AdminBackButton from "@/components/admin/AdminBackButton";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ProductForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let row: any = null;
  if (!isNew) {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    row = data;
  }

  const contents = Array.isArray(row?.contents) ? row.contents.join("\n") : "";
  const screenshots = Array.isArray(row?.screenshots) ? row.screenshots.join("\n") : "";

  return (
    <div className="mx-auto max-w-2xl">
      <AdminBackButton href="/admin/product" label="Product 목록" />
      <h1 className="mt-5 mb-2 text-2xl font-semibold tracking-tight">
        {isNew ? "새 상품" : "상품 수정"}
      </h1>

      <form action={saveProduct} className="mt-8 space-y-5">
        {!isNew && <input type="hidden" name="id" value={row?.id} />}

        <div>
          <label className="label">구분</label>
          <select name="category" defaultValue={row?.category ?? "ebook"} className="input">
            <option value="website">홈페이지 제작</option>
            <option value="ebook">전자책</option>
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
          <label className="label">간략 설명</label>
          <input name="summary" defaultValue={row?.summary ?? ""} className="input" />
        </div>
        <div>
          <label className="label">대표 이미지 URL</label>
          <input name="image" defaultValue={row?.image ?? ""} placeholder="/image/ebook.png" className="input" />
        </div>
        <div>
          <label className="label">주요 내용 (줄마다 1개)</label>
          <textarea name="contents" defaultValue={contents} rows={4} className="input" />
        </div>
        <div>
          <label className="label">미리보기/스크린샷 URL (줄마다 1개)</label>
          <textarea name="screenshots" defaultValue={screenshots} rows={3} className="input" />
        </div>
        <div>
          <label className="label">자세한 설명</label>
          <textarea name="long_description" defaultValue={row?.long_description ?? ""} rows={5} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">가격</label>
            <input name="price" defaultValue={row?.price ?? ""} placeholder="₩9,900" className="input" />
          </div>
          <div>
            <label className="label">CTA</label>
            <select name="cta" defaultValue={row?.cta ?? "contact"} className="input">
              <option value="contact">문의하기</option>
              <option value="buy">구매하기</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">CTA 라벨</label>
            <input name="cta_label" defaultValue={row?.cta_label ?? ""} className="input" />
          </div>
          <div>
            <label className="label">CTA URL</label>
            <input name="cta_url" defaultValue={row?.cta_url ?? ""} placeholder="/contact" className="input" />
          </div>
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

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/admin/actions";
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_STATUS_LABELS,
  formatKRW,
  type ProductType,
  type ProductStatus,
} from "@/lib/site";

/* eslint-disable @typescript-eslint/no-explicit-any */
function priceCell(p: any): string {
  if (p.price_label) return p.price_label;
  if (p.price_type === "quote") return "견적 문의";
  if (typeof p.sale_price === "number") return formatKRW(p.sale_price);
  if (typeof p.price === "number") return formatKRW(p.price);
  // 레거시(텍스트 price)
  if (typeof p.price === "string") return p.price;
  return "—";
}

export default async function AdminProductList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Product</h1>
        <Link href="/admin/product/new" className="btn btn-accent px-5 py-2">
          + 새 상품
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          products 테이블을 찾을 수 없습니다. supabase/migrations/0002_admin_cms.sql 및
          0008_products_cms_v1.sql 를 먼저 실행하세요.
        </p>
      )}

      <div className="mt-6 divide-y divide-[--border] rounded-2xl border border-[--border]">
        {(data ?? []).map((p) => {
          const title = p.title ?? p.name ?? "(제목 없음)";
          const typeLabel =
            PRODUCT_TYPE_LABELS[p.product_type as ProductType] ?? "상품";
          const statusLabel =
            PRODUCT_STATUS_LABELS[p.status as ProductStatus] ?? p.status;
          return (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4">
              <span className="w-20 text-xs text-[--muted-2]">{typeLabel}</span>
              <span className="flex-1 text-sm font-medium">{title}</span>
              <span className="text-xs text-[--muted]">{priceCell(p)}</span>
              <span
                className={`text-xs ${
                  p.status === "published" ? "text-green-400" : "text-[--muted-2]"
                }`}
              >
                {statusLabel}
              </span>
              <Link
                href={`/admin/product/${p.id}`}
                className="text-sm text-[--accent] hover:underline"
              >
                수정
              </Link>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-sm text-red-400 hover:underline" type="submit">
                  삭제
                </button>
              </form>
            </div>
          );
        })}
        {!error && (data ?? []).length === 0 && (
          <p className="px-5 py-6 text-sm text-[--muted-2]">등록된 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

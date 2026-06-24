import { createClient } from "@/lib/supabase/server";
import BackButton from "@/components/BackButton";
import ProductAdminForm, {
  type ProductInitial,
} from "@/components/admin/ProductAdminForm";

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

  // 마이그레이션(0008) 전/후 모두 안전하도록 레거시 컬럼명도 fallback 으로 읽는다.
  const initial: ProductInitial | undefined = row
    ? {
        id: row.id,
        slug: row.slug,
        title: row.title ?? row.name ?? "",
        productType: row.product_type ?? "digital",
        category: row.category ?? "",
        status: row.status ?? "draft",
        featured: !!row.featured,
        priceType: row.price_type ?? "fixed",
        price: typeof row.price === "number" ? row.price : null,
        salePrice: typeof row.sale_price === "number" ? row.sale_price : null,
        priceLabel: row.price_label ?? (typeof row.price === "string" ? row.price : ""),
        thumbnailUrl: row.thumbnail_url ?? row.image ?? "",
        galleryUrls: Array.isArray(row.gallery_urls)
          ? row.gallery_urls
          : Array.isArray(row.screenshots)
            ? row.screenshots
            : [],
        shortDescription: row.short_description ?? row.summary ?? "",
        description: row.description ?? row.long_description ?? "",
        options: Array.isArray(row.options) ? row.options : [],
      }
    : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href="/admin/product" label="Product 목록" />
      <h1 className="mt-5 mb-8 text-2xl font-semibold tracking-tight">
        {isNew ? "새 상품" : "상품 수정"}
      </h1>
      <ProductAdminForm initial={initial} />
    </div>
  );
}

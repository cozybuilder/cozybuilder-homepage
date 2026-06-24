import type { Metadata } from "next";
import Image from "next/image";
import {
  type Product,
  type ProductType,
  PRODUCT_TYPE_LABELS,
  productPriceDisplay,
} from "@/lib/site";
import { getProducts } from "@/lib/content";
import { PageHeader, Card, ImagePlaceholder } from "@/components/ui";

export const metadata: Metadata = { title: "Product" };

// 상품 유형 표시 순서
const TYPE_ORDER: ProductType[] = ["digital", "service", "subscription", "physical"];

function ProductCard({ p }: { p: Product }) {
  const price = productPriceDisplay(p);
  const soldout = p.status === "soldout";
  return (
    <Card href={`/product/${p.slug}`} hover>
      <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-xl">
        {p.thumbnailUrl ? (
          <Image
            src={p.thumbnailUrl}
            alt={p.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <ImagePlaceholder ratio="aspect-[16/9]" label={p.title} />
        )}
        {soldout && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            품절
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold">{p.title}</h3>
      {p.shortDescription && (
        <p className="mt-2 text-sm text-[--muted]">{p.shortDescription}</p>
      )}
      {price && (
        <p className="mt-3 text-sm font-semibold text-[--accent]">{price}</p>
      )}
    </Card>
  );
}

function ProductGrid({ items }: { items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.slug} p={p} />
      ))}
    </div>
  );
}

export default async function ProductPage() {
  const products = await getProducts();

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Product"
        title="Product"
        description="코지빌더가 판매하는 상품과 서비스."
      />

      {TYPE_ORDER.map((t) => {
        const items = products.filter((p) => p.productType === t);
        if (items.length === 0) return null;
        return (
          <section key={t} className="mt-16">
            <h2 className="text-xl font-semibold tracking-tight">
              {PRODUCT_TYPE_LABELS[t]}
            </h2>
            <ProductGrid items={items} />
          </section>
        );
      })}

      {products.length === 0 && (
        <p className="mt-16 text-sm text-[--muted]">등록된 상품이 없습니다.</p>
      )}
    </div>
  );
}

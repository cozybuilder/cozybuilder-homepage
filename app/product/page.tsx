import type { Metadata } from "next";
import Image from "next/image";
import { type Product } from "@/lib/site";
import { getProducts } from "@/lib/content";
import { PageHeader, Card } from "@/components/ui";

export const metadata: Metadata = { title: "Product" };

function ProductCard({ p }: { p: Product }) {
  return (
    <Card href={`/product/${p.slug}`} hover>
      <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-xl">
        <Image
          src={p.image}
          alt={p.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-lg font-semibold">{p.name}</h3>
      <p className="mt-2 text-sm text-[--muted]">{p.summary}</p>
      {p.price && (
        <p className="mt-3 text-sm font-semibold text-[--accent]">{p.price}</p>
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
  const website = products.filter((p) => p.category === "website");
  const ebook = products.filter((p) => p.category !== "website");

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Product"
        title="Product"
        description="제작·출판 상품 영역."
      />

      {/* 홈페이지 제작 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">홈페이지 제작</h2>
        <ProductGrid items={website} />
      </section>

      {/* 전자책 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">전자책</h2>
        <ProductGrid items={ebook} />
      </section>
    </div>
  );
}

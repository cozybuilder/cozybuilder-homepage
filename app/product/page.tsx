import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { products, type Product } from "@/lib/site";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Product" };

function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.slug}`} className="card card-hover">
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
    </Link>
  );
}

export default function ProductPage() {
  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Product"
        title="Product"
        description="제작·출판 상품 영역."
      />

      {/* 홈페이지 제작 (제목만 — 상품 카드는 추후 추가) */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">홈페이지 제작</h2>
      </section>

      {/* 전자책 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">전자책</h2>

        {products.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

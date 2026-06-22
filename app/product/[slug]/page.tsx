import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/content";
import { BackLink, ImagePlaceholder } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product ? product.name : "Product" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const ctaHref = product.ctaUrl || "/contact";

  return (
    <div className="container-page py-12">
      <BackLink href="/product">Product</BackLink>

      {/* 1. 메인 이미지 + 액션 */}
      <section className="mx-auto mt-8 max-w-3xl">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[--border] bg-black">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* 가격 + 구매/문의 버튼 */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {product.price && (
            <p className="text-lg font-semibold">{product.price}</p>
          )}
          <Link href={ctaHref} className="btn btn-accent min-w-[140px]">
            {product.cta === "buy" ? "구매하기" : "문의하기"}
          </Link>
        </div>
      </section>

      {/* 2. 간략한 설명 */}
      <section className="mx-auto mt-12 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-lg text-[--accent]">{product.summary}</p>
      </section>

      {/* 3. 주요 내용 (개수에 따라 자동 증감) */}
      {product.contents.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">주요 내용</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.contents.map((c) => (
              <div key={c} className="card flex items-center gap-3 py-4">
                <span className="text-[--accent]">◆</span>
                <span className="text-sm">{c}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. 미리보기 (여러 장 — 좌우 스크롤) */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">미리보기</h2>
        {product.screenshots && product.screenshots.length > 0 ? (
          <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2">
            {product.screenshots.map((src, i) => (
              <div
                key={i}
                className="relative aspect-video w-72 shrink-0 snap-start overflow-hidden rounded-xl border border-[--border] bg-[--surface-2]"
              >
                <Image
                  src={src}
                  alt={`${product.name} 미리보기 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImagePlaceholder ratio="aspect-video" />
            <ImagePlaceholder ratio="aspect-video" />
          </div>
        )}
      </section>

      {/* 5. 자세한 설명 (긴 텍스트) */}
      {product.longDescription && (
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">자세한 설명</h2>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-[--muted]">
            {product.longDescription}
          </p>
        </section>
      )}
    </div>
  );
}

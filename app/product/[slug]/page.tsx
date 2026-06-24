import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/content";
import { productPriceDisplay, optionPriceDisplay } from "@/lib/site";
import { ImagePlaceholder } from "@/components/ui";
import BackButton from "@/components/BackButton";
import ProductCtaButton from "@/components/ProductCtaButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product ? product.title : "Product" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const priceText = productPriceDisplay(product);
  const soldout = product.status === "soldout";

  return (
    <div className="container-page py-12">
      <BackButton href="/product" label="Product" />

      {/* 1. 메인 이미지 + 액션 */}
      <section className="mx-auto mt-8 max-w-3xl">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[--border] bg-black">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <ImagePlaceholder ratio="aspect-[16/9]" label={product.title} />
          )}
          {soldout && (
            <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              품절
            </span>
          )}
        </div>

        {/* 가격 + 버튼 (button_type 정책: inquiry→문의, payment→결제 준비중, soldout→품절) */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {priceText && <p className="text-lg font-semibold">{priceText}</p>}
          <ProductCtaButton buttonType={product.buttonType} soldout={soldout} />
        </div>
      </section>

      {/* 2. 간략한 설명 */}
      <section className="mx-auto mt-12 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">{product.title}</h1>
        {product.shortDescription && (
          <p className="mt-3 text-lg text-[--accent]">{product.shortDescription}</p>
        )}
      </section>

      {/* 3. 옵션 (옵션 비교/목록) */}
      {product.options.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">옵션</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.options.map((o, i) => {
              const optPrice = optionPriceDisplay(o);
              return (
                <div key={i} className="card">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{o.name}</h3>
                    {optPrice && (
                      <span className="shrink-0 text-sm font-semibold text-[--accent]">
                        {optPrice}
                      </span>
                    )}
                  </div>
                  {o.description && (
                    <p className="mt-2 text-sm text-[--muted]">{o.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. 상세 이미지 (여러 장 — 좌우 스크롤) */}
      {product.galleryUrls.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">상세 이미지</h2>
          <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2">
            {product.galleryUrls.map((src, i) => (
              <div
                key={i}
                className="relative aspect-video w-72 shrink-0 snap-start overflow-hidden rounded-xl border border-[--border] bg-[--surface-2]"
              >
                <Image
                  src={src}
                  alt={`${product.title} 상세 이미지 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. 자세한 설명 (긴 텍스트) */}
      {product.description && (
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">자세한 설명</h2>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-[--muted]">
            {product.description}
          </p>
        </section>
      )}
    </div>
  );
}

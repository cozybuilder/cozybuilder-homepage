import Link from "next/link";
import Image from "next/image";
import { type Program, type Product, productPriceDisplay } from "@/lib/site";
import { getPrograms, getMarketing, getProducts } from "@/lib/content";
import { Card, ImagePlaceholder } from "@/components/ui";
import { MarketingSnsCard, MarketingBlogCard } from "@/components/MarketingCard";
import HeroVideo from "@/components/HeroVideo";

// Home 섹션은 너무 길어지지 않게 최대 4개까지만 노출 (나머지는 각 페이지에서).
const HOME_MARKETING_LIMIT = 4;
const HOME_PRODUCT_LIMIT = 4;

// Home Product 축소형 카드 (/product 카드보다 작고 가볍게).
function HomeProductCard({ p }: { p: Product }) {
  const soldout = p.status === "soldout";
  const priceText = p.options.length > 0 ? "옵션선택" : productPriceDisplay(p);
  return (
    <Link
      href={`/product/${p.slug}`}
      className="block rounded-2xl border border-[--border] bg-[--surface] p-4 transition-all duration-300 hover:border-[--border-strong]"
    >
      <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl">
        {p.thumbnailUrl ? (
          <Image
            src={p.thumbnailUrl}
            alt={p.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <ImagePlaceholder ratio="aspect-[16/9]" label={p.title} />
        )}
        {soldout && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            품절
          </span>
        )}
      </div>
      <h3 className="truncate text-sm font-semibold">{p.title}</h3>
      {p.shortDescription && (
        <p className="mt-1 line-clamp-2 text-xs text-[--muted]">
          {p.shortDescription}
        </p>
      )}
      <p className="mt-2 text-xs font-semibold text-[--accent]">{priceText}</p>
    </Link>
  );
}

function HomeProgramCard({ p }: { p: Program }) {
  return (
    <Card href={`/programs/${p.slug}`} hover>
      <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl">
        <Image
          src={p.image}
          alt={p.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <h3 className="text-base font-semibold">{p.name}</h3>
      <p className="mt-2 text-sm text-[--muted]">{p.summary}</p>
    </Card>
  );
}

export default async function HomePage() {
  const programs = await getPrograms();
  const marketing = await getMarketing();
  const products = (await getProducts()).slice(0, HOME_PRODUCT_LIMIT);
  const webPrograms = programs.filter((p) => p.type === "web");
  const mobilePrograms = programs.filter((p) => p.type === "mobile");
  const sns = marketing
    .filter((m) => m.category === "sns")
    .slice(0, HOME_MARKETING_LIMIT);
  const blogs = marketing
    .filter((m) => m.category === "blog")
    .slice(0, HOME_MARKETING_LIMIT);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="container-page relative pt-10 pb-24 md:pt-14 md:pb-32">
        <h1 className="heading-gradient text-center text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Build.
          <br />
          Create.
          <br />
          Automate.
        </h1>

        <div className="mx-auto mt-10 max-w-xl space-y-4 text-center text-lg leading-relaxed text-[--muted]">
          <p>40대.</p>
          <p>
            프로그래머 8년, 건축업 13년을 그만두고
            <br />
            AI와 함께 다시 시작했습니다.
          </p>
          <p className="text-foreground">이곳은 그 기록입니다.</p>
        </div>

        {/* Cinematic Hero video */}
        <div className="mt-16">
          <HeroVideo />
        </div>
      </section>

      {/* ---------------- Programs ---------------- */}
      <section className="container-page py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Programs</p>
            <h2 className="text-3xl font-semibold tracking-tight">프로그램</h2>
          </div>
          <Link
            href="/programs"
            className="text-sm text-[--muted] transition-colors hover:text-foreground"
          >
            More →
          </Link>
        </div>

        <h3 className="text-sm font-medium text-[--muted]">컴퓨터 웹프로그램</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {webPrograms.map((p) => (
            <HomeProgramCard key={p.slug} p={p} />
          ))}
        </div>

        <h3 className="mt-8 text-sm font-medium text-[--muted]">모바일앱</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mobilePrograms.map((p) => (
            <HomeProgramCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {/* ---------------- Product ---------------- */}
      <section className="container-page py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Product</p>
            <h2 className="text-3xl font-semibold tracking-tight">제품</h2>
          </div>
          <Link
            href="/product"
            className="text-sm text-[--muted] transition-colors hover:text-foreground"
          >
            More →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <HomeProductCard key={p.slug} p={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[--muted]">등록된 상품이 없습니다.</p>
        )}
      </section>

      {/* ---------------- Marketing ---------------- */}
      <section className="container-page py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Marketing</p>
            <h2 className="text-3xl font-semibold tracking-tight">마케팅</h2>
          </div>
          <Link
            href="/marketing"
            className="text-sm text-[--muted] transition-colors hover:text-foreground"
          >
            More →
          </Link>
        </div>

        {/* SNS — 세로형 채널 카드 (데스크톱 4열 / 태블릿 2열 / 모바일 1열) */}
        {sns.length > 0 && (
          <>
            <h3 className="text-lg font-semibold tracking-tight">SNS</h3>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sns.map((c) => (
                <MarketingSnsCard key={c.slug} item={c} />
              ))}
            </div>
          </>
        )}

        {/* Blog — 일반 카드 */}
        {blogs.length > 0 && (
          <>
            <h3 className="mt-12 text-lg font-semibold tracking-tight">Blog</h3>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {blogs.map((b) => (
                <MarketingBlogCard key={b.slug} item={b} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

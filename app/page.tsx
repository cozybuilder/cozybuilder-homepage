import Link from "next/link";
import Image from "next/image";
import { programs, snsChannels, type Program } from "@/lib/site";
import HeroVideo from "@/components/HeroVideo";

function HomeProgramCard({ p }: { p: Program }) {
  return (
    <Link href={`/programs/${p.slug}`} className="card card-hover">
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
    </Link>
  );
}

export default function HomePage() {
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

        {/* 컴퓨터 웹프로그램 / 모바일앱 구분 */}
        <h3 className="text-sm font-medium text-[--muted]">컴퓨터 웹프로그램</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs
            .filter((p) => p.type === "web")
            .map((p) => (
              <HomeProgramCard key={p.slug} p={p} />
            ))}
        </div>

        <h3 className="mt-8 text-sm font-medium text-[--muted]">모바일앱</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs
            .filter((p) => p.type === "mobile")
            .map((p) => (
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

        {/* 분류 제목만 유지 (상품 카드는 /product 에서 노출) */}
        <h3 className="text-lg font-semibold tracking-tight">홈페이지 제작</h3>
        <h3 className="mt-8 text-lg font-semibold tracking-tight">전자책</h3>
      </section>

      {/* ---------------- Marketing ---------------- */}
      <section className="container-page py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Marketing</p>
            <h2 className="text-3xl font-semibold tracking-tight">마케팅</h2>
          </div>
          <Link
            href="/sns"
            className="text-sm text-[--muted] transition-colors hover:text-foreground"
          >
            More →
          </Link>
        </div>

        {/* SNS (외부 링크 — 상세페이지 없음) */}
        <h3 className="text-lg font-semibold tracking-tight">SNS</h3>
        <ul className="mt-4 space-y-1.5 text-[--muted]">
          {snsChannels
            .filter((c) => ["youtube", "instagram"].includes(c.slug))
            .map((c) => (
              <li key={c.slug}>
                {c.externalUrl ? (
                  <a
                    href={c.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <span className="text-[--accent]">·</span>
                    {c.name}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[--accent]">·</span>
                    {c.name}
                  </span>
                )}
              </li>
            ))}
        </ul>

        {/* Blog (외부 링크 — 상세페이지 없음) */}
        <h3 className="mt-12 text-lg font-semibold tracking-tight">Blog</h3>
        <ul className="mt-4 space-y-1.5 text-[--muted]">
          <li>
            <span className="inline-flex items-center gap-2">
              <span className="text-[--accent]">·</span>
              CozyBuilder Lab
            </span>
          </li>
        </ul>
      </section>
    </>
  );
}

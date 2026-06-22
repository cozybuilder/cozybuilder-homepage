import Link from "next/link";
import Image from "next/image";
import {
  programs,
  snsChannels,
  websiteServices,
  bookItems,
} from "@/lib/site";
import HeroVideo from "@/components/HeroVideo";

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

      {/* ---------------- Product ---------------- */}
      <section className="container-page py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Product</p>
            <h2 className="text-3xl font-semibold tracking-tight">제품</h2>
          </div>
          <Link
            href="/programs"
            className="text-sm text-[--muted] transition-colors hover:text-foreground"
          >
            More →
          </Link>
        </div>

        {/* Programs (카드) */}
        <h3 className="text-lg font-semibold tracking-tight">Programs</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <Link
              key={p.slug}
              href={`/programs/${p.slug}`}
              className="card card-hover"
            >
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
          ))}
        </div>

        {/* Website Development (텍스트) */}
        <h3 className="mt-12 text-lg font-semibold tracking-tight">
          Website Development
        </h3>
        <ul className="mt-4 space-y-1.5 text-[--muted]">
          {websiteServices.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className="text-[--accent]">·</span>
              {s}
            </li>
          ))}
        </ul>

        {/* Books (텍스트) */}
        <h3 className="mt-12 text-lg font-semibold tracking-tight">Books</h3>
        <ul className="mt-4 space-y-1.5 text-[--muted]">
          {bookItems.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="text-[--accent]">·</span>
              {b}
            </li>
          ))}
        </ul>
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

        {/* SNS (텍스트) */}
        <h3 className="text-lg font-semibold tracking-tight">SNS</h3>
        <ul className="mt-4 space-y-1.5 text-[--muted]">
          {snsChannels
            .filter((c) => ["youtube", "instagram"].includes(c.slug))
            .map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/sns/${c.slug}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <span className="text-[--accent]">·</span>
                  {c.name}
                </Link>
              </li>
            ))}
        </ul>

        {/* Blog (텍스트) */}
        <h3 className="mt-12 text-lg font-semibold tracking-tight">Blog</h3>
        <ul className="mt-4 space-y-1.5 text-[--muted]">
          <li>
            <Link
              href="/sns/blog"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <span className="text-[--accent]">·</span>
              CozyBuilder Lab
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}

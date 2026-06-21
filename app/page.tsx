import Link from "next/link";
import { programs, snsChannels } from "@/lib/site";
import { ImagePlaceholder } from "@/components/ui";
import HeroVideo from "@/components/HeroVideo";

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="container-page relative pt-20 pb-24 md:pt-28 md:pb-32">
        <p className="eyebrow mb-6 text-center">COZYBUILDER</p>

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

      {/* ---------------- Products Preview ---------------- */}
      <section className="container-page py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Products</p>
            <h2 className="text-3xl font-semibold tracking-tight">프로그램</h2>
          </div>
          <Link
            href="/programs"
            className="text-sm text-[--muted] transition-colors hover:text-foreground"
          >
            More →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <Link
              key={p.slug}
              href={`/programs/${p.slug}`}
              className="card card-hover"
            >
              <div className="mb-4 text-3xl">{p.emoji}</div>
              <h3 className="text-base font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-[--muted]">{p.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Latest Content ---------------- */}
      <section className="container-page py-16">
        <div className="mb-10">
          <p className="eyebrow mb-3">Latest Content</p>
          <h2 className="text-3xl font-semibold tracking-tight">최근 콘텐츠</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {snsChannels
            .filter((c) => ["blog", "youtube", "instagram"].includes(c.slug))
            .map((c) => (
              <Link key={c.slug} href={`/sns/${c.slug}`} className="card card-hover">
                <ImagePlaceholder ratio="aspect-video" />
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xl">{c.emoji}</span>
                  <h3 className="text-base font-semibold">{c.name}</h3>
                </div>
                <p className="mt-2 text-sm text-[--muted]">{c.summary}</p>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}

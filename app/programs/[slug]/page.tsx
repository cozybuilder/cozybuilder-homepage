import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { programs } from "@/lib/site";
import { BackLink, ImagePlaceholder, Placeholder } from "@/components/ui";
import ProgramAction from "@/components/ProgramAction";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);
  return { title: program ? program.name : "프로그램" };
}

/** 모바일앱 스토어 버튼 (링크 없으면 출시 준비 중). */
function StoreButton({ label, url }: { label: string; url?: string }) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-ghost flex-1"
      >
        {label}
      </a>
    );
  }
  return (
    <span className="btn btn-ghost flex-1 cursor-not-allowed flex-col gap-0 py-3 opacity-60">
      <span>{label}</span>
      <span className="text-xs text-[--muted-2]">출시 준비 중</span>
    </span>
  );
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);
  if (!program) notFound();

  return (
    <div className="container-page py-12">
      <BackLink href="/programs">프로그램 목록</BackLink>

      {/* 1. Hero 이미지 */}
      <section className="mt-8">
        <div className="relative aspect-[16/6] w-full overflow-hidden rounded-2xl border border-[--border]">
          <Image
            src={program.image}
            alt={program.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
      </section>

      {/* 2. 프로그램 소개 */}
      <section className="mx-auto mt-12 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">{program.name}</h1>
        <p className="mt-3 text-lg text-[--accent]">{program.summary}</p>
        <p className="mt-6 text-lg leading-relaxed text-[--muted]">
          {program.description}
        </p>
      </section>

      {/* 3. 주요 기능 */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">주요 기능</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {program.features.map((f) => (
            <div key={f} className="card flex items-center gap-3 py-4">
              <span className="text-[--accent]">◆</span>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 스크린샷 */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">스크린샷</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImagePlaceholder ratio="aspect-video" />
          <ImagePlaceholder ratio="aspect-video" />
        </div>
      </section>

      {/* 5. 업데이트 내역 */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">업데이트 내역</h2>
        <div className="mt-6">
          <Placeholder label="업데이트 내역 준비 중" />
        </div>
      </section>

      {/* 6. 액션: web=구독/실행 / mobile=스토어 */}
      <section className="mx-auto mt-16 max-w-3xl">
        {program.type === "mobile" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <StoreButton label="Google Play" url={program.playStoreUrl} />
            <StoreButton label="App Store" url={program.appStoreUrl} />
          </div>
        ) : (
          <ProgramAction slug={program.slug} appUrl={program.appUrl} />
        )}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { programs } from "@/lib/site";
import { BackLink, ImagePlaceholder, Placeholder } from "@/components/ui";

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
        <ImagePlaceholder ratio="aspect-[16/6]" label={program.emoji} />
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

      {/* 6. 실행하기 버튼 → /login */}
      <section className="mx-auto mt-16 max-w-3xl text-center">
        <Link href="/login" className="btn btn-accent px-10 py-4 text-base">
          실행하기
        </Link>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { type Program } from "@/lib/site";
import { getPrograms } from "@/lib/content";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Programs" };

function ProgramCard({ p }: { p: Program }) {
  return (
    <Link href={`/programs/${p.slug}`} className="card card-hover">
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
      <span className="mt-4 inline-block text-sm text-[--accent]">
        자세히 보기 →
      </span>
    </Link>
  );
}

export default async function ProgramsPage() {
  const programs = await getPrograms();
  const webPrograms = programs.filter((p) => p.type === "web");
  const mobilePrograms = programs.filter((p) => p.type === "mobile");

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Programs"
        title="Programs"
        description="실행 가능한 프로그램과 앱. 카드를 눌러 자세히 살펴보세요."
      />

      {/* 컴퓨터 웹프로그램 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">컴퓨터 웹프로그램</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {webPrograms.map((p) => (
            <ProgramCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {/* 모바일앱 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">모바일앱</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mobilePrograms.map((p) => (
            <ProgramCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

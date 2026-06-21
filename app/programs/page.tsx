import type { Metadata } from "next";
import Link from "next/link";
import { programs } from "@/lib/site";
import { PageHeader, ImagePlaceholder } from "@/components/ui";

export const metadata: Metadata = { title: "프로그램" };

export default function ProgramsPage() {
  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Programs"
        title="프로그램"
        description="AI와 함께 만든 도구들. 카드를 눌러 자세히 살펴보세요."
      />

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <Link key={p.slug} href={`/programs/${p.slug}`} className="card card-hover">
            <ImagePlaceholder ratio="aspect-video" label={p.emoji} />
            <h2 className="mt-5 text-lg font-semibold">{p.name}</h2>
            <p className="mt-2 text-sm text-[--muted]">{p.summary}</p>
            <span className="mt-4 inline-block text-sm text-[--accent]">
              자세히 보기 →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

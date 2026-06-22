import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  programs,
  websiteServices,
  bookItems,
  type Program,
} from "@/lib/site";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Product" };

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

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-2 text-[--muted]">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span className="text-[--accent]">·</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ProductPage() {
  const webPrograms = programs.filter((p) => p.type === "web");
  const mobilePrograms = programs.filter((p) => p.type === "mobile");

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Product"
        title="Product"
        description="CozyBuilder가 만드는 프로그램과 서비스."
      />

      {/* Programs — 컴퓨터 웹프로그램 / 모바일앱 구분 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Programs</h2>

        <h3 className="mt-6 text-sm font-medium text-[--muted]">
          컴퓨터 웹프로그램
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {webPrograms.map((p) => (
            <ProgramCard key={p.slug} p={p} />
          ))}
        </div>

        <h3 className="mt-8 text-sm font-medium text-[--muted]">모바일앱</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mobilePrograms.map((p) => (
            <ProgramCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {/* Website Development */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          Website Development
        </h2>
        <TextList items={websiteServices} />
      </section>

      {/* Books */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Books</h2>
        <TextList items={bookItems} />
      </section>
    </div>
  );
}

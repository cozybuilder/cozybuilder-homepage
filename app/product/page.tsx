import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { websiteServices, bookItems } from "@/lib/site";

export const metadata: Metadata = { title: "Product" };

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
  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Product"
        title="Product"
        description="제작·출판 상품 영역."
      />

      {/* 홈페이지 제작 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">홈페이지 제작</h2>
        <TextList items={websiteServices} />
      </section>

      {/* 전자책 */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">전자책</h2>
        <TextList items={bookItems} />
      </section>
    </div>
  );
}

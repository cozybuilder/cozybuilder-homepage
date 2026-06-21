import type { Metadata } from "next";
import { PageHeader, Placeholder, BackLink } from "@/components/ui";

export const metadata: Metadata = { title: "Books" };

export default function BooksPage() {
  return (
    <div className="container-page py-20">
      <div className="mb-10">
        <BackLink href="/about">소개</BackLink>
      </div>
      <PageHeader
        eyebrow="Books"
        title="Books"
        description="경험과 지식을 담은 전자책."
      />
      <div className="mx-auto mt-14 max-w-2xl">
        <Placeholder label="전자책 목록 준비 중" />
      </div>
    </div>
  );
}

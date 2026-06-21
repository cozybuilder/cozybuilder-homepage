import type { Metadata } from "next";
import { PageHeader, Placeholder, BackLink } from "@/components/ui";

export const metadata: Metadata = { title: "Contents" };

export default function ContentsPage() {
  return (
    <div className="container-page py-20">
      <div className="mb-10">
        <BackLink href="/about">소개</BackLink>
      </div>
      <PageHeader
        eyebrow="Contents"
        title="Contents"
        description="블로그, 쇼츠, SNS 콘텐츠."
      />
      <div className="mx-auto mt-14 max-w-2xl">
        <Placeholder label="콘텐츠 준비 중" />
      </div>
    </div>
  );
}

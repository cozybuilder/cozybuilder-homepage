import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = { title: "Contents" };

export default function ContentsPage() {
  return (
    <div className="container-page py-20">
      <div className="mb-10">
        <BackButton href="/about" label="소개" />
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

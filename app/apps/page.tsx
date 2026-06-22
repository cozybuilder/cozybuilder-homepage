import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = { title: "Websites & Apps" };

export default function AppsPage() {
  return (
    <div className="container-page py-20">
      <div className="mb-10">
        <BackButton href="/about" label="소개" />
      </div>
      <PageHeader
        eyebrow="Websites & Apps"
        title="Websites & Apps"
        description="웹사이트와 앱 서비스 제작."
      />
      <div className="mx-auto mt-14 max-w-2xl">
        <Placeholder label="제작 사례 준비 중" />
      </div>
    </div>
  );
}

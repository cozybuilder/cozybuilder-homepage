import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = { title: "AI Characters" };

export default function CharactersPage() {
  return (
    <div className="container-page py-20">
      <div className="mb-10">
        <BackButton href="/about" label="소개" />
      </div>
      <PageHeader
        eyebrow="AI Characters"
        title="AI Characters"
        description="AI Cozy와 HARIN 캐릭터 세계관."
      />
      <div className="mx-auto mt-14 max-w-2xl">
        <Placeholder label="AI 캐릭터 소개 준비 중" />
      </div>
    </div>
  );
}

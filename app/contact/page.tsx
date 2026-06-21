import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "문의" };

export default function ContactPage() {
  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Contact"
        title="문의"
        description="협업, 제안, 무엇이든 편하게 연락주세요."
      />

      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
        <a
          href={`mailto:${siteConfig.email}`}
          className="card card-hover text-center"
        >
          <div className="mb-3 text-3xl">📧</div>
          <h2 className="text-base font-semibold">이메일</h2>
          <p className="mt-2 break-all text-sm text-[--muted]">{siteConfig.email}</p>
        </a>

        <Link href="/sns/instagram" className="card card-hover text-center">
          <div className="mb-3 text-3xl">📸</div>
          <h2 className="text-base font-semibold">Instagram</h2>
          <p className="mt-2 text-sm text-[--muted]">DM으로 연락하기</p>
        </Link>

        <a
          href={`mailto:${siteConfig.email}?subject=협업 문의`}
          className="card card-hover text-center"
        >
          <div className="mb-3 text-3xl">🤝</div>
          <h2 className="text-base font-semibold">협업 문의</h2>
          <p className="mt-2 text-sm text-[--muted]">프로젝트 제안</p>
        </a>
      </div>
    </div>
  );
}

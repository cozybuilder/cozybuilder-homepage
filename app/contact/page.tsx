import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "문의" };

const categories = [
  {
    emoji: "🧩",
    title: "프로그램 문의",
    desc: "프로그램 사용·기능에 대한 문의",
    subject: "프로그램 문의",
  },
  {
    emoji: "🔐",
    title: "계정/로그인 문의",
    desc: "로그인·계정 관련 문의",
    subject: "계정/로그인 문의",
  },
  {
    emoji: "🤝",
    title: "협업/제안 문의",
    desc: "협업·프로젝트 제안",
    subject: "협업/제안 문의",
  },
];

export default function ContactPage() {
  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Contact"
        title="문의"
        description="무엇이든 편하게 연락주세요. CozyBuilder가 직접 확인합니다."
      />

      <div className="mx-auto mt-12 max-w-3xl">
        {/* 대표 이메일 */}
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="card card-hover flex items-center gap-4"
        >
          <span className="text-3xl">📧</span>
          <div>
            <h2 className="text-base font-semibold">이메일</h2>
            <p className="mt-1 break-all text-sm text-[--accent]">
              {siteConfig.contactEmail}
            </p>
          </div>
        </a>

        {/* 문의 유형 */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {categories.map((c) => (
            <a
              key={c.title}
              href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
                c.subject
              )}`}
              className="card card-hover text-center"
            >
              <div className="mb-3 text-3xl">{c.emoji}</div>
              <h3 className="text-base font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-[--muted]">{c.desc}</p>
            </a>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[--muted-2]">
          답변은 상황에 따라 다소 지연될 수 있습니다. 양해 부탁드립니다.
        </p>
      </div>
    </div>
  );
}

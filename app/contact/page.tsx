import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { PageHeader } from "@/components/ui";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "문의" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; option?: string }>;
}) {
  const { product = "", option = "" } = await searchParams;

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Contact"
        title="문의"
        description="무엇이든 편하게 연락주세요. CozyBuilder가 직접 확인합니다."
      />

      <div className="mx-auto mt-12 max-w-3xl">
        {/* 문의 폼 */}
        <ContactForm product={product} option={option} />

        {/* 대표 이메일 안내 (폼 아래로 정리) */}
        <div className="card mt-6 flex cursor-default items-center gap-4">
          <span className="text-3xl">📧</span>
          <div>
            <h2 className="text-base font-semibold">이메일</h2>
            <p className="mt-1 break-all text-sm text-[--accent]">
              {siteConfig.contactEmail}
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[--muted-2]">
          답변은 상황에 따라 다소 지연될 수 있습니다. 양해 부탁드립니다.
        </p>
      </div>
    </div>
  );
}

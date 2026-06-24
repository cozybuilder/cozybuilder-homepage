import type { Metadata } from "next";
import { getMarketing } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import { MarketingSnsCard, MarketingBlogCard } from "@/components/MarketingCard";

export const metadata: Metadata = { title: "Marketing" };

// 관리자 콘텐츠를 항상 최신으로 반영(정적 ISR 캐시로 일부 채널이 누락돼 보이던 문제 방지).
// 데이터(getMarketing)는 여전히 캐시되며 관리자 저장 시 revalidateTag 로 갱신된다.
export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const items = await getMarketing();
  const sns = items.filter((i) => i.category === "sns");
  const blogs = items.filter((i) => i.category === "blog");

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Marketing"
        title="Marketing"
        description="기록과 콘텐츠를 나누는 채널들."
      />

      {/* SNS — 세로형 채널 카드 (데스크톱 4열 / 태블릿 2열 / 모바일 1열) */}
      {sns.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl">
          <h2 className="text-xl font-semibold tracking-tight">SNS</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sns.map((c) => (
              <MarketingSnsCard key={c.slug} item={c} />
            ))}
          </div>
        </section>
      )}

      {/* Blog — 일반 카드 */}
      {blogs.length > 0 && (
        <section className="mx-auto mt-16 max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight">Blog</h2>
          <div className="mt-6 space-y-6">
            {blogs.map((b) => (
              <MarketingBlogCard key={b.slug} item={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

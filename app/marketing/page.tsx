import type { Metadata } from "next";
import Image from "next/image";
import { getMarketing, type MarketingItem } from "@/lib/content";
import { PageHeader, ImagePlaceholder } from "@/components/ui";

export const metadata: Metadata = { title: "Marketing" };

// 관리자 콘텐츠를 항상 최신으로 반영(정적 ISR 캐시로 일부 채널이 누락돼 보이던 문제 방지).
// 데이터(getMarketing)는 여전히 캐시되며 관리자 저장 시 revalidateTag 로 갱신된다.
export const dynamic = "force-dynamic";

// SNS 채널 key → 표시명(카드 우측)
const CHANNEL_LABELS: Record<string, string> = {
  instagram: "인스타그램",
  youtube: "유튜브",
  tiktok: "틱톡",
  facebook: "페이스북",
  threads: "쓰레드",
};

/** 외부 링크 래퍼: external_url 있으면 새 탭 링크, 없으면 준비 중(비활성). */
function LinkCard({
  item,
  className,
  children,
}: {
  item: MarketingItem;
  className: string;
  children: React.ReactNode;
}) {
  if (item.externalUrl) {
    return (
      <a
        href={item.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} card-hover`}
      >
        {children}
      </a>
    );
  }
  return <div className={`${className} cursor-default`}>{children}</div>;
}

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
            {sns.map((c) => {
              const channelLabel = c.channelType
                ? CHANNEL_LABELS[c.channelType] ?? ""
                : "";
              return (
                <LinkCard key={c.slug} item={c} className="card flex flex-col">
                  <div className="mb-4">
                    {c.image ? (
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[--border]">
                        <Image
                          src={c.image}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 240px"
                        />
                      </div>
                    ) : (
                      <ImagePlaceholder ratio="aspect-[3/4]" label={c.name} />
                    )}
                  </div>
                  {/* 한 줄: 제목(왼쪽) + 채널명(우측 정렬) */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-base font-semibold">{c.name}</h3>
                    {channelLabel && (
                      <span className="shrink-0 text-xs text-[--muted-2]">
                        {channelLabel}
                      </span>
                    )}
                  </div>
                  {c.description && (
                    <p className="mt-1 text-sm text-[--muted]">{c.description}</p>
                  )}
                  <span className="mt-3 text-sm text-[--accent]">
                    {c.externalUrl ? "바로가기 →" : "준비 중"}
                  </span>
                </LinkCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Blog — 일반 카드 */}
      {blogs.length > 0 && (
        <section className="mx-auto mt-16 max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight">Blog</h2>
          <div className="mt-6 space-y-6">
            {blogs.map((b) => (
              <LinkCard key={b.slug} item={b} className="card block">
                {b.image ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[--border]">
                    <Image
                      src={b.image}
                      alt={b.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 576px"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder ratio="aspect-video" label={b.name} />
                )}
                <h3 className="mt-5 text-lg font-semibold">{b.name}</h3>
                {b.description && (
                  <p className="mt-2 text-sm text-[--muted]">{b.description}</p>
                )}
                <span className="mt-4 inline-block text-sm text-[--accent]">
                  {b.externalUrl ? "바로가기 →" : "준비 중"}
                </span>
              </LinkCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

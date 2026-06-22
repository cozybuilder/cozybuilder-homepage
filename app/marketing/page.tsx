import type { Metadata } from "next";
import Image from "next/image";
import { getMarketing, type MarketingItem } from "@/lib/content";
import { PageHeader, ImagePlaceholder } from "@/components/ui";

export const metadata: Metadata = { title: "Marketing" };

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

      {/* SNS — 세로형 모바일 채널 카드 */}
      {sns.length > 0 && (
        <section className="mx-auto mt-16 max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight">SNS</h2>
          <div className="mt-6 grid grid-cols-2 gap-5">
            {sns.map((c) => (
              <LinkCard key={c.slug} item={c} className="card flex flex-col">
                <div className="mb-4">
                  {c.image ? (
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[--border]">
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                  ) : (
                    <ImagePlaceholder ratio="aspect-[3/4]" label={c.name} />
                  )}
                </div>
                <h3 className="text-base font-semibold">{c.name}</h3>
                {c.description && (
                  <p className="mt-1 text-sm text-[--muted]">{c.description}</p>
                )}
                <span className="mt-3 text-sm text-[--accent]">
                  {c.externalUrl ? "바로가기 →" : "준비 중"}
                </span>
              </LinkCard>
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

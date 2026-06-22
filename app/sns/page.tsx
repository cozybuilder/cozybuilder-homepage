import type { Metadata } from "next";
import { snsChannels } from "@/lib/site";
import { PageHeader, ImagePlaceholder } from "@/components/ui";

export const metadata: Metadata = { title: "Marketing" };

/** 외부 링크 카드 래퍼: externalUrl 있으면 새 탭 링크, 없으면 준비 중(비활성). */
function LinkCardWrapper({
  externalUrl,
  className,
  children,
}: {
  externalUrl?: string;
  className: string;
  children: React.ReactNode;
}) {
  if (externalUrl) {
    return (
      <a
        href={externalUrl}
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

export default function MarketingPage() {
  const sns = snsChannels.filter((c) =>
    ["youtube", "instagram"].includes(c.slug)
  );
  const blog = snsChannels.find((c) => c.slug === "blog");

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Marketing"
        title="Marketing"
        description="기록과 콘텐츠를 나누는 채널들."
      />

      {/* SNS — 세로형 모바일 채널 카드 */}
      <section className="mx-auto mt-16 max-w-xl">
        <h2 className="text-xl font-semibold tracking-tight">SNS</h2>
        <div className="mt-6 grid grid-cols-2 gap-5">
          {sns.map((c) => (
            <LinkCardWrapper
              key={c.slug}
              externalUrl={c.externalUrl}
              className="card flex flex-col"
            >
              <div className="mb-4">
                <ImagePlaceholder ratio="aspect-[3/4]" label={c.emoji} />
              </div>
              <h3 className="text-base font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-[--muted]">{c.summary}</p>
              <span className="mt-3 text-sm text-[--accent]">
                {c.externalUrl ? "바로가기 →" : "준비 중"}
              </span>
            </LinkCardWrapper>
          ))}
        </div>
      </section>

      {/* Blog — Programs 카드와 유사한 일반 카드 */}
      <section className="mx-auto mt-16 max-w-xl">
        <h2 className="text-xl font-semibold tracking-tight">Blog</h2>
        <div className="mt-6">
          <LinkCardWrapper externalUrl={blog?.externalUrl} className="card block">
            <ImagePlaceholder ratio="aspect-video" label={blog?.emoji ?? "✍️"} />
            <h3 className="mt-5 text-lg font-semibold">CozyBuilder Lab</h3>
            <p className="mt-2 text-sm text-[--muted]">
              {blog?.summary ?? "기록과 생각을 글로 남깁니다"}
            </p>
            <span className="mt-4 inline-block text-sm text-[--accent]">
              {blog?.externalUrl ? "바로가기 →" : "준비 중"}
            </span>
          </LinkCardWrapper>
        </div>
      </section>
    </div>
  );
}

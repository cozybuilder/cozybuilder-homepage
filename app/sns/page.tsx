import type { Metadata } from "next";
import Link from "next/link";
import { snsChannels, type SnsChannel } from "@/lib/site";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Marketing" };

function ChannelCard({
  slug,
  emoji,
  name,
  summary,
}: {
  slug: string;
  emoji: string;
  name: string;
  summary: string;
}) {
  return (
    <Link href={`/sns/${slug}`} className="card card-hover">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="mt-1 text-sm text-[--muted]">{summary}</p>
        </div>
      </div>
    </Link>
  );
}

export default function MarketingPage() {
  const sns = snsChannels.filter((c: SnsChannel) =>
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

      {/* SNS */}
      <section className="mx-auto mt-16 max-w-4xl">
        <h2 className="text-xl font-semibold tracking-tight">SNS</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {sns.map((c) => (
            <ChannelCard
              key={c.slug}
              slug={c.slug}
              emoji={c.emoji}
              name={c.name}
              summary={c.summary}
            />
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="mx-auto mt-16 max-w-4xl">
        <h2 className="text-xl font-semibold tracking-tight">Blog</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ChannelCard
            slug="blog"
            emoji={blog?.emoji ?? "✍️"}
            name="CozyBuilder Lab"
            summary={blog?.summary ?? "기록과 생각을 글로 남깁니다"}
          />
        </div>
      </section>
    </div>
  );
}

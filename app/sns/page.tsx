import type { Metadata } from "next";
import Link from "next/link";
import { snsChannels } from "@/lib/site";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "SNS" };

export default function SnsPage() {
  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="SNS"
        title="채널"
        description="기록을 나누는 여러 채널들. 카드를 눌러 자세히 살펴보세요."
      />

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        {snsChannels.map((c) => (
          <Link key={c.slug} href={`/sns/${c.slug}`} className="card card-hover">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{c.emoji}</span>
              <div>
                <h2 className="text-lg font-semibold">{c.name}</h2>
                <p className="mt-1 text-sm text-[--muted]">{c.summary}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

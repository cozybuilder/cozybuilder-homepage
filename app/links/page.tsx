import type { Metadata } from "next";
import Link from "next/link";
import { programs, snsChannels, siteConfig } from "@/lib/site";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "전체 링크" };

function LinkRow({ href, label, emoji }: { href: string; label: string; emoji?: string }) {
  return (
    <Link
      href={href}
      className="card card-hover flex items-center justify-between py-4"
    >
      <span className="flex items-center gap-3 text-sm font-medium">
        {emoji && <span className="text-xl">{emoji}</span>}
        {label}
      </span>
      <span className="text-[--muted-2]">→</span>
    </Link>
  );
}

export default function LinksPage() {
  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Links"
        title="전체 링크"
        description="CozyBuilder의 모든 링크를 한 곳에."
      />

      <div className="mx-auto mt-14 max-w-md space-y-8">
        <div>
          <h2 className="eyebrow mb-3">프로그램</h2>
          <div className="space-y-3">
            {programs.map((p) => (
              <LinkRow
                key={p.slug}
                href={`/programs/${p.slug}`}
                label={p.name}
                emoji={p.emoji}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="eyebrow mb-3">SNS</h2>
          <div className="space-y-3">
            {snsChannels.map((c) => (
              <LinkRow
                key={c.slug}
                href={`/sns/${c.slug}`}
                label={c.name}
                emoji={c.emoji}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="eyebrow mb-3">문의</h2>
          <div className="space-y-3">
            <LinkRow href="/contact" label="문의하기" emoji="✉️" />
            <a
              href={`mailto:${siteConfig.email}`}
              className="card card-hover flex items-center justify-between py-4"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <span className="text-xl">📧</span>
                {siteConfig.email}
              </span>
              <span className="text-[--muted-2]">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

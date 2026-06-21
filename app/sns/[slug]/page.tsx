import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { snsChannels } from "@/lib/site";
import { BackLink, Placeholder } from "@/components/ui";

export function generateStaticParams() {
  return snsChannels.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const channel = snsChannels.find((c) => c.slug === slug);
  return { title: channel ? channel.name : "SNS" };
}

export default async function SnsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const channel = snsChannels.find((c) => c.slug === slug);
  if (!channel) notFound();

  return (
    <div className="container-page py-12">
      <BackLink href="/sns">SNS 목록</BackLink>

      <section className="mx-auto mt-10 max-w-3xl text-center">
        <div className="text-5xl">{channel.emoji}</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          {channel.name}
        </h1>
        <p className="mt-3 text-lg text-[--muted]">{channel.summary}</p>
      </section>

      <section className="mx-auto mt-12 max-w-3xl">
        <Placeholder label={`${channel.name} 피드 준비 중`} />
      </section>
    </div>
  );
}

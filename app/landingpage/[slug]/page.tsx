import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingRenderer from "@/components/landingpage/LandingRenderer";
import {
  LANDING_BASE_URL,
  LANDING_CONFIGS,
  getLandingConfig,
  landingUrl,
} from "@/lib/landingpage/config";

// 공용 랜딩페이지 라우트. 설계: docs/landing/LANDINGPAGE_PLATFORM.md
// 등록된 slug 만 렌더 — 내용은 lib/landingpage/config.ts 가 소유한다.

export function generateStaticParams() {
  return LANDING_CONFIGS.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false; // 미등록 slug 는 404

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = getLandingConfig(slug);
  if (!config) return {};
  const url = landingUrl(config.slug);
  return {
    title: { absolute: config.meta.title },
    description: config.meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: config.meta.title,
      description: config.meta.description,
      url,
      siteName: "CozyBuilder",
      locale: "ko_KR",
      type: "website",
      images: [{ url: `${LANDING_BASE_URL}${config.images.og}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.meta.title,
      description: config.meta.description,
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const config = getLandingConfig(slug);
  if (!config) notFound();
  return <LandingRenderer config={config} />;
}

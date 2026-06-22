import "server-only";
import { unstable_cache } from "next/cache";
import { createClient as createPublicClient } from "@supabase/supabase-js";
import {
  programs as fallbackPrograms,
  products as fallbackProducts,
  snsChannels,
  type Program,
  type Product,
  type ProgramUpdate,
} from "@/lib/site";

// 공개 화면용 통합 데이터 레이어.
// published 콘텐츠는 쿠키 없는 anon 클라이언트로 조회 + unstable_cache(tags)로 캐싱.
// → 매 요청 DB 왕복 제거(정적/ISR화). 관리자 저장 시 revalidateTag 로 무효화.
// DB가 비어 있거나 오류면 lib/site fallback 사용(화면이 비지 않도록).

const supabasePublic = createPublicClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const CACHE_TAGS = {
  programs: "programs",
  products: "products",
  marketing: "marketing",
} as const;

const CACHE_TTL = 3600; // 초

export type MarketingItem = {
  slug: string;
  category: "sns" | "blog";
  name: string;
  description?: string;
  image?: string;
  externalUrl?: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function asStringArray(v: any): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

function rowToProgram(r: any): Program {
  return {
    slug: r.slug,
    name: r.name,
    summary: r.summary ?? "",
    description: r.description ?? "",
    features: asStringArray(r.features),
    emoji: "",
    image: r.image ?? "",
    type: r.type === "mobile" ? "mobile" : "web",
    appUrl: r.app_url ?? "",
    screenshots: asStringArray(r.screenshots),
    updates: Array.isArray(r.updates)
      ? (r.updates as ProgramUpdate[]).filter((u) => u && u.text)
      : [],
  };
}

function rowToProduct(r: any): Product {
  return {
    slug: r.slug,
    name: r.name,
    summary: r.summary ?? "",
    image: r.image ?? "",
    contents: asStringArray(r.contents),
    screenshots: asStringArray(r.screenshots),
    longDescription: r.long_description ?? "",
    price: r.price ?? "",
    cta: r.cta === "buy" ? "buy" : "contact",
    ctaUrl: r.cta_url ?? "",
    category: r.category === "website" ? "website" : "ebook",
  };
}

function rowToMarketing(r: any): MarketingItem {
  return {
    slug: r.slug,
    category: r.category === "blog" ? "blog" : "sns",
    name: r.name,
    description: r.description ?? "",
    image: r.image ?? "",
    externalUrl: r.external_url ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const fallbackMarketing: MarketingItem[] = snsChannels
  .filter((c) => ["youtube", "instagram", "blog"].includes(c.slug))
  .map((c) => ({
    slug: c.slug,
    category: c.slug === "blog" ? "blog" : "sns",
    name: c.slug === "blog" ? "CozyBuilder Lab" : c.name,
    description: c.summary,
    image: c.image ?? "",
    externalUrl: c.externalUrl ?? "",
  }));

// ── 캐시된 published 조회 ──
export const getPrograms = unstable_cache(
  async (): Promise<Program[]> => {
    const { data, error } = await supabasePublic
      .from("programs")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackPrograms;
    return data.map(rowToProgram);
  },
  ["programs-list"],
  { tags: [CACHE_TAGS.programs], revalidate: CACHE_TTL }
);

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { data, error } = await supabasePublic
      .from("products")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackProducts;
    return data.map(rowToProduct);
  },
  ["products-list"],
  { tags: [CACHE_TAGS.products], revalidate: CACHE_TTL }
);

export const getMarketing = unstable_cache(
  async (): Promise<MarketingItem[]> => {
    const { data, error } = await supabasePublic
      .from("marketing_channels")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackMarketing;
    return data.map(rowToMarketing);
  },
  ["marketing-list"],
  { tags: [CACHE_TAGS.marketing], revalidate: CACHE_TTL }
);

// 단건: 캐시된 목록에서 조회 (요청당 추가 DB 왕복 없음)
export async function getProgram(slug: string): Promise<Program | null> {
  return (await getPrograms()).find((p) => p.slug === slug) ?? null;
}

export async function getProduct(slug: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  programs as fallbackPrograms,
  products as fallbackProducts,
  snsChannels,
  type Program,
  type Product,
  type ProgramUpdate,
} from "@/lib/site";

// 공개 화면용 통합 데이터 레이어.
// 규칙: Supabase에 published 데이터가 있으면 DB 사용, 없으면 lib/site fallback.

export type MarketingItem = {
  slug: string;
  category: "sns" | "blog";
  name: string;
  description?: string;
  image?: string;
  externalUrl?: string;
};

// ── 매핑 (DB row → 화면 타입) ──
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

// 마케팅 fallback: 기존 snsChannels → MarketingItem
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

// ── Programs ──
export async function getPrograms(): Promise<Program[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackPrograms;
    return data.map(rowToProgram);
  } catch {
    return fallbackPrograms;
  }
}

export async function getProgram(slug: string): Promise<Program | null> {
  const all = await getPrograms();
  return all.find((p) => p.slug === slug) ?? null;
}

// ── Products ──
export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackProducts;
    return data.map(rowToProduct);
  } catch {
    return fallbackProducts;
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

// ── Marketing ──
export async function getMarketing(): Promise<MarketingItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("marketing_channels")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallbackMarketing;
    return data.map(rowToMarketing);
  } catch {
    return fallbackMarketing;
  }
}

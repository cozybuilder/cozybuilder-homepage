"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { CACHE_TAGS } from "@/lib/content";

function lines(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function updatesFrom(v: FormDataEntryValue | null): { date: string; text: string }[] {
  return lines(v)
    .map((line) => {
      const idx = line.indexOf("|");
      if (idx === -1) return { date: "", text: line.trim() };
      return { date: line.slice(0, idx).trim(), text: line.slice(idx + 1).trim() };
    })
    .filter((u) => u.text);
}

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/programs");
  revalidatePath("/product");
  revalidatePath("/marketing");
}

// 폼 액션 반환 상태 (useActionState 용)
export type SaveState = { error?: string } | null;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Programs ──
export async function saveProgram(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  await requireAdmin();
  const supabase = await createClient();
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  let slug = str(formData.get("slug"));

  // slug 없으면 이름 기반 자동 생성 (한글 등으로 비면 신규는 랜덤 fallback)
  if (!slug) slug = slugify(name);

  // 공통 필드 (slug 는 분기에서 처리)
  const base = {
    type: str(formData.get("type")) === "mobile" ? "mobile" : "web",
    name,
    subtitle: str(formData.get("subtitle")),
    summary: str(formData.get("summary")),
    description: str(formData.get("description")),
    image: str(formData.get("image")),
    features: lines(formData.get("features")),
    screenshots: lines(formData.get("screenshots")),
    updates: updatesFrom(formData.get("updates")),
    app_url: str(formData.get("app_url")),
    status: str(formData.get("status")) === "published" ? "published" : "draft",
    sort_order: Number(str(formData.get("sort_order"))) || 0,
    updated_at: new Date().toISOString(),
  };

  console.log("[saveProgram] keys:", [...formData.keys()].join(","), "| id:", id || "(new)", "| slug:", slug);

  let data, error;
  if (id) {
    // 수정: slug 비면 기존 slug 유지(payload 에서 제외)
    const payload = slug ? { ...base, slug } : base;
    ({ data, error } = await supabase
      .from("programs")
      .update(payload)
      .eq("id", id)
      .select());
  } else {
    // 신규: slug 보장 (비면 랜덤)
    if (!slug) slug = `program-${Date.now().toString(36)}`;
    ({ data, error } = await supabase
      .from("programs")
      .insert({ ...base, slug })
      .select());
  }

  console.log("[saveProgram] result:", { error: error?.message, rows: data?.length });

  if (error) {
    console.error("[saveProgram] supabase error:", error);
    return { error: error.message };
  }
  if (id && (!data || data.length === 0)) {
    return {
      error:
        "업데이트된 행이 없습니다. 관리자 권한(admin_users 등록) 또는 RLS 정책을 확인하세요.",
    };
  }

  revalidateTag(CACHE_TAGS.programs, "max");
  revalidatePath("/admin/programs");
  revalidatePublic();
  redirect("/admin/programs");
}

export async function deleteProgram(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("programs").delete().eq("id", str(formData.get("id")));
  revalidateTag(CACHE_TAGS.programs, "max");
  revalidatePath("/admin/programs");
  revalidatePublic();
  redirect("/admin/programs");
}

// ── Products ──
export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  let slug = str(formData.get("slug"));
  if (!slug) slug = slugify(name);
  const base = {
    category: str(formData.get("category")) === "website" ? "website" : "ebook",
    name,
    summary: str(formData.get("summary")),
    image: str(formData.get("image")),
    contents: lines(formData.get("contents")),
    screenshots: lines(formData.get("screenshots")),
    long_description: str(formData.get("long_description")),
    price: str(formData.get("price")),
    cta: str(formData.get("cta")) === "buy" ? "buy" : "contact",
    cta_label: str(formData.get("cta_label")),
    cta_url: str(formData.get("cta_url")),
    status: str(formData.get("status")) === "published" ? "published" : "draft",
    sort_order: Number(str(formData.get("sort_order"))) || 0,
    updated_at: new Date().toISOString(),
  };
  if (id) {
    await supabase.from("products").update(slug ? { ...base, slug } : base).eq("id", id);
  } else {
    if (!slug) slug = `product-${Date.now().toString(36)}`;
    await supabase.from("products").insert({ ...base, slug });
  }
  revalidateTag(CACHE_TAGS.products, "max");
  revalidatePath("/admin/product");
  revalidatePublic();
  redirect("/admin/product");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", str(formData.get("id")));
  revalidateTag(CACHE_TAGS.products, "max");
  revalidatePath("/admin/product");
  revalidatePublic();
  redirect("/admin/product");
}

// ── Marketing ──
export async function saveMarketing(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  let slug = str(formData.get("slug"));
  if (!slug) slug = slugify(name);
  // 구분(채널) — 새 채널 key 보존. 알 수 없는 값은 기존 호환을 위해 sns 로.
  const MARKETING_CATEGORIES = [
    "instagram",
    "youtube",
    "tiktok",
    "facebook",
    "threads",
    "blog",
    "sns",
  ];
  const rawCategory = str(formData.get("category"));
  const category = MARKETING_CATEGORIES.includes(rawCategory) ? rawCategory : "sns";
  const base = {
    category,
    name,
    description: str(formData.get("description")),
    image: str(formData.get("image")),
    external_url: str(formData.get("external_url")),
    status: str(formData.get("status")) === "published" ? "published" : "draft",
    sort_order: Number(str(formData.get("sort_order"))) || 0,
    updated_at: new Date().toISOString(),
  };
  if (id) {
    await supabase
      .from("marketing_channels")
      .update(slug ? { ...base, slug } : base)
      .eq("id", id);
  } else {
    if (!slug) slug = `channel-${Date.now().toString(36)}`;
    await supabase.from("marketing_channels").insert({ ...base, slug });
  }
  revalidateTag(CACHE_TAGS.marketing, "max");
  revalidatePath("/admin/marketing");
  revalidatePublic();
  redirect("/admin/marketing");
}

export async function deleteMarketing(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("marketing_channels")
    .delete()
    .eq("id", str(formData.get("id")));
  revalidateTag(CACHE_TAGS.marketing, "max");
  revalidatePath("/admin/marketing");
  revalidatePublic();
  redirect("/admin/marketing");
}

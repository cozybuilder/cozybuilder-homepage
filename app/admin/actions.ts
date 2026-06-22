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

// ── Programs ──
export async function saveProgram(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  await requireAdmin();
  const supabase = await createClient();
  const id = str(formData.get("id"));
  const slug = str(formData.get("slug"));
  if (!slug) {
    return { error: "slug 가 비어 있습니다. 고급 옵션에서 slug를 확인하세요." };
  }
  const payload = {
    slug,
    type: str(formData.get("type")) === "mobile" ? "mobile" : "web",
    name: str(formData.get("name")),
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

  const { data, error } = id
    ? await supabase.from("programs").update(payload).eq("id", id).select()
    : await supabase.from("programs").insert(payload).select();

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
  const payload = {
    slug: str(formData.get("slug")),
    category: str(formData.get("category")) === "website" ? "website" : "ebook",
    name: str(formData.get("name")),
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
  if (id) await supabase.from("products").update(payload).eq("id", id);
  else await supabase.from("products").insert(payload);
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
  const payload = {
    slug: str(formData.get("slug")),
    category: str(formData.get("category")) === "blog" ? "blog" : "sns",
    name: str(formData.get("name")),
    description: str(formData.get("description")),
    image: str(formData.get("image")),
    external_url: str(formData.get("external_url")),
    status: str(formData.get("status")) === "published" ? "published" : "draft",
    sort_order: Number(str(formData.get("sort_order"))) || 0,
    updated_at: new Date().toISOString(),
  };
  if (id) await supabase.from("marketing_channels").update(payload).eq("id", id);
  else await supabase.from("marketing_channels").insert(payload);
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

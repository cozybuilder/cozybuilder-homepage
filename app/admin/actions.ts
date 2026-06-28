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

  // release_status 는 정해진 3개 값만 허용(나머지/빈값 → null). CHECK 제약 위반 방지.
  const releaseRaw = str(formData.get("release_status"));
  const releaseStatus = (
    ["development", "coming_soon", "released"] as const
  ).includes(releaseRaw as "development" | "coming_soon" | "released")
    ? releaseRaw
    : null;

  // 공통 필드 (slug 는 분기에서 처리)
  // platform=web 이면 모바일 필드, platform=mobile 이면 app_url 이 폼에서 렌더되지 않아
  // 자연스럽게 빈값으로 정리된다(플랫폼 전환 시 반대편 링크가 남지 않음).
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
    app_url: str(formData.get("app_url")), // web 실행 URL (web_url 역할)
    play_store_url: str(formData.get("play_store_url")), // mobile
    app_store_url: str(formData.get("app_store_url")), // mobile
    release_status: releaseStatus, // mobile 출시 상태
    status: str(formData.get("status")) === "published" ? "published" : "draft",
    sort_order: Number(str(formData.get("sort_order"))) || 0,
    updated_at: new Date().toISOString(),
  };

  console.log("[saveProgram] keys:", [...formData.keys()].join(","), "| id:", id || "(new)", "| slug:", slug);

  // 0010 미실행(모바일 컬럼 없음) 환경에서도 저장이 깨지지 않도록, 컬럼 부재 오류면
  // 신규 모바일 필드를 제외하고 재시도한다(marketing channel_type 와 동일한 하위호환 패턴).
  const writeProgram = async (payload: Record<string, unknown>) => {
    if (id) {
      return supabase.from("programs").update(payload).eq("id", id).select();
    }
    return supabase.from("programs").insert(payload).select();
  };

  // 신규: slug 보장 (비면 랜덤) / 수정: slug 비면 기존 유지(payload 에서 제외)
  if (!id && !slug) slug = `program-${Date.now().toString(36)}`;
  const payload: Record<string, unknown> = slug ? { ...base, slug } : { ...base };

  let { data, error } = await writeProgram(payload);
  if (error && /play_store_url|app_store_url|release_status/i.test(error.message)) {
    const legacy = { ...payload };
    delete legacy.play_store_url;
    delete legacy.app_store_url;
    delete legacy.release_status;
    ({ data, error } = await writeProgram(legacy));
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

// ── Products (범용 상품 CMS v1) ──
function pick<T extends string>(
  v: FormDataEntryValue | null,
  allowed: readonly T[],
  fallback: T
): T {
  const s = str(v) as T;
  return allowed.includes(s) ? s : fallback;
}

// 숫자 문자열 → 정수 또는 null (콤마/공백 허용)
function intOrNull(v: FormDataEntryValue | null): number | null {
  const s = str(v).replace(/[, ]/g, "");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// options 입력(JSON 문자열) → 정규화 배열. 빈 이름 제외.
function parseOptions(v: FormDataEntryValue | null): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(String(v ?? "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((o) => {
        const name = String(o?.name ?? "").trim();
        const rawPrice = o?.price;
        const price =
          typeof rawPrice === "number"
            ? Math.round(rawPrice)
            : intOrNull(rawPrice == null ? "" : String(rawPrice));
        const out: Record<string, unknown> = {
          name,
          price,
          price_label: String(o?.price_label ?? "").trim(),
          description: String(o?.description ?? "").trim(),
        };
        const billing = String(o?.billing ?? "").trim();
        if (billing) out.billing = billing;
        return out;
      })
      .filter((o) => o.name);
  } catch {
    return [];
  }
}

export async function saveProduct(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  await requireAdmin();
  const supabase = await createClient();
  const id = str(formData.get("id"));
  const title = str(formData.get("title"));
  let slug = str(formData.get("slug"));
  if (!slug) slug = slugify(title);

  // 견적 문의(quote)는 가격 비어도 저장 가능 — price/sale_price 는 항상 nullable.
  const base = {
    title,
    product_type: pick(
      formData.get("product_type"),
      ["digital", "service", "subscription", "physical"] as const,
      "digital"
    ),
    category: str(formData.get("category")),
    status: pick(
      formData.get("status"),
      ["draft", "published", "hidden", "soldout"] as const,
      "draft"
    ),
    featured: str(formData.get("featured")) === "true",
    button_type: pick(
      formData.get("button_type"),
      ["inquiry", "payment"] as const,
      "inquiry"
    ),
    price_type: pick(
      formData.get("price_type"),
      ["fixed", "sale", "quote", "free", "monthly", "yearly"] as const,
      "fixed"
    ),
    price: intOrNull(formData.get("price")),
    sale_price: intOrNull(formData.get("sale_price")),
    price_label: str(formData.get("price_label")),
    thumbnail_url: str(formData.get("thumbnail_url")),
    gallery_urls: lines(formData.get("gallery_urls")),
    short_description: str(formData.get("short_description")),
    description: str(formData.get("description")),
    options: parseOptions(formData.get("options")),
    updated_at: new Date().toISOString(),
  };

  let data, error;
  if (id) {
    const payload = slug ? { ...base, slug } : base;
    ({ data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select());
  } else {
    if (!slug) slug = `product-${Date.now().toString(36)}`;
    ({ data, error } = await supabase
      .from("products")
      .insert({ ...base, slug })
      .select());
  }

  if (error) {
    console.error("[saveProduct] supabase error:", error);
    return { error: error.message };
  }
  if (id && (!data || data.length === 0)) {
    return {
      error:
        "업데이트된 행이 없습니다. 관리자 권한(admin_users 등록) 또는 RLS 정책을 확인하세요.",
    };
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
  // 구분(category)은 기존대로 'sns'/'blog' (0002 CHECK 유지).
  // SNS 하위 채널은 channel_type 에 저장(blog 이면 null). 채널 key 를 category 에 넣지 않는다.
  const category = str(formData.get("category")) === "blog" ? "blog" : "sns";
  const SNS_CHANNELS = ["instagram", "youtube", "tiktok", "facebook", "threads"];
  const rawChannel = str(formData.get("channel_type"));
  const channelType =
    category === "sns" && SNS_CHANNELS.includes(rawChannel) ? rawChannel : null;

  const base = {
    category,
    channel_type: channelType,
    name,
    description: str(formData.get("description")),
    image: str(formData.get("image")),
    external_url: str(formData.get("external_url")),
    status: str(formData.get("status")) === "published" ? "published" : "draft",
    sort_order: Number(str(formData.get("sort_order"))) || 0,
    updated_at: new Date().toISOString(),
  };
  if (!id && !slug) slug = `channel-${Date.now().toString(36)}`;
  const full: Record<string, unknown> = slug ? { ...base, slug } : { ...base };

  const write = (payload: Record<string, unknown>) =>
    id
      ? supabase.from("marketing_channels").update(payload).eq("id", id)
      : supabase.from("marketing_channels").insert(payload);

  let { error } = await write(full);
  if (error && /channel_type/i.test(error.message)) {
    // channel_type 컬럼이 아직 없음(0007 미실행) → 제외하고 재시도(저장 보장, 채널값은 0007 후 반영).
    const withoutChannel = { ...full };
    delete withoutChannel.channel_type;
    ({ error } = await write(withoutChannel));
  }
  if (error) {
    // 조용한 실패 방지: 서버 로그로 원인 노출(스토리지/제약/RLS 등).
    console.error("[saveMarketing] supabase error:", error.message, {
      id: id || "(new)",
      category,
      channelType,
    });
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

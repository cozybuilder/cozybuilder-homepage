"use client";

import { createClient } from "@/lib/supabase/client";

// 브라우저에서 긴 변 max 이하로 리사이즈 + WebP 변환 후 Supabase Storage 업로드.
// 버킷: cms-images (public). 실패 시 throw → 호출부에서 URL 직접 입력으로 대체.

const BUCKET = "cms-images";

// 이미지 종류별 프리셋.
//  - hero  : 대표 이미지 (긴 변 1600px, quality 0.82)
//  - thumb : 썸네일/카드/스크린샷 (긴 변 1200px, quality 0.8)
export type ImageKind = "hero" | "thumb";

const PRESETS: Record<ImageKind, { max: number; quality: number }> = {
  hero: { max: 1600, quality: 0.82 },
  thumb: { max: 1200, quality: 0.8 },
};

// 용량 목표(300~800KB 내외). 초과 시 quality 를 단계적으로 낮춰 재인코딩한다.
const TARGET_MAX_BYTES = 800 * 1024;
const MIN_QUALITY = 0.6;
const QUALITY_STEP = 0.07;

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", quality)
  );
}

async function resizeToWebp(file: File, kind: ImageKind): Promise<Blob | null> {
  const { max, quality } = PRESETS[kind];
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, w, h);

    // 시작 quality 로 인코딩 후, 용량 목표를 넘으면 quality 만 단계적으로 낮춰 재인코딩.
    let q = quality;
    let blob = await encode(canvas, q);
    while (blob && blob.size > TARGET_MAX_BYTES && q > MIN_QUALITY) {
      q = Math.max(MIN_QUALITY, q - QUALITY_STEP);
      blob = await encode(canvas, q);
    }
    return blob;
  } catch {
    return null;
  }
}

export async function uploadImage(
  file: File,
  folder: string,
  kind: ImageKind = "hero"
): Promise<string> {
  const supabase = createClient();
  const webp = await resizeToWebp(file, kind);
  const body: Blob = webp ?? file;
  const ext = webp ? "webp" : (file.name.split(".").pop() || "bin");
  const contentType = webp ? "image/webp" : file.type || "application/octet-stream";
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${folder}/${Date.now()}-${rand}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

"use client";

import { createClient } from "@/lib/supabase/client";

// 브라우저에서 긴 변 max 이하로 리사이즈 + WebP 변환 후 Supabase Storage 업로드.
// 버킷: cms-images (public). 실패 시 throw → 호출부에서 URL 직접 입력으로 대체.

const BUCKET = "cms-images";

async function resizeToWebp(
  file: File,
  max = 1600,
  quality = 0.8
): Promise<Blob | null> {
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
    return await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", quality)
    );
  } catch {
    return null;
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const webp = await resizeToWebp(file);
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

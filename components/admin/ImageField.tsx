"use client";

import { useState } from "react";
import { uploadImage } from "@/components/admin/uploadImage";

/** 단일 대표 이미지: 업로드(리사이즈) + 미리보기 + 고급(URL 직접 입력). */
export default function ImageField({
  name,
  folder,
  initial = "",
  recommend,
}: {
  name: string;
  folder: string;
  initial?: string;
  recommend?: string;
}) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      setUrl(await uploadImage(file, folder));
    } catch {
      setErr("업로드 실패 — Storage 버킷(cms-images) 설정 확인 또는 아래 URL 직접 입력.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={url} />
      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        className="block w-full text-sm text-[--muted] file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-foreground hover:file:bg-white/20"
      />
      {recommend && <p className="text-xs text-[--muted-2]">{recommend}</p>}
      {busy && <p className="text-xs text-[--muted]">업로드 중…</p>}
      {err && <p className="text-xs text-red-300">{err}</p>}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="미리보기"
          className="aspect-[16/9] w-full max-w-sm rounded-xl border border-[--border] object-cover"
        />
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-[--muted-2]">
          고급: 이미지 URL 직접 입력
        </summary>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/image/ebook.png"
          className="input mt-2"
        />
      </details>
    </div>
  );
}

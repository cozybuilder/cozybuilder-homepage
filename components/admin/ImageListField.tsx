"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/components/admin/uploadImage";

/** 여러 이미지: 썸네일 그리드 + "+ 추가" 카드. 고급: URL 직접 추가. hidden(name) 줄단위. */
export default function ImageListField({
  name,
  folder,
  initial = [],
  recommend,
}: {
  name: string;
  folder: string;
  initial?: string[];
  recommend?: string;
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const uploaded: string[] = [];
      for (const f of files) uploaded.push(await uploadImage(f, folder));
      setUrls((prev) => [...prev, ...uploaded]);
    } catch {
      setErr("업로드 실패 — 고급 옵션에서 URL을 직접 추가하세요.");
    } finally {
      setBusy(false);
    }
  };

  const remove = (i: number) => setUrls((prev) => prev.filter((_, idx) => idx !== i));
  const addManual = () => {
    const v = manual.trim();
    if (v) {
      setUrls((prev) => [...prev, v]);
      setManual("");
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={urls.join("\n")} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFiles}
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-3">
        {urls.map((u, i) => (
          <div key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={u}
              alt={`스크린샷 ${i + 1}`}
              className="aspect-video w-full rounded-lg border border-[--border] object-cover"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 rounded-full bg-black/70 px-2 text-xs text-white"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[--border-strong] bg-[--surface-2]/40 text-[--muted] transition-colors hover:bg-[--surface-2]"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs">{busy ? "업로드 중…" : "추가"}</span>
        </button>
      </div>

      {recommend && <p className="text-xs text-[--muted-2]">{recommend}</p>}
      {err && <p className="text-xs text-red-300">{err}</p>}

      <details className="text-sm">
        <summary className="cursor-pointer text-[--muted-2]">고급: URL 직접 추가</summary>
        <div className="mt-2 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="/image/shots.png"
            className="input"
          />
          <button type="button" onClick={addManual} className="btn btn-ghost px-4">
            추가
          </button>
        </div>
      </details>
    </div>
  );
}

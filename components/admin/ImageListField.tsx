"use client";

import { useState } from "react";
import { uploadImage } from "@/components/admin/uploadImage";

/** 여러 이미지: 업로드(여러 장) + 썸네일 + 삭제. hidden(name) 에 줄단위 URL 저장. */
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

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const uploaded: string[] = [];
      for (const f of files) uploaded.push(await uploadImage(f, folder));
      setUrls((prev) => [...prev, ...uploaded]);
    } catch {
      setErr("업로드 실패 — Storage 버킷(cms-images) 설정 확인 또는 URL 직접 추가.");
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
    <div className="space-y-3">
      <input type="hidden" name={name} value={urls.join("\n")} />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onFiles}
        className="block w-full text-sm text-[--muted] file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-foreground hover:file:bg-white/20"
      />
      {recommend && <p className="text-xs text-[--muted-2]">{recommend}</p>}
      {busy && <p className="text-xs text-[--muted]">업로드 중…</p>}
      {err && <p className="text-xs text-red-300">{err}</p>}

      {urls.length > 0 && (
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
        </div>
      )}

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

"use client";

import { useRef, useState } from "react";
import { uploadImage, type ImageKind } from "@/components/admin/uploadImage";

/** 여러 이미지: 비어있으면 큰 추가 카드, 있으면 썸네일 그리드(+추가). 고급 옵션: URL 직접 추가. */
export default function ImageListField({
  name,
  folder,
  initial = [],
  kind = "thumb",
}: {
  name: string;
  folder: string;
  initial?: string[];
  kind?: ImageKind;
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
      for (const f of files) uploaded.push(await uploadImage(f, folder, kind));
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (e) {
      console.error("[ImageListField] upload error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setErr(`업로드 실패: ${msg} — 고급 옵션에서 URL을 직접 추가할 수도 있습니다.`);
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
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />

      {urls.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-foreground">
            +
          </span>
          <span className="text-sm font-medium text-foreground">
            {busy ? "업로드 중…" : "스크린샷 추가"}
          </span>
          <span className="text-xs text-[--muted-2]">여러 장 업로드 가능</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {urls.map((u, i) => (
            <div key={i} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u}
                alt={`스크린샷 ${i + 1}`}
                className="aspect-video w-full rounded-lg border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 text-[--muted] transition-colors hover:bg-white/10"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs">{busy ? "업로드 중…" : "추가"}</span>
          </button>
        </div>
      )}

      {err && <p className="text-xs text-red-300">{err}</p>}

      <details className="text-sm">
        <summary className="cursor-pointer text-[--muted-2]">고급 옵션</summary>
        <div className="mt-2">
          <label className="label">URL 직접 추가</label>
          <div className="flex gap-2">
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
        </div>
      </details>
    </div>
  );
}

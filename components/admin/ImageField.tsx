"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/components/admin/uploadImage";

/** 단일 대표 이미지: 큰 카드 + 아이콘 → 업로드 → 미리보기(변경/삭제). 고급 옵션: URL 직접 입력. */
export default function ImageField({
  name,
  folder,
  initial = "",
}: {
  name: string;
  folder: string;
  initial?: string;
}) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      setUrl(await uploadImage(file, folder));
    } catch {
      setErr("업로드 실패 — 고급 옵션에서 URL을 직접 입력하세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {url ? (
        <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="대표 이미지" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" onClick={pick} className="btn btn-ghost px-4 py-2">
              변경
            </button>
            <button type="button" onClick={() => setUrl("")} className="btn btn-ghost px-4 py-2">
              삭제
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-foreground">
            +
          </span>
          <span className="text-sm font-medium text-foreground">
            {busy ? "업로드 중…" : "대표 이미지 추가"}
          </span>
          <span className="text-xs text-[--muted-2]">클릭하여 이미지 업로드</span>
        </button>
      )}

      {err && <p className="text-xs text-red-300">{err}</p>}

      <details className="text-sm">
        <summary className="cursor-pointer text-[--muted-2]">고급 옵션</summary>
        <div className="mt-2">
          <label className="label">URL 직접 입력</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/image/ebook.png"
            className="input"
          />
        </div>
      </details>
    </div>
  );
}

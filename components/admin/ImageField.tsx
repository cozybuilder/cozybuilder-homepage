"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/components/admin/uploadImage";

/** 단일 대표 이미지: 카드 중앙 + 버튼 → 업로드 → 미리보기(변경/삭제). 고급: URL 직접 입력. */
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
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />

      {url ? (
        <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[--border]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="대표 이미지" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" onClick={pick} className="btn btn-ghost px-4 py-2">
              변경
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="btn btn-ghost px-4 py-2"
            >
              삭제
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[--border-strong] bg-[--surface-2]/40 text-[--muted] transition-colors hover:bg-[--surface-2]"
        >
          <span className="text-3xl leading-none">+</span>
          <span className="text-sm">{busy ? "업로드 중…" : "대표 이미지 추가"}</span>
          {recommend && <span className="text-xs text-[--muted-2]">{recommend}</span>}
        </button>
      )}

      {err && <p className="text-xs text-red-300">{err}</p>}

      <details className="text-sm">
        <summary className="cursor-pointer text-[--muted-2]">
          고급: URL 직접 입력
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

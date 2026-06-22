"use client";

import { useState } from "react";

/** 문자열 목록(주요 기능/내용 등): 한 줄씩 추가/삭제. hidden(name) 줄단위 저장. 빈 항목 제외. */
export default function StringListField({
  name,
  initial = [],
  placeholder,
}: {
  name: string;
  initial?: string[];
  placeholder?: string;
}) {
  const [items, setItems] = useState<string[]>(initial.length ? initial : [""]);

  const update = (i: number, v: string) =>
    setItems((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) =>
    setItems((prev) => (prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i)));
  const add = () => setItems((prev) => [...prev, ""]);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={items.map((s) => s.trim()).filter(Boolean).join("\n")} />
      {items.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={v}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-white/40 outline-none transition-colors hover:bg-white/10 focus:border-violet-400/40"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 rounded-xl border border-white/10 bg-white/[0.08] px-3 text-[--muted] transition-colors hover:border-red-400/30 hover:bg-red-500/20 hover:text-red-200"
            aria-label="삭제"
          >
            −
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-[--muted] hover:text-foreground">
        + 추가
      </button>
    </div>
  );
}

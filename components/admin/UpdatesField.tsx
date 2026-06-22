"use client";

import { useState } from "react";

type Update = { date: string; text: string };

/** 업데이트 내역: 날짜+내용 행 추가/삭제. hidden(name) 에 "날짜 | 내용" 줄단위 저장. */
export default function UpdatesField({
  name,
  initial = [],
}: {
  name: string;
  initial?: Update[];
}) {
  const [items, setItems] = useState<Update[]>(
    initial.length ? initial : [{ date: "", text: "" }]
  );

  const update = (i: number, key: keyof Update, v: string) =>
    setItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, [key]: v } : x)));
  const remove = (i: number) =>
    setItems((prev) =>
      prev.length === 1 ? [{ date: "", text: "" }] : prev.filter((_, idx) => idx !== i)
    );
  const add = () => setItems((prev) => [...prev, { date: "", text: "" }]);

  const serialized = items
    .filter((u) => u.text.trim())
    .map((u) => `${u.date.trim()} | ${u.text.trim()}`)
    .join("\n");

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={serialized} />
      {items.map((u, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={u.date}
            onChange={(e) => update(i, "date", e.target.value)}
            placeholder="2026-06-22"
            className="w-full max-w-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-white/40 outline-none transition-colors hover:bg-white/10 focus:border-violet-400/40"
          />
          <input
            value={u.text}
            onChange={(e) => update(i, "text", e.target.value)}
            placeholder="업데이트 내용"
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
        + 업데이트 추가
      </button>
    </div>
  );
}

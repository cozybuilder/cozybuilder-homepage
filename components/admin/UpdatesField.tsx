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
            className="input max-w-[160px]"
          />
          <input
            value={u.text}
            onChange={(e) => update(i, "text", e.target.value)}
            placeholder="업데이트 내용"
            className="input"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="btn btn-ghost px-3"
            aria-label="삭제"
          >
            −
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-[--accent]">
        + 업데이트 추가
      </button>
    </div>
  );
}

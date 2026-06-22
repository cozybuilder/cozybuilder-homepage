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
        + 추가
      </button>
    </div>
  );
}

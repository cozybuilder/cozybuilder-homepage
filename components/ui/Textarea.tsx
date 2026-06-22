import type { ComponentProps } from "react";

/** 공통 텍스트영역 — 전역 .input(다크) 스타일 기준. */
export function Textarea({
  className = "",
  rows = 3,
  ...props
}: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={`input ${className}`} {...props} />;
}

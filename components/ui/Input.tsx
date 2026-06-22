import type { ComponentProps } from "react";

/** 공통 입력 — 전역 .input(다크) 스타일 기준. */
export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`input ${className}`} {...props} />;
}

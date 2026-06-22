import type { ComponentProps } from "react";

/** 공통 셀렉트 — 전역 .input(다크) + select.input option 다크 스타일 기준. */
export function Select({
  className = "",
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select className={`input ${className}`} {...props}>
      {children}
    </select>
  );
}

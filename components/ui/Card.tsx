import type { ComponentProps } from "react";

/** 공통 카드 — 전역 .card / .card-hover 스타일 기준. */
export function Card({
  hover = false,
  className = "",
  ...props
}: ComponentProps<"div"> & { hover?: boolean }) {
  return (
    <div className={`card ${hover ? "card-hover" : ""} ${className}`} {...props} />
  );
}

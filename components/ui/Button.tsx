import type { ComponentProps } from "react";

type Variant = "accent" | "ghost" | "primary";

/** 공통 버튼 — 전역 .btn / .btn-{variant} 스타일 기준. */
export function Button({
  variant = "accent",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`btn btn-${variant} ${className}`} {...props} />;
}

import Link from "next/link";
import type { ReactNode } from "react";

/** 공통 카드 — .card / .card-hover. href 주면 전체 클릭(Link), 아니면 div. */
export function Card({
  href,
  hover = false,
  className = "",
  children,
}: {
  href?: string;
  hover?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const cls = `card ${hover ? "card-hover" : ""} ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

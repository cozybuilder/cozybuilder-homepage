import type { ReactNode } from "react";

/** 섹션 카드 래퍼 (제목/설명 + 내용). 폼/관리 화면 공통. */
export function Section({
  title,
  desc,
  className = "",
  children,
}: {
  title?: string;
  desc?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`card ${className}`}>
      {title && <h2 className="text-base font-semibold">{title}</h2>}
      {desc && <p className="mt-1 text-xs text-[--muted-2]">{desc}</p>}
      <div className={title || desc ? "mt-4 space-y-4" : "space-y-4"}>
        {children}
      </div>
    </section>
  );
}

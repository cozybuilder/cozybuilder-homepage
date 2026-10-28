"use client";

import { useEffect, useState } from "react";

// 모바일 하단 고정 CTA (공용). 신청 폼(#apply)이 화면에 보이면 자동으로 숨긴다.
// closed: 신청 접수 종료 — 클릭·포커스되지 않는 종료 표시만 보인다(COZYRENT_PRELAUNCH §16).
export default function MobileCtaBar({ label, closed = false }: { label: string; closed?: boolean }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("apply");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setHidden(entries.some((e) => e.isIntersecting)),
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[--border] bg-[--background]/90 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-300 md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      {closed ? (
        <button
          type="button"
          disabled
          aria-disabled="true"
          data-cta-closed=""
          className="btn min-h-[52px] w-full cursor-not-allowed border border-[--border-strong] bg-transparent text-base font-semibold text-[--muted-2]"
        >
          {label}
        </button>
      ) : (
        <a href="#apply" className="btn btn-accent min-h-[52px] w-full text-base font-semibold">
          {label}
        </a>
      )}
    </div>
  );
}

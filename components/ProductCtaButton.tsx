"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductButtonType } from "@/lib/site";

/**
 * Product 상세 CTA 버튼.
 *  - soldout : "품절" 비활성
 *  - payment : "결제하기" → 결제 미연동이라 "결제 준비중" 토스트 (향후 토스 연결)
 *  - inquiry : "문의하기" → /contact
 */
export default function ProductCtaButton({
  buttonType,
  soldout,
}: {
  buttonType: ProductButtonType;
  soldout: boolean;
}) {
  const [toast, setToast] = useState(false);

  if (soldout) {
    return (
      <button
        type="button"
        disabled
        className="btn btn-accent min-w-[140px] cursor-not-allowed opacity-50"
      >
        품절
      </button>
    );
  }

  if (buttonType === "payment") {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setToast(true);
            setTimeout(() => setToast(false), 2000);
          }}
          className="btn btn-accent min-w-[140px]"
        >
          결제하기
        </button>
        {toast && (
          <span className="rounded-lg border border-[--border] bg-[--surface-2] px-3 py-1.5 text-xs text-[--muted]">
            결제 준비중입니다.
          </span>
        )}
      </div>
    );
  }

  return (
    <Link href="/contact" className="btn btn-accent min-w-[140px]">
      문의하기
    </Link>
  );
}

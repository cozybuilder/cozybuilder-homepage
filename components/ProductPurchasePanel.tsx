"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type ProductOption,
  type ProductPriceType,
  type ProductStatus,
  type ProductButtonType,
  formatKRW,
} from "@/lib/site";

function optId(name: string, i: number): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `opt-${i + 1}`;
}

/**
 * Product 상세 구매 패널: 옵션 선택 → 선택 가격이 CTA 에 반영.
 * 옵션이 없으면 상품 기본 가격(basePriceText) 기준으로 CTA 만 노출.
 * 결제 연동(토스)은 미구현 — selectedOption 구조만 보유.
 */
export default function ProductPurchasePanel({
  productSlug,
  priceType,
  status,
  buttonType,
  basePriceText,
  options,
}: {
  productSlug: string;
  priceType: ProductPriceType;
  status: ProductStatus;
  buttonType: ProductButtonType;
  basePriceText: string;
  options: ProductOption[];
}) {
  const hasOptions = options.length > 0;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toast, setToast] = useState(false);

  const soldout = status === "soldout";
  const ids = useMemo(
    () => options.map((o, i) => optId(o.name, i)),
    [options]
  );

  const selected = hasOptions ? options[selectedIndex] : null;
  const selectedId = hasOptions ? ids[selectedIndex] : "";

  // 선택 옵션 가격 표시: price_label → price 숫자 → (quote)"견적문의" → 상품 기본가
  function optionPriceText(o: ProductOption): string {
    if (o.price_label) return o.price_label;
    if (o.price != null) return formatKRW(o.price);
    if (priceType === "quote") return "견적문의";
    return basePriceText;
  }

  const payPriceText = selected ? optionPriceText(selected) : basePriceText;

  // 향후 토스 결제 연동 시 전달할 구조 (현재는 토스트만)
  const selectedOption = selected
    ? {
        id: selectedId,
        name: selected.name,
        price: selected.price ?? null,
        priceLabel: selected.price_label ?? "",
        billingCycle: selected.billing ?? "",
      }
    : null;

  function onPayClick() {
    // TODO(toss): 결제 연동 시 selectedOption 을 결제 요청에 전달
    void selectedOption;
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }

  const inquiryHref = hasOptions
    ? `/contact?product=${encodeURIComponent(productSlug)}&option=${encodeURIComponent(selectedId)}`
    : `/contact?product=${encodeURIComponent(productSlug)}`;

  return (
    <div>
      {/* 옵션 선택 카드 */}
      {hasOptions && (
        <div
          role="radiogroup"
          aria-label="옵션 선택"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {options.map((o, i) => {
            const isSel = i === selectedIndex;
            return (
              <button
                key={ids[i]}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => setSelectedIndex(i)}
                className={`rounded-2xl border bg-[--surface-2] p-4 text-left transition-all ${
                  isSel
                    ? "border-[--accent] shadow-[0_0_0_1px_var(--accent),0_0_28px_-6px_var(--accent-glow)]"
                    : "border-[--border] hover:border-[--border-strong]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{o.name}</span>
                  {o.billing && (
                    <span className="shrink-0 rounded-full border border-[--border] px-2 py-0.5 text-[10px] text-[--muted-2]">
                      {o.billing}
                    </span>
                  )}
                </div>
                {o.description && (
                  <p className="mt-1.5 text-sm text-[--muted]">{o.description}</p>
                )}
                <p className="mt-3 text-sm font-semibold text-[--accent]">
                  {optionPriceText(o)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* 선택 요약 + CTA */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="text-center">
          {selected && (
            <p className="text-sm text-[--muted-2]">
              선택한 옵션 <span className="text-foreground">{selected.name}</span>
            </p>
          )}
          <p className="mt-0.5">
            <span className="text-sm text-[--muted-2]">결제 금액 </span>
            <span className="text-lg font-semibold">{payPriceText}</span>
          </p>
        </div>

        {soldout ? (
          <button
            type="button"
            disabled
            className="btn btn-accent min-w-[160px] cursor-not-allowed opacity-50"
          >
            품절
          </button>
        ) : buttonType === "payment" ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onPayClick}
              className="btn btn-accent min-w-[160px]"
            >
              결제하기
            </button>
            {toast && (
              <span className="rounded-lg border border-[--border] bg-[--surface-2] px-3 py-1.5 text-xs text-[--muted]">
                결제 준비중입니다.
              </span>
            )}
          </div>
        ) : (
          <Link href={inquiryHref} className="btn btn-accent min-w-[160px]">
            문의하기
          </Link>
        )}
      </div>
    </div>
  );
}

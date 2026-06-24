"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import ImageField from "@/components/admin/ImageField";
import ImageListField from "@/components/admin/ImageListField";
import { Section, FormField, Input, Textarea, Select, Button } from "@/components/ui";
import {
  type ProductType,
  type ProductPriceType,
  type ProductStatus,
  type ProductOption,
  PRODUCT_TYPE_LABELS,
  PRICE_TYPE_LABELS,
  PRODUCT_STATUS_LABELS,
  formatKRW,
} from "@/lib/site";

export type ProductInitial = {
  id?: string;
  slug?: string;
  title?: string;
  productType?: ProductType;
  category?: string;
  status?: ProductStatus;
  featured?: boolean;
  priceType?: ProductPriceType;
  price?: number | null;
  salePrice?: number | null;
  priceLabel?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  shortDescription?: string;
  description?: string;
  options?: ProductOption[];
};

// 옵션 편집용 행(가격은 입력 중 문자열로 보관).
type OptionRow = {
  name: string;
  price: string;
  price_label: string;
  description: string;
  billing: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 숫자 문자열("790,000" / "790000") → 정수 또는 null
function toIntOrNull(s: string): number | null {
  const cleaned = s.replace(/[, ]/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// 입력값 보조 표시: "790000" → "= 790,000원"
function amountHint(s: string): string {
  const n = toIntOrNull(s);
  return n == null ? "" : `= ${formatKRW(n)}`;
}

const PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_LABELS) as ProductType[];
const PRICE_TYPES = Object.keys(PRICE_TYPE_LABELS) as ProductPriceType[];
const STATUSES = Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[];

export default function ProductAdminForm({ initial }: { initial?: ProductInitial }) {
  const isNew = !initial?.id;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [productType, setProductType] = useState<ProductType>(
    initial?.productType ?? "digital"
  );
  const [category, setCategory] = useState(initial?.category ?? "");
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "draft");
  const [featured, setFeatured] = useState(Boolean(initial?.featured));

  const [priceType, setPriceType] = useState<ProductPriceType>(
    initial?.priceType ?? "fixed"
  );
  const [price, setPrice] = useState(
    initial?.price != null ? String(initial.price) : ""
  );
  const [salePrice, setSalePrice] = useState(
    initial?.salePrice != null ? String(initial.salePrice) : ""
  );
  const [priceLabel, setPriceLabel] = useState(initial?.priceLabel ?? "");

  const [thumb, setThumb] = useState(initial?.thumbnailUrl ?? "");
  const [shortDescription, setShortDescription] = useState(
    initial?.shortDescription ?? ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");

  const [options, setOptions] = useState<OptionRow[]>(
    (initial?.options ?? []).map((o) => ({
      name: o.name ?? "",
      price: o.price != null ? String(o.price) : "",
      price_label: o.price_label ?? "",
      description: o.description ?? "",
      billing: o.billing ?? "",
    }))
  );

  const [state, formAction, pending] = useActionState(saveProduct, null);

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugTouched) {
      const s = slugify(v);
      if (s) setSlug(s);
    }
  };

  // 옵션 행 조작
  const addOption = () =>
    setOptions((p) => [
      ...p,
      { name: "", price: "", price_label: "", description: "", billing: "" },
    ]);
  const updateOption = (i: number, patch: Partial<OptionRow>) =>
    setOptions((p) => p.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const removeOption = (i: number) =>
    setOptions((p) => p.filter((_, idx) => idx !== i));
  const moveOption = (i: number, dir: -1 | 1) =>
    setOptions((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // 저장용 옵션 JSON (빈 이름 제외, 가격은 숫자 변환)
  const optionsJson = JSON.stringify(
    options
      .map((o) => {
        const out: ProductOption = {
          name: o.name.trim(),
          price: toIntOrNull(o.price),
          price_label: o.price_label.trim(),
          description: o.description.trim(),
        };
        if (o.billing.trim()) out.billing = o.billing.trim();
        return out;
      })
      .filter((o) => o.name)
  );

  // 미리보기 가격 (productPriceDisplay 와 동일한 우선순위)
  const previewPrice = (() => {
    if (priceLabel.trim()) return priceLabel.trim();
    if (priceType === "quote") return "견적 문의";
    const sp = toIntOrNull(salePrice);
    if (sp != null) return formatKRW(sp);
    const p = toIntOrNull(price);
    if (p != null) return formatKRW(p);
    return "가격 정보 없음";
  })();

  return (
    <form action={formAction} className="space-y-6">
      {!isNew && <input type="hidden" name="id" value={initial?.id} />}
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="product_type" value={productType} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="featured" value={featured ? "true" : "false"} />
      <input type="hidden" name="price_type" value={priceType} />
      <input type="hidden" name="options" value={optionsJson} />

      {/* A. 기본 정보 */}
      <Section title="기본 정보">
        <FormField label="상품명">
          <Input
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            required
            placeholder="예: 홈페이지 제작"
          />
        </FormField>
        <FormField label="URL 슬러그 (상품명에서 자동 생성, 수정 가능)">
          <Input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="비워두면 상품명으로 자동 생성"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="상품 유형">
            <Select
              value={productType}
              onChange={(e) => setProductType(e.target.value as ProductType)}
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PRODUCT_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="카테고리 (자유 입력, 선택)">
            <Input
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="예: ebook, 굿즈"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="공개 상태">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PRODUCT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="추천 상품">
            <label className="flex h-[42px] items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4"
              />
              추천으로 표시
            </label>
          </FormField>
        </div>
      </Section>

      {/* B. 가격 정보 */}
      <Section title="가격 정보" desc="견적 문의 유형은 가격을 비워도 저장됩니다.">
        <FormField label="가격 방식">
          <Select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as ProductPriceType)}
          >
            {PRICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {PRICE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="기본 가격 (숫자)">
            <Input
              name="price"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="예: 790000"
            />
            {amountHint(price) && (
              <p className="mt-1 text-xs text-[--muted-2]">{amountHint(price)}</p>
            )}
          </FormField>
          <FormField label="할인 가격 (숫자, 선택)">
            <Input
              name="sale_price"
              inputMode="numeric"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="예: 590000"
            />
            {amountHint(salePrice) && (
              <p className="mt-1 text-xs text-[--muted-2]">
                {amountHint(salePrice)}
              </p>
            )}
          </FormField>
        </div>
        <FormField label="가격 표시 문구 (있으면 카드에서 우선 표시)">
          <Input
            name="price_label"
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
            placeholder="예: 상담 후 견적 / 월 5만원~"
          />
        </FormField>
      </Section>

      {/* C. 이미지 */}
      <Section title="대표 이미지">
        <ImageField
          name="thumbnail_url"
          folder="product"
          initial={initial?.thumbnailUrl ?? ""}
          onChange={setThumb}
        />
      </Section>

      <Section title="상세 이미지" desc="여러 장 추가/삭제 가능.">
        <ImageListField
          name="gallery_urls"
          folder="product/gallery"
          initial={initial?.galleryUrls ?? []}
        />
      </Section>

      {/* D. 상품 설명 */}
      <Section title="상품 설명">
        <FormField label="짧은 소개">
          <Input
            name="short_description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="카드/상세 상단에 보이는 한 줄 소개"
          />
        </FormField>
        <FormField label="상세 설명">
          <Textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="상품에 대한 자세한 설명"
          />
        </FormField>
      </Section>

      {/* E. 옵션 */}
      <Section
        title="옵션"
        desc="플랜/색상 등. 가격 표시 문구가 있으면 화면에서 우선 표시됩니다."
      >
        {options.length === 0 && (
          <p className="text-sm text-[--muted-2]">등록된 옵션이 없습니다.</p>
        )}
        <div className="space-y-4">
          {options.map((o, i) => (
            <div key={i} className="rounded-xl border border-[--border] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-[--muted-2]">옵션 {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveOption(i, -1)}
                    disabled={i === 0}
                    className="px-2 text-sm text-[--muted] disabled:opacity-30"
                    aria-label="위로"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOption(i, 1)}
                    disabled={i === options.length - 1}
                    className="px-2 text-sm text-[--muted] disabled:opacity-30"
                    aria-label="아래로"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="px-2 text-sm text-red-400"
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="옵션명">
                  <Input
                    value={o.name}
                    onChange={(e) => updateOption(i, { name: e.target.value })}
                    placeholder="예: Starter"
                  />
                </FormField>
                <FormField label="가격 (숫자, 선택)">
                  <Input
                    inputMode="numeric"
                    value={o.price}
                    onChange={(e) => updateOption(i, { price: e.target.value })}
                    placeholder="예: 790000"
                  />
                </FormField>
                <FormField label="가격 표시 문구">
                  <Input
                    value={o.price_label}
                    onChange={(e) =>
                      updateOption(i, { price_label: e.target.value })
                    }
                    placeholder="예: 79만원 / 월 5만원"
                  />
                </FormField>
                <FormField label="결제 주기 (선택)">
                  <Input
                    value={o.billing}
                    onChange={(e) => updateOption(i, { billing: e.target.value })}
                    placeholder="예: monthly"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="옵션 설명">
                    <Input
                      value={o.description}
                      onChange={(e) =>
                        updateOption(i, { description: e.target.value })
                      }
                      placeholder="옵션에 대한 간단 설명"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="btn btn-ghost mt-2 px-4 py-2"
        >
          + 옵션 추가
        </button>
      </Section>

      {/* 미리보기 카드 */}
      <Section title="미리보기">
        <div className="card max-w-xs">
          <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[--border] bg-[--surface-2]">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[--muted-2]">
                대표 이미지
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold">
              {title || "상품명"}
            </h3>
            <span className="shrink-0 text-xs text-[--muted-2]">
              {PRODUCT_STATUS_LABELS[status]}
            </span>
          </div>
          {shortDescription && (
            <p className="mt-1 text-sm text-[--muted]">{shortDescription}</p>
          )}
          <p className="mt-3 text-sm font-semibold text-[--accent]">
            {previewPrice}
          </p>
        </div>
      </Section>

      {state?.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          저장 실패: {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full disabled:opacity-60">
        {pending ? "저장 중…" : "저장"}
      </Button>
    </form>
  );
}

import { createClient } from "@/lib/supabase/server";
import { saveProduct } from "@/app/admin/actions";
import BackButton from "@/components/BackButton";
import { Section, FormField, Input, Textarea, Select, Button } from "@/components/ui";
import ImageField from "@/components/admin/ImageField";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ProductForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let row: any = null;
  if (!isNew) {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    row = data;
  }

  const contents = Array.isArray(row?.contents) ? row.contents.join("\n") : "";
  const screenshots = Array.isArray(row?.screenshots) ? row.screenshots.join("\n") : "";

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href="/admin/product" label="Product 목록" />
      <h1 className="mt-5 mb-8 text-2xl font-semibold tracking-tight">
        {isNew ? "새 상품" : "상품 수정"}
      </h1>

      <form action={saveProduct} className="space-y-6">
        {!isNew && <input type="hidden" name="id" value={row?.id} />}

        <Section title="기본 정보">
          <FormField label="구분">
            <Select name="category" defaultValue={row?.category ?? "ebook"}>
              <option value="website">홈페이지 제작</option>
              <option value="ebook">전자책</option>
            </Select>
          </FormField>
          <FormField label="이름">
            <Input name="name" defaultValue={row?.name ?? ""} required />
          </FormField>
          <FormField label="간략 설명">
            <Input name="summary" defaultValue={row?.summary ?? ""} />
          </FormField>
          <FormField label="대표 이미지">
            <ImageField name="image" folder="product" initial={row?.image ?? ""} />
          </FormField>
        </Section>

        <Section title="상세">
          <FormField label="주요 내용 (줄마다 1개)">
            <Textarea name="contents" defaultValue={contents} rows={4} />
          </FormField>
          <FormField label="미리보기/스크린샷 URL (줄마다 1개)">
            <Textarea name="screenshots" defaultValue={screenshots} rows={3} />
          </FormField>
          <FormField label="자세한 설명">
            <Textarea name="long_description" defaultValue={row?.long_description ?? ""} rows={5} />
          </FormField>
        </Section>

        <Section title="판매/CTA">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="가격">
              <Input name="price" defaultValue={row?.price ?? ""} placeholder="₩9,900" />
            </FormField>
            <FormField label="CTA">
              <Select name="cta" defaultValue={row?.cta ?? "contact"}>
                <option value="contact">문의하기</option>
                <option value="buy">구매하기</option>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="CTA 라벨">
              <Input name="cta_label" defaultValue={row?.cta_label ?? ""} />
            </FormField>
            <FormField label="CTA URL">
              <Input name="cta_url" defaultValue={row?.cta_url ?? ""} placeholder="/contact" />
            </FormField>
          </div>
        </Section>

        <Section title="공개 설정">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="공개 상태">
              <Select name="status" defaultValue={row?.status ?? "draft"}>
                <option value="draft">임시저장</option>
                <option value="published">공개</option>
              </Select>
            </FormField>
            <FormField label="정렬 순서">
              <Input name="sort_order" type="number" defaultValue={row?.sort_order ?? 0} />
            </FormField>
          </div>
        </Section>

        <details className="card">
          <summary className="cursor-pointer text-sm font-semibold">고급 옵션</summary>
          <div className="mt-4">
            <FormField label="slug (비우면 이름으로 자동 생성)">
              <Input name="slug" defaultValue={row?.slug ?? ""} />
            </FormField>
          </div>
        </details>

        <Button type="submit" className="w-full">
          저장
        </Button>
      </form>
    </div>
  );
}

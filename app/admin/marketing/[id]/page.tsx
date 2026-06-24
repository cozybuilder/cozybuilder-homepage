import { createClient } from "@/lib/supabase/server";
import { saveMarketing } from "@/app/admin/actions";
import BackButton from "@/components/BackButton";
import ImageField from "@/components/admin/ImageField";
import MarketingCategoryFields from "@/components/admin/MarketingCategoryFields";
import { Section, FormField, Input, Select, Button } from "@/components/ui";

const SNS_CHANNELS = ["instagram", "youtube", "tiktok", "facebook", "threads"];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function MarketingForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let row: any = null;
  if (!isNew) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("marketing_channels")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    row = data;
  }

  // 기존 데이터 호환: 옛 잘못된 category(instagram 등)는 sns + 그 채널로 정규화해 표시.
  const rawCat = row?.category as string | undefined;
  const initialCategory = rawCat === "blog" ? "blog" : "sns";
  const initialChannel =
    (row?.channel_type as string | undefined) ||
    (rawCat && SNS_CHANNELS.includes(rawCat) ? rawCat : "instagram");

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href="/admin/marketing" label="Marketing 목록" />
      <h1 className="mt-5 mb-8 text-2xl font-semibold tracking-tight">
        {isNew ? "새 채널" : "채널 수정"}
      </h1>

      <form action={saveMarketing} className="space-y-6">
        {!isNew && <input type="hidden" name="id" value={row?.id} />}

        <Section title="기본 정보">
          <MarketingCategoryFields
            initialCategory={initialCategory}
            initialChannel={initialChannel}
          />
          <FormField label="이름">
            <Input name="name" defaultValue={row?.name ?? ""} required />
          </FormField>
          <FormField label="설명">
            <Input name="description" defaultValue={row?.description ?? ""} />
          </FormField>
          <FormField label="대표 이미지">
            <ImageField name="image" folder="marketing" initial={row?.image ?? ""} />
          </FormField>
          <FormField label="외부 링크">
            <Input
              name="external_url"
              defaultValue={row?.external_url ?? ""}
              placeholder="https://..."
            />
          </FormField>
        </Section>

        <Section title="공개 설정">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="공개 상태">
              <Select name="status" defaultValue={row?.status ?? "draft"}>
                <option value="draft">임시저장</option>
                <option value="published">공개</option>
              </Select>
            </FormField>
            <FormField label="표시 순서">
              <Input
                name="sort_order"
                type="number"
                defaultValue={row?.sort_order ?? 0}
              />
              <p className="mt-1 text-xs text-[--muted-2]">
                숫자가 작을수록 먼저 표시됩니다. 예: 0, 10, 20
              </p>
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

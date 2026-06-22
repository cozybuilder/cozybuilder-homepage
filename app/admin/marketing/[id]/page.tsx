import { createClient } from "@/lib/supabase/server";
import { saveMarketing } from "@/app/admin/actions";
import BackButton from "@/components/BackButton";
import { Section, FormField, Input, Select, Button } from "@/components/ui";

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

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href="/admin/marketing" label="Marketing 목록" />
      <h1 className="mt-5 mb-8 text-2xl font-semibold tracking-tight">
        {isNew ? "새 채널" : "채널 수정"}
      </h1>

      <form action={saveMarketing} className="space-y-6">
        {!isNew && <input type="hidden" name="id" value={row?.id} />}

        <Section title="기본 정보">
          <FormField label="구분">
            <Select name="category" defaultValue={row?.category ?? "sns"}>
              <option value="sns">SNS</option>
              <option value="blog">Blog</option>
            </Select>
          </FormField>
          <FormField label="이름">
            <Input name="name" defaultValue={row?.name ?? ""} required />
          </FormField>
          <FormField label="설명">
            <Input name="description" defaultValue={row?.description ?? ""} />
          </FormField>
          <FormField label="대표 이미지 URL">
            <Input name="image" defaultValue={row?.image ?? ""} />
          </FormField>
          <FormField label="외부 링크">
            <Input name="external_url" defaultValue={row?.external_url ?? ""} placeholder="https://..." />
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

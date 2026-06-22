"use client";

import { useActionState, useState } from "react";
import { saveProgram } from "@/app/admin/actions";
import ImageField from "@/components/admin/ImageField";
import ImageListField from "@/components/admin/ImageListField";
import StringListField from "@/components/admin/StringListField";
import UpdatesField from "@/components/admin/UpdatesField";
import { Section, FormField, Input, Textarea, Select, Button } from "@/components/ui";

export type ProgramInitial = {
  id?: string;
  slug?: string;
  type?: string;
  name?: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  image?: string;
  features?: string[];
  screenshots?: string[];
  updates?: { date: string; text: string }[];
  app_url?: string;
  status?: string;
  sort_order?: number;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProgramAdminForm({
  initial,
}: {
  initial?: ProgramInitial;
}) {
  const isNew = !initial?.id;
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [state, formAction, pending] = useActionState(saveProgram, null);

  const onName = (v: string) => {
    setName(v);
    if (!slugTouched) {
      const s = slugify(v);
      if (s) setSlug(s);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {!isNew && <input type="hidden" name="id" value={initial?.id} />}
      <input type="hidden" name="name" value={name} />

      <Section title="대표 이미지">
        <ImageField name="image" folder="programs" initial={initial?.image ?? ""} />
      </Section>

      <Section title="스크린샷">
        <ImageListField
          name="screenshots"
          folder="programs/screenshots"
          initial={initial?.screenshots ?? []}
        />
      </Section>

      <Section title="기본 정보">
        <FormField label="구분">
          <Select name="type" defaultValue={initial?.type ?? "web"}>
            <option value="web">컴퓨터 웹프로그램</option>
            <option value="mobile">모바일앱</option>
          </Select>
        </FormField>
        <FormField label="이름">
          <Input
            value={name}
            onChange={(e) => onName(e.target.value)}
            required
            placeholder="프로그램 이름"
          />
        </FormField>
        <FormField label="부제">
          <Input name="subtitle" defaultValue={initial?.subtitle ?? ""} />
        </FormField>
        <FormField label="요약">
          <Input name="summary" defaultValue={initial?.summary ?? ""} />
        </FormField>
        <FormField label="설명">
          <Textarea name="description" defaultValue={initial?.description ?? ""} rows={2} />
        </FormField>
      </Section>

      <Section title="주요 기능" desc="한 줄에 하나씩, 빈 항목은 저장되지 않습니다.">
        <StringListField
          name="features"
          initial={initial?.features ?? []}
          placeholder="예: 자동 하이라이트 추출"
        />
      </Section>

      <Section title="실행 설정">
        <FormField label="실행 URL">
          <Input name="app_url" defaultValue={initial?.app_url ?? ""} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="공개 상태">
            <Select name="status" defaultValue={initial?.status ?? "draft"}>
              <option value="draft">임시저장</option>
              <option value="published">공개</option>
            </Select>
          </FormField>
          <FormField label="정렬 순서">
            <Input name="sort_order" type="number" defaultValue={initial?.sort_order ?? 0} />
          </FormField>
        </div>
      </Section>

      <Section title="업데이트 내역">
        <UpdatesField name="updates" initial={initial?.updates ?? []} />
      </Section>

      <details className="card">
        <summary className="cursor-pointer text-sm font-semibold">고급 옵션</summary>
        <div className="mt-4">
          <FormField label="slug (이름에서 자동 생성, 수정 가능)">
            <Input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="비워두면 이름으로 자동 생성"
            />
          </FormField>
        </div>
      </details>

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

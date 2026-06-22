"use client";

import { useState } from "react";
import { saveProgram } from "@/app/admin/actions";
import ImageField from "@/components/admin/ImageField";
import ImageListField from "@/components/admin/ImageListField";
import StringListField from "@/components/admin/StringListField";
import UpdatesField from "@/components/admin/UpdatesField";

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

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <h2 className="text-base font-semibold">{title}</h2>
      {desc && <p className="mt-1 text-xs text-[--muted-2]">{desc}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
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

  const onName = (v: string) => {
    setName(v);
    if (!slugTouched) {
      const s = slugify(v);
      if (s) setSlug(s);
    }
  };

  return (
    <form action={saveProgram} className="space-y-6">
      {!isNew && <input type="hidden" name="id" value={initial?.id} />}

      <Section title="기본 정보">
        <div>
          <label className="label">구분</label>
          <select name="type" defaultValue={initial?.type ?? "web"} className="input">
            <option value="web">컴퓨터 웹프로그램</option>
            <option value="mobile">모바일앱</option>
          </select>
        </div>
        <div>
          <label className="label">이름</label>
          <input
            value={name}
            onChange={(e) => onName(e.target.value)}
            required
            className="input"
            placeholder="프로그램 이름"
          />
        </div>
        <div>
          <label className="label">부제</label>
          <input name="subtitle" defaultValue={initial?.subtitle ?? ""} className="input" />
        </div>
        <div>
          <label className="label">요약</label>
          <input name="summary" defaultValue={initial?.summary ?? ""} className="input" />
        </div>
        <div>
          <label className="label">설명</label>
          <textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            rows={3}
            className="input"
          />
        </div>
        {/* name 은 controlled 이므로 hidden 으로 제출 */}
        <input type="hidden" name="name" value={name} />
      </Section>

      <Section title="대표 이미지" desc="권장 규격: 16:9, 1600×900">
        <ImageField
          name="image"
          folder="programs"
          initial={initial?.image ?? ""}
          recommend="16:9 권장 · 업로드 시 자동으로 긴 변 1600px·WebP로 최적화됩니다."
        />
      </Section>

      <Section title="주요 기능" desc="한 줄에 하나씩, 빈 항목은 저장되지 않습니다.">
        <StringListField
          name="features"
          initial={initial?.features ?? []}
          placeholder="예: 자동 하이라이트 추출"
        />
      </Section>

      <Section title="스크린샷" desc="여러 장 업로드 가능 (16:9 또는 실제 화면 비율)">
        <ImageListField
          name="screenshots"
          folder="programs/screenshots"
          initial={initial?.screenshots ?? []}
          recommend="여러 장 선택 가능 · 자동 최적화"
        />
      </Section>

      <Section title="업데이트 내역">
        <UpdatesField name="updates" initial={initial?.updates ?? []} />
      </Section>

      <Section title="실행 설정">
        <div>
          <label className="label">실행 URL (web 실행 경로)</label>
          <input name="app_url" defaultValue={initial?.app_url ?? ""} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">공개 상태</label>
            <select name="status" defaultValue={initial?.status ?? "draft"} className="input">
              <option value="draft">임시저장</option>
              <option value="published">공개</option>
            </select>
          </div>
          <div>
            <label className="label">정렬 순서</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={initial?.sort_order ?? 0}
              className="input"
            />
          </div>
        </div>
      </Section>

      <details className="card">
        <summary className="cursor-pointer text-sm font-semibold">고급 옵션</summary>
        <div className="mt-4">
          <label className="label">slug (이름에서 자동 생성, 수정 가능)</label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            required
            className="input"
            placeholder="예: clipminer"
          />
        </div>
      </details>

      <button type="submit" className="btn btn-accent w-full">
        저장
      </button>
    </form>
  );
}

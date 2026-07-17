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
  play_store_url?: string;
  app_store_url?: string;
  deploy_status?: string | null;
  prereg_url?: string;
  prereg_cta_label?: string;
  prereg_benefit?: string;
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
  const [platform, setPlatform] = useState(
    initial?.type === "mobile" ? "mobile" : "web"
  );
  // 배포 상태 — 레거시(null)는 released 로 표시(저장해도 기존 동작과 동일).
  const [deployStatus, setDeployStatus] = useState(
    initial?.deploy_status === "preregistration" || initial?.deploy_status === "preparing"
      ? initial.deploy_status
      : "released"
  );
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
        <FormField label="플랫폼">
          <Select
            name="type"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="web">Web App (컴퓨터 웹앱)</option>
            <option value="mobile">Mobile App (모바일앱)</option>
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

      <Section
        title="배포 상태"
        desc="사전신청 = 출시 전 랜딩 연결 · 출시됨 = 스토어/실행 URL 기반(기존 동작) · 준비 중 = 버튼 숨김."
      >
        <FormField label="배포 상태">
          <Select
            name="deploy_status"
            value={deployStatus}
            onChange={(e) => setDeployStatus(e.target.value)}
          >
            <option value="preregistration">사전신청</option>
            <option value="released">출시됨</option>
            <option value="preparing">준비 중</option>
          </Select>
        </FormField>
      </Section>

      {deployStatus === "preregistration" && (
        <Section
          title="사전신청 설정"
          desc="내부 경로(/landingpage/cozyrent) 또는 https URL만 허용됩니다."
        >
          <FormField label="사전신청 랜딩 URL (필수)">
            <Input
              key="prereg-url"
              name="prereg_url"
              required
              defaultValue={initial?.prereg_url ?? ""}
              placeholder="/landingpage/cozyrent"
            />
          </FormField>
          <FormField label="사전신청 버튼 문구 (선택 — 비우면 '사전신청하기')">
            <Input
              key="prereg-cta"
              name="prereg_cta_label"
              defaultValue={initial?.prereg_cta_label ?? ""}
              placeholder="사전신청하기"
            />
          </FormField>
          <FormField label="혜택 문구 (선택)">
            <Input
              key="prereg-benefit"
              name="prereg_benefit"
              defaultValue={initial?.prereg_benefit ?? ""}
              placeholder="예: 출시 전 신청자 한정 6,900P"
            />
          </FormField>
        </Section>
      )}

      {deployStatus === "released" &&
        (platform === "web" ? (
          <Section
            title="실행 설정 (Web App)"
            desc="실행 URL이 있으면 '실행하기', 없으면 '준비 중'으로 표시됩니다. 예: /apps/ebook, /apps/clipminer, https://example.com"
          >
            <FormField label="실행 URL">
              <Input
                key="web-app_url"
                name="app_url"
                defaultValue={initial?.app_url ?? ""}
                placeholder="/apps/clipminer 또는 https://example.com"
              />
            </FormField>
          </Section>
        ) : (
          <Section
            title="다운로드 설정 (Mobile App)"
            desc="출시 상태는 스토어 URL 존재로 자동 판단됩니다. Google Play URL이 있으면 Android 출시, App Store URL이 있으면 iOS 출시로 표시됩니다. 둘 다 비우면 '출시 준비 중'."
          >
            <FormField label="Google Play URL">
              <Input
                key="mobile-play"
                name="play_store_url"
                defaultValue={initial?.play_store_url ?? ""}
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
            </FormField>
            <FormField label="App Store URL">
              <Input
                key="mobile-appstore"
                name="app_store_url"
                defaultValue={initial?.app_store_url ?? ""}
                placeholder="https://apps.apple.com/app/... (선택)"
              />
            </FormField>
          </Section>
        ))}

      {/* 숨겨진 섹션의 기존 값 보존 — 상태 전환 실수로 URL 이 지워지지 않게 한다.
          (released 의 web/mobile 플랫폼 전환 시 반대편 링크 정리는 기존 동작 그대로) */}
      {deployStatus !== "released" && (
        <>
          <input type="hidden" name="app_url" value={initial?.app_url ?? ""} />
          <input type="hidden" name="play_store_url" value={initial?.play_store_url ?? ""} />
          <input type="hidden" name="app_store_url" value={initial?.app_store_url ?? ""} />
        </>
      )}
      {deployStatus !== "preregistration" && (
        <>
          <input type="hidden" name="prereg_url" value={initial?.prereg_url ?? ""} />
          <input type="hidden" name="prereg_cta_label" value={initial?.prereg_cta_label ?? ""} />
          <input type="hidden" name="prereg_benefit" value={initial?.prereg_benefit ?? ""} />
        </>
      )}

      <Section title="공개 설정">
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

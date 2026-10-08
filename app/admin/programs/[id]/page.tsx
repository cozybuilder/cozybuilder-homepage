import { createClient } from "@/lib/supabase/server";
import ProgramAdminForm, {
  type ProgramInitial,
} from "@/components/admin/ProgramAdminForm";
import BackButton from "@/components/BackButton";
import { normalizeProgramLandingContent } from "@/lib/program-landing";
import { resolveScreenStories } from "@/lib/program-screen-story";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function ProgramFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let initial: ProgramInitial | undefined;
  if (!isNew) {
    const supabase = await createClient();
    const { data } = await supabase.from("programs").select("*").eq("id", id).maybeSingle();
    if (data) {
      const r = data as any;
      const shots = Array.isArray(r.screenshots) ? r.screenshots : [];
      const landing = normalizeProgramLandingContent(r.landing_content);
      initial = {
        id: r.id,
        slug: r.slug ?? "",
        type: r.type ?? "web",
        name: r.name ?? "",
        subtitle: r.subtitle ?? "",
        summary: r.summary ?? "",
        description: r.description ?? "",
        image: r.image ?? "",
        features: Array.isArray(r.features) ? r.features : [],
        screenshots: shots,
        updates: Array.isArray(r.updates) ? r.updates : [],
        app_url: r.app_url ?? "",
        play_store_url: r.play_store_url ?? "",
        app_store_url: r.app_store_url ?? "",
        deploy_status: r.deploy_status ?? null,
        prereg_url: r.prereg_url ?? "",
        prereg_cta_label: r.prereg_cta_label ?? "",
        prereg_benefit: r.prereg_benefit ?? "",
        youtube_url: r.youtube_url ?? "",
        landing_content: landing,
        // 아직 정식 screenStories 가 없는 코지임대는 레거시 문구를 **입력란 초기값**으로 보여준다.
        // 여는 것만으로 DB 에 쓰지 않는다 — 코지가 저장을 눌러야 정식 데이터가 된다.
        screen_stories:
          resolveScreenStories({ slug: r.slug, images: shots, stories: landing?.screenStories }) ??
          [],
        status: r.status ?? "draft",
        sort_order: r.sort_order ?? 0,
      };
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href="/admin/programs" label="Programs 목록" />
      <h1 className="mt-5 mb-8 text-2xl font-semibold tracking-tight">
        {isNew ? "새 프로그램" : "프로그램 수정"}
      </h1>
      <ProgramAdminForm initial={initial} />
    </div>
  );
}

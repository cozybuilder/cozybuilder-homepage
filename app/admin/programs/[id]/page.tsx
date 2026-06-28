import { createClient } from "@/lib/supabase/server";
import ProgramAdminForm, {
  type ProgramInitial,
} from "@/components/admin/ProgramAdminForm";
import BackButton from "@/components/BackButton";

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
        screenshots: Array.isArray(r.screenshots) ? r.screenshots : [],
        updates: Array.isArray(r.updates) ? r.updates : [],
        app_url: r.app_url ?? "",
        play_store_url: r.play_store_url ?? "",
        app_store_url: r.app_store_url ?? "",
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

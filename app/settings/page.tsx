import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = { title: "설정" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth&next=/settings");
  }

  const initialName = (user.user_metadata?.name as string | undefined) || "";

  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="Account" title="설정" />

      <div className="mx-auto mt-14 max-w-2xl">
        <SettingsForm initialName={initialName} />
      </div>
    </div>
  );
}

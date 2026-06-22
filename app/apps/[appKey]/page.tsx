import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getApp } from "@/lib/apps";
import { canAccessApp } from "@/lib/app-access";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/ui";

// 보안: 앱 접근은 매 요청 서버에서 권한 검증. 정적/ISR 캐시 금지.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ appKey: string }>;
}): Promise<Metadata> {
  const { appKey } = await params;
  const app = getApp(appKey);
  return { title: app ? app.name : "App" };
}

// 앱별 단계(placeholder). 없으면 "준비 중".
const STEPS: Record<string, string[]> = {
  ebook: [
    "원고 업로드",
    "출판 정보 입력",
    "표지/이미지 설정",
    "전자책 생성",
    "결과 다운로드",
  ],
};

export default async function AppPage({
  params,
}: {
  params: Promise<{ appKey: string }>;
}) {
  const { appKey } = await params;
  const app = getApp(appKey);
  if (!app) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/apps/${appKey}`);

  const access = await canAccessApp(user.id, appKey);
  console.log("[apps/access]", {
    userId: user.id,
    appKey,
    allowed: access.allowed,
    reason: access.reason,
    status: access.subscription?.status ?? null,
    updatedAt: access.subscription?.current_period_end ?? null,
    subUserId: access.subscription?.user_id ?? null,
  });
  if (!access.allowed) redirect(`/subscribe?app=${appKey}`);

  const steps = STEPS[appKey] ?? [];

  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="App" title={app.name} description={app.description} />

      <div className="mx-auto mt-14 max-w-3xl">
        {steps.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {steps.map((label, i) => (
              <Card key={i}>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-[--muted]">앱 화면 준비 중입니다.</p>
          </Card>
        )}

        <p className="mt-8 text-center text-xs text-[--muted-2]">
          홈페이지 안에서 실행되는 웹프로그램입니다. 실제 엔진 연결은 다음 단계에서
          제공됩니다.
        </p>
      </div>
    </div>
  );
}

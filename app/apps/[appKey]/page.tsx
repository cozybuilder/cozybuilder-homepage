import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApp } from "@/lib/apps";
import { requireAppAccess } from "@/lib/app-access";
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

export default async function AppPage({
  params,
}: {
  params: Promise<{ appKey: string }>;
}) {
  const { appKey } = await params;
  const app = getApp(appKey);
  if (!app) notFound();

  // 로그인 + 구독 권한 검증(미통과 시 내부에서 redirect).
  // ebook 은 전용 라우트(/apps/ebook)가 처리하므로 여기 도달하지 않는다.
  await requireAppAccess(appKey);

  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="App" title={app.name} description={app.description} />

      <div className="mx-auto mt-14 max-w-3xl">
        <Card>
          <p className="text-sm text-[--muted]">앱 화면 준비 중입니다.</p>
        </Card>

        <p className="mt-8 text-center text-xs text-[--muted-2]">
          홈페이지 안에서 실행되는 웹프로그램입니다. 실제 엔진 연결은 다음 단계에서
          제공됩니다.
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getApp, getAppLaunchUrl } from "@/lib/apps";
import { requireAppAccess } from "@/lib/app-access";
import { signLaunchToken } from "@/lib/launch-token";
import { recordEvent } from "@/lib/analytics";
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

// 범용 앱 런처 게이트 (모든 웹앱 공통):
//   1) 미로그인 → /login   2) 미구독 → /programs/[slug]  (둘 다 requireAppAccess 내부 처리)
//   3) 권한 통과 + 독립 배포됨(launchUrl) → 단명 launch token 발급 후 독립 앱 도메인으로 redirect
//   4) 독립 배포 전 → "준비 중" 플레이스홀더
// 실제 기능/데이터/출력 UI 는 독립 앱 책임. 홈페이지는 게이트 + 진입 트리거만 담당.
export default async function AppPage({
  params,
}: {
  params: Promise<{ appKey: string }>;
}) {
  const { appKey } = await params;
  const app = getApp(appKey);
  if (!app) notFound();

  // 로그인 + 구독 권한 검증(미통과 시 내부에서 redirect).
  const user = await requireAppAccess(appKey);

  // 권한 통과 = 앱 진입 성공. app_launch 계측(best-effort, redirect 전).
  // 익명화: 원본 user_id 대신 HMAC 해시만 저장된다(recordEvent 내부 처리).
  await recordEvent({
    appKey,
    platform: "web",
    eventName: "app_launch",
    userId: user.id,
  });

  // 독립 앱이 배포되어 있으면 launch token 발급 후 그 도메인으로 이동(iframe 없음).
  const launchUrl = getAppLaunchUrl(appKey);
  if (launchUrl) {
    const token = signLaunchToken(user.id, appKey);
    redirect(`${launchUrl}/?launch_token=${encodeURIComponent(token)}`);
  }

  // 아직 독립 배포 전 — 플레이스홀더.
  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="App" title={app.name} description={app.description} />

      <div className="mx-auto mt-14 max-w-3xl">
        <Card>
          <p className="text-sm text-[--muted]">앱 준비 중입니다.</p>
        </Card>
        <p className="mt-8 text-center text-xs text-[--muted-2]">
          독립 앱 배포 후 이 진입점에서 자동 실행됩니다.
        </p>
      </div>
    </div>
  );
}

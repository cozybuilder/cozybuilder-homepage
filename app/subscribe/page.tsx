import type { Metadata } from "next";
import Link from "next/link";
import { getApp } from "@/lib/apps";
import { PageHeader, Card } from "@/components/ui";

export const metadata: Metadata = { title: "구독 안내" };

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const { app: appKey } = await searchParams;
  const app = appKey ? getApp(appKey) : null;

  return (
    <div className="container-page py-20">
      <PageHeader
        eyebrow="Subscribe"
        title="구독이 필요한 프로그램입니다"
        description={app ? app.name : "웹프로그램"}
      />

      <div className="mx-auto mt-12 max-w-xl">
        <Card>
          <p className="text-sm leading-relaxed text-[--muted]">
            이 프로그램은 구독 사용자에게 제공되는 웹프로그램입니다.
            <br />
            현재는 결제 시스템 준비 중입니다.
            <br />
            베타 권한이 필요하면 관리자에게 문의해 주세요.
          </p>
        </Card>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn btn-ghost min-w-[140px]">
            대시보드로 돌아가기
          </Link>
          <Link href="/contact" className="btn btn-accent min-w-[140px]">
            문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}

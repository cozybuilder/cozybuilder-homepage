import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProgram } from "@/lib/content";
import { findAppByProgramSlug } from "@/lib/apps";
import { canAccessApp } from "@/lib/app-access";
import { createClient } from "@/lib/supabase/server";
import {
  startBetaSubscription,
  cancelBetaSubscription,
} from "@/app/apps/actions";
import { ImagePlaceholder, Placeholder } from "@/components/ui";
import BackButton from "@/components/BackButton";
import ProgramAction from "@/components/ProgramAction";
import ScreenshotGallery from "@/components/ScreenshotGallery";

// 구독 버튼이 현재 사용자 권한을 반영해야 하므로 동적 렌더(접근 판정은 매 요청).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  return { title: program ? program.name : "프로그램" };
}

/** 모바일앱 스토어 버튼 (링크 없으면 출시 준비 중). */
function StoreButton({ label, url }: { label: string; url?: string }) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-ghost min-w-[140px]"
      >
        {label}
      </a>
    );
  }
  return (
    <span className="btn btn-ghost min-w-[140px] cursor-not-allowed flex-col gap-0 py-3 opacity-60">
      <span>{label}</span>
      <span className="text-xs text-[--muted-2]">출시 준비 중</span>
    </span>
  );
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const webApp = program.type === "web" ? findAppByProgramSlug(program.slug) : null;
  console.log("[programs/detail]", {
    slug: program.slug,
    type: program.type,
    appKey: webApp?.key ?? null,
    appProgramSlug: webApp?.programSlug ?? null,
  });

  // 앱 권한 — Dashboard/Subscribe/Apps 와 동일한 단일 판정(canAccessApp) 사용
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = webApp && user ? await canAccessApp(user.id, webApp.key) : null;

  return (
    <div className="container-page py-12">
      <BackButton href="/programs" label="프로그램 목록" />

      {/* 1. 대표 이미지 + 액션 (본문 폭에 맞춤) */}
      <section className="mx-auto mt-8 max-w-3xl">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[--border] bg-black">
          <Image
            src={program.image}
            alt={program.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* 액션: 대표 이미지 바로 아래, 중앙 정렬 (web=구독/실행 / mobile=스토어) */}
        <div className="mt-6 flex justify-center">
          {program.type === "mobile" ? (
            <div className="flex flex-wrap justify-center gap-4">
              <StoreButton label="Google Play" url={program.playStoreUrl} />
              <StoreButton label="App Store" url={program.appStoreUrl} />
            </div>
          ) : webApp ? (
            <div className="flex flex-col items-center gap-3">
              {!user ? (
                <Link
                  href={`/login?next=${encodeURIComponent(`/subscribe?app=${webApp.key}`)}`}
                  className="btn btn-accent min-w-[140px]"
                >
                  무료 구독
                </Link>
              ) : access?.allowed ? (
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/apps/${webApp.key}`}
                    className="btn btn-accent min-w-[140px]"
                  >
                    실행하기
                  </Link>
                  <form action={cancelBetaSubscription}>
                    <input type="hidden" name="app" value={webApp.key} />
                    <input
                      type="hidden"
                      name="returnTo"
                      value={`/programs/${program.slug}`}
                    />
                    <button type="submit" className="btn btn-ghost min-w-[140px]">
                      구독 해제
                    </button>
                  </form>
                </div>
              ) : (
                <form action={startBetaSubscription}>
                  <input type="hidden" name="app" value={webApp.key} />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/programs/${program.slug}`}
                  />
                  <button type="submit" className="btn btn-accent min-w-[140px]">
                    무료 구독
                  </button>
                </form>
              )}

              {/* 무료 구독 안내 — 구독 중일 땐 관리 안내, 미구독일 땐 가입 유도 */}
              <p className="max-w-md text-center text-sm text-[--muted-2]">
                {access?.allowed
                  ? "프로필에서 무료 구독 중인 프로그램을 한눈에 관리할 수 있습니다. 언제든 구독 해제할 수 있습니다."
                  : "무료 구독하면 프로필에서 구독 중인 프로그램을 한눈에 관리할 수 있습니다. 언제든 구독 해제할 수 있습니다."}
              </p>
            </div>
          ) : (
            <ProgramAction slug={program.slug} appUrl={program.appUrl} />
          )}
        </div>
      </section>

      {/* 2. 프로그램 소개 */}
      <section className="mx-auto mt-12 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">{program.name}</h1>
        <p className="mt-3 text-lg text-[--accent]">{program.summary}</p>
        <p className="mt-6 text-lg leading-relaxed text-[--muted]">
          {program.description}
        </p>
      </section>

      {/* 3. 주요 기능 */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">주요 기능</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {program.features.map((f) => (
            <div key={f} className="card flex items-center gap-3 py-4">
              <span className="text-[--accent]">◆</span>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 스크린샷 (여러 장 등록 가능 — 많아지면 좌우 스크롤) */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">스크린샷</h2>
        {program.screenshots && program.screenshots.length > 0 ? (
          <div className="mt-6">
            <ScreenshotGallery images={program.screenshots} alt={program.name} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImagePlaceholder ratio="aspect-video" />
            <ImagePlaceholder ratio="aspect-video" />
          </div>
        )}
      </section>

      {/* 5. 업데이트 내역 (텍스트 기록형) */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">업데이트 내역</h2>
        {program.updates && program.updates.length > 0 ? (
          <ul className="mt-6 space-y-4 border-l border-[--border] pl-6">
            {program.updates.map((u, i) => (
              <li key={i}>
                <p className="text-sm text-[--muted-2]">{u.date}</p>
                <p className="mt-1 text-[--muted]">{u.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <Placeholder label="업데이트 내역 준비 중" />
          </div>
        )}
      </section>
    </div>
  );
}

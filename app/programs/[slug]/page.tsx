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
import BackButton from "@/components/BackButton";
import ProgramAction from "@/components/ProgramAction";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import ProgramScreenStory from "@/components/ProgramScreenStory";
import { resolveScreenStories } from "@/lib/program-screen-story";
import DownloadButton from "@/components/DownloadButton";
import { DEFAULT_PREREG_CTA_LABEL, type Program } from "@/lib/site";
import { parseYoutubeVideoId, youtubeEmbedUrl } from "@/lib/youtube";

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


// 스토어 버튼 공통 크기 — 두 버튼이 시각적으로 균형을 이루도록 height/padding/굵기/라운드 통일.
const STORE_BTN_BASE =
  "flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition sm:w-auto sm:min-w-[180px]";

/** 비활성 버튼 — 동일한 버튼 형태 유지(작은 보조 텍스트 사용 안 함). */
function StoreInactive({ label }: { label: string }) {
  return (
    <span
      className={`${STORE_BTN_BASE} cursor-default border border-white/15 bg-transparent text-white/50`}
    >
      {label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   CTA — 정책은 한 곳에서만 구현한다(설계: PROGRAM_OPERATING_MODEL.md §9·§10).
   히어로·중간·최종·모바일 고정 바가 전부 이 컴포넌트를 재사용한다.
   variant 는 표시 범위만 줄이고 **이동 목적지·권한 판정은 바꾸지 않는다.**
     full    — 기존 상세 동작 그대로(보조 문구·구독 해제 포함)
     compact — 긍정 액션 1개만(중간 CTA)
     sticky  — 모바일 하단 고정 바용 1개(전체 폭)
   ────────────────────────────────────────────────────────────── */

type ActionVariant = "full" | "compact" | "sticky";

type ActionCtx = {
  program: Program;
  webApp: ReturnType<typeof findAppByProgramSlug>;
  userId: string | null;
  allowed: boolean;
  launchHref: string | null;
};

/** 모바일 고정 바를 띄울 만한 **실제 가능한** 액션이 있는지. */
function hasPrimaryAction({ program, webApp, userId, allowed, launchHref }: ActionCtx): boolean {
  if (program.deployStatus === "preregistration") return Boolean(program.preregUrl?.trim());
  if (program.deployStatus === "preparing") return false; // 실제 행동 불가 — 고정 바 숨김
  if (program.type === "mobile") return Boolean(program.playStoreUrl || program.appStoreUrl);
  if (webApp) return !userId || !allowed || Boolean(launchHref);
  return false; // webApp 미등록 web 프로그램은 클라이언트 컴포넌트가 상태를 직접 판정한다
}

function ProgramPrimaryAction({
  ctx,
  variant = "full",
}: {
  ctx: ActionCtx;
  variant?: ActionVariant;
}) {
  const { program, webApp, userId, allowed, launchHref } = ctx;
  const sticky = variant === "sticky";
  const brief = variant !== "full"; // compact·sticky 는 보조 요소를 생략한다
  const wrap = sticky
    ? "flex w-full"
    : "mx-auto flex w-full max-w-md flex-col items-center gap-3";
  const btn = sticky ? `${STORE_BTN_BASE} w-full sm:w-full` : STORE_BTN_BASE;

  // 1) 사전신청 — 랜딩 CTA (목적지는 prereg_url 이 소유)
  if (program.deployStatus === "preregistration") {
    const url = program.preregUrl?.trim() ?? "";
    const label = program.preregCtaLabel?.trim() || DEFAULT_PREREG_CTA_LABEL;
    const external = url.startsWith("https://");
    if (!url) {
      return sticky ? null : (
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <StoreInactive label="준비 중" />
        </div>
      );
    }
    return (
      <div className={wrap}>
        <a
          href={url}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`${btn} btn-accent`}
        >
          {label}
        </a>
        {!brief && program.preregBenefit?.trim() && (
          <p className="max-w-md break-keep text-center text-sm text-[--muted]">
            {program.preregBenefit}
          </p>
        )}
      </div>
    );
  }

  // 2) 준비 중 — 클릭 불가 표시(고정 바에는 띄우지 않는다)
  if (program.deployStatus === "preparing") {
    return sticky ? null : (
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <StoreInactive label="준비 중" />
      </div>
    );
  }

  // 3) 모바일 — 출시 상태는 스토어 URL 존재로 추론(Release Model v3). 계측은 DownloadButton 이 소유.
  if (program.type === "mobile") {
    const hasPlay = Boolean(program.playStoreUrl);
    const hasAppStore = Boolean(program.appStoreUrl);
    if (!hasPlay && !hasAppStore) {
      return sticky ? null : (
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <StoreInactive label="출시 준비 중" />
        </div>
      );
    }
    // 고정 바·중간 CTA 는 받을 수 있는 스토어 하나만 보여준다(Play 우선).
    if (brief) {
      return (
        <div className={sticky ? "flex w-full" : "flex w-full max-w-md justify-center"}>
          {hasPlay ? (
            <DownloadButton
              label="Google Play에서 받기"
              url={program.playStoreUrl!}
              appKey={program.slug}
              platform="mobile"
              store="play"
            />
          ) : (
            <DownloadButton
              label="App Store에서 받기"
              url={program.appStoreUrl!}
              appKey={program.slug}
              platform="mobile"
              store="appstore"
            />
          )}
        </div>
      );
    }
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        {hasPlay ? (
          <DownloadButton
            label="Google Play에서 받기"
            url={program.playStoreUrl!}
            appKey={program.slug}
            platform="mobile"
            store="play"
          />
        ) : (
          <StoreInactive label="Google Play 출시 예정" />
        )}
        {hasAppStore ? (
          <DownloadButton
            label="App Store에서 받기"
            url={program.appStoreUrl!}
            appKey={program.slug}
            platform="mobile"
            store="appstore"
          />
        ) : (
          <StoreInactive label="App Store 출시 예정" />
        )}
      </div>
    );
  }

  // 4) web 등록 앱 — 로그인/무료 구독/실행/해제 (기존 판정 그대로)
  if (webApp) {
    if (!userId) {
      return (
        <Link
          href={`/login?next=${encodeURIComponent(`/subscribe?app=${webApp.key}`)}`}
          className={sticky ? `${btn} btn-accent` : "btn btn-accent min-w-[140px]"}
        >
          무료 구독
        </Link>
      );
    }
    if (allowed) {
      if (brief) {
        return (
          <Link
            href={launchHref!}
            target="_blank"
            rel="noopener noreferrer"
            className={sticky ? `${btn} btn-accent` : "btn btn-accent min-w-[140px]"}
          >
            실행하기
          </Link>
        );
      }
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={launchHref!}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent min-w-[140px]"
            >
              실행하기
            </Link>
            <form action={cancelBetaSubscription}>
              <input type="hidden" name="app" value={webApp.key} />
              <input type="hidden" name="returnTo" value={`/programs/${program.slug}`} />
              <button type="submit" className="btn btn-ghost min-w-[140px]">
                구독 해제
              </button>
            </form>
          </div>
          <p className="text-xs text-[--muted-2]">새 탭에서 프로그램이 실행됩니다.</p>
        </div>
      );
    }
    return (
      <form action={startBetaSubscription} className={sticky ? "w-full" : undefined}>
        <input type="hidden" name="app" value={webApp.key} />
        <input type="hidden" name="returnTo" value={`/programs/${program.slug}`} />
        <button
          type="submit"
          className={sticky ? `${btn} btn-accent` : "btn btn-accent min-w-[140px]"}
        >
          무료 구독
        </button>
      </form>
    );
  }

  // 5) webApp 미등록 web 프로그램 — 기존 클라이언트 컴포넌트 유지(중복 마운트 방지로 full 에서만)
  if (variant !== "full") return null;
  return <ProgramAction slug={program.slug} appUrl={program.appUrl} />;
}

/** 무료 구독 안내 — 기존 문구·조건 그대로(히어로에서만 노출). */
function WebSubscribeNote({ allowed }: { allowed: boolean }) {
  return (
    <p className="mx-auto mt-3 max-w-md text-center text-sm text-[--muted-2]">
      {allowed
        ? "프로필에서 무료 구독 중인 프로그램을 한눈에 관리할 수 있습니다. 언제든 구독 해제할 수 있습니다."
        : "무료 구독하면 프로필에서 구독 중인 프로그램을 한눈에 관리할 수 있습니다. 언제든 구독 해제할 수 있습니다."}
    </p>
  );
}

/** 섹션 공통 — 제목 + 본문. 데이터가 없으면 호출부에서 아예 렌더하지 않는다. */
function Band({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto mt-20 max-w-3xl md:mt-28 ${className}`}>
      {title && (
        <h2 className="break-keep text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      )}
      <div className={title ? "mt-7" : ""}>{children}</div>
    </section>
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

  // 상단 영역 표시 판정(0015): 유효한 YouTube 영상이 있으면 영상, 없으면 기존 대표 이미지.
  // 저장값을 신뢰하지 않고 렌더 시점에 다시 검증한다 — embed src 는 video ID 로만 조립한다.
  const youtubeVideoId = parseYoutubeVideoId(program.youtubeUrl);

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

  // 실행 대상 URL — CMS 실행 URL(app_url)을 최우선으로 사용한다.
  // 값이 있으면 외부 도메인으로 즉시 이동하고, 비어 있을 때만 내부 /apps/[key] fallback.
  const launchUrl = program.appUrl?.trim() ?? "";
  const launchHref = webApp ? launchUrl || `/apps/${webApp.key}` : null;

  const ctx: ActionCtx = {
    program,
    webApp,
    userId: user?.id ?? null,
    allowed: Boolean(access?.allowed),
    launchHref,
  };
  const showSticky = hasPrimaryAction(ctx);

  // 선택 홍보 콘텐츠(0016). 없으면 각 섹션을 통째로 숨기고 기존 데이터로만 구성한다.
  const L = program.landing ?? null;
  const headline = L?.hero?.headline || program.summary || program.name;
  const subheadline = L?.hero?.subheadline || program.description;
  const showEyebrow = headline !== program.name;
  const benefits = L?.benefits ?? [];
  const features = program.features ?? [];
  const screenshots = program.screenshots ?? [];
  // 제목·설명이 이미지와 1:1 로 갖춰졌을 때만 story UI 를 쓴다.
  // 아직 등록하지 않은 프로그램은 null 이 되어 기존 ScreenshotGallery 그대로다.
  const screenStories = resolveScreenStories({
    slug: program.slug,
    images: screenshots,
    stories: L?.screenStories,
  });
  const updates = program.updates ?? [];

  return (
    <div className="container-page py-12">
      <BackButton href="/programs" label="프로그램 목록" />

      {/* ── HERO: 제품명 → headline → subheadline → 미디어 → CTA → note ── */}
      <section className="mx-auto mt-8 max-w-3xl">
        {showEyebrow && <p className="eyebrow">{program.name}</p>}
        <h1 className="mt-3 break-keep text-3xl font-semibold leading-[1.25] tracking-tight sm:text-4xl">
          {headline}
        </h1>
        {subheadline && (
          <p className="mt-5 max-w-2xl break-keep text-lg leading-relaxed text-[--muted]">
            {subheadline}
          </p>
        )}

        <div className="relative mt-9 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[--border] bg-black">
          {youtubeVideoId ? (
            <iframe
              src={youtubeEmbedUrl(youtubeVideoId)}
              title={`${program.name} 소개 영상`}
              className="absolute inset-0 h-full w-full"
              // autoplay 는 넣지 않는다 — 사용자가 재생을 시작한다.
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <Image
              src={program.image}
              alt={program.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          )}
          {program.deployStatus === "preregistration" && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)]/90 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              사전신청
            </span>
          )}
          {program.deployStatus === "preparing" && (
            <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white backdrop-blur">
              준비 중
            </span>
          )}
        </div>

        <div className="mt-7 flex justify-center">
          <ProgramPrimaryAction ctx={ctx} variant="full" />
        </div>
        {webApp && user && <WebSubscribeNote allowed={ctx.allowed} />}
        {L?.hero?.note && (
          <p className="mx-auto mt-3 max-w-md break-keep text-center text-sm text-[--muted-2]">
            {L.hero.note}
          </p>
        )}
      </section>

      {/* ── 문제 공감 ── */}
      {L?.problems?.length ? (
        <Band title="이런 점이 불편하셨나요?">
          <ul className="grid gap-4 sm:grid-cols-2">
            {L.problems.map((p, i) => (
              <li key={i} className="rounded-2xl border border-[--border] p-5">
                {p.title && <p className="break-keep font-medium text-foreground">{p.title}</p>}
                {p.description && (
                  <p className="mt-2 break-keep text-sm leading-relaxed text-[--muted]">
                    {p.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Band>
      ) : null}

      {/* ── 해결·핵심 가치 (없으면 기존 주요 기능으로 대체) ── */}
      {benefits.length > 0 ? (
        <Band title="이렇게 해결합니다">
          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <div key={i}>
                {b.title && (
                  <p className="break-keep text-lg font-medium text-foreground">{b.title}</p>
                )}
                {b.description && (
                  <p className="mt-2 break-keep leading-relaxed text-[--muted]">{b.description}</p>
                )}
              </div>
            ))}
          </div>
        </Band>
      ) : features.length > 0 ? (
        <Band title="주요 기능">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f} className="card flex items-center gap-3 py-4">
                <span className="text-[--accent]">◆</span>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </Band>
      ) : null}

      {/* 중간 CTA — 가치를 읽은 직후 결심하는 사용자를 위해 같은 정책을 재사용 */}
      {(benefits.length > 0 || features.length > 0) && (
        <div className="mx-auto mt-10 flex max-w-3xl justify-center">
          <ProgramPrimaryAction ctx={ctx} variant="compact" />
        </div>
      )}

      {/* ── 실제 화면 (0장이면 섹션 자체 숨김) ── */}
      {screenshots.length > 0 &&
        (screenStories ? (
          // 제목·설명이 갖춰진 경우: 세로 캡처를 원본 비율로 보여주는 스크롤 스토리(폭을 넓게 쓴다)
          <section className="mx-auto mt-20 max-w-5xl md:mt-28">
            <h2 className="break-keep text-2xl font-semibold tracking-tight sm:text-3xl">
              실제 화면
            </h2>
            <div className="mt-10">
              <ProgramScreenStory
                images={screenshots}
                stories={screenStories}
                alt={program.name}
              />
            </div>
          </section>
        ) : (
          <Band title="실제 화면">
            <ScreenshotGallery images={screenshots} alt={program.name} />
          </Band>
        ))}

      {/* ── 추천 대상 ── */}
      {L?.audiences?.length ? (
        <Band title="이런 분께 맞습니다">
          <ul className="space-y-3">
            {L.audiences.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-[--accent]" aria-hidden>
                  ✓
                </span>
                <span className="break-keep leading-relaxed text-[--muted]">{a}</span>
              </li>
            ))}
          </ul>
        </Band>
      ) : null}

      {/* ── 신뢰 지표 (관리자가 입력한 실제 값만) ── */}
      {L?.proofStats?.length ? (
        <Band>
          <dl className="grid grid-cols-2 gap-8 border-y border-[--border] py-8 sm:grid-cols-3">
            {L.proofStats.map((s, i) => (
              // column-reverse — 의미 순서(dt→dd)는 지키고 화면에서는 큰 값이 위로 온다.
              <div key={i} className="flex flex-col-reverse">
                <dt className="mt-1 break-keep text-sm text-[--muted-2]">{s.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Band>
      ) : null}

      {/* ── 제작 배경 ── */}
      {L?.makerStory ? (
        <Band title={L.makerStory.title || "만든 사람"}>
          {L.makerStory.body && (
            <p className="max-w-2xl whitespace-pre-line break-keep text-lg leading-relaxed text-[--muted]">
              {L.makerStory.body}
            </p>
          )}
        </Band>
      ) : null}

      {/* ── 실제 후기 ── */}
      {L?.testimonials?.length ? (
        <Band title="사용자 후기">
          <div className="grid gap-5 sm:grid-cols-2">
            {L.testimonials.map((t, i) => (
              <figure key={i} className="rounded-2xl border border-[--border] p-6">
                <blockquote className="whitespace-pre-line break-keep leading-relaxed text-foreground">
                  {t.quote}
                </blockquote>
                {(t.displayName || t.meta) && (
                  <figcaption className="mt-4 break-keep text-sm text-[--muted-2]">
                    {t.displayName}
                    {t.meta ? ` · ${t.meta}` : ""}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </Band>
      ) : null}

      {/* ── 이용 안내 (문구 전용 — 정책 수치의 SSOT 아님) ── */}
      {L?.offer ? (
        <Band title={L.offer.title || "이용 안내"}>
          <div className="rounded-2xl border border-[--border] p-6 sm:p-8">
            {L.offer.headline && (
              <p className="break-keep text-xl font-medium text-foreground">{L.offer.headline}</p>
            )}
            {L.offer.body && (
              <p className="mt-3 max-w-2xl whitespace-pre-line break-keep leading-relaxed text-[--muted]">
                {L.offer.body}
              </p>
            )}
            {L.offer.lines?.length ? (
              <ul className="mt-5 space-y-2">
                {L.offer.lines.map((line, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-[--accent]" aria-hidden>
                      ·
                    </span>
                    <span className="break-keep text-sm leading-relaxed text-[--muted]">{line}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Band>
      ) : null}

      {/* ── FAQ (기본 닫힘 · 키보드 접근 가능한 native details) ── */}
      {L?.faqs?.length ? (
        <Band title="자주 묻는 질문">
          <div className="space-y-3">
            {L.faqs.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-[--border]">
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  <span className="break-keep">{f.question}</span>
                  <span
                    className="shrink-0 text-[--muted-2] transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="whitespace-pre-line break-keep px-5 pb-5 leading-relaxed text-[--muted]">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </Band>
      ) : null}

      {/* ── 최종 CTA — 문구만 landing_content, 목적지는 기존 정책이 소유 ── */}
      <Band>
        <div className="rounded-3xl border border-[--border] px-6 py-12 text-center sm:px-10">
          <h2 className="break-keep text-2xl font-semibold tracking-tight sm:text-3xl">
            {L?.finalCta?.title || `${program.name} 시작하기`}
          </h2>
          {L?.finalCta?.body && (
            <p className="mx-auto mt-4 max-w-xl break-keep leading-relaxed text-[--muted]">
              {L.finalCta.body}
            </p>
          )}
          <div className="mt-8 flex justify-center">
            <ProgramPrimaryAction ctx={ctx} variant="full" />
          </div>
        </div>
      </Band>

      {/* ── 업데이트 내역 (0건이면 섹션 자체 숨김) ── */}
      {updates.length > 0 && (
        <Band title="업데이트 내역">
          <ul className="space-y-4 border-l border-[--border] pl-6">
            {updates.map((u, i) => (
              <li key={i}>
                {u.date && <p className="text-sm text-[--muted-2]">{u.date}</p>}
                <p className="mt-1 break-keep text-[--muted]">{u.text}</p>
              </li>
            ))}
          </ul>
        </Band>
      )}

      {/* ── 모바일 하단 CTA — 실제 가능한 액션이 있을 때만. 데스크톱 미노출 ──
          position: fixed 대신 sticky 를 쓴다. 전역 Footer 는 이 페이지 밖에 있어서
          fixed 로 두면 스크롤 끝에서 푸터 하단을 가린다(실측 73px). sticky 는 본문 끝에서
          자연스럽게 자리를 차지하며 놓여나므로 푸터를 가리지 않는다. */}
      {showSticky && (
        <div className="sticky bottom-0 z-40 -mx-6 mt-12 border-t border-[--border] bg-[--background]/90 px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
          <ProgramPrimaryAction ctx={ctx} variant="sticky" />
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * AppFrame — CozyBuilder 플랫폼 공통 "앱 실행창".
 *
 * Homepage(플랫폼)가 독립 Program(Ebook/ShortsFactory/ClipMiner/Movie Maker…)을
 * 실행할 때 공통으로 두르는 프레임. 단순 iframe 삽입이 아니라,
 * 떠 있는 글래스 앱 윈도우 + 상단 앱바로 "플랫폼 안에서 앱이 실행되는" 느낌을 준다.
 *
 * 역할 경계: AppFrame 은 "실행창(셸)"만 담당한다. 내부(src)의 엔진 동작은 Program 책임.
 * 참고: PLATFORM_APP_ARCHITECTURE.md
 */
export type AppFrameProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode; // 이모지/문자 또는 SVG 노드
  status?: string; // 예: "Beta", "UX Shell"
  src: string; // 실행할 앱 셸 URL (보통 같은 오리진 정적 셸)
  backHref: string; // 뒤로(원형 버튼)
  homeHref?: string; // 홈으로(우측 버튼). 기본 /dashboard
  // 모바일/좁은 화면(<768px)에서 앱 실행 대신 보여줄 안내 문구.
  // 웹프로그램은 데스크톱 중심 — 작은 화면에선 실행창 대신 이 안내를 표시한다.
  desktopOnlyNote?: string;
};

const DEFAULT_DESKTOP_ONLY_NOTE =
  "이 프로그램은 데스크톱 환경에 최적화되어 있습니다.\nPC에서 이용해주세요.";

function IconArrowLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

export default function AppFrame({
  title,
  subtitle,
  icon,
  status,
  src,
  backHref,
  homeHref = "/dashboard",
  desktopOnlyNote = DEFAULT_DESKTOP_ONLY_NOTE,
}: AppFrameProps) {
  return (
    // 헤더(64px) 아래로 작업 공간 전체를 채운다. dvh = 모바일 브라우저 크롬 대응.
    <div
      className="relative flex flex-col"
      style={{ height: "calc(100dvh - 64px)", minHeight: "560px" }}
    >
      {/* 은은한 워크스페이스 글로우 (조용한 고급 분위기) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-120px] h-[440px] w-[860px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(124,140,255,0.22), transparent 70%)",
          }}
        />
      </div>

      {/* ── 모바일/좁은 화면(<768px): 앱 실행 대신 데스크톱 권장 안내 ──
          무료 구독/권한 구조와 무관(여기는 "실행 표면"만 제한). */}
      <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-5 px-6 text-center md:hidden">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-3xl">
          {icon ?? "🖥️"}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {status && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[--accent]/30 bg-[--accent]/10 px-3 py-1 text-xs font-medium text-[--accent]">
              <span className="h-1.5 w-1.5 rounded-full bg-[--accent]" />
              {status}
            </span>
          )}
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[--muted]">
          {desktopOnlyNote}
        </p>
        <div className="flex items-center gap-2.5">
          <Link href={backHref} className="btn btn-ghost px-5 py-2.5">
            뒤로
          </Link>
          <Link href={homeHref} className="btn btn-accent px-5 py-2.5">
            홈으로
          </Link>
        </div>
        <p className="text-xs text-[--muted-2]">
          무료 구독은 모바일에서도 가능합니다.
        </p>
      </div>

      {/* ── 데스크톱(≥768px): 앱 실행창(워크스페이스) ── */}
      <div className="mx-auto hidden h-full w-full max-w-[1440px] flex-col gap-3 px-3 py-3 md:flex md:gap-4 md:px-6 md:py-5">
        {/* ── 상단 앱 바 ── */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-2 backdrop-blur-xl md:px-3.5 md:py-2.5">
          {/* 왼쪽: 원형 뒤로가기 + 아이덴티티 */}
          <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
            <Link
              href={backHref}
              aria-label="뒤로"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.08]"
            >
              <IconArrowLeft />
            </Link>

            <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
              {icon != null && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-lg">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {title}
                </p>
                {subtitle && (
                  <p className="truncate text-xs leading-tight text-[--muted-2]">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 상태 배지 + 홈으로 */}
          <div className="flex shrink-0 items-center gap-2">
            {status && (
              <span className="hidden items-center gap-1.5 rounded-full border border-[--accent]/30 bg-[--accent]/10 px-3 py-1 text-xs font-medium text-[--accent] sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[--accent]" />
                {status}
              </span>
            )}
            <Link
              href={homeHref}
              aria-label="홈으로"
              className="flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm text-[--muted] transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-foreground"
            >
              <IconHome />
              <span className="hidden md:inline">홈으로</span>
            </Link>
          </div>
        </div>

        {/* ── 앱 실행창 (떠 있는 글래스 윈도우) ── */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[--surface] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04]">
          {/* 상단 미세 광택 라인 (창 가장자리 질감) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <iframe
            src={src}
            title={title}
            className="h-full w-full"
            style={{ border: 0, display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}

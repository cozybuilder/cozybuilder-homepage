import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAppAccess } from "@/lib/app-access";
import { signLaunchToken } from "@/lib/launch-token";

// 앱 접근은 매 요청 서버에서 권한 검증(플랫폼 역할). 정적 캐시 금지.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = { title: "전자책 스튜디오" };

// Ebook Studio 는 "작은 iframe/card embed"가 아니라 독립 풀페이지 앱으로 실행한다.
// 진입: Programs 상세 → 실행하기 → /apps/ebook (이 라우트, full-page).
// 데스크톱 전용(min-width 1180, 권장 1440) · height 100vh · 셸 = public/apps/ebook/studio.html.
// 인증/구독 게이트는 유지(requireAppAccess). 이번 Phase 는 UI 셸 / 출력 엔진 미연결.
export default async function EbookAppPage() {
  // 로그인 + 무료 구독 권한 검증(미통과 시 내부에서 redirect).
  const user = await requireAppAccess("ebook");

  // V3 컷오버: EBOOK_APP_URL(서버 전용 env) 설정 시 → 단명 launch token 발급 후
  // 외부 독립 Ebook 앱으로 redirect. 미설정이면 기존 내장 iframe 셸 유지(무중단).
  const ebookUrl = process.env.EBOOK_APP_URL;
  if (ebookUrl) {
    const token = signLaunchToken(user.id, "ebook");
    redirect(`${ebookUrl.replace(/\/$/, "")}/?launch_token=${encodeURIComponent(token)}`);
  }

  return (
    <>
      {/* ── 데스크톱(≥1180px): 앱 셸(부모 레벨 상단 바) + 풀페이지 스튜디오 iframe ──
          "← 홈페이지로"는 iframe 밖(부모/앱 페이지 레벨)에서 처리한다.
          studio.html(엔진 셸)·engine.bundle.js 와 완전히 분리 → 엔진 WIP 미혼입. */}
      <div className="fixed inset-0 z-[60] hidden flex-col bg-background min-[1180px]:flex">
        <div className="flex h-11 flex-none items-center border-b border-[--border] bg-background px-3">
          <Link
            href="/programs/ebook-publishing-system"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-[--muted] transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
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
            홈페이지로
          </Link>
        </div>
        <iframe
          src="/apps/ebook/studio.html"
          title="전자책 스튜디오"
          className="w-full flex-1 bg-background"
          style={{ border: 0 }}
        />
      </div>

      {/* ── 1180px 미만: 데스크톱 권장 안내(작은 화면 실행 차단) ── */}
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-background px-6 text-center min-[1180px]:hidden">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-3xl">
          🖥️
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            전자책 스튜디오는 데스크톱 전용입니다
          </h1>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[--muted]">
            {"원고 편집 · 이미지 · 전자책 출력은 넓은 화면이 필요합니다.\n가로 1180px 이상(권장 1440px)의 PC에서 실행해 주세요."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/programs/ebook-publishing-system" className="btn btn-ghost px-5 py-2.5">
            프로그램 소개로
          </Link>
          <Link href="/dashboard" className="btn btn-accent px-5 py-2.5">
            대시보드로
          </Link>
        </div>
      </div>
    </>
  );
}

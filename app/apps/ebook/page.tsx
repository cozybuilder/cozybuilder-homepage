import type { Metadata } from "next";
import { requireAppAccess } from "@/lib/app-access";
import AppFrame from "@/components/AppFrame";

// 앱 접근은 매 요청 서버에서 권한 검증(플랫폼 역할). 정적 캐시 금지.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = { title: "Ebook Publishing System" };

// Ebook Publishing System(완성된 별도 프로그램)의 Hero Home + 9단계 Wizard를
// 플랫폼 공통 "앱 실행창"(AppFrame) 안에서 실행한다. 원본 GUI는 고유 톤(paper/navy)과
// 자체 CSS/JS를 가지므로 iframe으로 격리(셸 = public/apps/ebook/studio.html).
// 이번 Phase는 화면·UX만 / 출력 엔진 미연결. 참고: PLATFORM_APP_ARCHITECTURE.md
export default async function EbookAppPage() {
  // 로그인 + 무료 구독 권한 검증(미통과 시 내부에서 redirect).
  await requireAppAccess("ebook");

  return (
    <AppFrame
      title="Ebook Publishing System"
      subtitle="원고 → 조립 → PDF · DOCX · EPUB 전자책"
      icon="📚"
      status="UX Shell"
      src="/apps/ebook/studio.html"
      backHref="/programs/ebook-publishing-system"
      homeHref="/dashboard"
      desktopOnlyNote={
        "이 프로그램은 데스크톱 환경에 최적화되어 있습니다.\n파일 업로드, 편집, 전자책 출력 작업은 PC에서 이용해주세요."
      }
    />
  );
}

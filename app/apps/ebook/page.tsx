import type { Metadata } from "next";
import { requireAppAccess } from "@/lib/app-access";

// 앱 접근은 매 요청 서버에서 권한 검증(플랫폼 역할). 정적 캐시 금지.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = { title: "Ebook Publishing System" };

// Ebook Publishing System(완성된 별도 프로그램)의 Hero Home + 9단계 Wizard를
// "집(Homepage) 안의 독립된 방"으로 그대로 이식한다. 원본 GUI는 고유 톤(paper/navy)과
// 자체 CSS/JS를 가지므로, Homepage 다크 디자인과 섞이지 않게 iframe으로 격리해 띄운다.
// 원본 권위 소스: C:\projects\ebookPublishingSystem\gui\index.html
// 셸 = public/apps/ebook/studio.html (이번 Phase는 화면·UX만 / 출력 엔진 미연결).
export default async function EbookAppPage() {
  // 로그인 + 무료 구독 권한 검증(미통과 시 내부에서 redirect).
  await requireAppAccess("ebook");

  return (
    <iframe
      src="/apps/ebook/studio.html"
      title="Ebook Publishing System"
      // Homepage 헤더(약 64px) 아래로 방 전체를 채운다.
      className="block w-full"
      style={{ height: "calc(100vh - 64px)", border: "0" }}
    />
  );
}

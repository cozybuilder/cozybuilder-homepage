// 프로그램 상세의 사용 설명서 보조 카드(설계: docs/platform/PROGRAM_OPERATING_MODEL.md §10 「코지임대 사용 설명서」).
// 대상은 Google Play 패키지로 고른다 — DB slug·문구에 기대지 않고, 다른 프로그램에는 아무것도 붙지 않는다.
// 공개 행동은 웹 매뉴얼 「사용 설명서 보기」 하나뿐이다(PDF 다운로드·인쇄 버튼 없음).
// 클라이언트/서버 공용 순수 모듈.

export type ProgramManualCard = {
  title: string;
  description: string;
  label: string;
  href: string; // public 기준 정적 웹 매뉴얼
};

const MANUALS_BY_ANDROID_PACKAGE: Record<string, ProgramManualCard> = {
  "com.cozybuilder.cozyrent": {
    title: "코지임대 사용 설명서",
    description: "첫 건물 등록부터 입금·지출·수리·퇴실까지 화면으로 따라 해보세요.",
    label: "사용 설명서 보기",
    href: "/manual/cozyrent/index.html",
  },
};

/** Google Play URL의 `id` 패키지. 형식이 맞지 않으면 null. */
export function androidPackageOf(playStoreUrl: string | null | undefined): string | null {
  const raw = playStoreUrl?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.hostname !== "play.google.com") return null;
    return u.searchParams.get("id");
  } catch {
    return null;
  }
}

/**
 * 이 프로그램에 붙일 사용 설명서 카드(없으면 null). 상세가 Google Play 버튼을 그리는 경우에만 —
 * 모바일 · 배포 상태 released(미지정 포함) · Play URL 있음.
 */
export function programManualFor(program: {
  type?: string | null;
  playStoreUrl?: string | null;
  deployStatus?: string | null;
}): ProgramManualCard | null {
  if (program.type !== "mobile") return null;
  if (program.deployStatus === "preregistration" || program.deployStatus === "preparing") return null;
  const pkg = androidPackageOf(program.playStoreUrl);
  return pkg ? MANUALS_BY_ANDROID_PACKAGE[pkg] ?? null : null;
}

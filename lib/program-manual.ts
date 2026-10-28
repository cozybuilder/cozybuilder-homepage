// 프로그램 상세 상단(뒤로가기 행 오른쪽)의 사용 설명서 보조 버튼(설계: docs/platform/PROGRAM_OPERATING_MODEL.md §10 「코지임대 사용 설명서」).
// 대상은 Google Play 패키지로 고른다 — DB slug·문구에 기대지 않고, 다른 프로그램에는 아무것도 붙지 않는다.
// 공개 행동은 웹 매뉴얼 「사용 설명서 보기」 하나뿐이다(PDF 다운로드·인쇄 버튼 없음).
// 클라이언트/서버 공용 순수 모듈.

export type ProgramManualLink = {
  title: string; // 버튼 툴팁(title 속성)
  label: string;
  href: string; // public 기준 정적 웹 매뉴얼
};

const MANUALS_BY_ANDROID_PACKAGE: Record<string, ProgramManualLink> = {
  "com.cozybuilder.cozyrent": {
    title: "코지임대 사용 설명서",
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
 * 이 프로그램에 붙일 사용 설명서 버튼(없으면 null). 상세가 Google Play 버튼을 그리는 경우에만 —
 * 모바일 · 배포 상태 released(미지정 포함) · Play URL 있음.
 */
export function programManualFor(program: {
  type?: string | null;
  playStoreUrl?: string | null;
  deployStatus?: string | null;
}): ProgramManualLink | null {
  if (program.type !== "mobile") return null;
  if (program.deployStatus === "preregistration" || program.deployStatus === "preparing") return null;
  const pkg = androidPackageOf(program.playStoreUrl);
  return pkg ? MANUALS_BY_ANDROID_PACKAGE[pkg] ?? null : null;
}

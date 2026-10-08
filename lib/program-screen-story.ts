// 실제 화면 스토리 — 이미지와 제목/설명을 짝짓는 규칙의 SSOT.
// 설계: docs/platform/PROGRAM_OPERATING_MODEL.md §11
//
// 소유 구조 (새 컬럼·migration 없음)
//   programs.screenshots                   → 이미지 URL 배열 + 표시 순서
//   programs.landing_content.screenStories → 같은 순서의 제목/설명
// 두 배열은 index 로 짝을 이룬다: screenshots[i] ↔ screenStories[i].
//
// 이 파일이 한 곳에서 소유하는 것
//   1) 공개페이지가 story UI 를 쓸지 기존 gallery 로 떨어질지의 판정
//   2) 아직 정식 데이터가 없는 코지임대의 legacy fallback 문구
//   3) 관리자 저장 시 폼 입력 재검증 (서버가 쓰는 순수 함수)
// 공개페이지와 관리자가 서로 다른 하드코딩을 갖지 않게 하기 위해 전부 여기 모은다.

import type { LandingScreenStory } from "./program-landing";

export type ScreenStory = LandingScreenStory;

/**
 * 코지임대 레거시 문구.
 *
 * 2026-10-08 기준 운영 DB 에는 screenshots 6장만 있고 정식 screenStories 가 아직 없다.
 * 그 상태에서도 승인된 화면이 그대로 보이도록 쓰는 **UI 초기값**이다.
 * 페이지를 여는 것만으로 DB 에 쓰지 않는다 — 코지가 관리자에서 저장해야 정식 데이터가 된다.
 * 관리자에서 저장하고 나면 저장된 값이 항상 이 fallback 보다 우선한다.
 */
export const COZYRENT_LEGACY_SLUG = "program-mr95apa5";

export const COZYRENT_LEGACY_SCREEN_STORIES: readonly ScreenStory[] = [
  {
    title: "홈 화면",
    description: "건물 현황과 이번 달 받을 돈을 한 화면에서 확인합니다.",
  },
  {
    title: "이번 달 돈 흐름",
    description: "받을 돈과 나갈 돈, 오늘 확인할 일을 함께 봅니다.",
  },
  {
    title: "호실 관리",
    description: "층별 호실과 계약 기간, 계약이 끝나가는 호실을 한눈에 봅니다.",
  },
  {
    title: "계약·퇴실 관리",
    description: "계약 내용과 만료 시점을 확인하고 갱신·퇴실로 이어갑니다.",
  },
  {
    title: "건물·시설 관리",
    description: "지출과 시설, 하자·수선 기록을 건물 단위로 모아 봅니다.",
  },
  {
    title: "지출 관리",
    description: "고정지출과 월별 납부 내역으로 나가는 돈을 관리합니다.",
  },
] as const;

/** 저장된 스토리가 이미지와 1:1 로 맞고 제목이 모두 있는가. */
function isComplete(images: string[], stories: readonly ScreenStory[] | undefined): boolean {
  if (!stories || stories.length === 0) return false;
  if (stories.length !== images.length) return false;
  return stories.every((s) => Boolean(s?.title));
}

/**
 * 공개페이지·관리자 공통 판정.
 *
 *   1. 저장된 screenStories 가 screenshots 와 1:1 → 그대로 쓴다
 *   2. 아직 정식 데이터가 없는 코지임대(이미지 개수까지 레거시와 동일) → fallback
 *   3. 그 외 → null (호출부가 기존 ScreenshotGallery 로 떨어진다)
 *
 * 다른 프로그램은 관리자에서 제목·설명을 등록하기 전까지 2번에 걸리지 않으므로
 * 아무 변화 없이 기존 gallery 를 유지한다.
 */
export function resolveScreenStories({
  slug,
  images,
  stories,
}: {
  slug?: string | null;
  images: string[];
  stories?: readonly ScreenStory[] | null;
}): ScreenStory[] | null {
  if (images.length === 0) return null;
  if (isComplete(images, stories ?? undefined)) {
    return (stories as ScreenStory[]).map((s) => ({
      title: s.title,
      description: s.description,
    }));
  }
  if (slug === COZYRENT_LEGACY_SLUG && images.length === COZYRENT_LEGACY_SCREEN_STORIES.length) {
    return COZYRENT_LEGACY_SCREEN_STORIES.map((s) => ({ ...s }));
  }
  return null;
}

/* ── 관리자 저장 검증 ──────────────────────────────────────────── */

export type ScreenStoriesParse =
  | { ok: true; stories: ScreenStory[] }
  | { ok: false; error: string };

/**
 * 관리자 폼이 보낸 `screen_stories` 를 서버에서 다시 검사한다.
 * 공개 read 쪽 정규화는 관대하지만(깨진 값이 와도 페이지가 죽지 않아야 한다),
 * 저장은 엄격하다 — 개수가 어긋나거나 제목이 비면 **조용히 저장하지 않고** 오류를 돌려준다.
 *
 * @param raw          폼의 hidden 값(JSON 문자열). 비어 있으면 story 미사용으로 본다.
 * @param imageCount   같은 폼이 보낸 screenshots 개수.
 */
export function parseScreenStoriesField(raw: string, imageCount: number): ScreenStoriesParse {
  const v = raw.trim();
  // 미사용 — 기존 프로그램 호환. 공개페이지는 기존 ScreenshotGallery 로 간다.
  if (!v) return { ok: true, stories: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(v);
  } catch {
    return {
      ok: false,
      error: "실제 화면 입력을 읽을 수 없습니다. 페이지를 새로고침한 뒤 다시 입력해주세요.",
    };
  }
  if (!Array.isArray(parsed)) {
    return {
      ok: false,
      error: "실제 화면 입력 형식이 올바르지 않습니다. 페이지를 새로고침한 뒤 다시 입력해주세요.",
    };
  }
  if (parsed.length === 0) return { ok: true, stories: [] };

  if (parsed.length !== imageCount) {
    return {
      ok: false,
      error: `실제 화면 이미지와 화면 설명 개수가 일치하지 않습니다. (이미지 ${imageCount}개 / 설명 ${parsed.length}개)`,
    };
  }

  const stories: ScreenStory[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i];
    const rec = typeof row === "object" && row !== null ? (row as Record<string, unknown>) : {};
    const title = typeof rec.title === "string" ? rec.title.trim() : "";
    const description = typeof rec.description === "string" ? rec.description.trim() : "";
    if (!title) {
      return { ok: false, error: `실제 화면 ${i + 1}번의 제목을 입력해주세요.` };
    }
    stories.push({ title, description });
  }
  return { ok: true, stories };
}

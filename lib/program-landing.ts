// 프로그램 상세 홍보 콘텐츠(`programs.landing_content`) 타입·정규화 SSOT.
// 설계: docs/platform/PROGRAM_OPERATING_MODEL.md §10 · migration 0016
//
// 원칙
// - **신뢰 경계는 여기 하나다.** 관리자 FormData 도, DB 에서 읽은 값도 모두 이 함수를 통과한다.
//   관리자 폼이 보낸 구조를 그대로 믿지 않는다.
// - v1 은 **일반 문자열만** 담는다. HTML·Markdown 을 해석하지 않으며 렌더도 텍스트로만 한다.
// - object/배열이 아닌 값, 알 수 없는 필드, 빈 항목은 전부 버린다(허용 목록 방식).
// - malformed 값 때문에 공개페이지가 깨지지 않는다 — 어떤 입력이든 유효 구조 또는 null 을 돌려준다.
// - 내용이 하나도 없으면 null 을 돌려준다(빈 껍데기를 DB 에 저장하지 않기 위해).

export const PROGRAM_LANDING_VERSION = 1 as const;

/** 길이 상한 — 과도한 입력이 레이아웃·저장소를 망가뜨리지 않게 한다. */
const LIMITS = {
  short: 120, // 제목·라벨·이름류
  medium: 300, // 한 줄 설명
  long: 2000, // 본문
  listItems: 20, // 반복 항목 최대 개수
} as const;

export type LandingTitleBody = { title: string; description: string };
export type LandingProofStat = { value: string; label: string };
export type LandingTestimonial = { quote: string; displayName: string; meta?: string };
export type LandingFaq = { question: string; answer: string };
/** 실제 화면 한 장의 제목·설명. 이미지는 여기 담지 않는다(`programs.screenshots` 가 소유). */
export type LandingScreenStory = { title: string; description: string };

export type ProgramLandingContentV1 = {
  version: typeof PROGRAM_LANDING_VERSION;
  hero?: { headline?: string; subheadline?: string; note?: string };
  problems?: LandingTitleBody[];
  benefits?: LandingTitleBody[];
  audiences?: string[];
  proofStats?: LandingProofStat[];
  makerStory?: { title?: string; body?: string };
  testimonials?: LandingTestimonial[];
  offer?: { title?: string; headline?: string; body?: string; lines?: string[] };
  faqs?: LandingFaq[];
  finalCta?: { title?: string; body?: string };
  /**
   * 실제 화면 설명 — `programs.screenshots` 와 **표시 순서 1:1 로 대응**한다.
   * 이미지 URL 은 여기 중복 저장하지 않는다. screenshots[i] 와 screenStories[i] 가 한 세트다.
   * optional 이라 기존 v1 데이터는 그대로 읽힌다(version 올리지 않음 · migration 없음).
   */
  screenStories?: LandingScreenStory[];
};

/* ── 원시 값 정규화 ───────────────────────────────────────────── */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 문자열만 받는다. 숫자/불리언/객체는 전부 버린다(의도치 않은 "[object Object]" 방지). */
function text(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  // 제어문자 제거 후 공백 정리 — 줄바꿈(\n)은 본문 가독성을 위해 보존한다.
  return v
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

function list(v: unknown): unknown[] {
  return Array.isArray(v) ? v.slice(0, LIMITS.listItems) : [];
}

/** 모든 값이 빈 문자열인 객체는 버린다. */
function keep<T extends Record<string, string | undefined>>(obj: T): T | null {
  return Object.values(obj).some((x) => x) ? obj : null;
}

function compact<T>(items: (T | null)[]): T[] {
  return items.filter((x): x is T => x !== null);
}

/** `{...obj}` 에서 빈 문자열 키를 제거해 저장 크기를 줄인다. */
function prune<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === "" || v === undefined || (Array.isArray(v) && v.length === 0)) continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

/* ── 섹션별 정규화 ───────────────────────────────────────────── */

function normTitleBodyList(v: unknown): LandingTitleBody[] {
  return compact(
    list(v).map((raw) => {
      if (!isRecord(raw)) return null;
      const item = {
        title: text(raw.title, LIMITS.short),
        description: text(raw.description, LIMITS.medium),
      };
      // 제목·설명이 모두 비면 버린다.
      return item.title || item.description ? item : null;
    })
  );
}

function normStringList(v: unknown, max: number): string[] {
  return compact(list(v).map((raw) => text(raw, max) || null));
}

function normProofStats(v: unknown): LandingProofStat[] {
  return compact(
    list(v).map((raw) => {
      if (!isRecord(raw)) return null;
      const item = {
        value: text(raw.value, LIMITS.short),
        label: text(raw.label, LIMITS.short),
      };
      // 수치와 라벨이 **둘 다** 있어야 지표로 인정한다(숫자만 떠 있는 카드 방지).
      return item.value && item.label ? item : null;
    })
  );
}

function normTestimonials(v: unknown): LandingTestimonial[] {
  return compact(
    list(v).map((raw) => {
      if (!isRecord(raw)) return null;
      const quote = text(raw.quote, LIMITS.long);
      const displayName = text(raw.displayName, LIMITS.short);
      // 후기 본문이 없으면 버린다 — 이름만 있는 빈 후기를 만들지 않는다.
      if (!quote) return null;
      const meta = text(raw.meta, LIMITS.short);
      return meta ? { quote, displayName, meta } : { quote, displayName };
    })
  );
}

function normScreenStories(v: unknown): LandingScreenStory[] {
  return compact(
    list(v).map((raw) => {
      if (!isRecord(raw)) return null;
      const title = text(raw.title, LIMITS.short);
      // 제목이 없으면 화면으로 세지 않는다 — 공개 UI 가 제목을 중심으로 구성되고,
      // 제목 없는 항목을 끼워 두면 screenshots 와의 1:1 대응이 조용히 어긋난다.
      if (!title) return null;
      return { title, description: text(raw.description, LIMITS.medium) };
    })
  );
}

function normFaqs(v: unknown): LandingFaq[] {
  return compact(
    list(v).map((raw) => {
      if (!isRecord(raw)) return null;
      const question = text(raw.question, LIMITS.medium);
      const answer = text(raw.answer, LIMITS.long);
      // 질문·답변이 모두 있어야 노출한다.
      return question && answer ? { question, answer } : null;
    })
  );
}

/* ── 공개 API ────────────────────────────────────────────────── */

/**
 * 어떤 입력이든 안전한 `ProgramLandingContentV1` 또는 `null` 로 환원한다.
 * 내용이 하나도 없으면 `null`.
 */
export function normalizeProgramLandingContent(
  raw: unknown
): ProgramLandingContentV1 | null {
  if (!isRecord(raw)) return null;

  const hero = keep({
    headline: text(isRecord(raw.hero) ? raw.hero.headline : "", LIMITS.short),
    subheadline: text(isRecord(raw.hero) ? raw.hero.subheadline : "", LIMITS.medium),
    note: text(isRecord(raw.hero) ? raw.hero.note : "", LIMITS.medium),
  });

  const makerStory = keep({
    title: text(isRecord(raw.makerStory) ? raw.makerStory.title : "", LIMITS.short),
    body: text(isRecord(raw.makerStory) ? raw.makerStory.body : "", LIMITS.long),
  });

  const finalCta = keep({
    title: text(isRecord(raw.finalCta) ? raw.finalCta.title : "", LIMITS.short),
    body: text(isRecord(raw.finalCta) ? raw.finalCta.body : "", LIMITS.medium),
  });

  const offerRaw = isRecord(raw.offer) ? raw.offer : {};
  const offerBase = {
    title: text(offerRaw.title, LIMITS.short),
    headline: text(offerRaw.headline, LIMITS.short),
    body: text(offerRaw.body, LIMITS.long),
  };
  const offerLines = normStringList(offerRaw.lines, LIMITS.medium);
  const offer =
    offerBase.title || offerBase.headline || offerBase.body || offerLines.length
      ? (prune({ ...offerBase, lines: offerLines }) as ProgramLandingContentV1["offer"])
      : null;

  const content: ProgramLandingContentV1 = {
    version: PROGRAM_LANDING_VERSION,
    ...prune({
      hero: hero ? (prune(hero) as ProgramLandingContentV1["hero"]) : undefined,
      problems: normTitleBodyList(raw.problems),
      benefits: normTitleBodyList(raw.benefits),
      audiences: normStringList(raw.audiences, LIMITS.medium),
      proofStats: normProofStats(raw.proofStats),
      makerStory: makerStory
        ? (prune(makerStory) as ProgramLandingContentV1["makerStory"])
        : undefined,
      testimonials: normTestimonials(raw.testimonials),
      offer: offer ?? undefined,
      faqs: normFaqs(raw.faqs),
      finalCta: finalCta
        ? (prune(finalCta) as ProgramLandingContentV1["finalCta"])
        : undefined,
      screenStories: normScreenStories(raw.screenStories),
    }),
  };

  // version 외에 아무 내용도 없으면 저장하지 않는다.
  return Object.keys(content).length > 1 ? content : null;
}

/**
 * 관리자 폼이 보낸 JSON 문자열 → 정규화 결과.
 * 파싱 실패는 예외로 던지지 않고 `invalid` 로 알린다(저장을 조용히 성공시키지 않기 위해).
 */
export function parseProgramLandingContent(
  rawJson: string
): { ok: true; content: ProgramLandingContentV1 | null } | { ok: false } {
  const v = rawJson.trim();
  if (!v) return { ok: true, content: null };
  try {
    return { ok: true, content: normalizeProgramLandingContent(JSON.parse(v)) };
  } catch {
    return { ok: false };
  }
}

/** 공개 렌더가 쓰는 헬퍼 — 해당 섹션에 보여줄 내용이 있는지. */
export function hasLandingSections(c: ProgramLandingContentV1 | null): boolean {
  return Boolean(c && Object.keys(c).length > 1);
}

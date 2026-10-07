// YouTube URL 검증·정규화 SSOT.
// 관리자 저장(app/admin/actions.ts)과 상세페이지 embed(app/programs/[slug]/page.tsx)가
// 같은 판정을 쓴다. 서버·클라이언트 공용 순수 모듈 — 외부 의존성 없음.
//
// 보안 원칙: iframe src 는 **검증된 video ID 로만 조립**한다. 사용자가 입력한 문자열을
// 그대로 src 에 넣지 않는다(임의 외부 URL·위험 scheme 주입 차단).

/** YouTube video ID — 11자 고정, URL-safe 문자집합. */
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** 허용 호스트. 이 목록 밖은 전부 거부한다(`www.youtube.com.evil.com` 같은 형태 포함). */
const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

/** 경로 1번째 구간이 이 값이면 2번째 구간을 video ID 로 읽는다. */
const PATH_ID_PREFIXES = new Set(["shorts", "embed", "live", "v"]);

function takeId(candidate: string | null | undefined): string | null {
  const id = (candidate ?? "").trim();
  return VIDEO_ID_RE.test(id) ? id : null;
}

/**
 * YouTube URL 에서 video ID 를 추출한다. 지원하지 않는 형식이면 `null`.
 *
 * 지원: `youtube.com/watch?v=ID` · `youtu.be/ID` · `youtube.com/shorts/ID`
 *       (+ 저장값 재입력 호환용 `embed/ID` · `live/ID` · `v/ID`)
 * `https://` 가 없어도 받아들인다(주소창에서 복사해 붙여넣는 경우).
 */
export function parseYoutubeVideoId(raw: string | null | undefined): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;

  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) return null;

  const segments = url.pathname.split("/").filter(Boolean);

  // youtu.be/VIDEO_ID
  if (host === "youtu.be" || host === "www.youtu.be") return takeId(segments[0]);

  // youtube.com/watch?v=VIDEO_ID
  if (segments[0] === "watch") return takeId(url.searchParams.get("v"));

  // youtube.com/shorts|embed|live|v/VIDEO_ID
  if (segments.length >= 2 && PATH_ID_PREFIXES.has(segments[0])) return takeId(segments[1]);

  return null;
}

/** 저장 정본 형식 — video ID 기반 canonical watch URL. */
export function canonicalYoutubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** 재생용 embed URL — 검증된 ID 로만 조립한다(autoplay 없음). */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

// 로그인 후 복귀 경로(next) 검증.
// 내부 경로만 허용한다. 외부 URL / 프로토콜 상대 경로(//, /\)는 차단.
export function safeNextPath(
  next?: string | null,
  fallback = "/dashboard"
): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

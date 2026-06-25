import "server-only";
import crypto from "node:crypto";

// Ebook 등 외부 독립 앱 실행 허가용 단명 서명 토큰(HS256/HMAC-SHA256).
// 홈페이지(서명) ↔ 외부 앱 /api/verify-launch(검증)가 동일 LAUNCH_TOKEN_SECRET 공유.
// 시크릿은 서버 전용 — 절대 NEXT_PUBLIC 금지. 클라이언트로 토큰만 흘러간다(시크릿 아님).

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

export type LaunchClaims = {
  sub: string; // user.id
  app_key: string; // "ebook"
  iat: number;
  exp: number;
  jti: string; // nonce (v2 리플레이 차단 확장용)
};

/** 권한 통과 사용자에게 발급하는 단명(기본 90초) 실행 토큰. */
export function signLaunchToken(sub: string, appKey: string, ttlSec = 90): string {
  const secret = process.env.LAUNCH_TOKEN_SECRET;
  if (!secret) throw new Error("LAUNCH_TOKEN_SECRET is not set");

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      sub,
      app_key: appKey,
      iat: now,
      exp: now + ttlSec,
      jti: crypto.randomBytes(16).toString("hex"),
    } satisfies LaunchClaims)
  );
  const data = `${header}.${payload}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

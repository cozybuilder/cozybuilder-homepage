import { recordEvent } from "@/lib/analytics";

// Platform Analytics 공용 인제스트. 설계: docs/platform/PLATFORM_ANALYTICS_ARCHITECTURE.md
// - 모든 프로그램(웹/모바일/데스크톱)이 이 엔드포인트로만 이벤트를 보낸다.
// - 실제 insert 는 lib/analytics.recordEvent(service_role) 가 수행(클라이언트 직접 insert 금지).
// - 개인정보: 본문에 식별정보(이메일/이름/전화/위치/기기번호)를 받지 않으며 저장하지 않는다.

export const runtime = "nodejs"; // node:crypto(HMAC) 사용 → edge 불가
export const dynamic = "force-dynamic";

// 서브도메인 독립 앱(*.cozybuilder.co.kr)에서의 교차 출처 전송 허용.
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    !!origin &&
    (/^https:\/\/([a-z0-9-]+\.)*cozybuilder\.co\.kr$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin));
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (allowed && origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const cors = corsHeaders(request.headers.get("origin"));

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400, headers: cors });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400, headers: cors });
  }

  const b = body as Record<string, unknown>;

  // user_id 원본은 받지 않는다 — 로그인 사용자 식별은 서버 측 계측(app_launch)에서만 처리.
  const result = await recordEvent({
    appKey: typeof b.appKey === "string" ? b.appKey : "",
    platform: typeof b.platform === "string" ? b.platform : "",
    eventName: typeof b.eventName === "string" ? b.eventName : "",
    anonymousId: typeof b.anonymousId === "string" ? b.anonymousId : null,
    appVersion: typeof b.appVersion === "string" ? b.appVersion : null,
    sessionId: typeof b.sessionId === "string" ? b.sessionId : null,
    metadata:
      typeof b.metadata === "object" && b.metadata !== null && !Array.isArray(b.metadata)
        ? (b.metadata as Record<string, unknown>)
        : null,
  });

  if (!result.ok) {
    // 검증 실패는 400, 적재 인프라 문제는 202(클라이언트 재시도 불필요한 best-effort).
    const status = result.error && result.error.startsWith("invalid") ? 400 : 202;
    return Response.json({ ok: false, error: result.error }, { status, headers: cors });
  }

  return Response.json({ ok: true }, { status: 202, headers: cors });
}

import { saveSignup } from "@/lib/cozyrent-prelaunch";

// 코지임대 사전신청 인제스트. 설계: docs/landing/COZYRENT_PRELAUNCH.md
// - 실제 insert 는 lib/cozyrent-prelaunch.saveSignup(service_role) 가 수행(클라이언트 직접 insert 금지).
// - 연락처 원문은 로그에 출력하지 않는다.
// - 동일 출처 폼 전용 — CORS 헤더를 열지 않는다.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const result = await saveSignup({
    name: b.name,
    contactType: b.contactType,
    contact: b.contact,
    buildingType: b.buildingType,
    unitCount: b.unitCount,
    painPoint: b.painPoint,
    consent: b.consent,
    source: b.source,
  });

  if (!result.ok) {
    if (result.error === "invalid") {
      return Response.json({ ok: false, error: "invalid", fields: result.fields }, { status: 400 });
    }
    if (result.error === "duplicate") {
      return Response.json({ ok: false, error: "duplicate" }, { status: 409 });
    }
    return Response.json({ ok: false, error: "server" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}

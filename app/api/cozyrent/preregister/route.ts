// 코지임대 사전신청 인제스트 — **접수 종료**(코지 2026-10-28 · docs/landing/COZYRENT_PRELAUNCH.md §16).
// - 신규 등록을 받지 않는다: 요청 본문을 읽지 않고 410 `closed`로 거절한다(새 개인정보를 받거나 저장하지 않음).
// - 기존 신청 자료·관리자 조회/CSV·lib/cozyrent-prelaunch(saveSignup 포함)는 그대로 둔다(삭제·이전·수정 0).
// - 동일 출처 폼 전용 — CORS 헤더를 열지 않는다.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json({ ok: false, error: "closed" }, { status: 410 });
}

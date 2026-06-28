"use client";

// 브라우저 측 분석 클라이언트. 익명 UUID 생성/보관 + 이벤트 전송(best-effort).
// 개인정보: localStorage 의 익명 UUID 외 식별정보를 만들지 않는다.
// 전송은 /api/analytics/track 로만 — 클라이언트는 Supabase 에 직접 쓰지 않는다.

const ANON_KEY = "cb_anon_id";

/** 기기별 익명 UUID. 없으면 생성해 localStorage 에 보관. */
export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(ANON_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export type ClientEvent = {
  appKey: string;
  platform?: "web" | "mobile" | "desktop";
  eventName: string;
  appVersion?: string;
  metadata?: Record<string, unknown>;
};

/** 이벤트 전송(논블로킹). sendBeacon 우선, 실패 시 keepalive fetch. */
export function trackClientEvent(ev: ClientEvent): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    appKey: ev.appKey,
    platform: ev.platform ?? "web",
    eventName: ev.eventName,
    anonymousId: getAnonId(),
    appVersion: ev.appVersion,
    metadata: ev.metadata,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/track", blob)) return;
    }
  } catch {
    // fall through to fetch
  }

  try {
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // 분석 실패는 조용히 무시(사용자 흐름 방해 금지).
  }
}

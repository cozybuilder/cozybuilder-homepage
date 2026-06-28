import "server-only";
import crypto from "node:crypto";
import { createClient as createServiceSb } from "@supabase/supabase-js";
import { getApp } from "@/lib/apps";

// Platform Analytics 서버 코어. 설계: docs/platform/PLATFORM_ANALYTICS_ARCHITECTURE.md
// - 적재(insert)는 오직 여기(service_role)에서만. 클라이언트 직접 insert 금지(RLS).
// - 개인정보 미저장: 원본 user_id 대신 HMAC 해시(auth_user_hash)만 저장.
//   IP/UA/이메일/이름/전화/위치 등은 받지도 저장하지도 않는다.

export const PLATFORMS = ["web", "mobile", "desktop"] as const;
export type Platform = (typeof PLATFORMS)[number];

// 허용 이벤트 화이트리스트. v1 에서 홈페이지가 실제 찍는 건 app_launch / download.
// 나머지는 향후 앱 내부 SDK 가 보낼 때를 위해 미리 허용(스키마 변경 없이 수용).
export const EVENT_NAMES = [
  "app_launch",
  "app_open",
  "app_close",
  "session_start",
  "session_end",
  "download",
  "install",
  "first_run",
  "update_check",
  "feature_click",
  "export_pdf",
  "export_docx",
  "save_project",
  "create_project",
  "subscription_start",
  "subscription_cancel",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

const APP_KEY_RE = /^[a-z0-9][a-z0-9_-]{0,39}$/;
const MAX_METADATA_BYTES = 4096;

export type RecordEventInput = {
  appKey: string;
  platform: string;
  eventName: string;
  anonymousId?: string | null;
  userId?: string | null; // 원본 저장 안 함 — 해시만 계산
  appVersion?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type RecordResult = { ok: boolean; error?: string };

/** 단방향 HMAC-SHA256(user_id). ANALYTICS_SALT 는 서버 전용(절대 NEXT_PUBLIC 금지). */
export function hashUserId(userId: string): string | null {
  const salt = process.env.ANALYTICS_SALT;
  if (!salt) return null;
  return crypto.createHmac("sha256", salt).update(userId).digest("hex");
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceSb(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 입력 정규화 + 검증. 통과 시 insert payload, 실패 시 error 문자열. */
export function normalizeEvent(
  input: RecordEventInput
): { row: Record<string, unknown> } | { error: string } {
  const appKey = String(input.appKey ?? "").trim();
  // app_key 는 형식 검증(소문자/숫자/_-). 웹 런처 앱은 레지스트리로 한 번 더 확인.
  if (!APP_KEY_RE.test(appKey)) return { error: "invalid app_key" };

  const platform = String(input.platform ?? "").trim();
  if (!(PLATFORMS as readonly string[]).includes(platform)) {
    return { error: "invalid platform" };
  }

  const eventName = String(input.eventName ?? "").trim();
  if (!(EVENT_NAMES as readonly string[]).includes(eventName)) {
    return { error: "invalid event_name" };
  }

  const userId = input.userId ? String(input.userId) : null;
  const authUserHash = userId ? hashUserId(userId) : null;

  // anonymous_id 는 NOT NULL. 없으면 로그인 사용자의 해시를 익명 식별자로 사용.
  let anonymousId = input.anonymousId ? String(input.anonymousId).slice(0, 64) : null;
  if (!anonymousId) anonymousId = authUserHash;
  if (!anonymousId) return { error: "missing anonymous_id" };

  let metadata: Record<string, unknown> = {};
  if (input.metadata != null) {
    if (!isPlainObject(input.metadata)) return { error: "invalid metadata" };
    if (Buffer.byteLength(JSON.stringify(input.metadata)) > MAX_METADATA_BYTES) {
      return { error: "metadata too large" };
    }
    metadata = input.metadata;
  }

  return {
    row: {
      app_key: appKey,
      platform,
      app_version: input.appVersion ? String(input.appVersion).slice(0, 40) : null,
      event_name: eventName,
      anonymous_id: anonymousId,
      auth_user_hash: authUserHash, // 원본 user_id 는 저장하지 않음
      session_id: input.sessionId ? String(input.sessionId).slice(0, 64) : null,
      metadata,
    },
  };
}

/** 이벤트 1건 적재(best-effort). 분석 실패가 호출부(런처 redirect 등)를 막지 않는다. */
export async function recordEvent(input: RecordEventInput): Promise<RecordResult> {
  const normalized = normalizeEvent(input);
  if ("error" in normalized) return { ok: false, error: normalized.error };

  const sb = serviceClient();
  if (!sb) return { ok: false, error: "service client unavailable" };

  const { error } = await sb.from("analytics_events").insert(normalized.row);
  if (error) {
    console.error("[analytics] insert failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** 웹 런처 앱 키인지(구독/실행 레지스트리 기준). 다운로드 등은 프로그램 슬러그도 허용. */
export function isRegisteredApp(appKey: string): boolean {
  return Boolean(getApp(appKey));
}

// ── 관리자 대시보드 집계 (RPC, 호출자는 관리자 쿠키 클라이언트) ──
/* eslint-disable @typescript-eslint/no-explicit-any */
type SupabaseLike = {
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data: any; error: any }>;
};

export type AnalyticsOverview = {
  total_users: number;
  today_active: number;
  active_7d: number;
  active_30d: number;
};
export type ProgramStat = {
  app_key: string;
  users: number;
  launches: number;
  downloads: number;
  events: number;
};
export type DailyPoint = { day: string; active: number; events: number };
export type VersionStat = { app_key: string; app_version: string; users: number };

export async function getOverview(sb: SupabaseLike): Promise<AnalyticsOverview> {
  const { data } = await sb.rpc("analytics_overview");
  const row = Array.isArray(data) ? data[0] : data;
  return {
    total_users: Number(row?.total_users ?? 0),
    today_active: Number(row?.today_active ?? 0),
    active_7d: Number(row?.active_7d ?? 0),
    active_30d: Number(row?.active_30d ?? 0),
  };
}

export async function getByProgram(sb: SupabaseLike): Promise<ProgramStat[]> {
  const { data } = await sb.rpc("analytics_by_program");
  return (data ?? []).map((r: any) => ({
    app_key: r.app_key,
    users: Number(r.users ?? 0),
    launches: Number(r.launches ?? 0),
    downloads: Number(r.downloads ?? 0),
    events: Number(r.events ?? 0),
  }));
}

export async function getDailyActive(
  sb: SupabaseLike,
  days = 30
): Promise<DailyPoint[]> {
  const { data } = await sb.rpc("analytics_daily_active", { days });
  return (data ?? []).map((r: any) => ({
    day: String(r.day),
    active: Number(r.active ?? 0),
    events: Number(r.events ?? 0),
  }));
}

export async function getByVersion(sb: SupabaseLike): Promise<VersionStat[]> {
  const { data } = await sb.rpc("analytics_by_version");
  return (data ?? []).map((r: any) => ({
    app_key: r.app_key,
    app_version: r.app_version,
    users: Number(r.users ?? 0),
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

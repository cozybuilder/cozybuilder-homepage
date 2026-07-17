"use server";

import { getAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import {
  BUILDING_TYPE_LABELS,
  CONTACT_TYPE_LABELS,
  PAIN_POINT_LABELS,
  UNIT_COUNT_LABELS,
  sourceLabel,
  type SignupRow,
} from "@/lib/cozyrent-prelaunch-labels";

// 코지임대 사전신청 관리자 조회 액션. 설계: docs/landing/COZYRENT_PRELAUNCH.md §13
// - 서버 액션은 직접 POST 로도 호출될 수 있으므로 모든 액션에서 관리자 검증을 먼저 수행한다.
// - 조회는 관리자 쿠키 클라이언트(RLS admin select) — service_role 미사용.
// - 검색어(연락처 포함 가능)는 URL 이 아니라 액션 body 로만 전달된다.
// - contact_normalized 는 select 하지 않는다(검색 조건으로만 사용).
// - 오류 로그에 검색어·연락처를 출력하지 않는다.

const SELECT_COLUMNS =
  "id,created_at,name,contact_type,contact,building_type,unit_count,pain_point,source,consent_at";

export type SignupFilters = {
  q?: string;
  contactType?: string;
  buildingType?: string;
  unitCount?: string;
  source?: string;
  from?: string; // yyyy-mm-dd (KST)
  to?: string; // yyyy-mm-dd (KST)
  page?: number;
  perPage?: number;
};

export type FetchSignupsResult =
  | { ok: true; rows: SignupRow[]; total: number; page: number; perPage: number }
  | { ok: false; error: "unauthorized" | "server" };

const PER_PAGE_OPTIONS = [20, 50, 100];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CSV_MAX_ROWS = 5000;

/** PostgREST or() 구문에서 의미를 갖는 문자를 제거해 검색어를 안전하게 만든다. */
function sanitizeSearch(q: string): string {
  return q.replace(/[%_,()"'\\]/g, " ").trim().slice(0, 80);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyFilters(query: any, f: SignupFilters): any {
  if (f.contactType && f.contactType in CONTACT_TYPE_LABELS) {
    query = query.eq("contact_type", f.contactType);
  }
  if (f.buildingType && f.buildingType in BUILDING_TYPE_LABELS) {
    query = query.eq("building_type", f.buildingType);
  }
  if (f.unitCount && f.unitCount in UNIT_COUNT_LABELS) {
    query = query.eq("unit_count", f.unitCount);
  }
  if (f.source && /^[a-z0-9_-]{1,40}$/.test(f.source)) {
    query = query.eq("source", f.source);
  }
  if (f.from && DATE_RE.test(f.from)) {
    query = query.gte("created_at", `${f.from}T00:00:00+09:00`);
  }
  if (f.to && DATE_RE.test(f.to)) {
    query = query.lte("created_at", `${f.to}T23:59:59.999+09:00`);
  }
  const q = f.q ? sanitizeSearch(f.q) : "";
  if (q) {
    // 이름·연락처 원문·정규화 연락처(하이픈 없는 숫자 검색용)를 함께 검색.
    const digits = q.replace(/[^0-9]/g, "");
    const parts = [`name.ilike.%${q}%`, `contact.ilike.%${q}%`];
    if (digits.length >= 4) parts.push(`contact_normalized.ilike.%${digits}%`);
    query = query.or(parts.join(","));
  }
  return query;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function fetchSignups(filters: SignupFilters): Promise<FetchSignupsResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "unauthorized" };

  const perPage = PER_PAGE_OPTIONS.includes(Number(filters.perPage))
    ? Number(filters.perPage)
    : 20;
  const page = Number.isInteger(Number(filters.page)) && Number(filters.page) >= 1
    ? Number(filters.page)
    : 1;

  const supabase = await createClient();
  let query = supabase
    .from("cozyrent_prelaunch_signups")
    .select(SELECT_COLUMNS, { count: "exact" });
  query = applyFilters(query, filters);
  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, count, error } = await query;
  if (error) {
    // 검색어·연락처는 로그에 남기지 않는다.
    console.error("[admin/cozyrent-prelaunch] fetch failed:", error.code);
    return { ok: false, error: "server" };
  }
  return { ok: true, rows: (data ?? []) as SignupRow[], total: count ?? 0, page, perPage };
}

export type ExportCsvResult =
  | { ok: true; csv: string; count: number; truncated: boolean }
  | { ok: false; error: "unauthorized" | "server" };

/** 현재 필터 결과를 CSV 로 반환(개인정보 포함 — 호출부에서 경고 후 다운로드). contact_normalized 제외. */
export async function exportSignupsCsv(filters: SignupFilters): Promise<ExportCsvResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "unauthorized" };

  const supabase = await createClient();
  let query = supabase.from("cozyrent_prelaunch_signups").select(SELECT_COLUMNS);
  query = applyFilters(query, filters);
  query = query.order("created_at", { ascending: false }).limit(CSV_MAX_ROWS + 1);

  const { data, error } = await query;
  if (error) {
    console.error("[admin/cozyrent-prelaunch] export failed:", error.code);
    return { ok: false, error: "server" };
  }

  const rows = (data ?? []) as SignupRow[];
  const truncated = rows.length > CSV_MAX_ROWS;
  const sliced = truncated ? rows.slice(0, CSV_MAX_ROWS) : rows;

  const kst = (iso: string) =>
    new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false });
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const header = [
    "신청일시",
    "이름",
    "연락방식",
    "연락처",
    "건물유형",
    "호실수",
    "불편업무",
    "유입경로",
    "동의일시",
  ];
  const lines = [header.join(",")];
  for (const r of sliced) {
    lines.push(
      [
        esc(kst(r.created_at)),
        esc(r.name),
        esc(CONTACT_TYPE_LABELS[r.contact_type] ?? r.contact_type),
        esc(r.contact),
        esc(BUILDING_TYPE_LABELS[r.building_type] ?? r.building_type),
        esc(r.unit_count ? UNIT_COUNT_LABELS[r.unit_count] ?? r.unit_count : ""),
        esc(r.pain_point ? PAIN_POINT_LABELS[r.pain_point] ?? r.pain_point : ""),
        esc(sourceLabel(r.source)),
        esc(kst(r.consent_at)),
      ].join(",")
    );
  }
  // BOM — Excel 한글 인코딩.
  return { ok: true, csv: "﻿" + lines.join("\r\n"), count: sliced.length, truncated };
}

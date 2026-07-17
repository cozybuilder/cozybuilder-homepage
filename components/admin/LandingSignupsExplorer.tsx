"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSignups,
  exportSignupsCsv,
  type SignupFilters,
} from "@/app/admin/landingpage/actions";
import {
  BUILDING_TYPE_LABELS,
  CONTACT_TYPE_LABELS,
  PAIN_POINT_LABELS,
  UNIT_COUNT_LABELS,
  label,
  sourceLabel,
  type SignupRow,
} from "@/lib/cozyrent-prelaunch-labels";

// 공용 랜딩 신청 목록 탐색기 (조회 전용) — slug 로 랜딩을 지정한다.
// - 데이터는 서버 액션 body 로만 오간다(연락처·검색어 URL 미노출, localStorage 미사용).
// - 서버 측 pagination(기본 20건) — 전체 데이터 로딩 금지.

const PER_OPTIONS = [20, 50, 100] as const;

type Status = "loading" | "ready" | "unauthorized" | "error";

const EMPTY_FILTERS = {
  q: "",
  contactType: "",
  buildingType: "",
  unitCount: "",
  source: "",
  from: "",
  to: "",
};

function kstDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function SelectFilter({
  value,
  onChange,
  allLabel,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  options: Record<string, string>;
}) {
  return (
    <select className="input py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{allLabel}</option>
      {Object.entries(options).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  );
}

export default function LandingSignupsExplorer({
  slug,
  knownSources,
}: {
  slug: string;
  knownSources: string[];
}) {
  const [draft, setDraft] = useState({ ...EMPTY_FILTERS });
  const [applied, setApplied] = useState({ ...EMPTY_FILTERS });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [rows, setRows] = useState<SignupRow[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [exporting, setExporting] = useState(false);
  const requestSeq = useRef(0);

  const sourceOptions: Record<string, string> = {};
  for (const s of knownSources) sourceOptions[s] = sourceLabel(s);

  const load = useCallback(
    async (f: typeof EMPTY_FILTERS, p: number, per: number) => {
      const seq = ++requestSeq.current;
      setStatus("loading");
      try {
        const result = await fetchSignups(slug, { ...f, page: p, perPage: per } as SignupFilters);
        if (seq !== requestSeq.current) return; // 오래된 응답 무시
        if (!result.ok) {
          setStatus(result.error === "unauthorized" ? "unauthorized" : "error");
          return;
        }
        setRows(result.rows);
        setTotal(result.total);
        setStatus("ready");
      } catch {
        if (seq === requestSeq.current) setStatus("error");
      }
    },
    [slug]
  );

  // 최초 1회 로드 — setState 를 effect 본문에서 직접 호출하지 않도록 매크로태스크로 미룬다.
  useEffect(() => {
    const t = setTimeout(() => {
      void load({ ...EMPTY_FILTERS }, 1, 20);
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const apply = (next: typeof EMPTY_FILTERS) => {
    setApplied(next);
    setPage(1);
    void load(next, 1, perPage);
  };

  const changeSelect = (key: keyof typeof EMPTY_FILTERS, v: string) => {
    const next = { ...draft, [key]: v };
    setDraft(next);
    apply(next);
  };

  const reset = () => {
    setDraft({ ...EMPTY_FILTERS });
    setApplied({ ...EMPTY_FILTERS });
    setPage(1);
    setPerPage(20);
    void load({ ...EMPTY_FILTERS }, 1, 20);
  };

  const goPage = (p: number) => {
    setPage(p);
    void load(applied, p, perPage);
  };

  const changePerPage = (per: number) => {
    setPerPage(per);
    setPage(1);
    void load(applied, 1, per);
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const downloadCsv = async () => {
    if (exporting) return;
    const warned = window.confirm(
      "개인정보(이름·연락처)가 포함된 파일입니다.\n업무 목적 외 사용·공유를 금지하며, 사용 후 안전하게 삭제하세요.\n현재 필터 결과를 내보낼까요?"
    );
    if (!warned) return;
    setExporting(true);
    try {
      const result = await exportSignupsCsv(slug, {
        ...applied,
        page: 1,
        perPage,
      } as SignupFilters);
      if (!result.ok) {
        window.alert("내보내기에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      const today = new Date()
        .toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" })
        .replaceAll("-", "");
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `landingpage-${slug}-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      if (result.truncated) {
        window.alert(`내보내기는 최대 5,000건까지 지원합니다. ${result.count}건만 저장했습니다.`);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 검색·필터 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(draft);
        }}
        className="card space-y-3 p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input w-full py-2 text-sm sm:max-w-xs"
            placeholder="이름 또는 연락처 검색"
            value={draft.q}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
            aria-label="이름 또는 연락처 검색"
          />
          <button type="submit" className="btn btn-ghost px-4 py-2 text-sm">
            검색
          </button>
          <button type="button" onClick={reset} className="btn btn-ghost px-4 py-2 text-sm">
            초기화
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={exporting || total === 0}
            className="btn btn-ghost ml-auto px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? "내보내는 중..." : "CSV 내보내기"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <SelectFilter
            value={draft.contactType}
            onChange={(v) => changeSelect("contactType", v)}
            allLabel="연락 방식: 전체"
            options={CONTACT_TYPE_LABELS}
          />
          <SelectFilter
            value={draft.buildingType}
            onChange={(v) => changeSelect("buildingType", v)}
            allLabel="건물 유형: 전체"
            options={BUILDING_TYPE_LABELS}
          />
          <SelectFilter
            value={draft.unitCount}
            onChange={(v) => changeSelect("unitCount", v)}
            allLabel="호실 수: 전체"
            options={UNIT_COUNT_LABELS}
          />
          <SelectFilter
            value={draft.source}
            onChange={(v) => changeSelect("source", v)}
            allLabel="유입 경로: 전체"
            options={sourceOptions}
          />
          <input
            type="date"
            className="input py-2 text-sm"
            value={draft.from}
            onChange={(e) => changeSelect("from", e.target.value)}
            aria-label="신청 시작일"
          />
          <input
            type="date"
            className="input py-2 text-sm"
            value={draft.to}
            onChange={(e) => changeSelect("to", e.target.value)}
            aria-label="신청 종료일"
          />
        </div>
      </form>

      {/* 상태 */}
      {status === "unauthorized" && (
        <p className="card px-4 py-6 text-sm text-red-400">
          관리자 권한이 없습니다. 다시 로그인해주세요.
        </p>
      )}
      {status === "error" && (
        <p className="card px-4 py-6 text-sm text-red-400">
          목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}

      {/* 목록 */}
      <div className="card overflow-x-auto p-0" aria-busy={status === "loading"}>
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-[--border] text-left text-xs text-[--muted-2]">
              <th className="px-4 py-3 font-medium">신청 일시</th>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">연락 방식</th>
              <th className="px-4 py-3 font-medium">연락처</th>
              <th className="px-4 py-3 font-medium">건물 유형</th>
              <th className="px-4 py-3 font-medium">호실 수</th>
              <th className="px-4 py-3 font-medium">불편 업무</th>
              <th className="px-4 py-3 font-medium">유입 경로</th>
              <th className="px-4 py-3 font-medium">동의 일시</th>
            </tr>
          </thead>
          <tbody className={status === "loading" ? "opacity-50" : ""}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[--muted-2]">
                  {status === "loading" ? "불러오는 중..." : "조건에 맞는 신청이 없습니다."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-[--border]/50">
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                    {kstDateTime(r.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{label(CONTACT_TYPE_LABELS, r.contact_type)}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">{r.contact}</td>
                  <td className="px-4 py-3">{label(BUILDING_TYPE_LABELS, r.building_type)}</td>
                  <td className="px-4 py-3">{label(UNIT_COUNT_LABELS, r.unit_count)}</td>
                  <td className="px-4 py-3">{label(PAIN_POINT_LABELS, r.pain_point)}</td>
                  <td className="px-4 py-3">{sourceLabel(r.source)}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                    {kstDateTime(r.consent_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-[--muted-2]">
          총 {total.toLocaleString()}건 · {page}/{totalPages} 페이지
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page <= 1 || status === "loading"}
            onClick={() => goPage(Math.max(1, page - 1))}
          >
            이전
          </button>
          <button
            type="button"
            className="btn btn-ghost px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page >= totalPages || status === "loading"}
            onClick={() => goPage(Math.min(totalPages, page + 1))}
          >
            다음
          </button>
        </div>
        <select
          className="input ml-auto w-auto py-1.5 text-sm"
          value={perPage}
          onChange={(e) => changePerPage(Number(e.target.value))}
          aria-label="페이지당 표시 건수"
        >
          {PER_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}건씩
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

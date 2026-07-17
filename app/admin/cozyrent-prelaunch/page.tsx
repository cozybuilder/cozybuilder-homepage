import { createClient } from "@/lib/supabase/server";
import CozyrentSignupsExplorer from "@/components/admin/CozyrentSignupsExplorer";
import {
  BUILDING_TYPE_LABELS,
  UNIT_COUNT_LABELS,
  sourceLabel,
} from "@/lib/cozyrent-prelaunch-labels";

// 코지임대 사전신청 관리자 (1차: 조회 전용). 설계: docs/landing/COZYRENT_PRELAUNCH.md §13
// - 권한: app/admin/layout.tsx 의 requireAdmin() + 각 서버 액션의 getAdminUser() 이중 검증.
// - 조회: 관리자 쿠키 클라이언트(RLS admin select) — service_role 미사용.
// - 개인정보 페이지 → 정적 캐시 금지(force-dynamic).
export const dynamic = "force-dynamic";
export const metadata = { title: "코지임대 사전신청" };

const BREAKDOWN_SCAN_LIMIT = 20000;

function seoulToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

function daysAgoKst(days: number): string {
  const base = new Date(`${seoulToday()}T00:00:00+09:00`);
  base.setUTCDate(base.getUTCDate() - days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(base);
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card py-6 text-center">
      <p className="text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-2 text-xs tracking-wide text-[--muted-2]">{label}</p>
    </div>
  );
}

function BreakdownCard({
  title,
  entries,
}: {
  title: string;
  entries: [string, number][];
}) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-[--muted-2]">데이터 없음</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {entries.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between gap-3">
              <span className="text-[--muted]">{k}</span>
              <span className="tabular-nums">{v.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminCozyrentPrelaunchPage() {
  const supabase = await createClient();
  const table = () => supabase.from("cozyrent_prelaunch_signups");
  const todayStart = `${seoulToday()}T00:00:00+09:00`;
  const weekStart = `${daysAgoKst(6)}T00:00:00+09:00`;

  // 핵심 통계 — DB count 쿼리(head)로 산출.
  const [totalQ, todayQ, weekQ, phoneQ, emailQ, breakdownQ] = await Promise.all([
    table().select("id", { count: "exact", head: true }),
    table().select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    table().select("id", { count: "exact", head: true }).gte("created_at", weekStart),
    table().select("id", { count: "exact", head: true }).eq("contact_type", "phone"),
    table().select("id", { count: "exact", head: true }).eq("contact_type", "email"),
    // 분류 통계 — 개인정보 없는 코드 컬럼만 서버에서 조회해 집계(이름·연락처 미포함).
    table()
      .select("building_type,unit_count,source")
      .order("created_at", { ascending: false })
      .limit(BREAKDOWN_SCAN_LIMIT),
  ]);

  const loadError = totalQ.error ?? breakdownQ.error;

  const byBuilding = new Map<string, number>();
  const byUnit = new Map<string, number>();
  const bySource = new Map<string, number>();
  const sources = new Set<string>();
  for (const r of breakdownQ.data ?? []) {
    const b = BUILDING_TYPE_LABELS[r.building_type] ?? r.building_type;
    byBuilding.set(b, (byBuilding.get(b) ?? 0) + 1);
    const u = r.unit_count ? UNIT_COUNT_LABELS[r.unit_count] ?? r.unit_count : "미선택";
    byUnit.set(u, (byUnit.get(u) ?? 0) + 1);
    const s = sourceLabel(r.source);
    bySource.set(s, (bySource.get(s) ?? 0) + 1);
    sources.add(r.source);
  }
  const sorted = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">코지임대 사전신청</h1>
        <p className="mt-2 text-sm text-[--muted]">
          출시 전 사전신청 접수 현황 (조회 전용). 개인정보가 표시되는 화면입니다 — 업무 목적으로만
          사용하세요.
        </p>
      </header>

      {loadError && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          집계를 불러오지 못했습니다. supabase/migrations/0013_cozyrent_prelaunch_v1.sql 적용 여부를
          확인하세요.
        </p>
      )}

      {/* 요약 카드 */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="전체 신청자" value={totalQ.count ?? 0} />
        <KpiCard label="오늘 신청" value={todayQ.count ?? 0} />
        <KpiCard label="최근 7일" value={weekQ.count ?? 0} />
        <KpiCard label="휴대전화 신청" value={phoneQ.count ?? 0} />
        <KpiCard label="이메일 신청" value={emailQ.count ?? 0} />
      </section>

      {/* 분류 통계 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BreakdownCard title="건물 유형별" entries={sorted(byBuilding)} />
        <BreakdownCard title="유입 경로별" entries={sorted(bySource)} />
        <BreakdownCard title="호실 규모별" entries={sorted(byUnit)} />
      </section>

      {/* 목록 (검색·필터·페이지네이션·CSV) */}
      <section>
        <CozyrentSignupsExplorer knownSources={[...sources].sort()} />
      </section>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getApp } from "@/lib/apps";
import {
  getOverview,
  getByProgram,
  getDailyActive,
  getByVersion,
  type DailyPoint,
} from "@/lib/analytics";

// 관리자 Analytics 개요 — 권한 검증은 app/admin/layout.tsx(requireAdmin)에서 수행.
// 집계는 RLS(관리자만) 하에서 RPC 로 실시간 산출. 개인정보 미노출(익명/해시만).
export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

function appLabel(appKey: string): string {
  return getApp(appKey)?.name ?? appKey;
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card py-6 text-center">
      <p className="text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-2 text-xs tracking-wide text-[--muted-2]">{label}</p>
    </div>
  );
}

/** 일별 활성 사용자 막대 그래프 (서버 렌더 SVG, 의존성 없음). */
function DailyChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[--muted-2]">
        아직 집계된 이벤트가 없습니다.
      </p>
    );
  }
  const W = 720;
  const H = 180;
  const pad = 24;
  const max = Math.max(1, ...data.map((d) => d.active));
  const bw = (W - pad * 2) / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="일별 활성 사용자">
      {data.map((d, i) => {
        const h = ((H - pad * 2) * d.active) / max;
        const x = pad + i * bw;
        const y = H - pad - h;
        return (
          <rect
            key={d.day}
            x={x + bw * 0.15}
            y={y}
            width={bw * 0.7}
            height={Math.max(0, h)}
            rx={2}
            className="fill-indigo-500"
          >
            <title>{`${d.day}: 활성 ${d.active} / 이벤트 ${d.events}`}</title>
          </rect>
        );
      })}
      <line
        x1={pad}
        y1={H - pad}
        x2={W - pad}
        y2={H - pad}
        className="stroke-[--border]"
        strokeWidth={1}
      />
    </svg>
  );
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [overview, programs, daily, versions] = await Promise.all([
    getOverview(supabase),
    getByProgram(supabase),
    getDailyActive(supabase, 30),
    getByVersion(supabase),
  ]);

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-[--muted]">
          모든 프로그램의 공통 사용량 개요. 개인정보 미수집 — 익명 식별자/해시 기반 집계.
        </p>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="전체 누적 사용자" value={overview.total_users} />
        <KpiCard label="오늘 접속자" value={overview.today_active} />
        <KpiCard label="최근 7일 활성" value={overview.active_7d} />
        <KpiCard label="최근 30일 활성" value={overview.active_30d} />
      </section>

      {/* 일별 그래프 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">최근 30일 일별 활성 사용자</h2>
        <div className="card p-4">
          <DailyChart data={daily} />
        </div>
      </section>

      {/* 프로그램별 비교 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">프로그램별 비교</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--border] text-left text-xs text-[--muted-2]">
                <th className="px-4 py-3 font-medium">프로그램</th>
                <th className="px-4 py-3 text-right font-medium">사용자</th>
                <th className="px-4 py-3 text-right font-medium">실행(app_launch)</th>
                <th className="px-4 py-3 text-right font-medium">다운로드</th>
                <th className="px-4 py-3 text-right font-medium">총 이벤트</th>
              </tr>
            </thead>
            <tbody>
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[--muted-2]">
                    데이터 없음
                  </td>
                </tr>
              ) : (
                programs.map((p) => (
                  <tr key={p.app_key} className="border-b border-[--border]/50">
                    <td className="px-4 py-3">
                      {appLabel(p.app_key)}
                      <span className="ml-2 text-xs text-[--muted-2]">{p.app_key}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.users.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.launches.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.downloads.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.events.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 버전별 사용자 (표) */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">버전별 사용자 수</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--border] text-left text-xs text-[--muted-2]">
                <th className="px-4 py-3 font-medium">프로그램</th>
                <th className="px-4 py-3 font-medium">버전</th>
                <th className="px-4 py-3 text-right font-medium">사용자</th>
              </tr>
            </thead>
            <tbody>
              {versions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[--muted-2]">
                    데이터 없음
                  </td>
                </tr>
              ) : (
                versions.map((v) => (
                  <tr key={`${v.app_key}-${v.app_version}`} className="border-b border-[--border]/50">
                    <td className="px-4 py-3">{appLabel(v.app_key)}</td>
                    <td className="px-4 py-3 tabular-nums">{v.app_version}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{v.users.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

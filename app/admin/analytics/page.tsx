import { createClient } from "@/lib/supabase/server";
import { getApp, findAppByProgramSlug } from "@/lib/apps";
import { getPrograms } from "@/lib/content";
import {
  getOverview,
  getByVersion,
  getDailyBreakdown,
  type DayAgg,
  type AppBreakdown,
} from "@/lib/analytics";

// 관리자 Analytics 개요 — 권한 검증은 app/admin/layout.tsx(requireAdmin)에서 수행.
// 집계는 RLS(관리자만) 하에서 산출. 개인정보 미노출(익명/해시만).
export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

const DAYS = 30;

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card py-6 text-center">
      <p className="text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-2 text-xs tracking-wide text-[--muted-2]">{label}</p>
    </div>
  );
}

/**
 * 막대 그래프(서버 렌더 SVG, 의존성 없음).
 * - 막대 너비 상한(maxBar) + 중앙 정렬 → 데이터 1개여도 과도하게 커지지 않음.
 * - 전 구간 0이면 빈 상태 문구.
 */
function BarChart({
  data,
  width = 720,
  height = 180,
  pad = 20,
  maxBar = 44,
  baseline = true,
  emptyText = "데이터 없음",
}: {
  data: DayAgg[];
  width?: number;
  height?: number;
  pad?: number;
  maxBar?: number;
  baseline?: boolean;
  emptyText?: string;
}) {
  const hasData = data.some((d) => d.active > 0);
  if (data.length === 0 || !hasData) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[--muted-2]"
        style={{ height }}
      >
        {emptyText}
      </div>
    );
  }

  const n = data.length;
  const slot = Math.min((width - pad * 2) / n, maxBar);
  const groupW = slot * n;
  const startX = Math.max(pad, (width - groupW) / 2);
  const max = Math.max(1, ...data.map((d) => d.active));
  const barW = slot * 0.7;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="일별 활성 사용자"
    >
      {data.map((d, i) => {
        const h = ((height - pad * 2) * d.active) / max;
        const x = startX + i * slot + (slot - barW) / 2;
        const y = height - pad - h;
        return (
          <rect
            key={d.day}
            x={x}
            y={y}
            width={barW}
            height={Math.max(0, h)}
            rx={2}
            className="fill-indigo-500"
          >
            <title>{`${d.day}: 활성 ${d.active} / 이벤트 ${d.events}`}</title>
          </rect>
        );
      })}
      {baseline && (
        <line
          x1={pad}
          y1={height - pad}
          x2={width - pad}
          y2={height - pad}
          className="stroke-[--border]"
          strokeWidth={1}
        />
      )}
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="text-[10px] text-[--muted-2]">{label}</p>
    </div>
  );
}

function ProgramCard({
  label,
  appKey,
  data,
}: {
  label: string;
  appKey: string;
  data?: AppBreakdown;
}) {
  const empty: AppBreakdown = {
    appKey,
    users: 0,
    launches: 0,
    downloads: 0,
    events: 0,
    days: [],
  };
  const d = data ?? empty;
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-[10px] text-[--muted-2]">{appKey}</span>
      </div>
      <div className="mb-3 grid grid-cols-4 gap-2">
        <Stat label="사용자" value={d.users} />
        <Stat label="실행수" value={d.launches} />
        <Stat label="다운로드 클릭" value={d.downloads} />
        <Stat label="총 이벤트" value={d.events} />
      </div>
      <BarChart
        data={d.days}
        width={260}
        height={56}
        pad={4}
        maxBar={12}
        baseline={false}
        emptyText="최근 30일 데이터 없음"
      />
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [overview, breakdown, versions, programs] = await Promise.all([
    getOverview(supabase),
    getDailyBreakdown(supabase, DAYS),
    getByVersion(supabase),
    getPrograms(),
  ]);

  // 프로그램 → 분석 app_key(웹: 런처 키 = app_launch 기준, 그 외: 슬러그 = download 기준)
  const seeded = new Set<string>();
  const cards: { label: string; appKey: string }[] = [];
  for (const p of programs) {
    const webApp = p.type === "web" ? findAppByProgramSlug(p.slug) : null;
    const key = webApp?.key ?? p.slug;
    if (seeded.has(key)) continue;
    seeded.add(key);
    cards.push({ label: p.name, appKey: key });
  }
  // 프로그램 목록에 없지만 데이터가 있는 app_key 도 누락 없이 노출.
  for (const key of Object.keys(breakdown.byApp)) {
    if (seeded.has(key)) continue;
    seeded.add(key);
    cards.push({ label: getApp(key)?.name ?? key, appKey: key });
  }

  const appLabel = (key: string): string =>
    getApp(key)?.name ??
    cards.find((c) => c.appKey === key)?.label ??
    key;

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-[--muted]">
          모든 프로그램의 공통 사용량 개요. 개인정보 미수집 — 익명 식별자/해시 기반 집계.
        </p>
      </header>

      {/* KPI — 전체 합산 */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">전체 합산</h2>
        <p className="mb-4 text-xs text-[--muted-2]">
          ※ 상단 KPI는 모든 프로그램 합산입니다. 활성 사용자 = distinct anonymous_id.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="전체 누적 사용자" value={overview.total_users} />
          <KpiCard label="오늘 접속자" value={overview.today_active} />
          <KpiCard label="최근 7일 활성" value={overview.active_7d} />
          <KpiCard label="최근 30일 활성" value={overview.active_30d} />
        </div>
      </section>

      {/* 기준 안내 */}
      <section className="card bg-[--muted]/5 p-4 text-xs leading-relaxed text-[--muted-2]">
        <p className="mb-1 font-semibold text-[--muted]">그래프 기준</p>
        <ul className="list-disc space-y-0.5 pl-5">
          <li>전체 그래프 = 모든 프로그램 합산.</li>
          <li>프로그램별 그래프 = app_key 기준 분리.</li>
          <li>실행수 = app_launch count(진입 횟수, 중복 포함).</li>
          <li>활성 사용자 = distinct anonymous_id.</li>
          <li>&lsquo;다운로드 클릭&rsquo;은 스토어/다운로드 버튼 클릭 의도이며 실제 설치 수가 아닙니다.</li>
        </ul>
      </section>

      {/* 전체 30일 그래프 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">최근 30일 — 전체 활성 사용자</h2>
        <div className="card p-4">
          <BarChart
            data={breakdown.overall}
            emptyText="아직 집계된 이벤트가 없습니다."
          />
        </div>
      </section>

      {/* 프로그램별 30일 분리 */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">최근 30일 — 프로그램별</h2>
        <p className="mb-4 text-xs text-[--muted-2]">
          각 프로그램(app_key)별 30일 활성 사용자 추이와 누적 지표입니다.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((c) => (
            <ProgramCard
              key={c.appKey}
              label={c.label}
              appKey={c.appKey}
              data={breakdown.byApp[c.appKey]}
            />
          ))}
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

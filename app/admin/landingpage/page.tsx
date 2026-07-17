import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LANDING_CONFIGS } from "@/lib/landingpage/config";
import { sourceLabel } from "@/lib/cozyrent-prelaunch-labels";

// 랜딩페이지 목록 관리자 — 레지스트리의 랜딩별 요약 카드.
// 설계: docs/landing/LANDINGPAGE_PLATFORM.md §3. 새 랜딩은 레지스트리 등록만으로 여기에 추가된다.
export const dynamic = "force-dynamic";
export const metadata = { title: "랜딩페이지" };

const SOURCE_SCAN_LIMIT = 20000;

function seoulToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

function daysAgoKst(days: number): string {
  const base = new Date(`${seoulToday()}T00:00:00+09:00`);
  base.setUTCDate(base.getUTCDate() - days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(base);
}

type LandingSummary = {
  slug: string;
  productName: string;
  adminName: string;
  total: number;
  today: number;
  week: number;
  topSources: string[];
  error: boolean;
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-1 text-[11px] text-[--muted-2]">{label}</p>
    </div>
  );
}

export default async function AdminLandingIndexPage() {
  const supabase = await createClient();
  const todayStart = `${seoulToday()}T00:00:00+09:00`;
  const weekStart = `${daysAgoKst(6)}T00:00:00+09:00`;

  const summaries: LandingSummary[] = await Promise.all(
    LANDING_CONFIGS.map(async (c) => {
      const table = () => supabase.from(c.signupsTable);
      const [totalQ, todayQ, weekQ, srcQ] = await Promise.all([
        table().select("id", { count: "exact", head: true }),
        table().select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        table().select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        table().select("source").limit(SOURCE_SCAN_LIMIT),
      ]);
      const bySource = new Map<string, number>();
      for (const r of srcQ.data ?? []) {
        bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1);
      }
      const topSources = [...bySource.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([s, n]) => `${sourceLabel(s)} ${n.toLocaleString()}`);
      return {
        slug: c.slug,
        productName: c.productName,
        adminName: c.adminName,
        total: totalQ.count ?? 0,
        today: todayQ.count ?? 0,
        week: weekQ.count ?? 0,
        topSources,
        error: Boolean(totalQ.error),
      };
    })
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">랜딩페이지</h1>
        <p className="mt-2 text-sm text-[--muted]">
          제품별 랜딩페이지와 사전신청 접수 현황. 새 랜딩은 랜딩 설정 레지스트리에 등록하면 여기에
          추가됩니다.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {summaries.map((s) => (
          <div key={s.slug} className="card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{s.adminName}</h2>
                <p className="mt-1 text-xs text-[--muted-2]">
                  {s.productName} · slug: {s.slug}
                </p>
              </div>
              <Link
                href={`/landingpage/${s.slug}`}
                target="_blank"
                className="text-sm text-[--accent] hover:underline"
              >
                공개 랜딩 열기 ↗
              </Link>
            </div>

            {s.error ? (
              <p className="mt-5 text-sm text-amber-300">
                집계를 불러오지 못했습니다. 신청 테이블 적용 여부를 확인하세요.
              </p>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-[--border] py-4">
                  <Stat label="전체 신청" value={s.total} />
                  <Stat label="오늘" value={s.today} />
                  <Stat label="최근 7일" value={s.week} />
                </div>
                <p className="mt-3 text-xs text-[--muted-2]">
                  주요 유입: {s.topSources.length > 0 ? s.topSources.join(" · ") : "데이터 없음"}
                </p>
              </>
            )}

            <Link
              href={`/admin/landingpage/${s.slug}`}
              className="btn btn-ghost mt-5 w-full py-2.5 text-sm"
            >
              신청 내역 보기
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

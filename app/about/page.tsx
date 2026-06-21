import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { team } from "@/lib/site";

export const metadata: Metadata = { title: "소개" };

const buildSections: {
  title: string;
  body: string[];
  items?: string[];
}[] = [
  {
    title: "Programs",
    body: ["AI와 자동화를 활용한 다양한 프로그램을 개발합니다."],
    items: ["Gratitude Diary", "ClipMiner", "ShortsFactory", "Ebook Publishing System"],
  },
  {
    title: "Books",
    body: ["전자책을 기획하고 제작하며,", "지식과 경험을 기록합니다."],
  },
  {
    title: "Contents",
    body: ["블로그, 유튜브, SNS를 통해", "성장 과정과 배움을 공유합니다."],
  },
  {
    title: "AI Characters",
    body: [
      "AI Cozy와 HARIN을 중심으로",
      "새로운 형태의 콘텐츠와 이야기를 만들어갑니다.",
    ],
  },
  {
    title: "Websites & Apps",
    body: ["웹사이트와 앱을 만들며,", "작은 서비스들을 하나씩 완성해 나갑니다."],
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-20">
      {/* ---------------- Section 1 : About Me ---------------- */}
      <PageHeader eyebrow="About" title="About Me" />

      <section className="mx-auto mt-12 max-w-2xl space-y-8 text-lg leading-relaxed text-[--muted]">
        <div className="space-y-3">
          <p>46세.</p>
          <p>
            프로그래머 8년, 건설 일 13년을 그만두고
            <br />
            AI와 함께 다시 시작했습니다.
          </p>
          <p className="text-foreground">이곳은 그 기록입니다.</p>
        </div>

        <hr className="border-[--border]" />

        <div className="space-y-3">
          <p>저는 단순히 하나의 직업을 가진 사람이 아닙니다.</p>
          <p>
            아이디어를 현실로 만들고, 작은 제품들을 하나씩 쌓아가며, AI 시대의
            1인 기업을 만들어가고 있습니다.
          </p>
        </div>
      </section>

      {/* ---------------- Section 2 : What I Build ---------------- */}
      <section className="mx-auto mt-24 max-w-2xl">
        <div className="text-center">
          <p className="eyebrow mb-3">What I Build</p>
          <h2 className="text-3xl font-semibold tracking-tight">만들어가는 것들</h2>
        </div>

        <div className="mt-12 divide-y divide-[--border]">
          {buildSections.map((section) => (
            <div key={section.title} className="py-8 first:pt-0 last:pb-0">
              <h3 className="text-xl font-semibold tracking-tight">
                {section.title}
              </h3>
              <div className="mt-3 space-y-1 leading-relaxed text-zinc-400">
                {section.body.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              {section.items && (
                <ul className="mt-4 space-y-1.5">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-zinc-400"
                    >
                      <span className="text-[--accent]">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Section 3 : My Mission ---------------- */}
      <section className="mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">My Mission</p>
          <h2 className="text-3xl font-semibold tracking-tight">제가 꿈꾸는 삶</h2>
        </div>

        <div className="mx-auto mt-10 max-w-2xl space-y-8 text-center text-lg leading-relaxed text-[--muted]">
          <div className="space-y-3">
            <p>화려한 성공보다</p>
            <p>꾸준히 만들고, 꾸준히 기록하며, 꾸준히 성장하는 것.</p>
            <p className="text-foreground">오늘보다 조금 더 나은 내일을 만드는 것.</p>
            <p>그것이 제가 꿈꾸는 삶입니다.</p>
          </div>

          <p className="heading-gradient text-2xl font-semibold tracking-tight">
            Build. Create. Automate.
          </p>
        </div>
      </section>

      {/* ---------------- Team (유지) ---------------- */}
      <section className="mx-auto mt-24 max-w-3xl">
        <div className="text-center">
          <p className="eyebrow mb-3">Team</p>
          <h2 className="text-3xl font-semibold tracking-tight">함께하는 팀</h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="card text-center">
              <div className="mb-3 text-3xl">{m.emoji}</div>
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <p className="mt-1 text-sm text-[--muted-2]">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

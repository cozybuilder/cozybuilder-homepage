import type { Metadata } from "next";
import AppScreenSlot from "@/components/cozyrent/AppScreenSlot";
import PreRegisterForm from "@/components/cozyrent/PreRegisterForm";
import MobileCtaBar from "@/components/cozyrent/MobileCtaBar";

// 코지임대 출시 전 사전신청 랜딩페이지. 설계 SSOT: docs/landing/COZYRENT_PRELAUNCH.md
// 혜택·문구 원본: cozyrent/docs/MARKETING.md §8 · SUBSCRIPTION.md (금지 표현 준수)

const PAGE_URL = "https://cozybuilder.co.kr/cozyrent";
const DESCRIPTION =
  "월세, 관리비, 미납, 계약, 수선 기록까지 한곳에서. 코지임대 출시 전 사전신청하고 6,900P 혜택을 받아보세요.";

export const metadata: Metadata = {
  title: { absolute: "코지임대 사전신청 | 건물주를 위한 임대관리 앱" },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "코지임대 사전신청 | 건물주를 위한 임대관리 앱",
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "CozyBuilder",
    locale: "ko_KR",
    type: "website",
    images: [{ url: `${PAGE_URL.replace("/cozyrent", "")}/image/cozyrent/og.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "코지임대 사전신청 | 건물주를 위한 임대관리 앱",
    description: DESCRIPTION,
  },
};

// 실앱 화면 교체 슬롯 — 실제 앱 화면 확보 시 public/image/cozyrent/ 에 파일을 넣고 경로를 채운다.
// 가짜 UI 금지: 자산이 없으면 AppScreenSlot 이 중립 placeholder 를 표시한다.
const APP_SCREENS: Record<string, string | null> = {
  hero: null, // public/image/cozyrent/app-home.png
  rent: null, // public/image/cozyrent/app-rent.png
  building: null, // public/image/cozyrent/app-building.png
  repair: null, // public/image/cozyrent/app-repair.png
  moveout: null, // public/image/cozyrent/app-moveout.png
  expense: null, // public/image/cozyrent/app-expense.png
};

const PROBLEMS = [
  "이번 달 월세를 누가 냈는지 헷갈립니다.",
  "계약과 보증금 기록이 여기저기 흩어져 있습니다.",
  "미납·수선·퇴실 일정을 놓치기 쉽습니다.",
  "호실이 늘어날수록 관리가 복잡해집니다.",
];

const FEATURES: { key: string; title: string; desc: string }[] = [
  {
    key: "rent",
    title: "월세·관리비·미납 관리",
    desc: "이번 달 받을 돈과 입금 내역을 기록하면, 미납은 자동으로 계산됩니다.",
  },
  {
    key: "building",
    title: "건물·호실·계약 관리",
    desc: "건물과 호실, 계약·보증금 정보를 층별로 정리해 한눈에 확인합니다.",
  },
  {
    key: "repair",
    title: "수선·시설·하자 기록",
    desc: "수선·하자 내역과 시설 정보를 호실·건물별로 기록하고 관리합니다.",
  },
  {
    key: "moveout",
    title: "퇴실 점검과 정산 기록",
    desc: "퇴실할 때 점검한 내용과 정산 내역을 기록으로 남깁니다.",
  },
  {
    key: "expense",
    title: "고정지출 관리",
    desc: "공용 전기, 청소비처럼 매달 나가는 고정지출을 한곳에 정리합니다.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "언제 출시되나요?",
    a: "지금 Android 앱을 우선 개발하고 있습니다. 정식 출시 일정이 확정되면 사전신청하신 연락처로 가장 먼저 안내해드립니다.",
  },
  {
    q: "사전신청하면 결제되나요?",
    a: "아니요. 사전신청은 무료이며 결제 정보(카드 등록)를 받지 않습니다. 자동결제도 없습니다. 정식 출시 후 가입하면 카드 등록 없이 15일 무료체험을 이용할 수 있습니다.",
  },
  {
    q: "6,900P는 어떻게 사용하나요?",
    a: "정식 출시 후 코지임대를 구독하면 사전신청 포인트가 이용기간 연장에 적용됩니다. 베이직 요금제 기준 30일 연장에 해당합니다. 포인트는 이용기간 연장 전용이며 현금화·양도·환불할 수 없습니다. 세부 적용 조건은 정식 출시 시 안내됩니다.",
  },
  {
    q: "아이폰에서도 사용할 수 있나요?",
    a: "지금은 Android 앱을 먼저 개발하고 있습니다. iPhone(iOS) 버전은 정식 출시 이후 순차적으로 검토할 예정입니다.",
  },
  {
    q: "누구에게 필요한 앱인가요?",
    a: "원룸·다가구·상가주택을 직접 관리하는 개인 임대인을 위한 앱입니다. 월세·관리비 확인, 미납, 계약, 수선, 퇴실 기록을 휴대폰 하나로 정리하고 싶은 분께 맞습니다.",
  },
];

function PhoneMockup({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="mx-auto w-[240px] sm:w-[280px]">
      <div className="aspect-[9/19] overflow-hidden rounded-[2.2rem] border-4 border-[--border-strong] bg-[--surface] shadow-[0_30px_80px_-20px_var(--accent-glow)]">
        <AppScreenSlot src={src} alt={alt} label="실제 앱 화면이 이 자리에 들어갑니다" />
      </div>
    </div>
  );
}

export default function CozyrentLandingPage() {
  return (
    <div className="pb-24 md:pb-0">
      {/* 상단 바 — 랜딩 전용(전역 Header 는 /cozyrent 에서 숨김) */}
      <div className="sticky top-0 z-50 border-b border-[--border] bg-[--background]/80 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-foreground">코지임대</span>
          <a href="#apply" className="btn btn-accent min-h-[44px] px-5 text-sm font-semibold">
            사전신청
          </a>
        </div>
      </div>

      {/* 히어로 */}
      <section className="container-page pt-14 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">출시 전 사전신청 진행 중</p>
            <h1 className="heading-gradient mt-5 text-4xl font-bold leading-tight sm:text-5xl md:text-[3.4rem]">
              임대관리의 새로운 기준,
              <br />
              코지임대
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[--muted] sm:text-xl">
              월세, 관리비, 미납, 계약, 수선 기록까지
              <br className="hidden sm:block" /> 개인 건물주에게 필요한 임대관리를 한곳에서
              확인하세요.
            </p>
            <div className="mt-9">
              <a
                href="#apply"
                className="btn btn-accent min-h-[56px] w-full px-8 text-lg font-semibold sm:w-auto"
              >
                사전신청하고 6,900P 받기
              </a>
              <p className="mt-4 text-base text-[--muted-2]">
                출시 전 신청자 한정 · 베이직 이용기간 30일 연장 상당
              </p>
            </div>
          </div>
          <PhoneMockup src={APP_SCREENS.hero} alt="코지임대 앱 홈 화면" />
        </div>
      </section>

      {/* 문제 공감 */}
      <section className="container-page mt-28 md:mt-36">
        <h2 className="text-center text-2xl font-bold leading-snug text-foreground sm:text-3xl">
          임대관리, 아직도 기억과 메모에
          <br className="sm:hidden" /> 의존하고 계신가요?
        </h2>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {PROBLEMS.map((p) => (
            <li key={p} className="card flex items-start gap-3 p-5">
              <span className="mt-0.5 text-[--accent]" aria-hidden>
                ✓
              </span>
              <span className="text-base leading-relaxed text-[--muted] sm:text-lg">{p}</span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-2xl text-center text-lg leading-relaxed text-foreground sm:text-xl">
          코지임대는 문제가 없는 정보는 줄이고,
          <br />
          지금 확인해야 할 일부터 보여줍니다.
        </p>
      </section>

      {/* 주요 기능 */}
      <section className="container-page mt-28 md:mt-36">
        <p className="eyebrow text-center">주요 기능</p>
        <h2 className="mt-4 text-center text-2xl font-bold text-foreground sm:text-3xl">
          건물주에게 필요한 관리만 담았습니다
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.key} className="card card-hover flex flex-col overflow-hidden p-0">
              <div className="aspect-[16/10]">
                <AppScreenSlot
                  src={APP_SCREENS[f.key]}
                  alt={`코지임대 ${f.title} 화면`}
                  label="실제 앱 화면 준비 중"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-[--muted]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 제작 신뢰 */}
      <section className="container-page mt-28 md:mt-36">
        <div className="card mx-auto max-w-3xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            다가구주택을 직접 관리하는
            <br />
            건물주가 만들었습니다
          </h2>
          <div className="mt-7 space-y-5 text-base leading-relaxed text-[--muted] sm:text-lg">
            <p>코지임대는 가상의 임대관리 방식에서 출발하지 않았습니다.</p>
            <p>
              건물을 직접 짓고 관리하며 겪은 월세 확인, 미납 관리, 시설 수선과 퇴실 정산의 불편을
              줄이기 위해 만들고 있습니다.
            </p>
            <p>
              복잡한 ERP가 아니라, 건물주가 매일 휴대폰으로 편하게 사용하는 앱을 목표로 합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 혜택 */}
      <section className="container-page mt-28 md:mt-36">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
          출시 전에 신청하면 6,900P
        </h2>
        <div className="card mx-auto mt-10 max-w-2xl border-[--accent]/40 p-8 text-center sm:p-12">
          <p className="text-5xl font-bold text-foreground sm:text-6xl">
            6,900<span className="text-3xl align-top sm:text-4xl">P</span>
          </p>
          <p className="mt-3 text-lg font-medium text-[--accent] sm:text-xl">
            베이직 이용기간 30일 연장 상당
          </p>
          <div className="mt-8 space-y-4 text-base leading-relaxed text-[--muted] sm:text-lg">
            <p>
              정식 출시 후 코지임대를 구독하면
              <br />
              사전신청 포인트가 이용기간 연장에 적용됩니다.
            </p>
            <p>
              가입 후에는 카드 등록 없이
              <br />
              15일 동안 무료로 체험할 수 있습니다.
            </p>
          </div>
          <p className="mt-8 border-t border-[--border] pt-6 text-sm leading-relaxed text-[--muted-2]">
            포인트는 코지임대 이용기간 연장 전용이며 현금화·양도·환불할 수 없습니다.
            <br />
            세부 조건은 정식 출시 시 안내됩니다.
          </p>
        </div>
      </section>

      {/* 사전신청 폼 */}
      <section id="apply" className="container-page mt-28 scroll-mt-20 md:mt-36">
        <p className="eyebrow text-center">사전신청</p>
        <h2 className="mt-4 text-center text-2xl font-bold text-foreground sm:text-3xl">
          출시 소식을 가장 먼저 받아보세요
        </h2>
        <div className="mx-auto mt-10 max-w-xl">
          <PreRegisterForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page mt-28 md:mt-36">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
          자주 묻는 질문
        </h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="card group p-0">
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-base font-medium text-foreground sm:text-lg [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  className="text-[--muted-2] transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 text-base leading-relaxed text-[--muted]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 마지막 CTA */}
      <section className="container-page mt-28 md:mt-36">
        <div className="card mx-auto max-w-3xl p-10 text-center sm:p-14">
          <h2 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            기억에 의존하던 임대관리,
            <br />
            코지임대로 정리해보세요.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[--muted]">
            출시 전 사전신청하고
            <br />
            6,900P 혜택을 받아보세요.
          </p>
          <a
            href="#apply"
            className="btn btn-accent mt-9 min-h-[56px] w-full px-10 text-lg font-semibold sm:w-auto"
          >
            코지임대 사전신청
          </a>
        </div>
      </section>

      {/* 모바일 하단 고정 CTA */}
      <MobileCtaBar />
    </div>
  );
}

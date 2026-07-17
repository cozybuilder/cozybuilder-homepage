import type { ComponentType } from "react";
import type { LandingConfig, LandingFormKind } from "@/lib/landingpage/config";
import AppScreenSlot from "@/components/landingpage/AppScreenSlot";
import MobileCtaBar from "@/components/landingpage/MobileCtaBar";
import CozyrentPreRegisterForm from "@/components/cozyrent/PreRegisterForm";

// 공용 랜딩 렌더러. 설계: docs/landing/LANDINGPAGE_PLATFORM.md §2
// 랜딩별 내용은 전부 config 가 소유한다 — 이 파일에 제품 문구를 하드코딩하지 않는다.

// 폼 종류 → 폼 컴포넌트 (신규 랜딩은 여기에 폼을 등록한다).
const FORM_COMPONENTS: Record<LandingFormKind, ComponentType> = {
  "cozyrent-preregister": CozyrentPreRegisterForm,
};

function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={line} className="block">
          {line}
          {i < lines.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

function PhoneMockup({
  src,
  alt,
  ratio,
  dims,
}: {
  src: string | null;
  alt: string;
  ratio: string;
  dims?: { w: number; h: number };
}) {
  return (
    <div className="mx-auto w-[240px] sm:w-[280px]">
      <div
        className="overflow-hidden rounded-[2.2rem] border-4 border-[--border-strong] bg-[--surface] shadow-[0_30px_80px_-20px_var(--accent-glow)]"
        style={{ aspectRatio: ratio }}
      >
        <AppScreenSlot
          src={src}
          alt={alt}
          label="실제 앱 화면이 이 자리에 들어갑니다"
          width={dims?.w}
          height={dims?.h}
          sizes="280px"
          priority
        />
      </div>
    </div>
  );
}

/** 기능 카드 상단 세로형 앱 화면 슬롯 — 실제 캡처 비율 보존, 전 카드 동일 규격. */
function FeatureScreen({
  src,
  alt,
  ratio,
  dims,
}: {
  src: string | null;
  alt: string;
  ratio: string;
  dims?: { w: number; h: number };
}) {
  return (
    <div className="flex justify-center bg-[--surface-2]/40 pb-0 pt-6">
      <div className="w-36 sm:w-40">
        <div
          className="overflow-hidden rounded-2xl border border-[--border-strong] bg-[--surface] shadow-[0_16px_40px_-16px_var(--accent-glow)]"
          style={{ aspectRatio: ratio }}
        >
          <AppScreenSlot
            src={src}
            alt={alt}
            label="실제 앱 화면 준비 중"
            width={dims?.w}
            height={dims?.h}
            sizes="160px"
          />
        </div>
      </div>
    </div>
  );
}

export default function LandingRenderer({ config }: { config: LandingConfig }) {
  const ApplyForm = FORM_COMPONENTS[config.formKind];
  const screens = config.images.appScreens;
  const heroRatio = config.images.heroRatio ?? "9 / 19";
  const screenRatio = config.images.screenRatio ?? "9 / 19";

  return (
    <div className="pb-24 md:pb-0">
      {/* 상단 바 — 랜딩 전용(전역 Header 는 /landingpage 에서 숨김) */}
      <div className="sticky top-0 z-50 border-b border-[--border] bg-[--background]/80 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-foreground">
            {config.productName}
          </span>
          <a href="#apply" className="btn btn-accent min-h-[44px] px-5 text-sm font-semibold">
            사전신청
          </a>
        </div>
      </div>

      {/* 히어로 */}
      <section className="container-page pt-14 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">{config.hero.eyebrow}</p>
            {/* 의미 단위 명시 줄바꿈 + 줄 단위 nowrap + clamp 글자 크기 → 단어 중간 분리·넘침 방지 */}
            <h1 className="heading-gradient landing-hero-title mt-5 break-keep font-bold leading-[1.25] tracking-tight">
              {config.hero.titleLines.map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 break-keep text-lg leading-relaxed text-[--muted] sm:text-xl">
              {config.hero.description.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < config.hero.description.length - 1 && (
                    <>
                      <br className="hidden sm:block" />{" "}
                    </>
                  )}
                </span>
              ))}
            </p>
            <div className="mt-9">
              <a
                href="#apply"
                className="btn btn-accent min-h-[56px] w-full whitespace-nowrap px-6 text-base font-semibold sm:w-auto sm:px-8 sm:text-lg"
              >
                {config.hero.cta}
              </a>
              <p className="mt-4 break-keep text-base text-[--muted-2]">{config.hero.sub}</p>
            </div>
          </div>
          <PhoneMockup
            src={screens.hero}
            alt={config.hero.heroScreenAlt}
            ratio={heroRatio}
            dims={config.images.heroDims}
          />
        </div>
      </section>

      {/* 문제 공감 */}
      <section className="container-page mt-28 md:mt-36">
        <h2 className="break-keep text-center text-2xl font-bold leading-snug text-foreground sm:text-3xl">
          <Lines lines={config.problems.title} />
        </h2>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {config.problems.items.map((p) => (
            <li key={p} className="card flex items-start gap-3 p-5">
              <span className="mt-0.5 text-[--accent]" aria-hidden>
                ✓
              </span>
              <span className="break-keep text-base leading-relaxed text-[--muted] sm:text-lg">
                {p}
              </span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-2xl break-keep text-center text-lg leading-relaxed text-foreground sm:text-xl">
          <Lines lines={config.problems.closing} />
        </p>
      </section>

      {/* 주요 기능 */}
      <section className="container-page mt-28 md:mt-36">
        <p className="eyebrow text-center">{config.features.eyebrow}</p>
        <h2 className="mt-4 break-keep text-center text-2xl font-bold text-foreground sm:text-3xl">
          {config.features.title}
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {config.features.items.map((f) => (
            <div key={f.key} className="card card-hover flex flex-col overflow-hidden p-0">
              <FeatureScreen
                src={screens[f.key] ?? null}
                alt={`${config.productName} ${f.title} 화면`}
                ratio={screenRatio}
                dims={config.images.screenDims}
              />
              <div className="p-6 pt-5">
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 break-keep text-base leading-relaxed text-[--muted]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 제작 신뢰 */}
      <section className="container-page mt-28 md:mt-36">
        <div className="card mx-auto max-w-3xl p-8 sm:p-12">
          <h2 className="break-keep text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            <Lines lines={config.trust.titleLines} />
          </h2>
          <div className="mt-7 space-y-5 break-keep text-base leading-relaxed text-[--muted] sm:text-lg">
            {config.trust.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 혜택 */}
      <section className="container-page mt-28 md:mt-36">
        <h2 className="break-keep text-center text-2xl font-bold text-foreground sm:text-3xl">
          {config.benefit.title}
        </h2>
        <div className="card mx-auto mt-10 max-w-2xl border-[--accent]/40 p-8 text-center sm:p-12">
          <p className="text-5xl font-bold text-foreground sm:text-6xl">
            {config.benefit.amount}
            <span className="align-top text-3xl sm:text-4xl">{config.benefit.amountUnit}</span>
          </p>
          <p className="mt-3 break-keep text-lg font-medium text-[--accent] sm:text-xl">
            {config.benefit.subtitle}
          </p>
          <div className="mt-8 space-y-4 break-keep text-base leading-relaxed text-[--muted] sm:text-lg">
            {config.benefit.paragraphs.map((lines) => (
              <p key={lines[0]}>
                <Lines lines={lines} />
              </p>
            ))}
          </div>
          <p className="mt-8 break-keep border-t border-[--border] pt-6 text-sm leading-relaxed text-[--muted-2]">
            <Lines lines={config.benefit.notice} />
          </p>
        </div>
      </section>

      {/* 사전신청 폼 */}
      <section id="apply" className="container-page mt-28 scroll-mt-20 md:mt-36">
        <p className="eyebrow text-center">{config.applySection.eyebrow}</p>
        <h2 className="mt-4 break-keep text-center text-2xl font-bold text-foreground sm:text-3xl">
          {config.applySection.title}
        </h2>
        <div className="mx-auto mt-10 max-w-xl">
          <ApplyForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page mt-28 md:mt-36">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
          자주 묻는 질문
        </h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {config.faqs.map((f) => (
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
              <p className="break-keep px-6 pb-6 text-base leading-relaxed text-[--muted]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 마지막 CTA */}
      <section className="container-page mt-28 md:mt-36">
        <div className="card mx-auto max-w-3xl p-10 text-center sm:p-14">
          <h2 className="break-keep text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            <Lines lines={config.finalCta.titleLines} />
          </h2>
          <p className="mt-5 break-keep text-lg leading-relaxed text-[--muted]">
            <Lines lines={config.finalCta.descLines} />
          </p>
          <a
            href="#apply"
            className="btn btn-accent mt-9 min-h-[56px] w-full whitespace-nowrap px-6 text-base font-semibold sm:w-auto sm:px-10 sm:text-lg"
          >
            {config.finalCta.button}
          </a>
        </div>
      </section>

      {/* 모바일 하단 고정 CTA */}
      <MobileCtaBar label={config.hero.cta} />
    </div>
  );
}

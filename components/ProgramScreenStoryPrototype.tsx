"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ⚠ 디자인 프로토타입 (코지 확인용) — 승인 전까지 공통 컴포넌트로 승격하지 않는다.
// 적용 범위: 코지임대 상세페이지 한 곳. 다른 프로그램은 기존 ScreenshotGallery 를 그대로 쓴다.
//
// 이번 단계에서 하지 않는 것(승인 후 2차 작업):
//   - 관리자에서 이미지/제목/설명/순서 등록 · landing_content 확장 · DB 저장 구조
// 그래서 설명 문구는 **여기 코드 상수**로만 둔다. 운영 데이터는 건드리지 않는다.
//
// 이미지는 실제 앱 캡처(1080×2111 세로)다. 기존 갤러리의 16:9 검은 박스는 쓰지 않고
// 원본 비율 그대로 보여준다 — crop 0 · 검은 여백 0.
//
// 2차 보강
//   - 기기 프레임: 외부 목업 이미지 없이 CSS 만으로 만든 중립 안드로이드형 바디.
//     notch·Dynamic Island 를 그리지 않는다 — 캡처 안에 이미 앱의 상태바가 들어 있어서
//     가짜 노치를 얹으면 실제 화면을 가리게 된다.
//   - 화면 전환: opacity crossfade + 아주 작은 scale/translateY. 좌우 슬라이드·회전 없음.
//   - 좌측 텍스트: 활성 1개만 또렷하게, 나머지는 흐리게(단, 읽을 수는 있게).
//   - prefers-reduced-motion: transform 을 버리고 거의 즉시 바뀌는 opacity 만 남긴다.

const SCREEN_RATIO = "1080 / 2111";

/** 전환 길이 — 지시 범위(350–450ms) 안. 텍스트도 같은 리듬을 쓴다. */
const EASE = "transition-[opacity,translate,scale,color] duration-[400ms] ease-out";
/** 모션 최소화 환경: 변형을 없애고(= scale/translate 원위치) 거의 즉시 끝낸다. */
const REDUCED =
  "motion-reduce:scale-100 motion-reduce:translate-y-0 motion-reduce:duration-[1ms] motion-reduce:delay-0";

// 들어오는 화면은 위에 쌓여 400ms 동안 올라오고, 나가는 화면은 그게 거의 덮인 뒤에야 사라진다.
// 둘을 동시에 반반 투명하게 만들면 교체 순간 프레임이 한 번 어두워지는데, 그걸 피하기 위한 순서다.
const SCREEN_IN = `z-10 ${EASE} ${REDUCED}`;
const SCREEN_OUT = `transition-[opacity,translate,scale] duration-[160ms] delay-[300ms] ease-out ${REDUCED}`;

/** 프로토타입 설명 — 운영 screenshots 순서(home→rent→building→moveout→repair→expense)에 1:1 대응. */
const STEPS: { title: string; description: string }[] = [
  {
    title: "홈 화면",
    description: "건물 현황과 이번 달 받을 돈을 한 화면에서 확인합니다.",
  },
  {
    title: "이번 달 돈 흐름",
    description: "받을 돈과 나갈 돈, 오늘 확인할 일을 함께 봅니다.",
  },
  {
    title: "호실 관리",
    description: "층별 호실과 계약 기간, 계약이 끝나가는 호실을 한눈에 봅니다.",
  },
  {
    title: "계약·퇴실 관리",
    description: "계약 내용과 만료 시점을 확인하고 갱신·퇴실로 이어갑니다.",
  },
  {
    title: "건물·시설 관리",
    description: "지출과 시설, 하자·수선 기록을 건물 단위로 모아 봅니다.",
  },
  {
    title: "지출 관리",
    description: "고정지출과 월별 납부 내역으로 나가는 돈을 관리합니다.",
  },
];

const num = (i: number) => String(i + 1).padStart(2, "0");

/**
 * CSS 전용 기기 프레임.
 * 화면 영역이 비율을 소유하므로 이미지가 늦게 와도 높이가 변하지 않는다(CLS 0).
 */
function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[2.25rem] bg-[#1b1c21] p-[6px] shadow-[0_22px_60px_-26px_rgba(0,0,0,0.85)] ring-1 ring-white/10 ${className}`}
    >
      {/* 측면 버튼 — 기기처럼 보이게 하는 최소한의 힌트. 화면 위를 덮지 않는다. */}
      <span aria-hidden className="absolute right-[-3px] top-[19%] h-9 w-[3px] rounded-r-full bg-[#34363d]" />
      <span aria-hidden className="absolute right-[-3px] top-[32%] h-14 w-[3px] rounded-r-full bg-[#34363d]" />
      <div
        className="relative overflow-hidden rounded-[1.85rem] bg-black"
        style={{ aspectRatio: SCREEN_RATIO }}
      >
        {children}
      </div>
    </div>
  );
}

/** 프레임 안에 원본 비율 그대로 들어가는 스크린샷 한 장. 테두리·라운드는 프레임이 소유한다. */
function Shot({
  src,
  alt,
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  // 박스 비율 = 원본 비율이라 contain 으로도 여백이 생기지 않는다.
  return <Image src={src} alt={alt} fill priority={priority} className="object-contain" sizes={sizes} />;
}

export default function ProgramScreenStoryPrototype({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // 읽기 중심(뷰포트 가운데 10% 띠)에 들어온 항목을 활성으로 삼는다.
    // rootMargin 으로 띠를 좁혀 두면 동시에 여러 개가 잡히지 않아 튐이 없다.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = stepRefs.current.indexOf(e.target as HTMLLIElement);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    const nodes = stepRefs.current.filter(Boolean) as HTMLLIElement[];
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [images.length]);

  if (images.length === 0) return null;

  const stepOf = (i: number) => STEPS[i] ?? { title: `화면 ${num(i)}`, description: "" };

  return (
    <div className="md:grid md:grid-cols-[42fr_58fr] md:gap-12">
      {/* ── 왼쪽: 설명 목록 (모바일에서는 각 항목 아래에 스크린샷을 끼워 넣는다) ── */}
      <ol className="space-y-16 md:space-y-0">
        {images.map((src, i) => {
          const step = stepOf(i);
          const on = i === active;
          return (
            <li
              key={src}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className="md:flex md:min-h-[34vh] md:flex-col md:justify-center"
            >
              {/* 흐려지는 쪽은 데스크톱만 — 모바일은 목록 전체가 한 번에 보이므로 읽기를 방해하지 않는다. */}
              <div className={`${EASE} ${REDUCED} ${on ? "md:translate-y-0" : "md:translate-y-[6px] md:motion-reduce:translate-y-0"}`}>
                <div className="flex items-baseline gap-3">
                  <span
                    className={`font-mono text-sm tabular-nums ${EASE} ${REDUCED} ${
                      on
                        ? "text-[var(--accent)]"
                        : "text-[var(--muted)] md:text-foreground md:opacity-[0.35]"
                    }`}
                  >
                    {num(i)}
                  </span>
                  <h3
                    className={`break-keep text-xl font-semibold text-foreground sm:text-2xl ${EASE} ${REDUCED} ${
                      on ? "" : "md:opacity-[0.32]"
                    }`}
                  >
                    {step.title}
                  </h3>
                </div>
                {step.description && (
                  <p
                    className={`mt-2 max-w-md break-keep leading-relaxed text-[var(--muted)] ${EASE} ${REDUCED} ${
                      on ? "" : "md:text-foreground md:opacity-[0.30]"
                    }`}
                  >
                    {step.description}
                  </p>
                )}
              </div>

              {/* 모바일: sticky 없이 설명 바로 아래에 실제 화면 */}
              <div className="mx-auto mt-6 w-[79vw] md:hidden">
                <PhoneFrame>
                  <Shot
                    src={src}
                    alt={`${alt} ${step.title} 화면`}
                    priority={i === 0}
                    sizes="79vw"
                  />
                </PhoneFrame>
              </div>
            </li>
          );
        })}
      </ol>

      {/* ── 오른쪽: 데스크톱 전용 sticky 기기 (스크롤에 따라 화면만 교체) ── */}
      <div className="hidden md:block">
        <div className="sticky top-24">
          <PhoneFrame className="mx-auto w-full max-w-[344px]">
            {images.map((src, i) => {
              const on = i === active;
              return (
                <div
                  key={src}
                  aria-hidden={!on}
                  className={`absolute inset-0 ${
                    on
                      ? `${SCREEN_IN} translate-y-0 scale-100 opacity-100`
                      : `${SCREEN_OUT} pointer-events-none translate-y-[6px] scale-[0.985] opacity-0`
                  }`}
                >
                  <Shot
                    src={src}
                    alt={`${alt} ${stepOf(i).title} 화면`}
                    priority={i === 0}
                    sizes="344px"
                  />
                </div>
              );
            })}
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ⚠ 디자인 프로토타입 (코지 확인용) — 승인 전까지 공통 컴포넌트로 승격하지 않는다.
// 적용 범위: 코지임대 상세페이지 한 곳. 다른 프로그램은 기존 ScreenshotGallery 를 그대로 쓴다.
//
// 이 단계에서 하지 않는 것: 관리자 등록 · landing_content 확장 · DB 저장 구조.
// 그래서 설명 문구는 **여기 코드 상수**로만 둔다. 운영 데이터는 건드리지 않는다.
//
// 이미지는 실제 앱 캡처(1080×2111 세로)다. 원본 비율 그대로 — crop 0 · 검은 여백 0.
//
// ── 3차 구조 (데스크톱) ─────────────────────────────────────────────
// 좌우 모두 화면 중앙에 고정하고, 스크롤은 "보이지 않는 trigger" 가 담당한다.
//
//   container (relative · 높이 = n*STEP_VH + 무대 1장)
//     ├─ stage    : sticky. 화면 중앙에 고정. 활성 1개의 카피 + 폰만 보여준다.
//     └─ triggers : absolute. 눈에 안 보이지만 스크롤 길이를 만들고 active 를 바꾼다.
//
// 2차까지는 설명 6개가 실제 문서 흐름에 세로로 깔려 있었다. 그래서 스크롤하면 글자 자체가
// 위로 밀려 올라갔고, 거기에 전환 애니메이션이 겹쳐 보였다. 그게 "삐그덕거림" 의 핵심이다.
// 이제 보이는 글자는 스크롤과 함께 움직이지 않는다 — 제자리에서 내용만 바뀐다.
//
// 모바일은 바꾸지 않는다 — 번호·제목·설명·폰 캡처가 순차로 반복되는 기존 구조 그대로.

const SCREEN_RATIO = "1080 / 2111";
/** 세로 캡처 비율. 폰 크기를 뷰포트 높이에 맞춰 줄일 때 쓴다. */
const SCREEN_ASPECT = 2111 / 1080;

/** 사이트 헤더가 sticky top-0 으로 65px 를 점유한다. 무대는 그 아래를 기준으로 가운데를 잡는다. */
const HEADER_PX = 65;
/** step 하나가 차지하는 스크롤 길이. 전부 같은 값이라 체류 시간이 고르다. */
const STEP_VH = 45;
const FRAME_MAX_W = 344;
const BEZEL = 6;

/** 무대 높이 = 헤더를 제외한 실제 가시 영역. */
const STAGE_H = `calc(100vh - ${HEADER_PX}px)`;
/**
 * 폰 너비. 기본 344px 이되, 세로가 짧은 화면에서는 무대 안에 들어가도록 줄인다.
 * frameH = (frameW - 2*BEZEL) * SCREEN_ASPECT + 2*BEZEL 를 역산한 값이다.
 */
const FRAME_W = `min(${FRAME_MAX_W}px, calc((100vh - ${
  HEADER_PX + 48 + BEZEL * 2
}px) / ${SCREEN_ASPECT.toFixed(5)} + ${BEZEL * 2}px))`;

// 전환 길이는 레일과 폰이 똑같이 500ms 를 쓴다 — "같이 넘어간다" 는 느낌을 만들기 위해서다.

/**
 * 모션 최소화 환경 — 폰 화면용.
 * 여기서 scale/translate 는 순전히 장식이라 원위치시키고 거의 즉시 끝낸다.
 */
const REDUCED_DECOR =
  "motion-reduce:scale-100 motion-reduce:translate-y-0 motion-reduce:duration-[1ms] motion-reduce:delay-0";
/**
 * 모션 최소화 환경 — 레일용.
 * 레일의 translate 는 장식이 아니라 **배치**다(상·중·하 위치 그 자체).
 * 원위치시키면 세 항목이 가운데 겹쳐 버리므로, 위치는 두고 전환만 즉시 끝낸다.
 */
const REDUCED_MOTION_ONLY = "motion-reduce:duration-[1ms] motion-reduce:delay-0";

// 화면은 불투명하다. 두 장을 동시에 반투명하게 두면 교체 순간 프레임이 어두워지므로,
// 들어오는 화면을 위에 쌓아 올리고 나가는 화면은 그게 덮인 뒤에 거둔다.
// 들어오는 쪽 길이는 레일과 같은 DUR — 카피가 가운데로 들어오는 것과 새 화면이
// 자리잡는 것이 함께 끝난다.
const SCREEN_IN = `z-10 transition-[opacity,translate,scale] duration-[500ms] ease-out ${REDUCED_DECOR}`;
const SCREEN_OUT = `transition-[opacity,translate,scale] duration-[200ms] delay-[375ms] ease-out ${REDUCED_DECOR}`;

// ── 좌측 3단 레일 ─────────────────────────────────────────────────
// 6개 카피를 전부 겹쳐 두고 i - active 로 슬롯만 바꾼다. DOM 을 유지해야
// "중앙 → 상단", "하단 → 중앙" 이 실제 이동으로 보인다(교체 렌더면 그냥 깜빡인다).
//
// 슬롯 간격은 레일 컨테이너(= 무대) 높이의 26.5% 다. 백분율 translate 는 자기 높이를
// 기준으로 하고 컨테이너가 무대 전체 높이라서, 각 슬롯의 세로 위치가 이렇게 된다:
//   상단 23.5% · 중앙 50% · 하단 76.5%   (지시 범위 22~25 / 50 / 75~78 안)
// 중앙 슬롯은 translate 0 이므로 폰 중심과 자동으로 같은 높이에 선다.
const RAIL = `transition-[opacity,translate,scale,color] duration-[500ms] ease-out ${REDUCED_MOTION_ONLY}`;
/** 색만 따로 전환하는 자식용(색 전환은 부모에서 상속되지 않는다). */
const RAIL_COLOR = `transition-[color] duration-[500ms] ease-out ${REDUCED_MOTION_ONLY}`;

/**
 * i - active 를 5단계 슬롯으로 환원한다.
 * 바깥(far)은 한 칸 더 나가 있고 투명하다 — 레일이 돌 때 거기서 들어오고 거기로 빠진다.
 */
function slot(rel: number): string {
  if (rel === 0) return "translate-y-0 scale-100 opacity-100";
  if (rel === -1) return "-translate-y-[26.5%] scale-[0.97] opacity-[0.32]";
  if (rel === 1) return "translate-y-[26.5%] scale-[0.97] opacity-[0.32]";
  if (rel < -1) return "-translate-y-[53%] scale-[0.97] opacity-0";
  return "translate-y-[53%] scale-[0.97] opacity-0";
}

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
const stepOf = (i: number) => STEPS[i] ?? { title: `화면 ${num(i)}`, description: "" };

/**
 * CSS 전용 기기 프레임.
 * 화면 영역이 비율을 소유하므로 이미지가 늦게 와도 높이가 변하지 않는다(CLS 0).
 */
function PhoneFrame({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative rounded-[2.25rem] bg-[#1b1c21] p-[6px] shadow-[0_22px_60px_-26px_rgba(0,0,0,0.85)] ring-1 ring-white/10 ${className}`}
      style={style}
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

/**
 * 프레임 안에 원본 비율 그대로 들어가는 스크린샷 한 장. 테두리·라운드는 프레임이 소유한다.
 *
 * priority 는 쓰지 않는다. 이 섹션은 히어로·혜택·중간 CTA 아래라 LCP 후보가 아니고,
 * 같은 이미지를 모바일/데스크톱 두 벌로 렌더하는데 `sizes` 가 서로 달라서
 * preload 가 두 개 생긴다(한쪽은 항상 display:none 이라 반드시 버려진다).
 */
function Shot({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  // 박스 비율 = 원본 비율이라 contain 으로도 여백이 생기지 않는다.
  return <Image src={src} alt={alt} fill className="object-contain" sizes={sizes} />;
}

export default function ProgramScreenStoryPrototype({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  /** 데스크톱: 보이지 않는 스크롤 trigger. */
  const triggerRefs = useRef<(HTMLLIElement | null)[]>([]);
  /** 모바일: 기존 순차 목록 항목. */
  const mobileRefs = useRef<(HTMLLIElement | null)[]>([]);
  /** 무대 — 중앙선의 기준점. */
  const stageRef = useRef<HTMLDivElement | null>(null);
  /** 섹션이 화면 근처인지 판단할 대상(각 breakpoint 마다 하나씩만 살아 있다). */
  const deskRef = useRef<HTMLDivElement | null>(null);
  const mobListRef = useRef<HTMLOListElement | null>(null);

  const count = images.length;

  useEffect(() => {
    if (count === 0) return;

    // active 를 "어떤 entry 가 보고됐나" 로 정하지 않는다. 호출될 때마다 실제 좌표를 다시 읽어서
    // 중앙선을 품은 항목 하나를 결정적으로 고른다. 경로·방향·점프와 무관하게 같은 위치면 같은 답이다.
    // (2차까지는 경계에서 인접 두 항목이 동시에 intersecting 이라 entries 순서에 결과가 좌우됐다.)
    const pick = () => {
      const s = stageRef.current?.getBoundingClientRect();
      // 중앙선 = 무대의 세로 중앙. 무대는 고정 전·고정 중·고정 해제 어느 구간에서도
      // trigger 들과 같은 컨테이너 안에서 움직이므로, 그 중심이 곧 올바른 측정점이다.
      // 모바일에서는 무대가 display:none(크기 0) 이라 뷰포트 중앙을 쓴다.
      const mid = s && s.height > 0 ? s.top + s.height / 2 : window.innerHeight / 2;

      let best = 0;
      let bestOutside = Infinity;
      let bestCenter = Infinity;

      for (let i = 0; i < count; i++) {
        for (const el of [triggerRefs.current[i], mobileRefs.current[i]]) {
          if (!el) continue;
          const r = el.getBoundingClientRect();
          // 반대 breakpoint 쪽 DOM 은 display:none 이라 0 크기다. 건너뛴다.
          if (r.width === 0 && r.height === 0) continue;

          const outside = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0;
          const center = Math.abs((r.top + r.bottom) / 2 - mid);
          // 1순위: 중앙선을 품고 있는가. 2순위: 중심이 중앙선에 얼마나 가까운가.
          if (outside < bestOutside || (outside === bestOutside && center < bestCenter)) {
            bestOutside = outside;
            bestCenter = center;
            best = i;
          }
        }
      }
      setActive(best);
    };

    // trigger 하나하나를 관찰해 "교차가 바뀔 때만" 계산하는 방법은 쓰지 않는다.
    // 섹션을 통째로 건너뛰며 점프하면(맨 위 → 맨 아래) 모든 trigger 가 false → false 라
    // 콜백이 한 번도 오지 않고, 활성 인덱스가 옛날 값에 멈춘 채로 남는다.
    // 대신 "섹션이 화면 근처인가" 만 관찰하고, 근처인 동안에는 스크롤을 직접 따라간다.
    const nearby = new Set<Element>();
    const vis = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) nearby.add(e.target);
          else nearby.delete(e.target);
        }
        // 들어오는 순간 한 번 바로잡는다 — 점프로 건너뛰어 왔더라도 화면에 닿기 전에 맞춰진다.
        if (nearby.size > 0) pick();
      },
      // 한 화면 앞뒤로 넉넉히 켠다. 보이기 전에 이미 올바른 값이 들어가 있도록.
      { rootMargin: "100% 0px 100% 0px", threshold: 0 }
    );
    // breakpoint 마다 둘 중 하나만 실제로 보인다(반대쪽은 display:none 이라 교차하지 않는다).
    for (const el of [deskRef.current, mobListRef.current]) {
      if (el) vis.observe(el);
    }

    // 스크롤 이벤트는 브라우저가 이미 프레임 단위로 합쳐서 보낸다. 따로 rAF 로 묶지 않는다 —
    // 읽기만 하는 좌표 조회 몇 번이라 비용이 미미하고, 한 단계를 들어내면 그만큼 어긋날 데가 없다.
    // setActive 는 값이 같으면 React 가 재렌더를 건너뛰므로 실제로 다시 그리는 건 바뀌는 순간뿐이다.
    const onScroll = () => {
      if (nearby.size > 0) pick();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", pick);
    pick(); // 새로고침·복원된 스크롤 위치에서도 처음부터 맞게 시작한다.

    return () => {
      vis.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", pick);
    };
  }, [count]);

  if (count === 0) return null;

  return (
    <>
      {/* ══ 모바일: 기존 순차 구조 그대로 (번호·제목·설명·폰 캡처 반복) ══ */}
      <ol ref={mobListRef} className="space-y-16 md:hidden">
        {images.map((src, i) => {
          const step = stepOf(i);
          const on = i === active;
          return (
            <li
              key={src}
              ref={(el) => {
                mobileRefs.current[i] = el;
              }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className={`font-mono text-sm tabular-nums transition-colors duration-[400ms] ease-out motion-reduce:duration-[1ms] ${
                    on ? "text-[var(--accent)]" : "text-[var(--muted)]"
                  }`}
                >
                  {num(i)}
                </span>
                <h3 className="break-keep text-xl font-semibold text-foreground sm:text-2xl">
                  {step.title}
                </h3>
              </div>
              {step.description && (
                <p className="mt-2 max-w-md break-keep leading-relaxed text-[var(--muted)]">
                  {step.description}
                </p>
              )}
              <div className="mx-auto mt-6 w-[79vw]">
                <PhoneFrame>
                  <Shot src={src} alt={`${alt} ${step.title} 화면`} sizes="79vw" />
                </PhoneFrame>
              </div>
            </li>
          );
        })}
      </ol>

      {/* ══ 데스크톱: 좌우 모두 중앙 고정. 스크롤은 보이지 않는 trigger 가 담당 ══ */}
      <div
        ref={deskRef}
        className="relative hidden md:block"
        style={{ height: `calc(${count * STEP_VH}vh + 100vh - ${HEADER_PX}px)` }}
      >
        {/* 무대 — 화면 중앙에 고정. 보여주는 건 활성 1개뿐이다. */}
        <div
          ref={stageRef}
          aria-hidden
          className="sticky flex items-center"
          style={{ top: `${HEADER_PX}px`, height: STAGE_H }}
        >
          {/* h-full 이라 좌측 레일 컨테이너가 무대 전체 높이를 갖는다.
              슬롯 백분율(23.5/50/76.5%)이 곧 무대 기준 위치가 되고, 우측 폰은 그 안에서 가운데 선다. */}
          <div className="grid h-full w-full grid-cols-[42fr_58fr] gap-12">
            {/* 좌: 상·중·하 3단 레일. 이전/현재/다음만 보이고 나머지는 바깥에서 대기한다.
                overflow-hidden 은 레일을 무대 높이로 잘라낸다 — 빠져나가는 항목이 아직
                옅게 남은 채로 무대 위(반투명 헤더 뒤)까지 올라가 비치는 걸 막는다. */}
            <div className="relative overflow-hidden">
              {images.map((src, i) => {
                const step = stepOf(i);
                const rel = i - active;
                const center = rel === 0;
                return (
                  <div
                    key={src}
                    className={`absolute inset-0 flex flex-col justify-center ${RAIL} ${slot(rel)} ${
                      center ? "" : "pointer-events-none"
                    }`}
                  >
                    <span
                      className={`font-mono text-sm tabular-nums ${RAIL_COLOR} ${
                        center ? "text-[var(--accent)]" : "text-foreground"
                      }`}
                    >
                      {num(i)}
                    </span>
                    <h3 className="mt-3 break-keep text-2xl font-semibold text-foreground lg:text-3xl">
                      {step.title}
                    </h3>
                    {step.description && (
                      // 위·아래 항목은 블록 opacity 가 0.32 라서, muted 색을 그대로 쓰면
                      // 글자가 배경에 묻힌다. 흐려지는 쪽만 밝은 색을 밑에 깔아 읽을 수 있게 남긴다.
                      <p
                        className={`mt-3 max-w-md break-keep leading-relaxed ${RAIL_COLOR} ${
                          center ? "text-[var(--muted)]" : "text-foreground"
                        }`}
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 우: 폰. 세로가 짧은 화면에서는 무대 안에 들어가도록 너비가 줄어든다. */}
            <div className="flex items-center justify-center">
              <PhoneFrame style={{ width: FRAME_W }}>
                {images.map((src, i) => {
                  const on = i === active;
                  return (
                    <div
                      key={src}
                      className={`absolute inset-0 ${
                        on
                          ? `${SCREEN_IN} translate-y-0 scale-100 opacity-100`
                          : `${SCREEN_OUT} pointer-events-none translate-y-[6px] scale-[0.985] opacity-0`
                      }`}
                    >
                      <Shot
                        src={src}
                        alt={`${alt} ${stepOf(i).title} 화면`}
                        sizes={`${FRAME_MAX_W}px`}
                      />
                    </div>
                  );
                })}
              </PhoneFrame>
            </div>
          </div>
        </div>

        {/* 스크롤 trigger — 눈에는 안 보이지만 화면낭독기에는 6개 설명이 순서대로 남는다.
            무대를 aria-hidden 으로 둔 이유가 이것이다(같은 내용을 두 번 읽지 않게). */}
        <ol
          className="pointer-events-none absolute inset-x-0"
          style={{ top: `calc((100vh - ${HEADER_PX}px) / 2)`, height: `${count * STEP_VH}vh` }}
        >
          {images.map((src, i) => {
            const step = stepOf(i);
            return (
              <li
                key={src}
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                style={{ height: `${STEP_VH}vh` }}
              >
                <div className="sr-only">
                  <h3>{`${num(i)}. ${step.title}`}</h3>
                  {step.description && <p>{step.description}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

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
// 원본 비율 그대로 보여준다 — crop 0 · 검은 여백 0 · 가짜 bezel 0.

const SCREEN_RATIO = "1080 / 2111";

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

/** 원본 비율 그대로 그리는 스크린샷 한 장. */
function Shot({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      // 박스 비율 = 원본 비율이라 contain 으로도 여백이 생기지 않는다.
      className={`rounded-[1.75rem] border border-[--border] object-contain shadow-[0_18px_50px_-24px_rgba(0,0,0,0.8)] ${className}`}
      sizes="(max-width: 768px) 80vw, 320px"
    />
  );
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
      <ol className="space-y-14 md:space-y-0">
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
              <div className="flex items-baseline gap-3">
                <span
                  className={`font-mono text-sm tabular-nums transition-colors duration-300 ${
                    on ? "text-[--accent]" : "text-[--muted-2]"
                  }`}
                >
                  {num(i)}
                </span>
                <h3
                  className={`break-keep text-xl font-semibold transition-colors duration-300 sm:text-2xl ${
                    on ? "text-foreground" : "text-[--muted] md:opacity-70"
                  }`}
                >
                  {step.title}
                </h3>
              </div>
              {step.description && (
                <p
                  className={`mt-2 max-w-md break-keep leading-relaxed transition-colors duration-300 ${
                    on ? "text-[--muted]" : "text-[--muted-2] md:opacity-70"
                  }`}
                >
                  {step.description}
                </p>
              )}

              {/* 모바일: sticky 없이 설명 바로 아래에 실제 화면 */}
              <div
                className="relative mx-auto mt-6 w-[88%] md:hidden"
                style={{ aspectRatio: SCREEN_RATIO }}
              >
                <Shot src={src} alt={`${alt} ${step.title} 화면`} priority={i === 0} />
              </div>
            </li>
          );
        })}
      </ol>

      {/* ── 오른쪽: 데스크톱 전용 sticky 스크린샷 (스크롤에 따라 교체) ── */}
      <div className="hidden md:block">
        <div className="sticky top-24">
          <div className="relative mx-auto w-full max-w-[320px]" style={{ aspectRatio: SCREEN_RATIO }}>
            {images.map((src, i) => (
              <div
                key={src}
                aria-hidden={i !== active}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              >
                <Shot src={src} alt={`${alt} ${stepOf(i).title} 화면`} priority={i === 0} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

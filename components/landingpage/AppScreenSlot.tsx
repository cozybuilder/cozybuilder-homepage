import Image from "next/image";

// 실앱 화면 교체 슬롯 (공용). 가짜 UI 를 만들지 않는다 — 자산이 없으면 중립 placeholder 만 표시.
// 자산 추가 시 lib/landingpage/config.ts 의 images.appScreens 경로를 채운다.
// (설계: docs/landing/LANDINGPAGE_PLATFORM.md §4)
export default function AppScreenSlot({
  src,
  alt,
  label = "앱 화면 준비 중",
  className = "",
  width = 640,
  height = 1351,
  sizes,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  label?: string;
  className?: string;
  /** CLS 방지 — 원본 픽셀 크기. 컨테이너 aspect-ratio 와 일치시켜 잘림 없이 채운다. */
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-cover object-top ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${alt} (준비 중)`}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[--surface-2] ${className}`}
    >
      <span className="text-2xl" aria-hidden>
        🏢
      </span>
      <span className="px-3 text-center text-xs leading-relaxed text-[--muted-2]">{label}</span>
    </div>
  );
}

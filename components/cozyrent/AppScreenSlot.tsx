import Image from "next/image";

// 실앱 화면 교체 슬롯. 가짜 UI 를 만들지 않는다 — 자산이 없으면 중립 placeholder 만 표시.
// 자산 추가 시 app/cozyrent/page.tsx 의 APP_SCREENS 경로에 파일을 넣고 src 를 채운다.
// (설계: docs/landing/COZYRENT_PRELAUNCH.md §9)
export default function AppScreenSlot({
  src,
  alt,
  label = "앱 화면 준비 중",
  className = "",
}: {
  src?: string | null;
  alt: string;
  label?: string;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={640}
        height={1386}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${alt} (준비 중)`}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[--surface-2] ${className}`}
    >
      <span className="text-3xl" aria-hidden>
        🏢
      </span>
      <span className="px-4 text-center text-sm text-[--muted-2]">{label}</span>
    </div>
  );
}

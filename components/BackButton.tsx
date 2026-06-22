import Link from "next/link";

/** 전역 통일 뒤로가기 — 원형 아이콘 버튼(lucide ArrowLeft, 텍스트 없음). */
export default function BackButton({
  href,
  label = "뒤로",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition-colors hover:border-white/20 hover:bg-white/10"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}

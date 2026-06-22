/** 내용 준비 중 placeholder 블록. */
export function Placeholder({ label = "내용 준비 중" }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[--border-strong] bg-[--surface-2]/40 p-6 text-sm text-[--muted-2]">
      {label}
    </div>
  );
}

/** 그라데이션 이미지 자리표시자(실제 에셋 없을 때). */
export function ImagePlaceholder({
  ratio = "aspect-video",
  label,
}: {
  ratio?: string;
  label?: string;
}) {
  return (
    <div
      className={`${ratio} flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[--border]`}
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(124,140,255,0.18), rgba(176,140,255,0.10) 60%, rgba(12,13,17,0.4))",
      }}
    >
      {label && <span className="text-sm text-[--muted]">{label}</span>}
    </div>
  );
}

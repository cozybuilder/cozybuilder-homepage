/** Standard page intro block used across inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h1 className="heading-gradient text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-5 text-lg text-[--muted]">{description}</p>
      )}
    </div>
  );
}

/** Placeholder block to mark content yet to be filled in. */
export function Placeholder({ label = "내용 준비 중" }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-[--border-strong] bg-[--surface-2]/40 p-6 text-sm text-[--muted-2]">
      {label}
    </div>
  );
}

/** Decorative gradient image stand-in (no real assets yet). */
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

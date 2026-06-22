/** 페이지 제목 영역 (중앙 정렬 인트로). */
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
      {description && <p className="mt-5 text-lg text-[--muted]">{description}</p>}
    </div>
  );
}

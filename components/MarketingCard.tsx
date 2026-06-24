import Image from "next/image";
import { type MarketingItem } from "@/lib/content";
import { ImagePlaceholder } from "@/components/ui";

// SNS 채널 key → 표시명(카드 우측)
export const CHANNEL_LABELS: Record<string, string> = {
  instagram: "인스타그램",
  youtube: "유튜브",
  tiktok: "틱톡",
  facebook: "페이스북",
  threads: "쓰레드",
};

/** 외부 링크 래퍼: external_url 있으면 새 탭 링크, 없으면 준비 중(비활성). */
function LinkCard({
  item,
  className,
  children,
}: {
  item: MarketingItem;
  className: string;
  children: React.ReactNode;
}) {
  if (item.externalUrl) {
    return (
      <a
        href={item.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} card-hover`}
      >
        {children}
      </a>
    );
  }
  return <div className={`${className} cursor-default`}>{children}</div>;
}

/** SNS 세로형 채널 카드 (이미지 + 이름 + 우측 채널명 + 설명 + 바로가기). */
export function MarketingSnsCard({ item }: { item: MarketingItem }) {
  const channelLabel = item.channelType
    ? CHANNEL_LABELS[item.channelType] ?? ""
    : "";
  return (
    <LinkCard item={item} className="card flex flex-col">
      <div className="mb-4">
        {item.image ? (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[--border]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 240px"
            />
          </div>
        ) : (
          <ImagePlaceholder ratio="aspect-[3/4]" label={item.name} />
        )}
      </div>
      {/* 한 줄: 제목(왼쪽) + 채널명(우측 정렬) */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-base font-semibold">{item.name}</h3>
        {channelLabel && (
          <span className="shrink-0 text-xs text-[--muted-2]">
            {channelLabel}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-1 text-sm text-[--muted]">{item.description}</p>
      )}
      <span className="mt-3 text-sm text-[--accent]">
        {item.externalUrl ? "바로가기 →" : "준비 중"}
      </span>
    </LinkCard>
  );
}

/** Blog 일반 카드 (가로형 이미지 + 이름 + 설명 + 바로가기). */
export function MarketingBlogCard({ item }: { item: MarketingItem }) {
  return (
    <LinkCard item={item} className="card block">
      {item.image ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[--border]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 576px"
          />
        </div>
      ) : (
        <ImagePlaceholder ratio="aspect-video" label={item.name} />
      )}
      <h3 className="mt-5 text-lg font-semibold">{item.name}</h3>
      {item.description && (
        <p className="mt-2 text-sm text-[--muted]">{item.description}</p>
      )}
      <span className="mt-4 inline-block text-sm text-[--accent]">
        {item.externalUrl ? "바로가기 →" : "준비 중"}
      </span>
    </LinkCard>
  );
}

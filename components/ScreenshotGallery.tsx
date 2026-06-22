"use client";

import Image from "next/image";
import { useState } from "react";

/** 큰 preview + 썸네일 선택. 첫 진입 시 첫 번째 자동 선택. */
export default function ScreenshotGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[--border] bg-black">
        <Image
          src={images[active]}
          alt={`${alt} 스크린샷 ${active + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`스크린샷 ${i + 1} 보기`}
              className={`relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                i === active
                  ? "border-[--accent] ring-1 ring-[--accent]"
                  : "border-[--border] hover:border-[--border-strong]"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

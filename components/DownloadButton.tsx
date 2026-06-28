"use client";

import { trackClientEvent } from "@/lib/analytics-client";

// 스토어/다운로드 CTA — 클릭 시 download 이벤트를 계측한 뒤 정상 이동.
// 계측은 논블로킹(sendBeacon)이라 링크 이동을 막지 않는다.
const STORE_BTN_BASE =
  "flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition sm:w-auto sm:min-w-[180px]";

export default function DownloadButton({
  label,
  url,
  appKey,
  platform = "mobile",
  store,
}: {
  label: string;
  url: string;
  appKey: string;
  platform?: "web" | "mobile" | "desktop";
  store?: string; // "play" | "appstore" | "direct" 등
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackClientEvent({
          appKey,
          platform,
          eventName: "download",
          metadata: store ? { store } : undefined,
        })
      }
      className={`${STORE_BTN_BASE} bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:from-blue-400 hover:to-indigo-400`}
    >
      {label}
    </a>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic Hero video for the home page.
 * - Autoplays once (muted, no loop), freezes on last frame.
 * - Sound toggle (bottom-right) and Replay button (center, only when ended).
 * - Falls back to a gradient placeholder when the video is missing / fails to load;
 *   in that state the Sound/Replay buttons are hidden.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);

  // React's `muted` JSX prop doesn't reliably update the DOM property,
  // so mirror the initial state onto the actual <video> element on mount.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted) {
      video.volume = 1;
      void video.play().catch(() => {});
    }
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setEnded(false);
    void video.play().catch(() => {});
  };

  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-[--border]">
      {!failed ? (
        <video
          ref={videoRef}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted={muted}
          playsInline
          preload="metadata"
          onPlay={() => setEnded(false)}
          onEnded={() => setEnded(true)}
          onError={() => setFailed(true)}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-1 text-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(124,140,255,0.18), rgba(176,140,255,0.10) 60%, rgba(12,13,17,0.4))",
          }}
        >
          <span className="text-sm font-medium text-[--muted]">영상 없음</span>
          <span className="text-xs text-[--muted-2]">public/videos/hero.mp4 파일을 추가하세요</span>
        </div>
      )}

      {/* Cinematic dark gradient overlay — must not capture clicks */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(5,5,7,0.25) 0%, rgba(5,5,7,0) 35%, rgba(5,5,7,0.55) 100%)",
        }}
      />

      {/* Sound toggle — bottom right (only when a real video is present) */}
      {!failed && (
        <button
          type="button"
          onClick={handleToggleSound}
          aria-label={muted ? "음소거 해제" : "음소거"}
          className="absolute bottom-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
        >
          {muted ? "🔇 Sound Off" : "🔊 Sound On"}
        </button>
      )}

      {/* Replay — center, only when ended */}
      {!failed && ended && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <button
            type="button"
            onClick={handleReplay}
            aria-label="다시 재생"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <span aria-hidden>↻</span> Replay
          </button>
        </div>
      )}
    </div>
  );
}

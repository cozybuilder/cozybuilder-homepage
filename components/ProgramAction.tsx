"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "anon" | "unsubscribed" | "subscribed";

/**
 * web 타입 프로그램의 하단 액션.
 * 비로그인 → 로그인 / 로그인+미구독 → 구독하기 / 구독 중 → 실행하기 + 구독취소.
 * 구독 상태는 Supabase program_subscriptions (user_id + program_slug) 에 저장.
 * (결제 없음 — 무료 flag. 추후 Billing 연결 시 subscribed 갱신만 교체하면 됨)
 */
export default function ProgramAction({
  slug,
  appUrl,
}: {
  slug: string;
  appUrl?: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setStatus("anon");
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("program_subscriptions")
        .select("subscribed")
        .eq("user_id", user.id)
        .eq("program_slug", slug)
        .maybeSingle();
      if (!active) return;
      setStatus(data?.subscribed ? "subscribed" : "unsubscribed");
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const setSubscription = async (subscribed: boolean) => {
    if (!userId) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("program_subscriptions").upsert(
      {
        user_id: userId,
        program_slug: slug,
        subscribed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,program_slug" }
    );
    setBusy(false);
    if (!error) setStatus(subscribed ? "subscribed" : "unsubscribed");
  };

  if (status === "loading") {
    return (
      <div className="btn btn-ghost min-w-[140px] opacity-60">불러오는 중…</div>
    );
  }

  if (status === "anon") {
    return (
      <Link
        href={`/login?next=/programs/${slug}`}
        className="btn btn-accent min-w-[140px]"
      >
        로그인
      </Link>
    );
  }

  if (status === "unsubscribed") {
    return (
      <button
        type="button"
        onClick={() => setSubscription(true)}
        disabled={busy}
        className="btn btn-accent min-w-[140px] disabled:opacity-60"
      >
        {busy ? "처리 중…" : "무료 구독"}
      </button>
    );
  }

  // subscribed
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {appUrl ? (
        <a href={appUrl} className="btn btn-accent min-w-[140px]">
          실행하기
        </a>
      ) : (
        <span className="btn btn-accent min-w-[140px] cursor-not-allowed opacity-60">
          실행하기 (Coming Soon)
        </span>
      )}
      <button
        type="button"
        onClick={() => setSubscription(false)}
        disabled={busy}
        className="btn btn-ghost min-w-[140px] disabled:opacity-60"
      >
        {busy ? "처리 중…" : "구독 해제"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 1차: 비밀번호 재설정 메일 발송까지만 구현.
 * 실제 새 비밀번호 변경 화면(/reset-password)은 다음 단계에서.
 */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-2xl">📩</p>
        <p className="text-sm text-[--muted]">
          비밀번호 재설정 메일을 보냈습니다.
          <br />
          이메일함을 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="label" htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-accent w-full disabled:opacity-60"
      >
        {loading ? "보내는 중…" : "재설정 메일 보내기"}
      </button>
    </form>
  );
}

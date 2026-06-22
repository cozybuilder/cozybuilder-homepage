"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormField, Input, Button } from "@/components/ui";

/**
 * 비밀번호 재설정 메일 링크로 진입한 사용자의 새 비밀번호 변경.
 * createClient()를 마운트 시점에 생성해, URL의 복구 토큰을 자동 처리한 세션으로
 * auth.updateUser({ password }) 를 호출한다.
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(
        "비밀번호 변경에 실패했습니다. 메일 링크가 만료되었을 수 있어요. 다시 시도해주세요."
      );
      setLoading(false);
      return;
    }

    // 변경 후 기존 세션 정리하고 재로그인 유도.
    await supabase.auth.signOut();
    setLoading(false);
    setDone(true);
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 2500);
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-2xl">✅</p>
        <p className="text-sm text-[--muted]">
          비밀번호가 변경되었습니다. 다시 로그인해주세요.
        </p>
        <a href="/login" className="btn btn-accent w-full">
          로그인으로 이동
        </a>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormField label="새 비밀번호" htmlFor="password">
        <Input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>
      <FormField label="새 비밀번호 확인" htmlFor="confirm">
        <Input
          id="confirm"
          type="password"
          required
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </FormField>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full disabled:opacity-60">
        {loading ? "변경 중…" : "비밀번호 변경"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormField, Input, Button } from "@/components/ui";

/**
 * Email/password sign-up via Supabase Auth.
 * Supabase Free 기본값은 이메일 인증(confirm)이 켜져 있어, 가입 후 확인 메일 안내를 표시한다.
 */
export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-2xl">📩</p>
        <p className="text-sm text-[--muted]">
          <span className="font-medium text-foreground">{email}</span> 로 확인
          메일을 보냈습니다.
          <br />
          메일의 링크를 눌러 가입을 완료한 뒤 로그인해 주세요.
        </p>
        <a href="/login" className="btn btn-accent w-full">
          로그인으로 이동
        </a>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormField label="이름" htmlFor="name">
        <Input
          id="name"
          type="text"
          required
          placeholder="홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>
      <FormField label="이메일" htmlFor="email">
        <Input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <FormField label="비밀번호" htmlFor="password">
        <Input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>
      <FormField label="비밀번호 확인" htmlFor="confirm">
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
        {loading ? "가입 중…" : "회원가입"}
      </Button>
    </form>
  );
}

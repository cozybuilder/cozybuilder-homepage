"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SocialButtons from "@/components/SocialButtons";
import { FormField, Input, Button } from "@/components/ui";

/**
 * Email/password login via Supabase Auth.
 * Social buttons remain UI-only (see SocialButtons).
 */
export default function LoginForm({
  initialError = null,
  nextPath = "/dashboard",
}: {
  initialError?: string | null;
  nextPath?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
        {/* Eyebrow */}
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-[--muted-2]">
          COZYBUILDER
        </p>

        {/* Title + description */}
        <h1 className="mt-4 text-center text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-[--muted]">
          다시 CozyBuilder Lab으로 돌아오신 것을 환영합니다.
        </p>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </FormField>

          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full disabled:opacity-60"
          >
            {loading ? "로그인 중…" : "Sign in"}
          </Button>
        </form>

        {/* Social sign-in */}
        <SocialButtons nextPath={nextPath} />

        {/* Aux links */}
        <div className="mt-6 space-y-2 text-center text-sm">
          <p>
            <Link
              href="/forgot-password"
              className="text-[--muted] transition-colors hover:text-foreground"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </p>
          <p className="text-[--muted]">
            아직 계정이 없나요?{" "}
            <Link
              href="/signup"
              className="text-foreground underline-offset-4 hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

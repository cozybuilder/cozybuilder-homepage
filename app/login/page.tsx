import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import { safeNextPath } from "@/lib/auth-redirect";

export const metadata: Metadata = { title: "로그인" };

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "Google 로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.",
  expired: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
  auth: "로그인이 필요한 페이지입니다.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const initialError = error ? ERROR_MESSAGES[error] ?? null : null;
  const nextPath = safeNextPath(next);

  return <LoginForm initialError={initialError} nextPath={nextPath} />;
}

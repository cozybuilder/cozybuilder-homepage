import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "비밀번호 찾기" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="비밀번호 찾기"
      subtitle="가입한 이메일로 재설정 링크를 보내드립니다."
      footer={
        <Link href="/login" className="text-[--accent] hover:underline">
          ← 로그인으로 돌아가기
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

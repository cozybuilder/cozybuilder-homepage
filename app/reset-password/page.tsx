import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = { title: "비밀번호 재설정" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="비밀번호 재설정"
      subtitle="새 비밀번호를 입력해주세요."
      footer={
        <Link href="/login" className="text-[--accent] hover:underline">
          ← 로그인으로 돌아가기
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}

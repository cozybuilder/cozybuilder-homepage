import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import SignupForm from "@/components/SignupForm";
import SocialButtons from "@/components/SocialButtons";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return (
    <AuthShell
      title="회원가입"
      subtitle="CozyBuilder와 함께 시작하세요."
      footer={
        <span>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[--accent] hover:underline">
            로그인
          </Link>
        </span>
      }
    >
      <SignupForm />

      {/* Social sign-up (UI only) */}
      <SocialButtons />
    </AuthShell>
  );
}

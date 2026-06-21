import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="Legal" title="개인정보처리방침" />

      <div className="mx-auto mt-12 max-w-3xl space-y-10 leading-relaxed text-[--muted]">
        <p className="text-sm text-[--muted-2]">최종 수정일: 2026년 6월 22일</p>

        <p>
          CozyBuilder(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 중요하게
          생각하며, 아래와 같이 개인정보를 수집·이용·보관합니다. 본 방침은 1차
          운영용 초안이며 서비스 변경에 따라 업데이트될 수 있습니다.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            1. 로그인 및 인증 방식
          </h2>
          <p className="mt-3">
            서비스는 이메일 로그인과 Google 로그인을 사용합니다. 휴대폰 번호는
            수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. 수집하는 개인정보 항목
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>이메일 주소</li>
            <li>이름 또는 표시 이름</li>
            <li>Google 프로필 이미지(Google 로그인 시)</li>
            <li>가입일</li>
            <li>로그인 방식(Email / Google)</li>
            <li>회원 식별자(Supabase user.id)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. 이용 목적</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>회원 식별</li>
            <li>로그인 및 세션 유지</li>
            <li>서비스 제공 및 운영</li>
            <li>문의 대응</li>
            <li>향후 결제/구독 관리(도입 시)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. 보관 기간</h2>
          <p className="mt-3">
            개인정보는 회원 탈퇴 또는 삭제 요청 시까지 보관하며, 요청 시 지체 없이
            파기합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. 제3자 제공 및 처리 위탁
          </h2>
          <p className="mt-3">
            서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만 서비스 운영을 위해 아래 도구를 사용합니다.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Supabase — 인증 및 데이터 저장</li>
            <li>Vercel — 배포 및 호스팅</li>
            <li>Google OAuth — Google 로그인</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. 이용자의 권리
          </h2>
          <p className="mt-3">
            이용자는 자신의 계정 이메일을 직접 관리해야 하며, 언제든지 개인정보의
            열람·수정·삭제를 요청할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. 문의</h2>
          <p className="mt-3">
            개인정보 관련 문의:{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-[--accent] hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

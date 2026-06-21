import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "이용약관" };

export default function TermsPage() {
  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="Legal" title="이용약관" />

      <div className="mx-auto mt-12 max-w-3xl space-y-10 leading-relaxed text-[--muted]">
        <p className="text-sm text-[--muted-2]">최종 수정일: 2026년 6월 22일</p>

        <p>
          본 약관은 CozyBuilder(이하 &ldquo;서비스&rdquo;) 이용에 관한 기본
          사항을 규정합니다. 1차 운영용 초안이며 서비스 변경에 따라 업데이트될 수
          있습니다.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-foreground">1. 목적</h2>
          <p className="mt-3">
            본 약관은 서비스가 제공하는 프로그램과 콘텐츠의 이용 조건 및 절차,
            이용자와 서비스의 권리·의무를 정하는 것을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. 서비스 내용</h2>
          <p className="mt-3">
            서비스는 AI 기반 프로그램, 콘텐츠, 관련 웹/앱 기능을 제공합니다.
            제공 범위는 운영 상황에 따라 변경될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. 계정 및 관리 책임
          </h2>
          <p className="mt-3">
            이용자는 본인 계정의 이메일과 로그인 정보를 직접 관리할 책임이 있으며,
            계정 이용으로 발생한 활동에 대한 책임은 이용자에게 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. 로그인 방식</h2>
          <p className="mt-3">
            서비스는 이메일 로그인과 Google 로그인을 기반으로 운영하며, 휴대폰
            인증은 사용하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. 이용자의 콘텐츠·자료 책임
          </h2>
          <p className="mt-3">
            이용자가 서비스에 입력·등록하는 콘텐츠와 자료에 대한 책임은 해당
            이용자에게 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. 금지 행위</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>타인의 정보 도용 및 부정 로그인</li>
            <li>서비스 운영을 방해하는 행위</li>
            <li>법령 또는 공서양속에 반하는 행위</li>
            <li>무단 복제·배포 등 권리 침해 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. 서비스 변경 및 중단
          </h2>
          <p className="mt-3">
            서비스는 운영상·기술상 필요에 따라 내용을 변경하거나 일시적/영구적으로
            중단할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. 유료 기능(향후)
          </h2>
          <p className="mt-3">
            현재 결제/구독(Billing) 기능은 제공되지 않으며, 향후 유료 기능이
            추가될 수 있습니다. 도입 시 관련 조건을 별도로 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. 책임 제한</h2>
          <p className="mt-3">
            서비스는 천재지변, 외부 서비스 장애 등 통제할 수 없는 사유 및 무료로
            제공되는 기능의 이용으로 발생한 손해에 대해 관련 법령이 허용하는
            범위에서 책임을 제한합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. 문의</h2>
          <p className="mt-3">
            약관 관련 문의:{" "}
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

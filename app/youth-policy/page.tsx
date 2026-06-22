import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "청소년보호정책" };

export default function YouthPolicyPage() {
  return (
    <div className="container-page py-20">
      <PageHeader eyebrow="Legal" title="청소년보호정책" />

      <div className="mx-auto mt-12 max-w-3xl space-y-10 leading-relaxed text-[--muted]">
        <p className="text-sm text-[--muted-2]">시행일: 2026년 6월 22일</p>

        <p>
          CozyBuilder(이하 &ldquo;서비스&rdquo;)는 AI 도구, 웹 프로그램, 전자책
          제작 시스템, 쇼츠 제작/관리 도구, 콘텐츠·기록형 서비스를 다루는
          개인/브랜드 홈페이지이며, 청소년에게 유해한 콘텐츠 제공을 목적으로 하지
          않습니다. 다만 향후 콘텐츠·프로그램·커뮤니티·게시물·외부 링크 등이
          확장될 수 있으므로 아래와 같이 청소년 보호 원칙을 명시합니다.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-foreground">1. 목적</h2>
          <p className="mt-3">
            본 정책은 청소년이 유해 정보에 노출되지 않도록 서비스 운영 원칙을
            정하는 것을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. 유해 콘텐츠 제한
          </h2>
          <p className="mt-3">
            서비스는 청소년에게 유해한 정보, 불법 정보, 폭력적·선정적 콘텐츠,
            도박·마약·불법 거래 관련 콘텐츠를 의도적으로 제공하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. 외부 링크 안내
          </h2>
          <p className="mt-3">
            서비스에는 블로그, SNS, 외부 서비스로 연결되는 링크가 포함될 수
            있으며, 외부 사이트의 콘텐츠 정책은 해당 사이트의 기준을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. 신고 및 문의
          </h2>
          <p className="mt-3">
            청소년 유해 정보가 발견되거나 관련 문의가 있는 경우 아래 이메일로
            연락해 주시기 바랍니다.
          </p>
          <p className="mt-3">
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-[--accent] hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. 청소년보호 책임자
          </h2>
          <p className="mt-3">
            서비스는 현재 1인 운영 구조로, 청소년보호 책임자는 다음과 같습니다.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>청소년보호 책임자: 서영준</li>
            <li>
              이메일:{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="text-[--accent] hover:underline"
              >
                {siteConfig.contactEmail}
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. 시행일</h2>
          <p className="mt-3">본 정책은 2026년 6월 22일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}

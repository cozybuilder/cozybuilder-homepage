import Link from "next/link";
import { siteConfig } from "@/lib/site";

const policyLinks = [
  { label: "소개", href: "/about" },
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "청소년보호정책", href: "/youth-policy" },
  { label: "제휴문의", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[--border] bg-[--surface]/40">
      <div className="container-page py-14">
        {/* 상단: 회사/사업자 정보 */}
        <div className="text-sm text-[--muted]">
          <p className="font-semibold text-foreground">{siteConfig.companyName}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
            <span>대표이사 : {siteConfig.representative}</span>
            <span>사업자등록번호 : {siteConfig.businessNumber}</span>
            <span>통신판매업신고 : {siteConfig.commerceReportNumber}</span>
            <span>
              이메일 :{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="transition-colors hover:text-foreground"
              >
                {siteConfig.contactEmail}
              </a>
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-8 border-t border-[--border]" />

        {/* 하단: 좌측 Copyright / 우측 정책 링크 */}
        <div className="flex flex-col gap-4 text-sm text-[--muted-2] md:flex-row md:items-center md:justify-between">
          <p>Copyright © CozyBuilder. All Rights Reserved.</p>

          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {policyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

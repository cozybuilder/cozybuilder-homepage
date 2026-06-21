import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[--border] bg-[--surface]/40">
      <div className="container-page py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="text-sm font-semibold tracking-[0.18em]">
              {siteConfig.name}
            </div>
            <p className="mt-3 text-sm text-[--muted]">{siteConfig.tagline}</p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 sm:grid-cols-3">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[--muted] transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[--border] pt-8 text-sm text-[--muted-2]">
          {/* 정책 링크 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              개인정보처리방침
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              이용약관
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              문의
            </Link>
          </div>

          <p>Built with ❤️ &nbsp;·&nbsp; Cozy • Cobi • Clo</p>
          <p>
            © {siteConfig.foundedYear} CozyBuilder. All rights reserved. &nbsp;·&nbsp;{" "}
            {siteConfig.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}

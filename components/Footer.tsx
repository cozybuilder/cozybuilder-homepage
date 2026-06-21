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

        <div className="mt-12 flex flex-col gap-2 border-t border-[--border] pt-8 text-sm text-[--muted-2]">
          <p>Built with ❤️ &nbsp;·&nbsp; Cozy • Cobi • Clo</p>
          <p>
            {siteConfig.tagline} &nbsp;·&nbsp; Founded in {siteConfig.foundedYear}
          </p>
        </div>
      </div>
    </footer>
  );
}

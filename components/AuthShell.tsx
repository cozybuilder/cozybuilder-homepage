import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

/** Centered card layout shared by login / signup / forgot-password. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.18em] text-[--muted]"
          >
            {siteConfig.name}
          </Link>
          <h1 className="heading-gradient mt-4 text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-[--muted]">{subtitle}</p>}
        </div>

        <div className="card p-8">{children}</div>

        {footer && (
          <div className="mt-6 text-center text-sm text-[--muted]">{footer}</div>
        )}
      </div>
    </div>
  );
}

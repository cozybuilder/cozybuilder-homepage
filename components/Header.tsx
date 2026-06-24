"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { mainNav, siteConfig } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [open, setOpen] = useState(false); // 모바일 메뉴
  const [menuOpen, setMenuOpen] = useState(false); // 프로필 드롭다운
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // 로그인 상태 구독.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 드롭다운 바깥 클릭 시 닫기.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[--border] bg-[--background]/70 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          aria-label={siteConfig.name}
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={32}
            height={32}
            priority
            className="h-8 w-8"
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-[--muted] hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="pointer-events-none absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[--accent] to-[--accent-2]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop auth: 로그인 버튼 또는 프로필 드롭다운 */}
        <div className="hidden md:block">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="계정 메뉴"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-foreground transition-colors hover:bg-white/[0.06]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-zinc-950/90 p-1.5 backdrop-blur-xl">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-[--muted] transition-colors hover:bg-white/[0.06] hover:text-foreground"
                  >
                    프로필
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-[--muted] transition-colors hover:bg-white/[0.06] hover:text-foreground"
                  >
                    설정
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-[--muted] transition-colors hover:bg-white/[0.06] hover:text-foreground"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-ghost cursor-pointer px-5 py-2">
              로그인
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[--border] md:hidden"
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 bg-foreground transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[--border] bg-[--background] md:hidden">
          <ul className="container-page flex flex-col py-4">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-base transition-colors ${
                    isActive(item.href)
                      ? "bg-[--surface-2] text-foreground"
                      : "text-[--muted] hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* 로그인 상태별 메뉴 */}
            {user ? (
              <>
                <li className="mt-2 border-t border-[--border] pt-2">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base text-[--muted] transition-colors hover:text-foreground"
                  >
                    프로필
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base text-[--muted] transition-colors hover:text-foreground"
                  >
                    설정
                  </Link>
                </li>
                <li className="mt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-ghost w-full cursor-pointer"
                  >
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <li className="mt-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost w-full cursor-pointer"
                >
                  로그인
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}

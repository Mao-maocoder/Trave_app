"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { t } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/map", key: "nav.map" },
  { href: "/culture", key: "nav.culture" },
  { href: "/exhibitions", key: "nav.exhibitions" },
  { href: "/photo-wall", key: "nav.photoWall" },
  { href: "/translation", key: "nav.translation" },
  { href: "/voice", key: "nav.voice" },
  { href: "/itinerary", key: "nav.itinerary" },
  { href: "/handbook", key: "nav.handbook" },
  { href: "/community", key: "nav.community" },
  { href: "/shop", key: "nav.shop" },
];

export default function Navbar() {
  const { locale, toggleLocale } = useLocaleStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 nav-surface transition-all duration-500 ${scrolled ? "shadow-[0_12px_34px_rgba(26,26,26,0.1)]" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — Seal stamp style */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="seal-stamp text-sm tracking-widest group-hover:bg-cinnabar group-hover:text-white transition-colors duration-300">
              中轴
            </div>
            <span className="font-display font-bold text-lg tracking-wide text-ink transition-colors">
              {t(locale, "app.title")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden max-w-[48vw] items-center gap-0.5 overflow-x-auto rounded-sm border border-charcoal/5 bg-white/18 px-1 py-1 backdrop-blur-md xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-sm px-2.5 py-1.5 text-xs transition-colors relative font-body ${
                  pathname === link.href
                    ? "bg-cinnabar text-white shadow-sm"
                    : "text-charcoal/78 hover:bg-cinnabar/8 hover:text-cinnabar"
                }`}
              >
                {t(locale, link.key)}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Link
              href="/search"
              className="rounded-sm p-2 text-charcoal/54 transition-colors hover:text-cinnabar"
              title={locale === "zh" ? "搜索" : "Search"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
            </Link>

            {/* Language Toggle — Ink stamp style */}
            <button
              onClick={toggleLocale}
              className="rounded-sm border border-charcoal/20 px-3 py-1.5 text-xs font-display font-bold tracking-wider text-charcoal transition-all duration-300 hover:border-cinnabar hover:text-cinnabar"
            >
              {locale === "zh" ? "EN" : "中文"}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                {(user.role === "admin" || user.role === "guide") && (
                  <Link
                    href={user.role === "admin" ? "/admin" : "/guide"}
                    className="px-2 py-1 text-xs font-display tracking-wider border border-cinnabar/30 text-cinnabar hover:bg-cinnabar hover:text-white transition-all duration-300 rounded-sm"
                  >
                    {user.role === "admin" ? t(locale, "nav.admin") : (locale === "zh" ? "导览" : "Guide")}
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-body text-charcoal transition-colors hover:text-cinnabar"
                >
                  <div className="w-6 h-6 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="" width={24} height={24} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-cinnabar text-[10px] font-display font-bold">{user.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  {user.username}
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-charcoal/50 transition-colors hover:text-cinnabar"
                >
                  {locale === "zh" ? "退出" : "Logout"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm font-body text-charcoal transition-colors hover:text-cinnabar"
                >
                  {t(locale, "nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm bg-cinnabar text-white rounded-sm hover:bg-cinnabar-deep transition-colors font-display tracking-wider"
                >
                  {t(locale, "nav.register")}
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}

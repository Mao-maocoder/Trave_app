"use client";

import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { t } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SearchOverlay from "@/components/search/SearchOverlay";

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/map", key: "nav.map" },
  { href: "/culture", key: "nav.culture" },
  { href: "/photo-wall", key: "nav.photoWall" },
  { href: "/translation", key: "nav.translation" },
  { href: "/voice", key: "nav.voice" },
  { href: "/itinerary", key: "nav.itinerary" },
  { href: "/community", key: "nav.community" },
];

export default function Navbar() {
  const { locale, toggleLocale } = useLocaleStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-rice-paper/95 backdrop-blur-md shadow-[0_1px_0_rgba(194,59,34,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — Seal stamp style */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="seal-stamp text-sm tracking-widest group-hover:bg-cinnabar group-hover:text-white transition-colors duration-300">
              中轴
            </div>
            <span className="font-display font-bold text-lg text-ink tracking-wide">
              {t(locale, "app.title")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm transition-colors relative brush-line font-body ${
                  pathname === link.href ? "text-cinnabar" : "text-charcoal/80 hover:text-cinnabar"
                }`}
              >
                {t(locale, link.key)}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-charcoal/50 hover:text-cinnabar transition-colors"
              title={locale === "zh" ? "搜索" : "Search"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Language Toggle — Ink stamp style */}
            <button
              onClick={toggleLocale}
              className="px-3 py-1.5 text-xs font-display font-bold tracking-wider border border-charcoal/20 text-charcoal hover:border-cinnabar hover:text-cinnabar transition-all duration-300 rounded-sm"
            >
              {locale === "zh" ? "EN" : "中文"}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="text-sm text-charcoal hover:text-cinnabar font-body transition-colors"
                >
                  {user.username}
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-charcoal/50 hover:text-cinnabar transition-colors"
                >
                  {locale === "zh" ? "退出" : "Logout"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm text-charcoal hover:text-cinnabar font-body transition-colors"
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

      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </nav>
  );
}

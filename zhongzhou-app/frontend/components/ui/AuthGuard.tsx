"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useLocaleStore } from "@/stores/localeStore";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: "admin" | "guide";
  redirectTo?: string;
  fallback?: "spinner" | "login";
}

export default function AuthGuard({
  children,
  requireRole,
  redirectTo,
  fallback = "spinner",
}: AuthGuardProps) {
  const { authReady, user } = useAuthStore();
  const { locale } = useLocaleStore();
  const router = useRouter();

  const resolvedRedirect = redirectTo ?? (requireRole ? "/" : "/login");

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace(resolvedRedirect);
      return;
    }
    if (requireRole && user.role !== requireRole) {
      router.replace("/");
    }
  }, [authReady, user, requireRole, resolvedRedirect, router]);

  if (!authReady) {
    return (
      <div className="relative z-10 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cinnabar/20 border-t-cinnabar rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (requireRole && user.role !== requireRole)) {
    if (fallback === "login") {
      return (
        <div className="relative z-10 max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-ink mb-4">
            {locale === "zh" ? "请先登录" : "Please login first"}
          </h1>
          <p className="text-charcoal/50 font-body text-sm mb-6">
            {locale === "zh" ? "登录后即可访问" : "Login to continue"}
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-2.5 bg-cinnabar text-white font-display tracking-[0.1em] text-sm rounded-sm hover:bg-cinnabar-deep transition-colors"
          >
            {locale === "zh" ? "去登录" : "Login"}
          </Link>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}

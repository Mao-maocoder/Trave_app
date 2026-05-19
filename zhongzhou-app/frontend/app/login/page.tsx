"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const { locale } = useLocaleStore();
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) router.push("/profile");
  };

  return (
    <div className="relative z-10 flex min-h-[76vh] items-center justify-center px-4 py-14">
      <div className="heritage-panel w-full max-w-md rounded-lg p-7 md:p-9">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="seal-stamp text-sm tracking-[0.3em] mx-auto mb-4 w-fit px-4 py-1.5">
            {locale === "zh" ? "登录" : "SIGN IN"}
          </div>
          <h1 className="font-display font-bold text-3xl text-ink tracking-wide">
            {t(locale, "nav.login")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-charcoal/50">
            {locale === "zh" ? "回到你的中轴线旅程、收藏与打卡记录。" : "Return to your Central Axis trips, collections, and memories."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-cinnabar/5 border border-cinnabar/20 rounded-sm text-cinnabar text-sm font-body">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-display text-ink mb-2 tracking-wider">
              {locale === "zh" ? "用户名" : "Username"}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError(); }}
              className="w-full rounded-sm border border-charcoal/12 bg-white/72 px-4 py-3 font-body text-charcoal transition-all focus:border-cinnabar/40 focus:outline-none focus:ring-2 focus:ring-cinnabar/24"
              placeholder={locale === "zh" ? "请输入用户名" : "Enter username"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-display text-ink mb-2 tracking-wider">
              {locale === "zh" ? "密码" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              className="w-full rounded-sm border border-charcoal/12 bg-white/72 px-4 py-3 font-body text-charcoal transition-all focus:border-cinnabar/40 focus:outline-none focus:ring-2 focus:ring-cinnabar/24"
              placeholder={locale === "zh" ? "请输入密码" : "Enter password"}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cinnabar text-white font-display tracking-[0.15em] rounded-sm hover:bg-cinnabar-deep transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(194,59,34,0.2)]"
          >
            {isLoading
              ? (locale === "zh" ? "登录中..." : "Signing in...")
              : t(locale, "nav.login")}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-charcoal/50 font-body">
          {locale === "zh" ? "还没有账号？" : "Don't have an account? "}
          <Link href="/register" className="text-cinnabar hover:text-cinnabar-deep transition-colors font-display tracking-wider">
            {t(locale, "nav.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}

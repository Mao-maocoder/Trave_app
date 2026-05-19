"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { t } from "@/lib/i18n";

export default function RegisterPage() {
  const { locale } = useLocaleStore();
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin" | "guide">("user");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await register(username, email, password, role);
    if (ok) router.push("/profile");
  };

  return (
    <div className="relative z-10 flex min-h-[76vh] items-center justify-center px-4 py-14">
      <div className="heritage-panel w-full max-w-md rounded-lg p-7 md:p-9">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="seal-stamp text-sm tracking-[0.3em] mx-auto mb-4 w-fit px-4 py-1.5">
            {locale === "zh" ? "注册" : "SIGN UP"}
          </div>
          <h1 className="font-display font-bold text-3xl text-ink tracking-wide">
            {t(locale, "nav.register")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-charcoal/50">
            {locale === "zh" ? "创建账号，开始记录你的中轴线探索。" : "Create an account and start recording your Axis journey."}
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
              placeholder={locale === "zh" ? "2-20个字符" : "2-20 characters"}
              required
              minLength={2}
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-display text-ink mb-2 tracking-wider">
              {locale === "zh" ? "邮箱" : "Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              className="w-full rounded-sm border border-charcoal/12 bg-white/72 px-4 py-3 font-body text-charcoal transition-all focus:border-cinnabar/40 focus:outline-none focus:ring-2 focus:ring-cinnabar/24"
              placeholder={locale === "zh" ? "请输入邮箱" : "Enter email"}
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
              placeholder={locale === "zh" ? "至少6个字符" : "At least 6 characters"}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-display text-ink mb-2 tracking-wider">
              {locale === "zh" ? "账号类型" : "Account Type"}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 py-2.5 text-sm font-display tracking-wider border rounded-sm transition-all duration-300 ${
                  role === "user"
                    ? "border-cinnabar bg-cinnabar/5 text-cinnabar"
                    : "border-charcoal/15 text-charcoal/50 hover:border-charcoal/30"
                }`}
              >
                {locale === "zh" ? "普通用户" : "User"}
              </button>
              <button
                type="button"
                onClick={() => setRole("guide")}
                className={`flex-1 py-2.5 text-sm font-display tracking-wider border rounded-sm transition-all duration-300 ${
                  role === "guide"
                    ? "border-cinnabar bg-cinnabar/5 text-cinnabar"
                    : "border-charcoal/15 text-charcoal/50 hover:border-charcoal/30"
                }`}
              >
                {locale === "zh" ? "导览员" : "Guide"}
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2.5 text-sm font-display tracking-wider border rounded-sm transition-all duration-300 ${
                  role === "admin"
                    ? "border-cinnabar bg-cinnabar/5 text-cinnabar"
                    : "border-charcoal/15 text-charcoal/50 hover:border-charcoal/30"
                }`}
              >
                {locale === "zh" ? "管理员" : "Admin"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cinnabar text-white font-display tracking-[0.15em] rounded-sm hover:bg-cinnabar-deep transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(194,59,34,0.2)]"
          >
            {isLoading
              ? (locale === "zh" ? "注册中..." : "Creating account...")
              : t(locale, "nav.register")}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-charcoal/50 font-body">
          {locale === "zh" ? "已有账号？" : "Already have an account? "}
          <Link href="/login" className="text-cinnabar hover:text-cinnabar-deep transition-colors font-display tracking-wider">
            {t(locale, "nav.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { SettingsIcon, ReturnIcon } from "@/components/icons";

export default function SettingsPage() {
  const { locale, toggleLocale } = useLocaleStore();
  const { user } = useAuthStore();

  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [fontSize, setFontSize] = useState(1.0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="heritage-hero py-12">
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <Link href="/profile" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6">
            <ReturnIcon size={16} />
            <span className="font-display text-sm tracking-wider">{locale === "zh" ? "返回" : "Back"}</span>
          </Link>
          <div className="flex items-center gap-3">
            <SettingsIcon size={28} className="text-white/80" />
            <h1 className="font-display font-bold text-3xl text-white tracking-wider">
              {locale === "zh" ? "设置" : "Settings"}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Language */}
        <div>
          <h2 className="font-display font-bold text-sm text-cinnabar tracking-wider mb-3">
            {locale === "zh" ? "语言设置" : "LANGUAGE"}
          </h2>
          <div className="heritage-panel rounded-lg divide-y divide-charcoal/5">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-display text-sm text-ink">{locale === "zh" ? "应用语言" : "App Language"}</p>
                <p className="text-charcoal/40 font-body text-xs mt-0.5">{locale === "zh" ? "选择应用显示语言" : "Choose app display language"}</p>
              </div>
              <button
                onClick={toggleLocale}
                className="px-4 py-1.5 text-xs font-display tracking-wider border border-charcoal/20 text-charcoal hover:border-cinnabar hover:text-cinnabar transition-all rounded-sm"
              >
                {locale === "zh" ? "English" : "中文"}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="font-display font-bold text-sm text-cinnabar tracking-wider mb-3">
            {locale === "zh" ? "通知设置" : "NOTIFICATIONS"}
          </h2>
          <div className="heritage-panel rounded-lg divide-y divide-charcoal/5">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-display text-sm text-ink">{locale === "zh" ? "推送通知" : "Push Notifications"}</p>
                <p className="text-charcoal/40 font-body text-xs mt-0.5">{locale === "zh" ? "接收应用更新和活动提醒" : "Receive app updates and reminders"}</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${notifications ? "bg-cinnabar" : "bg-charcoal/20"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${notifications ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Display */}
        <div>
          <h2 className="font-display font-bold text-sm text-cinnabar tracking-wider mb-3">
            {locale === "zh" ? "显示设置" : "DISPLAY"}
          </h2>
          <div className="heritage-panel rounded-lg divide-y divide-charcoal/5">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-display text-sm text-ink">{locale === "zh" ? "字体大小" : "Font Size"}</p>
                <p className="text-charcoal/40 font-body text-xs mt-0.5">{locale === "zh" ? "调整应用字体大小" : "Adjust app font size"}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFontSize(Math.max(0.8, fontSize - 0.1))}
                  className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal/60 hover:bg-charcoal/10 transition-colors text-lg"
                >
                  −
                </button>
                <span className="font-display text-sm text-ink w-12 text-center">{Math.round(fontSize * 100)}%</span>
                <button
                  onClick={() => setFontSize(Math.min(1.5, fontSize + 0.1))}
                  className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal/60 hover:bg-charcoal/10 transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-display text-sm text-ink">{locale === "zh" ? "自动播放" : "Auto Play"}</p>
                <p className="text-charcoal/40 font-body text-xs mt-0.5">{locale === "zh" ? "自动播放视频和音频" : "Auto play videos and audio"}</p>
              </div>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${autoPlay ? "bg-cinnabar" : "bg-charcoal/20"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${autoPlay ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Account */}
        {user && (
          <div>
            <h2 className="font-display font-bold text-sm text-cinnabar tracking-wider mb-3">
              {locale === "zh" ? "账户信息" : "ACCOUNT"}
            </h2>
            <div className="heritage-panel rounded-lg divide-y divide-charcoal/5">
              <div className="px-5 py-4">
                <p className="font-display text-sm text-ink">{locale === "zh" ? "用户名" : "Username"}</p>
                <p className="text-charcoal/50 font-body text-sm mt-0.5">{user.username}</p>
              </div>
              <div className="px-5 py-4">
                <p className="font-display text-sm text-ink">{locale === "zh" ? "邮箱" : "Email"}</p>
                <p className="text-charcoal/50 font-body text-sm mt-0.5">{user.email}</p>
              </div>
              <div className="px-5 py-4">
                <p className="font-display text-sm text-ink">{locale === "zh" ? "角色" : "Role"}</p>
                <p className="text-charcoal/50 font-body text-sm mt-0.5">
                  {user.role === "admin" ? "ADMIN" : user.role === "guide" ? "GUIDE" : "USER"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-cinnabar text-white font-display tracking-[0.15em] text-sm hover:bg-cinnabar-deep transition-colors rounded-lg"
          >
            {saved
              ? (locale === "zh" ? "已保存 ✓" : "Saved ✓")
              : (locale === "zh" ? "保存设置" : "Save Settings")}
          </button>
        </div>

        {/* Version info */}
        <div className="text-center pt-4 pb-8">
          <p className="text-charcoal/20 font-body text-xs">
            Axis Odyssey v1.0.0
          </p>
        </div>
      </section>
    </div>
  );
}

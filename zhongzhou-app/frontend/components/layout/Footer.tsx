"use client";

import { useLocaleStore } from "@/stores/localeStore";

export default function Footer() {
  const { locale } = useLocaleStore();

  return (
    <footer className="relative z-[1] bg-ink text-white/40 py-16 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cinnabar/30 to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cinnabar/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="seal-stamp text-xs tracking-widest border-cinnabar/60 text-cinnabar/60">
                中轴
              </div>
              <span className="font-display font-bold text-lg text-white/80 tracking-wide">
                {locale === "zh" ? "中轴奇遇" : "Axis Odyssey"}
              </span>
            </div>
            <p className="text-sm leading-relaxed font-body">
              {locale === "zh"
                ? "北京中轴线文明互鉴旅行应用，带您穿越七百年历史，感受中华文明的脉搏。"
                : "Beijing Central Axis cultural travel app. Walk through 700 years of history."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-white/60 text-sm tracking-widest mb-4 uppercase">
              {locale === "zh" ? "快速导航" : "Navigation"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/", label: locale === "zh" ? "首页" : "Home" },
                { href: "/map", label: locale === "zh" ? "地图" : "Map" },
                { href: "/culture", label: locale === "zh" ? "文化" : "Culture" },
                { href: "/photo-wall", label: locale === "zh" ? "照片墙" : "Photos" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/30 hover:text-cinnabar-light transition-colors font-body"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Axis Info */}
          <div>
            <h3 className="font-display font-bold text-white/60 text-sm tracking-widest mb-4 uppercase">
              {locale === "zh" ? "中轴线" : "The Axis"}
            </h3>
            <p className="text-sm text-white/30 font-body leading-relaxed">
              {locale === "zh"
                ? "北京中轴线全长7.8公里，南起永定门，北至钟鼓楼，是世界文化遗产。"
                : "Beijing's Central Axis stretches 7.8km from Yongdingmen to the Bell & Drum Towers, a UNESCO World Heritage Site."}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20 font-body">
            &copy; 2024 {locale === "zh" ? "中轴奇遇" : "Axis Odyssey"}
          </p>
          <p className="text-xs text-white/20 font-display tracking-wider">
            {locale === "zh" ? "漫步中轴 · 文明互鉴" : "Walk the Axis · Cultural Exchange"}
          </p>
        </div>
      </div>
    </footer>
  );
}

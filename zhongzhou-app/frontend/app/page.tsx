"use client";

import Link from "next/link";
import BannerCarousel from "@/components/spots/BannerCarousel";
import SpotCard from "@/components/spots/SpotCard";
import { spots } from "@/lib/spots";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";

export default function Home() {
  const { locale } = useLocaleStore();

  const features = [
    {
      icon: "地图",
      emoji: "🗺️",
      titleKey: "home.features.map",
      descKey: "home.features.mapDesc",
      href: "/map",
    },
    {
      icon: "翻译",
      emoji: "🌐",
      titleKey: "home.features.translation",
      descKey: "home.features.translationDesc",
      href: "/translation",
    },
    {
      icon: "语音",
      emoji: "🎤",
      titleKey: "home.features.voice",
      descKey: "home.features.voiceDesc",
      href: "/voice",
    },
    {
      icon: "文化",
      emoji: "🎭",
      titleKey: "home.features.culture",
      descKey: "home.features.cultureDesc",
      href: "/culture",
    },
  ];

  return (
    <div className="relative z-10">
      {/* Hero Banner Carousel */}
      <section className="max-w-7xl mx-auto pt-6 pb-12">
        <BannerCarousel />
      </section>

      {/* Axis Line Decoration */}
      <div className="flex items-center justify-center gap-4 mb-16">
        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-cinnabar/40" />
        <div className="seal-stamp text-[10px] tracking-[0.3em] px-3 py-1">
          {locale === "zh" ? "北京中轴线" : "CENTRAL AXIS"}
        </div>
        <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-cinnabar/40" />
      </div>

      {/* Spots Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink mb-3 tracking-wide">
            {t(locale, "home.spots.title")}
          </h2>
          <p className="text-charcoal/60 font-body text-sm max-w-md mx-auto">
            {t(locale, "home.spots.subtitle")}
          </p>
          {/* Decorative brush stroke */}
          <div className="mt-4 mx-auto w-16 h-[2px] bg-gradient-to-r from-transparent via-cinnabar to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {spots.map((spot, index) => (
            <SpotCard key={spot.id} spot={spot} index={index} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cinnabar/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-jade/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3 tracking-wide">
              {t(locale, "home.features.title")}
            </h2>
            <div className="mt-4 mx-auto w-16 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <Link
                key={f.href}
                href={f.href}
                className="group relative p-8 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cinnabar/30 hover:bg-white/10 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Icon */}
                <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">
                  {f.emoji}
                </div>

                {/* Chinese character accent */}
                <div className="absolute top-4 right-4 font-display text-6xl font-bold text-white/[0.03] leading-none select-none">
                  {f.icon}
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-2 tracking-wide group-hover:text-cinnabar-light transition-colors">
                  {t(locale, f.titleKey)}
                </h3>
                <p className="text-white/50 text-sm font-body leading-relaxed">
                  {t(locale, f.descKey)}
                </p>

                {/* Gold accent line */}
                <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="font-display text-2xl md:text-3xl text-ink/80 mb-2 tracking-wider">
            {locale === "zh" ? "七百年中轴，一步一景" : "700 Years of Axis, Every Step a View"}
          </p>
          <div className="mt-6 mx-auto w-20 h-[2px] bg-gradient-to-r from-transparent via-cinnabar to-transparent" />
          <Link
            href="/map"
            className="inline-block mt-8 px-10 py-3 bg-cinnabar text-white font-display tracking-[0.2em] text-sm hover:bg-cinnabar-deep transition-colors duration-300 rounded-sm shadow-[0_4px_20px_rgba(194,59,34,0.3)]"
          >
            {t(locale, "home.hero.cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}

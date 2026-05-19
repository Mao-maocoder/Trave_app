"use client";

import Link from "next/link";
import Image from "next/image";
import BannerCarousel from "@/components/spots/BannerCarousel";
import SpotCard from "@/components/spots/SpotCard";
import { spots } from "@/lib/spots";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";
import { MapIcon, TranslationIcon, VoiceIcon, CultureIcon, ShoppingBagIcon } from "@/components/icons";

export default function Home() {
  const { locale } = useLocaleStore();

  const features = [
    {
      icon: "地图",
      Icon: MapIcon,
      titleKey: "home.features.map",
      descKey: "home.features.mapDesc",
      href: "/map",
    },
    {
      icon: "翻译",
      Icon: TranslationIcon,
      titleKey: "home.features.translation",
      descKey: "home.features.translationDesc",
      href: "/translation",
    },
    {
      icon: "语音",
      Icon: VoiceIcon,
      titleKey: "home.features.voice",
      descKey: "home.features.voiceDesc",
      href: "/voice",
    },
    {
      icon: "文化",
      Icon: CultureIcon,
      titleKey: "home.features.culture",
      descKey: "home.features.cultureDesc",
      href: "/culture",
    },
    {
      icon: "周边",
      Icon: ShoppingBagIcon,
      titleKey: "home.features.shop",
      descKey: "home.features.shopDesc",
      href: "/shop",
    },
  ];

  return (
    <div className="relative z-10">
      {/* Hero Banner Carousel */}
      <section className="w-full">
        <BannerCarousel />
      </section>

      {/* Axis Line Decoration */}
      <div className="mx-auto -mt-10 mb-18 max-w-5xl px-4">
        <div className="paper-surface relative z-20 grid grid-cols-1 overflow-hidden rounded-lg md:grid-cols-3">
          {[
            locale === "zh" ? "南北纵贯 7.8 公里" : "7.8 km north-south line",
            locale === "zh" ? "15 处核心遗产点" : "15 core heritage stops",
            locale === "zh" ? "从永定门到钟鼓楼" : "Yongdingmen to Bell Towers",
          ].map((item, index) => (
            <div
              key={item}
              className="relative px-6 py-5 text-center text-sm text-charcoal/70 md:border-l md:border-charcoal/10 first:md:border-l-0"
            >
              <span className="mb-2 block font-display text-[10px] tracking-[0.28em] text-cinnabar">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Spots Grid */}
      <section className="axis-hairline mx-auto max-w-7xl px-4 pb-24">
        <div className="relative z-10 mb-12 flex flex-col items-center text-center">
          <span className="section-kicker mb-4">
            {locale === "zh" ? "北京中轴线" : "CENTRAL AXIS"}
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-ink mb-4 tracking-wide">
            {t(locale, "home.spots.title")}
          </h2>
          <p className="text-charcoal/64 font-body text-sm leading-7 max-w-xl mx-auto">
            {t(locale, "home.spots.subtitle")}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {spots.map((spot, index) => (
            <SpotCard key={spot.id} spot={spot} index={index} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="ink-band relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/22" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="section-kicker mb-4 text-gold">
              {locale === "zh" ? "旅行工具" : "TRAVEL TOOLS"}
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-3 tracking-wide">
              {t(locale, "home.features.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {features.map((f, i) => (
              <Link
                key={f.href}
                href={f.href}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold/36 hover:bg-white/[0.09] animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Icon */}
                <div className="text-white/80 mb-5 group-hover:scale-110 group-hover:text-cinnabar-light transition-all duration-300">
                  <f.Icon size={36} />
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
      <section className="relative overflow-hidden py-24 text-center">
        <div className="absolute inset-0">
          <Image
            src="/images/textures/ink-bg-light.png"
            alt=""
            fill
            className="object-cover object-center"
            style={{ opacity: 0.8 }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <p className="font-display text-3xl md:text-5xl text-ink/86 mb-4 tracking-wide">
            {locale === "zh" ? "七百年中轴，一步一景" : "700 Years of Axis, Every Step a View"}
          </p>
          <p className="mx-auto max-w-xl text-sm leading-7 text-charcoal/64">
            {locale === "zh" ? "把地图、导览、翻译、打卡和文化故事放在同一条路线里。" : "Plan, navigate, translate, collect memories, and read stories along one route."}
          </p>
          <Link
            href="/map"
            className="mt-9 inline-flex items-center gap-3 rounded-sm bg-cinnabar px-10 py-3 text-sm font-display tracking-[0.2em] text-white shadow-[0_12px_30px_rgba(194,59,34,0.28)] transition-colors duration-300 hover:bg-cinnabar-deep"
          >
            {t(locale, "home.hero.cta")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useLocaleStore } from "@/stores/localeStore";

const banners = [
  {
    title: { zh: "中轴奇遇", en: "Axis Odyssey" },
    subtitle: {
      zh: "探索北京中轴线的文化魅力",
      en: "Explore the cultural charm of Beijing's Central Axis",
    },
    image: "/images/spots/gugong.webp",
    tag: { zh: "文化体验", en: "Culture" },
    href: "/spots/gugong?from=home",
  },
  {
    title: { zh: "天坛祈年殿", en: "Temple of Heaven" },
    subtitle: {
      zh: "感受古代皇家祭祀文化",
      en: "Experience ancient royal sacrificial culture",
    },
    image: "/images/spots/tiantan.webp",
    tag: { zh: "历史古迹", en: "Historic Site" },
    href: "/spots/tiantan?from=home",
  },
  {
    title: { zh: "钟鼓楼", en: "Bell & Drum Towers" },
    subtitle: {
      zh: "聆听古都的时光回响",
      en: "Listen to the echoes of ancient Beijing",
    },
    image: "/images/spots/zhonggulou.webp",
    tag: { zh: "文化地标", en: "Landmark" },
    href: "/spots/zhonggulou?from=home",
  },
  {
    title: { zh: "前门大街", en: "Qianmen Street" },
    subtitle: {
      zh: "体验老北京风情",
      en: "Experience old Beijing culture",
    },
    image: "/images/spots/qianmen.webp",
    tag: { zh: "民俗文化", en: "Folk Culture" },
    href: "/spots/qianmen?from=home",
  },
  {
    title: { zh: "永定门", en: "Yongdingmen" },
    subtitle: {
      zh: "中轴线的南起点",
      en: "Southern start of the Central Axis",
    },
    image: "/images/spots/yongdingmen.webp",
    tag: { zh: "历史地标", en: "Historic Landmark" },
    href: "/spots/yongdingmen?from=home",
  },
];

export default function BannerCarousel() {
  const { locale } = useLocaleStore();
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative min-h-[560px] h-[74vh] max-h-[760px] overflow-hidden bg-ink shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      {/* Slides */}
      {banners.map((banner, index) => (
        <a
          key={index}
          href={banner.href}
          className={`absolute inset-0 transition-all duration-700 ease-out ${
            index === current
              ? "opacity-100 z-10 scale-100"
              : "opacity-0 z-0 scale-105"
          }`}
        >
          {/* Background Image */}
          <Image
            src={banner.image}
            alt={banner.title[locale]}
            fill
            className="object-cover"
            quality={90}
            sizes="100vw"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/28 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/18 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-rice-paper via-rice-paper/20 to-transparent" />
          {/* Grain texture */}
          <div className="absolute inset-0 grain-overlay" />

          {/* Content */}
          <div className="absolute left-5 right-5 bottom-14 z-10 md:left-12 md:bottom-20 lg:left-[8vw]">
            {/* Tag — seal stamp style */}
            <div
              className={`inline-block mb-4 transition-all duration-700 delay-200 ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="seal-stamp text-xs tracking-[0.2em]">
                {banner.tag[locale]}
              </span>
            </div>

            {/* Title */}
            <h2
              className={`font-display font-bold text-4xl text-white mb-4 tracking-wide drop-shadow-lg transition-all duration-700 delay-300 md:text-6xl lg:text-7xl ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              {banner.title[locale]}
            </h2>

            {/* Subtitle */}
            <p
              className={`text-white/76 text-base md:text-lg font-body max-w-xl leading-8 transition-all duration-700 delay-400 ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              {banner.subtitle[locale]}
            </p>

            {/* Decorative brush line */}
            <div
              className={`mt-6 h-[2px] bg-gradient-to-r from-cinnabar via-gold to-transparent transition-all duration-1000 delay-500 ${
                index === current ? "w-36 opacity-100" : "w-0 opacity-0"
              }`}
            />

            <div
              className={`mt-8 flex flex-wrap items-center gap-3 transition-all duration-700 delay-500 ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
            >
              <span className="paper-surface rounded-sm px-4 py-2 text-xs font-display tracking-widest text-cinnabar">
                {locale === "zh" ? "开始探索" : "Start Exploring"}
              </span>
              <span className="text-sm text-white/62">
                {locale === "zh" ? "沿 7.8 公里中轴线展开旅程" : "Follow the 7.8 km Central Axis"}
              </span>
            </div>
          </div>
        </a>
      ))}

      <div className="pointer-events-none absolute left-5 top-24 z-20 hidden h-[54%] flex-col items-center justify-between md:flex">
        <span className="h-14 w-px bg-gradient-to-b from-transparent to-white/40" />
        <span className="rotate-180 text-[10px] font-display tracking-[0.42em] text-white/52 [writing-mode:vertical-rl]">
          CENTRAL AXIS
        </span>
        <span className="h-14 w-px bg-gradient-to-t from-transparent to-gold/60" />
      </div>

      {/* Page Indicator — top right */}
      <div className="absolute top-5 right-5 z-20 px-4 py-2 bg-black/34 backdrop-blur-md rounded-sm border border-white/12">
        <span className="text-white/90 text-xs font-display tracking-widest">
          {String(current + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
        </span>
      </div>

      {/* Dots — bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`transition-all duration-400 rounded-full ${
              index === current
                ? "w-8 h-1.5 bg-cinnabar"
                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => goTo((current - 1 + banners.length) % banners.length)}
        className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm border border-white/12 bg-black/22 text-2xl text-white/70 backdrop-blur-md transition-all duration-300 hover:bg-black/42 hover:text-white md:flex"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm border border-white/12 bg-black/22 text-2xl text-white/70 backdrop-blur-md transition-all duration-300 hover:bg-black/42 hover:text-white md:flex"
      >
        ›
      </button>
    </div>
  );
}

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
    href: "/spots/gugong",
  },
  {
    title: { zh: "天坛祈年殿", en: "Temple of Heaven" },
    subtitle: {
      zh: "感受古代皇家祭祀文化",
      en: "Experience ancient royal sacrificial culture",
    },
    image: "/images/spots/tiantan.webp",
    tag: { zh: "历史古迹", en: "Historic Site" },
    href: "/spots/tiantan",
  },
  {
    title: { zh: "钟鼓楼", en: "Bell & Drum Towers" },
    subtitle: {
      zh: "聆听古都的时光回响",
      en: "Listen to the echoes of ancient Beijing",
    },
    image: "/images/spots/zhonggulou.webp",
    tag: { zh: "文化地标", en: "Landmark" },
    href: "/spots/zhonggulou",
  },
  {
    title: { zh: "前门大街", en: "Qianmen Street" },
    subtitle: {
      zh: "体验老北京风情",
      en: "Experience old Beijing culture",
    },
    image: "/images/spots/qianmen.webp",
    tag: { zh: "民俗文化", en: "Folk Culture" },
    href: "/spots/qianmen",
  },
  {
    title: { zh: "永定门", en: "Yongdingmen" },
    subtitle: {
      zh: "中轴线的南起点",
      en: "Southern start of the Central Axis",
    },
    image: "/images/spots/yongdingmen.webp",
    tag: { zh: "历史地标", en: "Historic Landmark" },
    href: "/spots/yongdingmen",
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
    <div className="relative h-[440px] overflow-hidden rounded-lg shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          {/* Grain texture */}
          <div className="absolute inset-0 grain-overlay" />

          {/* Content */}
          <div className="absolute bottom-8 left-8 right-8 z-10">
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
              className={`font-display font-bold text-5xl text-white mb-3 tracking-wide transition-all duration-700 delay-300 ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              {banner.title[locale]}
            </h2>

            {/* Subtitle */}
            <p
              className={`text-white/70 text-sm md:text-base font-body max-w-lg transition-all duration-700 delay-400 ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              {banner.subtitle[locale]}
            </p>

            {/* Decorative brush line */}
            <div
              className={`mt-4 h-[2px] bg-gradient-to-r from-cinnabar via-gold to-transparent transition-all duration-1000 delay-500 ${
                index === current ? "w-24 opacity-100" : "w-0 opacity-0"
              }`}
            />
          </div>
        </a>
      ))}

      {/* Page Indicator — top right */}
      <div className="absolute top-4 right-4 z-20 px-4 py-1.5 bg-black/40 backdrop-blur-sm rounded-sm border border-white/10">
        <span className="text-white/90 text-xs font-display tracking-widest">
          {String(current + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
        </span>
      </div>

      {/* Dots — bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-3">
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white/70 hover:text-white rounded-full transition-all duration-300 border border-white/10"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white/70 hover:text-white rounded-full transition-all duration-300 border border-white/10"
      >
        ›
      </button>
    </div>
  );
}

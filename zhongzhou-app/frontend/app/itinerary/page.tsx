"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { spots } from "@/lib/spots";

interface Stop {
  spotId: string;
  zh: { name: string; duration: string; highlight: string };
  en: { name: string; duration: string; highlight: string };
}

interface ItineraryPlan {
  id: string;
  zh: { title: string; subtitle: string; description: string };
  en: { title: string; subtitle: string; description: string };
  stops: Stop[];
  tips: { zh: string[]; en: string[] };
  accent: string;
}

const plans: ItineraryPlan[] = [
  {
    id: "classic",
    accent: "cinnabar",
    zh: {
      title: "经典一日游",
      subtitle: "中轴线精华全覆盖",
      description: "从南到北纵贯中轴线，一天之内打卡全部核心景点，感受700年古都的壮阔格局。",
    },
    en: {
      title: "Classic One-Day Tour",
      subtitle: "Full Axis Highlights",
      description: "Traverse the entire axis from south to north in one day — all the essential landmarks, 700 years of imperial grandeur.",
    },
    stops: [
      { spotId: "yongdingmen", zh: { name: "永定门", duration: "30分钟", highlight: "中轴线南起点，拍照打卡" }, en: { name: "Yongdingmen", duration: "30 min", highlight: "Southern start of the axis — photo spot" } },
      { spotId: "tiantan", zh: { name: "天坛", duration: "2小时", highlight: "祈年殿、回音壁、圜丘坛" }, en: { name: "Temple of Heaven", duration: "2 hrs", highlight: "Prayer Hall, Echo Wall, Circular Mound" } },
      { spotId: "qianmen", zh: { name: "前门大街", duration: "1.5小时", highlight: "老字号午餐、逛街" }, en: { name: "Qianmen Street", duration: "1.5 hrs", highlight: "Heritage brands lunch, shopping" } },
      { spotId: "gugong", zh: { name: "故宫", duration: "3小时", highlight: "三大殿、御花园、珍宝馆" }, en: { name: "Forbidden City", duration: "3 hrs", highlight: "Three Great Halls, Imperial Garden, Treasury" } },
      { spotId: "shichahai", zh: { name: "什刹海", duration: "1.5小时", highlight: "万宁桥、胡同漫步" }, en: { name: "Shichahai", duration: "1.5 hrs", highlight: "Wanning Bridge, hutong walk" } },
      { spotId: "zhonggulou", zh: { name: "钟鼓楼", duration: "1小时", highlight: "登楼俯瞰胡同，日落最佳" }, en: { name: "Bell & Drum Towers", duration: "1 hr", highlight: "Hutong panorama, best at sunset" } },
    ],
    tips: {
      zh: ["建议早上8点出发，避开人流高峰", "故宫需提前网上预约", "穿舒适的步行鞋，全天步行约15000步", "午餐推荐前门大街老字号"],
      en: ["Start at 8am to avoid crowds", "Book Forbidden City tickets online in advance", "Wear comfortable shoes — ~15,000 steps total", "Lunch at Qianmen's heritage restaurants"],
    },
  },
  {
    id: "halfday",
    accent: "jade",
    zh: {
      title: "半日精华游",
      subtitle: "核心三景点深度游",
      description: "时间有限？聚焦故宫、景山、钟鼓楼三大核心，半天感受中轴线最精华的部分。",
    },
    en: {
      title: "Half-Day Essential",
      subtitle: "Top 3 Highlights",
      description: "Short on time? Focus on the Forbidden City, Jingshan, and the Bell & Drum Towers — the essence of the axis in half a day.",
    },
    stops: [
      { spotId: "gugong", zh: { name: "故宫", duration: "2.5小时", highlight: "南门进北门出，沿中轴线步行" }, en: { name: "Forbidden City", duration: "2.5 hrs", highlight: "South gate in, north gate out — walk the central path" } },
      { spotId: "shichahai", zh: { name: "什刹海·万宁桥", duration: "1小时", highlight: "元代古桥、运河遗迹" }, en: { name: "Shichahai · Wanning Bridge", duration: "1 hr", highlight: "Yuan dynasty bridge, Grand Canal heritage" } },
      { spotId: "zhonggulou", zh: { name: "钟鼓楼", duration: "1小时", highlight: "登楼远眺，听击鼓表演" }, en: { name: "Bell & Drum Towers", duration: "1 hr", highlight: "Panoramic views, drum performance" } },
    ],
    tips: {
      zh: ["建议上午出发，故宫光线最佳", "故宫北门出后步行10分钟到什刹海", "钟鼓楼有定时击鼓表演，提前查好时间"],
      en: ["Start in the morning for best light in the Forbidden City", "10-min walk from north gate to Shichahai", "Drum performances are scheduled — check times in advance"],
    },
  },
  {
    id: "culture",
    accent: "gold",
    zh: {
      title: "文化深度游",
      subtitle: "两天慢行·沉浸体验",
      description: "放慢脚步，两天时间深入体验中轴线的文化内涵。含博物馆、非遗体验、胡同探访。",
    },
    en: {
      title: "Cultural Deep Dive",
      subtitle: "Two-Day Immersion",
      description: "Slow down — two days to immerse in the axis's cultural depth. Museums, intangible heritage, and hutong exploration.",
    },
    stops: [
      { spotId: "xiannongtan", zh: { name: "先农坛·古代建筑博物馆", duration: "2小时", highlight: "藻井、古代建筑展" }, en: { name: "Xiannongtan · Architecture Museum", duration: "2 hrs", highlight: "Caisson ceilings, ancient architecture exhibits" } },
      { spotId: "tiantan", zh: { name: "天坛", duration: "2.5小时", highlight: "清晨看晨练，深度游览" }, en: { name: "Temple of Heaven", duration: "2.5 hrs", highlight: "Morning exercise groups, in-depth visit" } },
      { spotId: "qianmen", zh: { name: "前门·大栅栏", duration: "2小时", highlight: "老字号、非遗手工艺" }, en: { name: "Qianmen · Dashilan", duration: "2 hrs", highlight: "Heritage brands, handicrafts" } },
      { spotId: "gugong", zh: { name: "故宫", duration: "3小时", highlight: "珍宝馆、钟表馆、书画展" }, en: { name: "Forbidden City", duration: "3 hrs", highlight: "Treasury, Clock Gallery, Painting exhibitions" } },
      { spotId: "shichahai", zh: { name: "什刹海胡同游", duration: "2小时", highlight: "四合院、黄包车、老北京小吃" }, en: { name: "Shichahai Hutong Tour", duration: "2 hrs", highlight: "Courtyards, rickshaw, Beijing snacks" } },
      { spotId: "zhonggulou", zh: { name: "钟鼓楼", duration: "1.5小时", highlight: "钟楼历史展、鼓楼击鼓表演" }, en: { name: "Bell & Drum Towers", duration: "1.5 hrs", highlight: "Bell Tower history, drum performance" } },
    ],
    tips: {
      zh: ["建议安排两天，第一天南段（先农坛→前门），第二天北段（故宫→钟鼓楼）", "先农坛游客少，可以细细品味", "什刹海胡同游建议请当地导游讲解"],
      en: ["Split into two days: Day 1 south (Xiannongtan→Qianmen), Day 2 north (Forbidden City→Drum Tower)", "Xiannongtan is uncrowded — take your time", "Hire a local guide for the hutong tour at Shichahai"],
    },
  },
];

const accentColors: Record<string, { bg: string; border: string; text: string; hoverText: string; dot: string; glow: string }> = {
  cinnabar: { bg: "bg-cinnabar", border: "border-cinnabar", text: "text-cinnabar", hoverText: "hover:text-cinnabar", dot: "bg-cinnabar", glow: "shadow-[0_4px_16px_rgba(194,59,34,0.25)]" },
  jade: { bg: "bg-jade", border: "border-jade", text: "text-jade", hoverText: "hover:text-jade", dot: "bg-jade", glow: "shadow-[0_4px_16px_rgba(0,128,105,0.2)]" },
  gold: { bg: "bg-gold", border: "border-gold", text: "text-gold", hoverText: "hover:text-gold", dot: "bg-gold", glow: "shadow-[0_4px_16px_rgba(191,155,68,0.2)]" },
};

export default function ItineraryPage() {
  const { locale } = useLocaleStore();
  const [activePlan, setActivePlan] = useState(plans[0].id);

  const current = plans.find((p) => p.id === activePlan)!;
  const accent = accentColors[current.accent];

  // Get spot images for the current plan stops
  const stopImages = current.stops.map((stop) => {
    const spot = spots.find((s) => s.id === stop.spotId);
    return spot?.image || null;
  });

  return (
    <div className="relative z-10">
      {/* Hero — layered composition */}
      <section className="heritage-hero relative h-[58vh] min-h-[440px] overflow-hidden">
        {/* Background image — first stop's spot image */}
        {stopImages[0] && (
          <Image
            src={stopImages[0]}
            alt=""
            fill
            className="object-cover"
            quality={85}
            sizes="100vw"
            priority
          />
        )}
        {/* Multi-layer overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/78 via-ink/58 to-ink/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-transparent" />
        <div className="absolute inset-0 grain-overlay" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            {/* Large decorative number */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[200px] font-bold text-white/[0.03] leading-none select-none pointer-events-none">
              {String(current.stops.length).padStart(2, "0")}
            </div>

            <div className="seal-stamp text-xs tracking-[0.3em] px-4 py-1.5 mx-auto mb-6 inline-block">
              {locale === "zh" ? "行程规划" : "ITINERARY"}
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl text-white mb-5 tracking-wider">
              {locale === "zh" ? "行至中轴" : "Walk the Axis"}
            </h1>
            <p className="text-white/50 font-body text-base max-w-xl mx-auto leading-relaxed">
              {locale === "zh"
                ? "精心规划的游览路线，从半日精华到两日深度，总有一条适合你。"
                : "Carefully planned routes — from half-day essentials to two-day deep dives."}
            </p>
            <div className="mt-8 mx-auto w-24 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

            {/* Stats row */}
            <div className="flex items-center justify-center gap-10 mt-8">
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-white">{current.stops.length}</div>
                <div className="text-white/30 text-xs font-display tracking-widest mt-0.5">{locale === "zh" ? "景点" : "STOPS"}</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-white">
                  {locale === "zh" ? current.zh.subtitle.split("·")[0] : current.en.subtitle.split("·")[0]}
                </div>
                <div className="text-white/30 text-xs font-display tracking-widest mt-0.5">{locale === "zh" ? "主题" : "THEME"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan selector — floating cards */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="heritage-panel flex gap-3 overflow-x-auto rounded-lg p-2">
          {plans.map((p) => {
            const a = accentColors[p.accent];
            const isActive = activePlan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlan(p.id)}
                className={`relative flex-1 max-w-[200px] px-5 py-4 rounded-lg text-sm font-display tracking-wider transition-all duration-400 ${
                  isActive
                    ? `${a.bg} text-white ${a.glow} scale-[1.02]`
                    : "bg-white/60 text-charcoal/60 hover:bg-white hover:text-ink border border-charcoal/5"
                }`}
              >
                <div className="font-bold text-base">{locale === "zh" ? p.zh.title : p.en.title}</div>
                <div className={`text-xs mt-1 ${isActive ? "text-white/70" : "text-charcoal/30"}`}>
                  {locale === "zh" ? p.zh.subtitle : p.en.subtitle}
                </div>
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-inherit" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Plan content */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-20">
        {/* Plan header — with spot image mosaic */}
        <div className="mb-14">
          <div className="flex items-start gap-8">
            {/* Left: image collage of first 2 stops */}
            <div className="hidden md:flex flex-shrink-0 gap-2 w-[280px]">
              {stopImages.slice(0, 2).map((img, i) => (
                <div key={i} className={`relative overflow-hidden rounded-lg ${i === 0 ? "flex-1 h-48" : "w-24 h-48"}`}>
                  {img && (
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      quality={80}
                      sizes="140px"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {/* Stop number overlay */}
                  <div className="absolute bottom-2 left-2">
                    <span className="font-display font-bold text-white/90 text-3xl">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: text */}
            <div className="flex-1">
              <h2 className="font-display font-bold text-3xl text-ink tracking-wider">
                {locale === "zh" ? current.zh.title : current.en.title}
              </h2>
              <p className={`${accent.text} font-display text-sm tracking-widest mt-1.5`}>
                {locale === "zh" ? current.zh.subtitle : current.en.subtitle}
              </p>
              <div className={`mt-4 w-12 h-[2px] ${accent.bg}`} />
              <p className="text-charcoal/50 font-body text-sm mt-4 leading-[1.8] max-w-md">
                {locale === "zh" ? current.zh.description : current.en.description}
              </p>
            </div>
          </div>
        </div>

        {/* Route timeline — refined */}
        <div className="relative">
          {/* Vertical line — gradient from accent color */}
          <div className="absolute left-[29px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-charcoal/10 via-charcoal/8 to-transparent" />

          <div className="space-y-5">
            {current.stops.map((stop, i) => {
              const s = locale === "zh" ? stop.zh : stop.en;
              const spot = spots.find((sp) => sp.id === stop.spotId);
              const isFirst = i === 0;
              const isLast = i === current.stops.length - 1;

              return (
                <div
                  key={stop.spotId}
                  className="relative flex items-start gap-6 animate-fade-in-up group"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {/* Step number — refined circle */}
                  <div className="relative flex-shrink-0 w-[60px] flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isFirst || isLast
                        ? `${accent.bg} text-white shadow-lg`
                        : `bg-white border-2 ${accent.border}/30 ${accent.text}`
                    }`}>
                      <span className="font-display font-bold text-sm">{i + 1}</span>
                    </div>
                    {/* Connector dot for first/last */}
                    {(isFirst || isLast) && (
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isFirst ? "-left-1" : "-right-1"} w-2 h-2 rounded-full ${accent.dot} opacity-40`} />
                    )}
                  </div>

                  {/* Content card — with spot thumbnail */}
                  <div className="paper-surface flex-1 rounded-lg p-5 transition-all duration-300 group-hover:translate-x-1">
                    <div className="flex items-start gap-4">
                      {/* Spot thumbnail */}
                      {spot && (
                        <div className="hidden sm:block flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                          <Image
                            src={spot.image}
                            alt={s.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            quality={75}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/spots/${stop.spotId}?from=itinerary`}
                              className={`font-display font-bold text-lg text-ink transition-colors tracking-wide ${accent.hoverText}`}
                            >
                              {s.name}
                            </Link>
                            <p className="text-charcoal/40 font-body text-sm mt-1.5 leading-relaxed">
                              {s.highlight}
                            </p>
                          </div>
                          <span className={`flex-shrink-0 text-xs px-3 py-1.5 ${accent.bg}/5 ${accent.text} border ${accent.border}/10 rounded-md font-display tracking-wider`}>
                            {s.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips — refined card */}
        <div className="heritage-panel mt-16 rounded-lg p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-8 h-8 rounded-full ${accent.bg}/10 flex items-center justify-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-4 h-4 ${accent.text}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-sm text-ink tracking-wider">
              {locale === "zh" ? "实用贴士" : "Practical Tips"}
            </h3>
          </div>
          <div className="grid gap-3">
            {(locale === "zh" ? current.tips.zh : current.tips.en).map((tip, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <span className={`font-display font-bold text-xs ${accent.text} mt-0.5 w-5 text-right flex-shrink-0`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-charcoal/60 font-body text-sm leading-relaxed">
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — elevated button */}
        <div className="mt-14 text-center">
          <Link
            href="/map"
            className={`inline-flex items-center gap-3 rounded-lg px-10 py-3.5 ${accent.bg} text-sm font-display tracking-[0.15em] text-white transition-all duration-300 hover:opacity-90 ${accent.glow}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
            {locale === "zh" ? "在地图上查看路线" : "View Route on Map"}
          </Link>
        </div>
      </section>
    </div>
  );
}

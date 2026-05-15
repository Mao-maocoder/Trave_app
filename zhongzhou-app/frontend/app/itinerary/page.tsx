"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";

interface Stop {
  spotId: string;
  zh: { name: string; duration: string; highlight: string };
  en: { name: string; duration: string; highlight: string };
}

interface ItineraryPlan {
  id: string;
  icon: string;
  zh: { title: string; subtitle: string; description: string };
  en: { title: string; subtitle: string; description: string };
  stops: Stop[];
  tips: { zh: string[]; en: string[] };
}

const plans: ItineraryPlan[] = [
  {
    id: "classic",
    icon: "🏯",
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
    icon: "⛩️",
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
    icon: "🎭",
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

export default function ItineraryPage() {
  const { locale } = useLocaleStore();
  const [activePlan, setActivePlan] = useState(plans[0].id);

  const current = plans.find((p) => p.id === activePlan)!;

  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-jade/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gold/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="seal-stamp text-xs tracking-[0.3em] px-4 py-1.5 mx-auto mb-6 inline-block">
            {locale === "zh" ? "行程规划" : "ITINERARY"}
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-wider">
            {locale === "zh" ? "行至中轴" : "Walk the Axis"}
          </h1>
          <p className="text-white/50 font-body text-base max-w-xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "精心规划的游览路线，从半日精华到两日深度，总有一条适合你。"
              : "Carefully planned routes — from half-day essentials to two-day deep dives. Find the perfect walk for you."}
          </p>
          <div className="mt-6 mx-auto w-20 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </section>

      {/* Plan selector */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        <div className="flex gap-3 justify-center">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlan(p.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-display tracking-wider transition-all duration-300 shadow-md ${
                activePlan === p.id
                  ? "bg-cinnabar text-white shadow-[0_4px_16px_rgba(194,59,34,0.25)]"
                  : "bg-white text-charcoal/60 hover:text-cinnabar border border-charcoal/5 hover:border-cinnabar/20"
              }`}
            >
              <span>{p.icon}</span>
              <span>{locale === "zh" ? p.zh.title : p.en.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Plan content */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        {/* Plan header */}
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl text-ink tracking-wider">
            {locale === "zh" ? current.zh.title : current.en.title}
          </h2>
          <p className="text-cinnabar font-display text-sm tracking-widest mt-1">
            {locale === "zh" ? current.zh.subtitle : current.en.subtitle}
          </p>
          <p className="text-charcoal/50 font-body text-sm mt-3 max-w-lg mx-auto">
            {locale === "zh" ? current.zh.description : current.en.description}
          </p>
        </div>

        {/* Route timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[28px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-cinnabar/30 via-cinnabar/20 to-transparent" />

          <div className="space-y-6">
            {current.stops.map((stop, i) => {
              const s = locale === "zh" ? stop.zh : stop.en;
              return (
                <div
                  key={stop.spotId}
                  className="relative flex items-start gap-5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Step number */}
                  <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-cinnabar/10 border-2 border-cinnabar/30 flex items-center justify-center">
                      <span className="font-display font-bold text-cinnabar text-sm">
                        {i + 1}
                      </span>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="flex-1 bg-white/70 border border-charcoal/5 rounded-sm p-4 hover:border-cinnabar/15 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/spots/${stop.spotId}`}
                          className="font-display font-bold text-lg text-ink hover:text-cinnabar transition-colors tracking-wide"
                        >
                          {s.name}
                        </Link>
                        <p className="text-jade font-body text-sm mt-1">
                          {s.highlight}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-xs px-2.5 py-1 bg-cinnabar/5 text-cinnabar border border-cinnabar/10 rounded-sm font-display tracking-wider">
                        {s.duration}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-rice-paper-warm/50 border border-charcoal/5 rounded-sm p-6">
          <h3 className="font-display font-bold text-sm text-ink tracking-wider mb-4">
            {locale === "zh" ? "实用贴士" : "Practical Tips"}
          </h3>
          <ul className="space-y-2.5">
            {(locale === "zh" ? current.tips.zh : current.tips.en).map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-cinnabar text-xs mt-0.5">●</span>
                <span className="text-charcoal/60 font-body text-sm leading-relaxed">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/map"
            className="inline-block px-10 py-3 bg-cinnabar text-white font-display tracking-[0.2em] text-sm hover:bg-cinnabar-deep transition-colors duration-300 rounded-sm shadow-[0_4px_20px_rgba(194,59,34,0.3)]"
          >
            {locale === "zh" ? "在地图上查看路线" : "View Route on Map"}
          </Link>
        </div>
      </section>
    </div>
  );
}

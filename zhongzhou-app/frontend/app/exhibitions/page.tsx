"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { PalaceIcon } from "@/components/icons";

interface Exhibition {
  id: string;
  zh: { title: string; subtitle: string };
  en: { title: string; subtitle: string };
  image: string;
  startDate: string;
  endDate: string;
  status: "current" | "permanent" | "upcoming";
  location: string;
  href?: string;
}

const exhibitions: Exhibition[] = [
  {
    id: "caihua",
    zh: { title: "彩画千年", subtitle: "中国官式彩画传承与创新展" },
    en: { title: "A Thousand Years of Caihua", subtitle: "Legacy and Innovation of Chinese Official Decorative Painting" },
    image: "/images/spots/gugong.webp",
    startDate: "2025-05-27",
    endDate: "2025-08-26",
    status: "current",
    location: "故宫博物院",
  },
  {
    id: "jade",
    zh: { title: "玉出昆冈", subtitle: "清代宫廷用玉文化展" },
    en: { title: "Jade from Kunlun", subtitle: "Qing Court Jade Culture Exhibition" },
    image: "/images/spots/tiantan.webp",
    startDate: "2025-01-07",
    endDate: "2026-01-04",
    status: "current",
    location: "故宫博物院",
  },
  {
    id: "horse",
    zh: { title: "腾跃古今", subtitle: "马文化特展" },
    en: { title: "Leaping Through Time", subtitle: "Horse Culture Exhibition" },
    image: "/images/spots/zhonggulou.webp",
    startDate: "2025-06-03",
    endDate: "2026-03-31",
    status: "current",
    location: "首都博物馆",
  },
  {
    id: "glimpses",
    zh: { title: "吉光片羽", subtitle: "故宫常设展" },
    en: { title: "Glimpses of Glory", subtitle: "Permanent Exhibition at the Palace Museum" },
    image: "/images/spots/qianmen.webp",
    startDate: "2020-01-01",
    endDate: "2026-12-31",
    status: "permanent",
    location: "故宫博物院",
  },
  {
    id: "axis-culture",
    zh: { title: "中轴文化展", subtitle: "北京中轴线历史文化展" },
    en: { title: "Central Axis Culture", subtitle: "Beijing Central Axis Historical Exhibition" },
    image: "/images/spots/yongdingmen.webp",
    startDate: "2025-03-01",
    endDate: "2025-12-31",
    status: "current",
    location: "首都博物馆",
  },
  {
    id: "ancient-capital",
    zh: { title: "古都风貌", subtitle: "北京古都风貌展" },
    en: { title: "Ancient Capital Scenery", subtitle: "Beijing Old City Landscape Exhibition" },
    image: "/images/spots/shichahai_wanningqiao.webp",
    startDate: "2025-04-15",
    endDate: "2025-10-15",
    status: "current",
    location: "北京画院",
  },
];

const statusColors: Record<string, { bg: string; text: string; label: { zh: string; en: string } }> = {
  current: { bg: "bg-jade/10 text-jade border-jade/20", text: "text-jade", label: { zh: "进行中", en: "Ongoing" } },
  permanent: { bg: "bg-gold/10 text-gold border-gold/20", text: "text-gold", label: { zh: "常设展", en: "Permanent" } },
  upcoming: { bg: "bg-cinnabar/10 text-cinnabar border-cinnabar/20", text: "text-cinnabar", label: { zh: "即将开幕", en: "Upcoming" } },
};

export default function ExhibitionsPage() {
  const { locale } = useLocaleStore();
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");

  const currentExhibitions = exhibitions.filter((e) => e.status === "current" || e.status === "permanent");

  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="heritage-hero py-20">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="seal-stamp text-xs tracking-[0.3em] px-4 py-1.5 mx-auto mb-6 inline-block">
            {locale === "zh" ? "文化展览" : "EXHIBITIONS"}
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-wider">
            {locale === "zh" ? "正在展出" : "Now Showing"}
          </h1>
          <p className="text-white/50 font-body text-base max-w-xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "中轴线沿线博物馆与美术馆的精彩展览，感受中华文化的深厚底蕴。"
              : "Exhibitions along the Central Axis — museums and galleries showcasing China's cultural heritage."}
          </p>
          <div className="mt-6 mx-auto w-20 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </section>

      {/* Exhibition Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="heritage-panel mb-10 flex w-fit gap-2 rounded-lg p-1.5">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-5 py-2 rounded-sm text-sm font-display tracking-wider transition-all duration-300 ${
              activeTab === "current"
                ? "bg-cinnabar text-white shadow-[0_2px_12px_rgba(194,59,34,0.2)]"
                : "text-charcoal/60 hover:bg-white/50 hover:text-cinnabar"
            }`}
          >
            {locale === "zh" ? "当前展览" : "Current"}
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2 rounded-sm text-sm font-display tracking-wider transition-all duration-300 ${
              activeTab === "past"
                ? "bg-cinnabar text-white shadow-[0_2px_12px_rgba(194,59,34,0.2)]"
                : "text-charcoal/60 hover:bg-white/50 hover:text-cinnabar"
            }`}
          >
            {locale === "zh" ? "全部展览" : "All"}
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === "current" ? currentExhibitions : exhibitions).map((ex, i) => {
            const s = statusColors[ex.status];
            return (
              <div
                key={ex.id}
                className="paper-surface group overflow-hidden rounded-lg hover:border-cinnabar/15 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={ex.image}
                    alt={ex.zh.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    quality={80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2.5 py-1 rounded-sm font-display tracking-wider border ${s.bg}`}>
                      {s.label[locale]}
                    </span>
                  </div>
                  {/* Date */}
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs text-white/70 font-body">
                      {ex.startDate} ~ {ex.endDate}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg text-ink tracking-wide mb-1 group-hover:text-cinnabar transition-colors">
                    {locale === "zh" ? ex.zh.title : ex.en.title}
                  </h3>
                  <p className="text-charcoal/50 font-body text-sm mb-3">
                    {locale === "zh" ? ex.zh.subtitle : ex.en.subtitle}
                  </p>
                  <div className="flex items-center gap-2 text-charcoal/40">
                    <PalaceIcon size={14} />
                    <span className="text-xs font-body">{ex.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state for past tab */}
        {activeTab === "past" && exhibitions.length === 0 && (
          <div className="text-center py-20">
            <PalaceIcon size={48} className="text-charcoal/20 mx-auto mb-4" />
            <p className="text-charcoal/40 font-body">
              {locale === "zh" ? "暂无展览信息" : "No exhibitions available"}
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <div className="heritage-panel rounded-lg p-8">
          <p className="font-display text-lg text-ink/80 mb-2 tracking-wider">
            {locale === "zh" ? "探索更多文化体验" : "Explore More Cultural Experiences"}
          </p>
          <p className="text-charcoal/50 font-body text-sm mb-6">
            {locale === "zh"
              ? "中轴线沿线博物馆全年举办各类精彩展览"
              : "Museums along the Central Axis host exhibitions year-round"}
          </p>
          <Link
            href="/map"
            className="inline-block px-8 py-2.5 bg-cinnabar text-white font-display tracking-[0.15em] text-sm hover:bg-cinnabar-deep transition-colors rounded-sm"
          >
            {locale === "zh" ? "在地图上查看" : "View on Map"}
          </Link>
        </div>
      </section>
    </div>
  );
}

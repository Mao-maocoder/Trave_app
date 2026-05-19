"use client";

import { useState } from "react";
import { useLocaleStore } from "@/stores/localeStore";
import { MapIcon, BowlIcon, ShoppingBagIcon, PalaceIcon, CultureIcon } from "@/components/icons";

interface Handbook {
  id: string;
  category: string;
  Icon: typeof MapIcon;
  zh: { title: string; description: string };
  en: { title: string; description: string };
  pages: number;
  downloads: number;
}

const handbooks: Handbook[] = [
  {
    id: "transport",
    category: "transport",
    Icon: MapIcon,
    zh: { title: "北京中轴线交通指南", description: "详细介绍中轴线各景点的交通方式和路线规划，含地铁、公交、自驾等多种出行方案。" },
    en: { title: "Central Axis Transport Guide", description: "Detailed transportation methods and route planning for attractions along the Axis — metro, bus, driving, and more." },
    pages: 15,
    downloads: 1200,
  },
  {
    id: "forbidden-city",
    category: "culture",
    Icon: PalaceIcon,
    zh: { title: "故宫游览完全手册", description: "故宫游览路线、注意事项和历史文化解读，涵盖三大殿、御花园、珍宝馆等核心区域。" },
    en: { title: "Forbidden City Complete Guide", description: "Tour routes, tips, and historical interpretation — covering the Three Great Halls, Imperial Garden, and Treasury." },
    pages: 25,
    downloads: 2100,
  },
  {
    id: "hutong-stay",
    category: "accommodation",
    Icon: CultureIcon,
    zh: { title: "北京胡同住宿推荐", description: "精选胡同内的特色民宿和酒店推荐，体验老北京四合院的独特魅力。" },
    en: { title: "Hutong Accommodation Guide", description: "Selected boutique homestays and hotels in Beijing's hutongs — experience the charm of traditional courtyards." },
    pages: 12,
    downloads: 890,
  },
  {
    id: "food-map",
    category: "food",
    Icon: BowlIcon,
    zh: { title: "中轴线美食地图", description: "中轴线沿线特色餐厅和小吃推荐，从烤鸭到豆汁，品味地道北京味。" },
    en: { title: "Central Axis Food Map", description: "Specialty restaurants and snacks along the Axis — from Peking duck to douzhir, taste authentic Beijing." },
    pages: 18,
    downloads: 1560,
  },
  {
    id: "shopping",
    category: "shopping",
    Icon: ShoppingBagIcon,
    zh: { title: "北京特色购物指南", description: "中轴线周边特色商品和购物场所推荐，老字号、文创产品、纪念品一站搞定。" },
    en: { title: "Beijing Shopping Guide", description: "Specialty products and shopping venues around the Axis — heritage brands, cultural souvenirs, and more." },
    pages: 10,
    downloads: 750,
  },
  {
    id: "culture-depth",
    category: "culture",
    Icon: PalaceIcon,
    zh: { title: "中轴线文化深度解读", description: "从建筑、礼制、风水三个维度深度解读中轴线的文化内涵。" },
    en: { title: "Central Axis Cultural Deep Dive", description: "In-depth cultural interpretation of the Axis from three dimensions: architecture, ritual, and feng shui." },
    pages: 30,
    downloads: 980,
  },
];

const categories = [
  { id: "all", zh: "全部", en: "All" },
  { id: "transport", zh: "交通", en: "Transport" },
  { id: "accommodation", zh: "住宿", en: "Stay" },
  { id: "food", zh: "美食", en: "Food" },
  { id: "shopping", zh: "购物", en: "Shopping" },
  { id: "culture", zh: "文化", en: "Culture" },
];

export default function HandbookPage() {
  const { locale } = useLocaleStore();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? handbooks
    : handbooks.filter((h) => h.category === activeCategory);

  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="heritage-hero py-20">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="seal-stamp text-xs tracking-[0.3em] px-4 py-1.5 mx-auto mb-6 inline-block">
            {locale === "zh" ? "旅行手册" : "HANDBOOKS"}
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-wider">
            {locale === "zh" ? "出行锦囊" : "Travel Handbooks"}
          </h1>
          <p className="text-white/50 font-body text-base max-w-xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "精心整理的旅行攻略，涵盖交通、住宿、美食、购物、文化方方面面。"
              : "Carefully curated travel guides — transport, accommodation, dining, shopping, and culture."}
          </p>
          <div className="mt-6 mx-auto w-20 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        {/* Category tabs */}
        <div className="heritage-panel chip-scroll mb-10 flex gap-2 overflow-x-auto rounded-lg p-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-sm text-sm font-display tracking-wider whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-cinnabar text-white shadow-[0_2px_12px_rgba(194,59,34,0.2)]"
                  : "bg-white/55 text-charcoal/60 hover:bg-white hover:text-cinnabar border border-charcoal/5"
              }`}
            >
              {locale === "zh" ? cat.zh : cat.en}
            </button>
          ))}
        </div>

        {/* Handbook list */}
        <div className="space-y-4">
          {filtered.map((hb, i) => (
            <div
              key={hb.id}
              className="paper-surface group cursor-pointer rounded-lg p-6 transition-all duration-400 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-cinnabar/5 flex items-center justify-center text-cinnabar/60 group-hover:bg-cinnabar/10 group-hover:text-cinnabar transition-all duration-300">
                  <hb.Icon size={28} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-ink tracking-wide group-hover:text-cinnabar transition-colors">
                        {locale === "zh" ? hb.zh.title : hb.en.title}
                      </h3>
                      <p className="text-charcoal/50 font-body text-sm mt-1.5 leading-relaxed">
                        {locale === "zh" ? hb.zh.description : hb.en.description}
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-5 mt-4">
                    <span className="text-xs text-charcoal/40 font-body">
                      {hb.pages} {locale === "zh" ? "页" : "pages"}
                    </span>
                    <span className="text-xs text-charcoal/40 font-body">
                      {hb.downloads.toLocaleString()} {locale === "zh" ? "次阅读" : "reads"}
                    </span>
                    <span className="text-xs text-cinnabar/60 font-display tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto">
                      {locale === "zh" ? "查看详情 →" : "View details →"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <PalaceIcon size={48} className="text-charcoal/20 mx-auto mb-4" />
            <p className="text-charcoal/40 font-body">
              {locale === "zh" ? "该分类暂无手册" : "No handbooks in this category"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

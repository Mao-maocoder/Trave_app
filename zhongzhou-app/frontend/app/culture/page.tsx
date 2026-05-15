"use client";

import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";

const timeline = [
  {
    year: "1267",
    zh: { title: "元大都奠基", desc: "忽必烈命刘秉忠营建元大都，以积水潭（今什刹海）东岸为基点，确定城市中轴线，奠定北京城700余年的格局。" },
    en: { title: "Yuan Capital Founded", desc: "Kublai Khan ordered Liu Bingzhong to build Dadu (Great Capital). The axis was anchored east of Jishuitan (today's Shichahai), setting Beijing's layout for 700+ years." },
  },
  {
    year: "1420",
    zh: { title: "紫禁城落成", desc: "明永乐帝迁都北京，紫禁城、天坛、先农坛等核心建筑同期建成，中轴线延伸至7.8公里，形成完整序列。" },
    en: { title: "Forbidden City Completed", desc: "Emperor Yongle moved the capital to Beijing. The Forbidden City, Temple of Heaven, and Temple of Agriculture were built, extending the axis to 7.8 km." },
  },
  {
    year: "1553",
    zh: { title: "外城扩建", desc: "嘉靖帝增筑外城，永定门成为中轴线新的南起点，轴线总长约7.8公里，串联起内城、外城的核心建筑群。" },
    en: { title: "Outer City Expanded", desc: "Emperor Jiaji added the outer city. Yongdingmen became the new southern terminus, bringing the axis to ~7.8 km through the urban core." },
  },
  {
    year: "1750",
    zh: { title: "乾隆盛世修缮", desc: "乾隆帝大规模修缮中轴线沿线建筑，景山五亭、天坛祈年殿蓝瓦金顶等标志性形制在此时定型。" },
    en: { title: "Qianlong Renovation", desc: "Emperor Qianlong extensively renovated axis buildings. Jingshan's five pavilions and the Temple of Heaven's blue-tiled golden dome took their current form." },
  },
  {
    year: "1925",
    zh: { title: "故宫博物院成立", desc: "紫禁城从皇家禁地变为全民共享的博物馆，中轴线的核心建筑向公众开放。" },
    en: { title: "Palace Museum Opens", desc: "The Forbidden City transformed from an imperial forbidden zone to a public museum, opening the axis's heart to all." },
  },
  {
    year: "2024",
    zh: { title: "申遗成功", desc: "「北京中轴线——中国理想都城秩序的杰作」列入《世界遗产名录》，成为全球第59项世界文化遗产。" },
    en: { title: "UNESCO Inscription", desc: "'Beijing Central Axis — A Building Ensemble Exhibiting the Ideal Order of the Chinese Capital' was inscribed on the World Heritage List." },
  },
];

const highlights = [
  {
    emoji: "🏯",
    zh: { title: "对称之美", desc: "中轴线东西对称，左祖右社、前朝后市，体现中国传统的\"居中而治\"理念。" },
    en: { title: "Symmetry", desc: "The axis is perfectly symmetrical — ancestral temple left, altar right, court front, market back — embodying the Chinese ideal of 'ruling from the center'." },
  },
  {
    emoji: "🎵",
    zh: { title: "晨钟暮鼓", desc: "钟楼鼓楼定时报时，钟声浑厚、鼓声沉稳，数百年来守护着古都的时间秩序。" },
    en: { title: "Bells & Drums", desc: "The Bell and Drum Towers kept time for centuries — deep bells at dawn, steady drums at dusk — guarding the ancient capital's temporal rhythm." },
  },
  {
    emoji: "🌿",
    zh: { title: "天人合一", desc: "天坛祈年殿的圆形攒尖、方形围墙，象征\"天圆地方\"，是中国古代宇宙观的建筑表达。" },
    en: { title: "Heaven & Earth", desc: "The Temple of Heaven's round hall atop a square wall symbolizes 'round heaven, square earth' — architecture as cosmology." },
  },
  {
    emoji: "🏛️",
    zh: { title: "礼制秩序", desc: "建筑的高度、开间、屋顶形制严格对应等级，从永定门到钟鼓楼，一部用建筑书写的礼制教科书。" },
    en: { title: "Ritual Order", desc: "Building height, bay count, and roof form strictly follow hierarchy — from Yongdingmen to the Drum Tower, architecture as a textbook of ritual propriety." },
  },
];

export default function CulturePage() {
  const { locale } = useLocaleStore();

  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cinnabar/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-jade/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="seal-stamp text-xs tracking-[0.3em] px-4 py-1.5 mx-auto mb-8 inline-block">
            {locale === "zh" ? "世界遗产" : "WORLD HERITAGE"}
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-wider leading-tight">
            {locale === "zh" ? "中轴之魂" : "Soul of the Axis"}
          </h1>
          <p className="text-white/60 font-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "一条贯穿古今的城市脊梁，承载着中华文明对秩序、和谐与永恒的追求。7.8公里，700余年，一部用建筑书写的文明史诗。"
              : "A spine through time, bearing China's pursuit of order, harmony, and eternity. 7.8 kilometers, 700 years — an epic of civilization written in architecture."}
          </p>
          <div className="mt-8 mx-auto w-24 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </section>

      {/* Intro paragraph */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <p className="font-body text-charcoal/70 text-base md:text-lg leading-[1.9] text-center">
          {locale === "zh"
            ? "北京中轴线南起永定门，北至钟鼓楼，全长约7.8公里，是世界上现存最长的城市中轴线。它始建于元代（1267年），历经明清两代的不断完善，串联起15处遗产构成要素——从皇家宫殿到祭祀坛庙，从城市管理设施到公共空间，完整展现了中国古代\"以中为尊\"的都城规划理念。2024年7月，北京中轴线正式列入《世界遗产名录》。"
            : "Beijing's Central Axis stretches from Yongdingmen in the south to the Bell and Drum Towers in the north — approximately 7.8 km, the longest surviving urban axis in the world. Built beginning in 1267 and refined through the Ming and Qing dynasties, it connects 15 heritage components — from imperial palaces to sacrificial temples, from civic infrastructure to public spaces — showcasing China's ancient planning philosophy of 'centering as supreme'. In July 2024, it was officially inscribed on the UNESCO World Heritage List."}
        </p>
      </section>

      {/* Cultural highlights */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-rice-paper-warm/60" />
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink mb-3 tracking-wider">
              {locale === "zh" ? "文化精髓" : "Cultural Essence"}
            </h2>
            <div className="mt-4 mx-auto w-16 h-[2px] bg-gradient-to-r from-transparent via-cinnabar to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="group relative p-7 bg-white/70 border border-charcoal/5 rounded-sm hover:border-cinnabar/20 hover:shadow-lg transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {h.emoji}
                </div>
                <div className="absolute top-3 right-4 font-display text-5xl font-bold text-ink/[0.03] leading-none select-none">
                  {locale === "zh" ? h.zh.title[0] : ""}
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2 tracking-wide">
                  {locale === "zh" ? h.zh.title : h.en.title}
                </h3>
                <p className="text-charcoal/60 text-sm font-body leading-relaxed">
                  {locale === "zh" ? h.zh.desc : h.en.desc}
                </p>
                <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink mb-3 tracking-wider">
            {locale === "zh" ? "七百年脉络" : "700 Years Unfolded"}
          </h2>
          <div className="mt-4 mx-auto w-16 h-[2px] bg-gradient-to-r from-transparent via-cinnabar to-transparent" />
        </div>

        <div className="relative">
          {/* Vertical axis line */}
          <div className="absolute left-[60px] md:left-[72px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-cinnabar/20 via-cinnabar/40 to-cinnabar/20" />

          <div className="space-y-12">
            {timeline.map((item, i) => (
              <div
                key={item.year}
                className="relative flex items-start gap-6 md:gap-8 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Year */}
                <div className="flex-shrink-0 w-[60px] md:w-[72px] text-right">
                  <span className="font-display font-bold text-xl md:text-2xl text-cinnabar tracking-wider">
                    {item.year}
                  </span>
                </div>

                {/* Dot */}
                <div className="relative flex-shrink-0 w-3 h-3 mt-2.5">
                  <div className="absolute inset-0 rounded-full bg-cinnabar" />
                  <div className="absolute inset-[-4px] rounded-full border-2 border-cinnabar/30" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <h3 className="font-display font-bold text-lg text-ink mb-1.5 tracking-wide">
                    {locale === "zh" ? item.zh.title : item.en.title}
                  </h3>
                  <p className="text-charcoal/60 font-body text-sm leading-relaxed">
                    {locale === "zh" ? item.zh.desc : item.en.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-cinnabar/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "7.8", unit: locale === "zh" ? "公里" : "km", label: locale === "zh" ? "轴线全长" : "Axis Length" },
              { value: "700+", unit: locale === "zh" ? "年" : "yrs", label: locale === "zh" ? "历史跨度" : "Years of History" },
              { value: "15", unit: locale === "zh" ? "处" : "", label: locale === "zh" ? "遗产构成要素" : "Heritage Components" },
              { value: "2024", unit: "", label: locale === "zh" ? "列入世遗" : "UNESCO Listed" },
            ].map((n, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="font-display font-bold text-4xl md:text-5xl text-gold mb-1">
                  {n.value}
                  <span className="text-lg md:text-xl text-gold/60 ml-1">{n.unit}</span>
                </div>
                <p className="text-white/40 font-body text-sm tracking-wide">{n.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="font-display text-2xl md:text-3xl text-ink/80 mb-2 tracking-wider">
            {locale === "zh" ? "亲历中轴，感知文明" : "Walk the Axis, Feel the Civilization"}
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

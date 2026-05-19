"use client";

import { useState } from "react";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";
import { TipIcon, HandWaveIcon, MapIcon, BowlIcon, ShoppingBagIcon, PalaceIcon, EmergencyIcon } from "@/components/icons";

interface Phrase {
  zh: string;
  pinyin: string;
  en: string;
}

interface Category {
  id: string;
  Icon: typeof HandWaveIcon;
  zh: string;
  en: string;
  phrases: Phrase[];
}

const categories: Category[] = [
  {
    id: "greetings",
    Icon: HandWaveIcon,
    zh: "基本问候",
    en: "Greetings",
    phrases: [
      { zh: "你好", pinyin: "Nǐ hǎo", en: "Hello" },
      { zh: "谢谢", pinyin: "Xiè xie", en: "Thank you" },
      { zh: "不客气", pinyin: "Bú kè qi", en: "You're welcome" },
      { zh: "对不起", pinyin: "Duì bu qǐ", en: "Sorry" },
      { zh: "没关系", pinyin: "Méi guān xi", en: "It's okay" },
      { zh: "再见", pinyin: "Zài jiàn", en: "Goodbye" },
      { zh: "请", pinyin: "Qǐng", en: "Please" },
      { zh: "麻烦你了", pinyin: "Má fan nǐ le", en: "Sorry to trouble you" },
    ],
  },
  {
    id: "directions",
    Icon: MapIcon,
    zh: "问路出行",
    en: "Directions",
    phrases: [
      { zh: "请问，怎么去……？", pinyin: "Qǐng wèn, zěn me qù…?", en: "Excuse me, how do I get to…?" },
      { zh: "这里离……远吗？", pinyin: "Zhè lí…yuǎn ma?", en: "Is it far from here to…?" },
      { zh: "最近的地铁站在哪？", pinyin: "Zuì jìn de dì tiě zhàn zài nǎ?", en: "Where is the nearest subway station?" },
      { zh: "请帮我叫一辆出租车", pinyin: "Qǐng bāng wǒ jiào yī liàng chū zū chē", en: "Please call me a taxi" },
      { zh: "左转 / 右转 / 直走", pinyin: "Zuǒ zhuǎn / Yòu zhuǎn / Zhí zǒu", en: "Turn left / Turn right / Go straight" },
      { zh: "我迷路了", pinyin: "Wǒ mí lù le", en: "I'm lost" },
      { zh: "请用中文写下来", pinyin: "Qǐng yòng Zhōng wén xiě xià lái", en: "Please write it down in Chinese" },
    ],
  },
  {
    id: "food",
    Icon: BowlIcon,
    zh: "餐饮美食",
    en: "Dining",
    phrases: [
      { zh: "请给我菜单", pinyin: "Qǐng gěi wǒ cài dān", en: "May I have the menu, please" },
      { zh: "我要这个", pinyin: "Wǒ yào zhè ge", en: "I want this one" },
      { zh: "不要辣的", pinyin: "Bú yào là de", en: "No spicy food, please" },
      { zh: "我对花生过敏", pinyin: "Wǒ duì huā shēng guò mǐn", en: "I'm allergic to peanuts" },
      { zh: "买单", pinyin: "Mǎi dān", en: "Check, please" },
      { zh: "可以扫码支付吗？", pinyin: "Kě yǐ sǎo mǎ zhī fù ma?", en: "Can I pay by scanning QR code?" },
      { zh: "推荐一下特色菜", pinyin: "Tuī jiàn yī xià tè sè cài", en: "What do you recommend?" },
      { zh: "打包", pinyin: "Dǎ bāo", en: "Takeaway / To go" },
    ],
  },
  {
    id: "shopping",
    Icon: ShoppingBagIcon,
    zh: "购物消费",
    en: "Shopping",
    phrases: [
      { zh: "这个多少钱？", pinyin: "Zhè ge duō shao qián?", en: "How much is this?" },
      { zh: "太贵了", pinyin: "Tài guì le", en: "Too expensive" },
      { zh: "可以便宜一点吗？", pinyin: "Kě yǐ pián yi yī diǎn ma?", en: "Can you make it cheaper?" },
      { zh: "可以试穿吗？", pinyin: "Kě yǐ shì chuān ma?", en: "Can I try it on?" },
      { zh: "有大一号的吗？", pinyin: "Yǒu dà yī hào de ma?", en: "Do you have one size bigger?" },
      { zh: "我要买这个", pinyin: "Wǒ yào mǎi zhè ge", en: "I'd like to buy this" },
      { zh: "可以开发票吗？", pinyin: "Kě yǐ kāi fā piào ma?", en: "Can I get a receipt?" },
    ],
  },
  {
    id: "attractions",
    Icon: PalaceIcon,
    zh: "景点游览",
    en: "Sightseeing",
    phrases: [
      { zh: "门票多少钱？", pinyin: "Mén piào duō shao qián?", en: "How much is the ticket?" },
      { zh: "可以拍照吗？", pinyin: "Kě yǐ pāi zhào ma?", en: "Can I take photos here?" },
      { zh: "请问开放时间是几点？", pinyin: "Qǐng wèn kāi fàng shí jiān shì jǐ diǎn?", en: "What are the opening hours?" },
      { zh: "有中文讲解吗？", pinyin: "Yǒu Zhōng wén jiǎng jiě ma?", en: "Is there a Chinese audio guide?" },
      { zh: "洗手间在哪里？", pinyin: "Xǐ shǒu jiān zài nǎ lǐ?", en: "Where is the restroom?" },
      { zh: "这个地方有什么历史？", pinyin: "Zhè ge dì fang yǒu shén me lì shǐ?", en: "What is the history of this place?" },
      { zh: "需要提前预约吗？", pinyin: "Xū yào tí qián yù yuē ma?", en: "Do I need to book in advance?" },
    ],
  },
  {
    id: "emergency",
    Icon: EmergencyIcon,
    zh: "紧急求助",
    en: "Emergency",
    phrases: [
      { zh: "请帮帮我！", pinyin: "Qǐng bāng bang wǒ!", en: "Please help me!" },
      { zh: "请叫救护车", pinyin: "Qǐng jiào jiù hù chē", en: "Please call an ambulance" },
      { zh: "我丢了护照", pinyin: "Wǒ diū le hù zhào", en: "I lost my passport" },
      { zh: "请报警", pinyin: "Qǐng bào jǐng", en: "Please call the police" },
      { zh: "我需要去医院", pinyin: "Wǒ xū yào qù yī yuàn", en: "I need to go to the hospital" },
      { zh: "我不会说中文", pinyin: "Wǒ bú huì shuō Zhōng wén", en: "I don't speak Chinese" },
      { zh: "请说慢一点", pinyin: "Qǐng shuō màn yī diǎn", en: "Please speak more slowly" },
    ],
  },
];

export default function TranslationPage() {
  const { locale } = useLocaleStore();
  const [active, setActive] = useState(categories[0].id);
  const [copied, setCopied] = useState<string | null>(null);

  const current = categories.find((c) => c.id === active)!;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="heritage-hero">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14">
          <div className="seal-stamp text-xs tracking-[0.3em] w-fit px-3 py-1 mb-4">
            {locale === "zh" ? "旅行用语" : "TRAVEL PHRASEBOOK"}
          </div>
          <h1 className="font-display font-bold text-4xl text-white tracking-wide md:text-5xl">
            {t(locale, "nav.translation")}
          </h1>
          <p className="text-white/58 font-body text-sm mt-3 max-w-xl leading-7">
            {locale === "zh"
              ? "实用旅行短语，点击即可复制。告别语言障碍，畅游中轴线。"
              : "Practical travel phrases — tap to copy. Break the language barrier and explore the Central Axis with ease."}
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 pt-6 pb-6">
        <div className="heritage-panel chip-scroll flex gap-2 overflow-x-auto rounded-lg p-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-display tracking-wider whitespace-nowrap transition-all duration-300 ${
                active === cat.id
                  ? "bg-cinnabar text-white shadow-[0_2px_12px_rgba(194,59,34,0.2)]"
                  : "bg-white/55 text-charcoal/60 hover:bg-white hover:text-cinnabar border border-charcoal/5"
              }`}
            >
              <cat.Icon size={16} />
              <span>{locale === "zh" ? cat.zh : cat.en}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Phrase list */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="space-y-3">
          {current.phrases.map((p, i) => (
            <div
              key={i}
              className="paper-surface group cursor-pointer rounded-lg p-4 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => handleCopy(p.zh)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-lg text-ink tracking-wide">
                    {p.zh}
                  </p>
                  <p className="text-charcoal/40 font-body text-sm mt-1">
                    {p.pinyin}
                  </p>
                  <p className="text-jade font-body text-sm mt-1">
                    {p.en}
                  </p>
                </div>
                <div className="flex-shrink-0 mt-1">
                  {copied === p.zh ? (
                    <span className="text-xs text-jade font-display tracking-wider">
                      {locale === "zh" ? "已复制" : "Copied"}
                    </span>
                  ) : (
                    <span className="text-xs text-charcoal/20 group-hover:text-cinnabar/50 font-display tracking-wider transition-colors">
                      {locale === "zh" ? "点击复制" : "Tap to copy"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage tip */}
        <div className="mt-10 text-center">
          <div className="heritage-panel inline-flex items-center gap-2 rounded-lg px-4 py-2">
            <TipIcon size={16} className="text-gold" />
            <span className="text-xs text-charcoal/40 font-body">
              {locale === "zh"
                ? "点击短语即可复制到剪贴板，直接粘贴给对方看"
                : "Tap any phrase to copy it — show it to the person you're talking to"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

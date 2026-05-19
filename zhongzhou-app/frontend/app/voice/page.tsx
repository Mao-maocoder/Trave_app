"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLocaleStore } from "@/stores/localeStore";
import { TipIcon } from "@/components/icons";

interface Phrase {
  zh: string;
  pinyin: string;
  en: string;
}

const phrases: Phrase[] = [
  { zh: "你好，请问怎么去故宫？", pinyin: "Nǐ hǎo, qǐng wèn zěn me qù Gù gōng?", en: "Hello, how do I get to the Forbidden City?" },
  { zh: "谢谢你的帮助", pinyin: "Xiè xie nǐ de bāng zhù", en: "Thank you for your help" },
  { zh: "这个多少钱？", pinyin: "Zhè ge duō shao qián?", en: "How much is this?" },
  { zh: "请问洗手间在哪里？", pinyin: "Qǐng wèn xǐ shǒu jiān zài nǎ lǐ?", en: "Where is the restroom?" },
  { zh: "我要一份北京烤鸭", pinyin: "Wǒ yào yī fèn Běi jīng kǎo yā", en: "I'd like a Peking duck, please" },
  { zh: "请帮我拍张照片", pinyin: "Qǐng bāng wǒ pāi zhāng zhào piàn", en: "Could you take a photo for me?" },
  { zh: "最近的地铁站怎么走？", pinyin: "Zuì jìn de dì tiě zhàn zěn me zǒu?", en: "How do I get to the nearest subway station?" },
  { zh: "这里有什么推荐的菜？", pinyin: "Zhè lǐ yǒu shén me tuī jiàn de cài?", en: "What do you recommend here?" },
  { zh: "我想去天坛", pinyin: "Wǒ xiǎng qù Tiān tán", en: "I want to go to the Temple of Heaven" },
  { zh: "可以便宜一点吗？", pinyin: "Kě yǐ pián yi yī diǎn ma?", en: "Can you make it cheaper?" },
  { zh: "我不太舒服，需要帮助", pinyin: "Wǒ bú tài shū fu, xū yào bāng zhù", en: "I'm not feeling well, I need help" },
  { zh: "这个地方叫什么名字？", pinyin: "Zhè ge dì fang jiào shén me míng zì?", en: "What is this place called?" },
];

export default function VoicePage() {
  const { locale } = useLocaleStore();
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [activePhrase, setActivePhrase] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const speak = useCallback((text: string, lang: string, key: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(key);
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => setSpeaking(null);
    window.speechSynthesis.speak(utterance);
  }, []);

  const handlePlayZh = (p: Phrase, i: number) => {
    setActivePhrase(i);
    speak(p.zh, "zh-CN", `zh-${i}`);
  };

  const handlePlayEn = (p: Phrase, i: number) => {
    setActivePhrase(i);
    speak(p.en, "en-US", `en-${i}`);
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setListening(true);
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="heritage-hero py-20">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="seal-stamp text-xs tracking-[0.3em] px-4 py-1.5 mx-auto mb-6 inline-block">
            {locale === "zh" ? "语音工具" : "VOICE TOOL"}
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-wider">
            {locale === "zh" ? "开口说中文" : "Speak Chinese"}
          </h1>
          <p className="text-white/50 font-body text-base max-w-xl mx-auto leading-relaxed">
            {locale === "zh"
              ? "点击播放按钮听发音，用语音识别练习你的中文。基于浏览器语音合成，无需联网。"
              : "Tap play to hear pronunciation, use voice recognition to practice your Chinese. Powered by browser speech synthesis — works offline."}
          </p>
          <div className="mt-6 mx-auto w-20 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </section>

      {/* Voice recognition section */}
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <div className="heritage-panel rounded-lg p-6 text-center">
          <h2 className="font-display font-bold text-lg text-ink tracking-wider mb-2">
            {locale === "zh" ? "语音识别练习" : "Speech Recognition Practice"}
          </h2>
          <p className="text-charcoal/40 font-body text-sm mb-6">
            {locale === "zh"
              ? "对着麦克风说一句中文，看看识别结果"
              : "Speak a Chinese phrase into your microphone and see the result"}
          </p>

          <button
            onClick={listening ? handleStopListening : handleStartListening}
            disabled={!supported}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
              listening
                ? "bg-cinnabar text-white shadow-[0_0_30px_rgba(194,59,34,0.4)] animate-pulse"
                : supported
                  ? "bg-cinnabar/10 text-cinnabar hover:bg-cinnabar/20 hover:shadow-lg"
                  : "bg-charcoal/10 text-charcoal/30 cursor-not-allowed"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
              <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.041h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.041a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
            </svg>
          </button>

          <p className="text-xs text-charcoal/30 font-body mt-3">
            {supported
              ? (listening
                ? (locale === "zh" ? "正在聆听..." : "Listening...")
                : (locale === "zh" ? "点击麦克风开始" : "Tap the microphone to start"))
              : (locale === "zh" ? "你的浏览器不支持语音识别" : "Speech recognition is not supported in your browser")}
          </p>

          {transcript && (
            <div className="mt-4 p-4 bg-jade/5 border border-jade/10 rounded-sm">
              <p className="text-xs text-jade font-display tracking-wider mb-1">
                {locale === "zh" ? "识别结果" : "Result"}
              </p>
              <p className="font-display font-bold text-lg text-ink">{transcript}</p>
              <button
                onClick={() => speak(transcript, "zh-CN", "recognition")}
                className="mt-2 text-xs text-cinnabar hover:text-cinnabar-deep font-display tracking-wider"
              >
                {speaking === "recognition" ? (locale === "zh" ? "播放中..." : "Playing...") : (locale === "zh" ? "播放发音" : "Play pronunciation")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Phrase list */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="font-display font-bold text-xl text-ink tracking-wider mb-6 text-center">
          {locale === "zh" ? "常用旅行短语" : "Common Travel Phrases"}
        </h2>

        <div className="space-y-3">
          {phrases.map((p, i) => (
            <div
              key={i}
              className={`paper-surface group rounded-lg p-4 transition-all duration-300 animate-fade-in-up ${
                activePhrase === i ? "border-cinnabar/20 shadow-md" : "hover:border-cinnabar/15"
              }`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-lg text-ink tracking-wide">
                    {p.zh}
                  </p>
                  <p className="text-charcoal/40 font-body text-sm mt-0.5">
                    {p.pinyin}
                  </p>
                  <p className="text-jade font-body text-sm mt-0.5">
                    {p.en}
                  </p>
                </div>

                {/* Play buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handlePlayZh(p, i)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      speaking === `zh-${i}`
                        ? "bg-cinnabar text-white shadow-md"
                        : "bg-cinnabar/10 text-cinnabar hover:bg-cinnabar/20"
                    }`}
                    title={locale === "zh" ? "播放中文" : "Play Chinese"}
                  >
                    {speaking === `zh-${i}` ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-xs font-display font-bold">中</span>
                    )}
                  </button>
                  <button
                    onClick={() => handlePlayEn(p, i)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      speaking === `en-${i}`
                        ? "bg-jade text-white shadow-md"
                        : "bg-jade/10 text-jade hover:bg-jade/20"
                    }`}
                    title={locale === "zh" ? "播放英文" : "Play English"}
                  >
                    {speaking === `en-${i}` ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-xs font-display font-bold">EN</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-10 text-center">
          <div className="heritage-panel inline-flex items-center gap-2 rounded-lg px-4 py-2">
            <TipIcon size={16} className="text-gold" />
            <span className="text-xs text-charcoal/40 font-body">
              {locale === "zh"
                ? "点击「中」听中文发音，点击「EN」听英文翻译"
                : "Tap '中' for Chinese pronunciation, 'EN' for English translation"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

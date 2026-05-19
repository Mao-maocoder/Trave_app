"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { spots } from "@/lib/spots";
import { ReturnIcon } from "@/components/icons";

interface HistoryItem {
  spotId: string;
  visitedAt: Date;
  duration: string;
}

// Simulated browsing history
const mockHistory: HistoryItem[] = [
  { spotId: "gugong", visitedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), duration: "45 min" },
  { spotId: "tiantan", visitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), duration: "30 min" },
  { spotId: "zhonggulou", visitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), duration: "20 min" },
  { spotId: "shichahai", visitedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), duration: "35 min" },
  { spotId: "qianmen", visitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), duration: "25 min" },
  { spotId: "yongdingmen", visitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), duration: "15 min" },
];

function formatRelativeDate(date: Date, locale: string): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return locale === "zh" ? "刚刚" : "Just now";
  if (hours < 24) return locale === "zh" ? `${hours}小时前` : `${hours}h ago`;
  if (days < 7) return locale === "zh" ? `${days}天前` : `${days}d ago`;
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US");
}

export default function HistoryPage() {
  const { locale } = useLocaleStore();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // In a real app, fetch from API
    // For now, use localStorage
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("browsing_history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((item: { spotId: string; visitedAt: string; duration: string }) => ({
          ...item,
          visitedAt: new Date(item.visitedAt),
        }));
        setHistory(parsed);
      } catch {
        setHistory(mockHistory);
      }
    } else {
      setHistory(mockHistory);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("browsing_history");
  };

  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="heritage-hero py-12">
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <Link href="/profile" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6">
            <ReturnIcon size={16} />
            <span className="font-display text-sm tracking-wider">{locale === "zh" ? "返回" : "Back"}</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-3xl text-white tracking-wider">
                {locale === "zh" ? "浏览历史" : "Browsing History"}
              </h1>
              <p className="text-white/50 font-body text-sm mt-2">
                {locale === "zh" ? "最近浏览过的景点" : "Recently viewed spots"}
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-1.5 text-xs font-display text-white/50 border border-white/20 rounded-sm hover:text-white hover:border-white/40 transition-colors tracking-wider"
              >
                {locale === "zh" ? "清除" : "Clear"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* History list */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        {history.length === 0 ? (
          <div className="text-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-charcoal/20 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-charcoal/40 font-body">
              {locale === "zh" ? "还没有浏览记录" : "No browsing history yet"}
            </p>
            <Link href="/map" className="text-cinnabar text-xs font-display tracking-wider mt-3 inline-block">
              {locale === "zh" ? "去探索景点 →" : "Explore spots →"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => {
              const spot = spots.find((s) => s.id === item.spotId);
              if (!spot) return null;
              return (
                <Link
                  key={`${item.spotId}-${i}`}
                  href={`/spots/${item.spotId}?from=history`}
                  className="paper-surface group flex items-center gap-4 rounded-lg p-4 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={spot.image}
                      alt={spot.name[locale]}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      quality={75}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-sm text-ink group-hover:text-cinnabar transition-colors tracking-wide">
                      {spot.name[locale]}
                    </h3>
                    <p className="text-charcoal/40 font-body text-xs mt-0.5">
                      {spot.subtitle[locale]}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-charcoal/40 font-body text-xs">
                      {formatRelativeDate(item.visitedAt, locale)}
                    </p>
                    <p className="text-charcoal/30 font-body text-[10px] mt-0.5">
                      {locale === "zh" ? `停留 ${item.duration}` : `${item.duration}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

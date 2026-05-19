"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { spots } from "@/lib/spots";
import { useLocaleStore } from "@/stores/localeStore";
import { CancelIcon } from "@/components/icons";

interface SearchOverlayProps {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const { locale } = useLocaleStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = query.trim()
    ? spots.filter((s) => {
        const q = query.toLowerCase();
        return (
          s.name.zh.includes(q) ||
          s.name.en.toLowerCase().includes(q) ||
          s.subtitle.zh.includes(q) ||
          s.subtitle.en.toLowerCase().includes(q) ||
          s.description.zh.includes(q) ||
          s.description.en.toLowerCase().includes(q) ||
          s.tags.zh.some((t) => t.includes(q)) ||
          s.tags.en.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-[150] isolate">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <div className="max-w-2xl mx-auto px-4 pt-20 pointer-events-auto animate-fade-in-up">
          {/* Search input */}
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={locale === "zh" ? "搜索景点、标签..." : "Search spots, tags..."}
              className="w-full pl-12 pr-12 py-4 bg-white rounded-sm shadow-xl border border-charcoal/10 focus:outline-none focus:border-cinnabar/30 text-ink font-body text-base"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-ink transition-colors"
            >
              <CancelIcon size={20} />
            </button>
          </div>

          {/* Results */}
          {query.trim() && (
            <div className="mt-2 bg-white rounded-sm shadow-xl border border-charcoal/10 max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-charcoal/30 font-body text-sm">
                    {locale === "zh" ? "没有找到匹配的景点" : "No matching spots found"}
                  </p>
                </div>
              ) : (
                results.map((spot) => (
                  <Link
                    key={spot.id}
                    href={`/spots/${spot.id}?from=search`}
                    onClick={onClose}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-charcoal/3 transition-colors border-b border-charcoal/5 last:border-0"
                  >
                    <div className="relative w-12 h-12 rounded-sm overflow-hidden flex-shrink-0 bg-charcoal/5">
                      <Image
                        src={spot.image}
                        alt={spot.name[locale]}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-ink">
                        {spot.name[locale]}
                      </p>
                      <p className="text-charcoal/40 font-body text-xs mt-0.5">
                        {spot.subtitle[locale]}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {spot.tags[locale].slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 bg-cinnabar/5 text-cinnabar/70 rounded-sm font-body"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Quick suggestions when empty */}
          {!query.trim() && (
            <div className="mt-2 bg-white rounded-sm shadow-xl border border-charcoal/10 px-5 py-4">
              <p className="text-xs text-charcoal/30 font-display tracking-wider mb-3">
                {locale === "zh" ? "热门搜索" : "Popular searches"}
              </p>
              <div className="flex flex-wrap gap-2">
                {(locale === "zh"
                  ? ["故宫", "天坛", "钟鼓楼", "前门", "什刹海"]
                  : ["Forbidden City", "Temple of Heaven", "Bell Tower"]
                ).map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 text-xs font-body text-charcoal/60 bg-charcoal/5 hover:bg-cinnabar/5 hover:text-cinnabar rounded-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { spots } from "@/lib/spots";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function MapPage() {
  const { locale } = useLocaleStore();
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null);

  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="heritage-hero">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14">
          <div className="seal-stamp text-xs tracking-[0.3em] w-fit px-3 py-1 mb-4">
            {locale === "zh" ? "地图导航" : "MAP"}
          </div>
          <h1 className="font-display font-bold text-4xl text-white tracking-wide md:text-5xl">
            {t(locale, "nav.map")}
          </h1>
          <p className="text-white/58 font-body mt-3 max-w-xl leading-7">
            {locale === "zh"
              ? "北京中轴线七大核心景点分布，一眼看清南北游览动线。"
              : "Seven core attractions on Beijing's Central Axis, arranged from south to north."}
          </p>
        </div>
      </section>

      {/* Spot list chips */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 pt-6 pb-4">
        <div className="heritage-panel chip-scroll flex gap-2 overflow-x-auto rounded-lg p-3">
          {spots.map((spot, i) => (
            <button
              key={spot.id}
              onClick={() => setActiveSpotId(spot.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-display tracking-wider rounded-sm border transition-all ${
                activeSpotId === spot.id
                  ? "bg-cinnabar text-white border-cinnabar"
                  : "bg-white/55 text-charcoal/70 border-charcoal/10 hover:border-cinnabar/40 hover:text-cinnabar"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-cinnabar/10 flex items-center justify-center text-[10px] font-bold text-cinnabar">
                {i + 1}
              </span>
              {spot.name[locale]}
            </button>
          ))}
        </div>
      </section>

      {/* Map */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="paper-surface relative h-[540px] overflow-hidden rounded-lg p-2">
          <div className="relative h-full overflow-hidden rounded-md border border-charcoal/10">
          <MapView
            spots={spots}
            activeSpotId={activeSpotId}
            onSpotClick={setActiveSpotId}
          />
          </div>
        </div>
      </section>

      {/* Spot cards */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {spots.map((spot, i) => (
            <Link
              key={spot.id}
              href={`/spots/${spot.id}?from=map`}
              className="paper-surface group flex items-center gap-4 rounded-lg p-4 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-cinnabar/10 flex items-center justify-center text-cinnabar font-display font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm text-ink tracking-wide group-hover:text-cinnabar transition-colors">
                  {spot.name[locale]}
                </p>
                <p className="text-charcoal/40 font-body text-xs mt-0.5 truncate">
                  {spot.subtitle[locale]}
                </p>
              </div>
              <span className="text-charcoal/20 text-sm group-hover:text-cinnabar transition-colors">›</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

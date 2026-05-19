"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";
import type { Spot } from "@/lib/spots";

interface SpotCardProps {
  spot: Spot;
  index?: number;
}

export default function SpotCard({ spot, index = 0 }: SpotCardProps) {
  const { locale } = useLocaleStore();

  return (
    <Link
      href={`/spots/${spot.id}?from=home`}
      className="group block card-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="paper-surface relative overflow-hidden rounded-lg">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden grain-overlay">
          <Image
            src={spot.image}
            alt={spot.name[locale]}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            quality={85}
            sizes="300px"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/16 to-transparent z-[2]" />

          {/* Number badge — top left */}
          <div className="absolute top-3 left-3 z-[3]">
            <div className="flex h-8 w-10 items-center justify-center rounded-sm border border-white/28 bg-black/26 text-xs font-display font-bold text-white shadow-md backdrop-blur-md">
              {String(index + 1).padStart(2, "0")}
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-[3]">
            <h3 className="font-display font-bold text-xl text-white mb-1 tracking-wide">
              {spot.name[locale]}
            </h3>
            <p className="text-white/70 text-xs font-body">
              {spot.subtitle[locale]}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <p className="text-charcoal/70 text-sm leading-relaxed line-clamp-2 font-body">
            {spot.description[locale]}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {spot.tags[locale].slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-cinnabar/10 bg-cinnabar/5 px-2 py-1 text-[10px] font-display tracking-wider text-cinnabar"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-cinnabar font-display tracking-wider group-hover:tracking-widest transition-all duration-300">
              {t(locale, "spots.viewDetail")}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-cinnabar/15 text-cinnabar/70 transition-all duration-300 group-hover:translate-x-1 group-hover:border-cinnabar/35 group-hover:bg-cinnabar group-hover:text-white">
              →
            </span>
          </div>
        </div>

        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  );
}

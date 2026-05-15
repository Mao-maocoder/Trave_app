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
      href={`/spots/${spot.id}`}
      className="group block card-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative bg-white rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-charcoal/5">
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden grain-overlay">
          <Image
            src={spot.image}
            alt={spot.name[locale]}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            quality={85}
            sizes="300px"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-[2]" />

          {/* Number badge — top left */}
          <div className="absolute top-3 left-3 z-[3]">
            <div className="w-8 h-8 flex items-center justify-center bg-cinnabar/90 text-white font-display font-bold text-sm rounded-sm shadow-md">
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
        <div className="p-4">
          <p className="text-charcoal/70 text-sm leading-relaxed line-clamp-2 font-body">
            {spot.description[locale]}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {spot.tags[locale].slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-display tracking-wider text-cinnabar bg-cinnabar/5 border border-cinnabar/10 rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-cinnabar font-display tracking-wider group-hover:tracking-widest transition-all duration-300">
              {t(locale, "spots.viewDetail")}
            </span>
            <span className="text-cinnabar/60 group-hover:text-cinnabar group-hover:translate-x-1 transition-all duration-300">
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

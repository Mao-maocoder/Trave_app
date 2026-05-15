"use client";

import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSpotById, spots } from "@/lib/spots";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { t } from "@/lib/i18n";
import { useState, useEffect } from "react";

export default function SpotDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { locale } = useLocaleStore();
  const { token } = useAuthStore();
  const spot = getSpotById(params.id as string);
  const from = searchParams.get("from");
  const backHref = from === "community" ? "/community" : from === "photo-wall" ? "/photo-wall" : "/";
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setFavorited(data.favorites?.includes(params.id)))
      .catch(() => {});
  }, [token, params.id]);

  const handleToggleFavorite = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/favorites/${params.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFavorited(data.favorited);
    } catch {
      // ignore
    }
  };

  if (!spot) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-ink mb-4">
            {locale === "zh" ? "景点未找到" : "Spot not found"}
          </h1>
          <Link href={backHref} className="text-cinnabar hover:text-cinnabar-deep font-display text-sm tracking-wider">
            ← {t(locale, "spots.back")}
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = spots.findIndex((s) => s.id === spot.id);
  const spotNumber = String(currentIndex + 1).padStart(2, "0");
  const prevSpot = currentIndex > 0 ? spots[currentIndex - 1] : null;
  const nextSpot = currentIndex < spots.length - 1 ? spots[currentIndex + 1] : null;

  return (
    <div className="relative z-10">
      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={spot.image}
          alt={spot.name[locale]}
          fill
          className="object-cover animate-ink-spread"
          quality={90}
          sizes="100vw"
          priority
        />
        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        {/* Grain */}
        <div className="absolute inset-0 grain-overlay" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 pb-10 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back link */}
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 font-body transition-colors"
            >
              <span className="text-lg">←</span>
              {t(locale, "spots.back")}
            </Link>

            {/* Number + Title */}
            <div className="flex items-end gap-4">
              <span className="font-display text-8xl font-bold text-white/10 leading-none select-none">
                {spotNumber}
              </span>
              <div>
                <h1 className="font-display font-bold text-5xl text-white tracking-wide">
                  {spot.name[locale]}
                </h1>
                <p className="text-white/60 text-base mt-2 font-body">
                  {spot.subtitle[locale]}
                </p>
              </div>
              {token && (
                <button
                  onClick={handleToggleFavorite}
                  className="ml-auto flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all"
                  title={favorited ? (locale === "zh" ? "取消收藏" : "Unfavorite") : (locale === "zh" ? "收藏" : "Favorite")}
                >
                  <span className="text-xl">{favorited ? "❤️" : "🤍"}</span>
                </button>
              )}
            </div>

            {/* Decorative line */}
            <div className="mt-6 h-[2px] w-20 bg-gradient-to-r from-cinnabar via-gold to-transparent" />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10 animate-fade-in-up">
          {spot.tags[locale].map((tag) => (
            <span
              key={tag}
              className="seal-stamp text-xs tracking-[0.15em]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <section className="mb-16 animate-fade-in-up delay-100">
          <p className="text-charcoal/80 text-lg leading-[1.9] font-body">
            {spot.description[locale]}
          </p>
        </section>

        {/* History */}
        <section className="mb-16 animate-fade-in-up delay-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📜</span>
            <h2 className="font-display font-bold text-2xl text-ink tracking-wide">
              {t(locale, "spots.history")}
            </h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-charcoal/10 to-transparent" />
          </div>
          <div className="relative pl-6 border-l-2 border-cinnabar/20">
            <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-cinnabar" />
            <p className="text-charcoal/70 leading-[1.9] font-body">
              {spot.history[locale]}
            </p>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-16 animate-fade-in-up delay-300">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">💡</span>
            <h2 className="font-display font-bold text-2xl text-ink tracking-wide">
              {t(locale, "spots.tips")}
            </h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-charcoal/10 to-transparent" />
          </div>
          <div className="grid gap-4">
            {spot.tips[locale].map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-jade/5 border border-jade/10 rounded-lg hover:border-jade/20 transition-colors"
              >
                <span className="font-display font-bold text-jade text-lg w-6 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-charcoal/70 font-body leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="mb-16 animate-fade-in-up delay-400">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📍</span>
            <h2 className="font-display font-bold text-2xl text-ink tracking-wide">
              {t(locale, "spots.location")}
            </h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-charcoal/10 to-transparent" />
          </div>
          <div className="p-6 bg-silk/50 rounded-lg border border-charcoal/5">
            <p className="text-charcoal/60 font-body text-sm">
              {locale === "zh"
                ? `纬度: ${spot.location.lat.toFixed(4)}　经度: ${spot.location.lng.toFixed(4)}`
                : `Lat: ${spot.location.lat.toFixed(4)}　Lng: ${spot.location.lng.toFixed(4)}`}
            </p>
            <Link
              href={`/map?spot=${spot.id}`}
              className="inline-block mt-3 text-cinnabar hover:text-cinnabar-deep font-display text-sm tracking-wider transition-colors"
            >
              {locale === "zh" ? "在地图上查看 →" : "View on map →"}
            </Link>
          </div>
        </section>

        {/* Navigation between spots */}
        <div className="flex justify-between items-center pt-12 border-t border-charcoal/10">
          {prevSpot ? (
            <Link
              href={`/spots/${prevSpot.id}`}
              className="group flex items-center gap-3 text-charcoal/60 hover:text-cinnabar transition-colors"
            >
              <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
              <div>
                <div className="text-xs text-charcoal/40 font-display tracking-wider">
                  {locale === "zh" ? "上一站" : "Previous"}
                </div>
                <div className="font-display font-bold text-lg">{prevSpot.name[locale]}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextSpot ? (
            <Link
              href={`/spots/${nextSpot.id}`}
              className="group flex items-center gap-3 text-charcoal/60 hover:text-cinnabar transition-colors text-right"
            >
              <div>
                <div className="text-xs text-charcoal/40 font-display tracking-wider">
                  {locale === "zh" ? "下一站" : "Next"}
                </div>
                <div className="font-display font-bold text-lg">{nextSpot.name[locale]}</div>
              </div>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}

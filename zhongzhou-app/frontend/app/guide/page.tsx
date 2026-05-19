"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { spots } from "@/lib/spots";
import AuthGuard from "@/components/ui/AuthGuard";

interface GuideSpot {
  id: string;
  name: { zh: string; en: string };
  subtitle: { zh: string; en: string };
  image: string;
  description: { zh: string; en: string };
  history: { zh: string; en: string };
  tips: { zh: string[]; en: string[] };
}

export default function GuideDashboardPage() {
  const { locale } = useLocaleStore();
  const { token } = useAuthStore();
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [visitors, setVisitors] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/spot-visits", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, number> = {};
        (data.visits || []).forEach((v: { spot_id: string; count: number }) => {
          map[v.spot_id] = v.count;
        });
        setVisitors(map);
      })
      .catch(() => {});
  }, [token]);

  const guideSpots: GuideSpot[] = spots;

  return (
    <AuthGuard>
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <div className="heritage-hero py-10 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-display font-bold text-xl tracking-wider">
            {locale === "zh" ? "导览仪表盘" : "Guide Dashboard"}
          </h1>
          <p className="text-white/40 font-body text-xs mt-2">
            {locale === "zh"
              ? "北京中轴线七大景点导览管理"
              : "Beijing Central Axis spot guide management"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="heritage-panel rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-cinnabar">{guideSpots.length}</p>
            <p className="text-xs text-charcoal/40 font-display tracking-wider mt-1">
              {locale === "zh" ? "景点总数" : "Total Spots"}
            </p>
          </div>
          <div className="heritage-panel rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-blue-600">
              {Object.values(visitors).reduce((s, v) => s + v, 0)}
            </p>
            <p className="text-xs text-charcoal/40 font-display tracking-wider mt-1">
              {locale === "zh" ? "总浏览量" : "Total Views"}
            </p>
          </div>
          <div className="heritage-panel rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-emerald-600">
              {Object.keys(visitors).length}
            </p>
            <p className="text-xs text-charcoal/40 font-display tracking-wider mt-1">
              {locale === "zh" ? "已访问景点" : "Visited Spots"}
            </p>
          </div>
        </div>

        {/* Spot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guideSpots.map((spot) => (
            <div
              key={spot.id}
              className="paper-surface overflow-hidden rounded-lg transition-shadow"
            >
              <div className="relative h-36 bg-charcoal/5">
                <Image src={spot.image} alt={spot.name[locale]} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display font-bold text-white text-base tracking-wider">
                    {spot.name[locale]}
                  </h3>
                  <p className="text-white/70 font-body text-xs mt-0.5">{spot.subtitle[locale]}</p>
                </div>
                {visitors[spot.id] > 0 && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/40 rounded-sm">
                    <span className="text-[10px] text-white font-body">
                      {visitors[spot.id]} {locale === "zh" ? "次浏览" : "views"}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* Tips */}
                <div className="mb-3">
                  <p className="text-xs font-display text-charcoal/50 tracking-wider mb-2">
                    {locale === "zh" ? "游览提示" : "Visitor Tips"}
                  </p>
                  <ul className="space-y-1">
                    {spot.tips[locale].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-cinnabar/50 mt-1.5 flex-shrink-0" />
                        <span className="text-xs font-body text-charcoal/70">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-charcoal/5">
                  <Link
                    href={`/spots/${spot.id}`}
                    className="flex-1 py-2 text-center text-xs font-display text-cinnabar border border-cinnabar/20 rounded-sm hover:bg-cinnabar/5 transition-colors tracking-wider"
                  >
                    {locale === "zh" ? "查看详情" : "View Details"}
                  </Link>
                  <button
                    onClick={() => setSelectedSpot(selectedSpot === spot.id ? null : spot.id)}
                    className="flex-1 py-2 text-center text-xs font-display text-white bg-cinnabar rounded-sm hover:bg-cinnabar-deep transition-colors tracking-wider"
                  >
                    {selectedSpot === spot.id
                      ? (locale === "zh" ? "收起" : "Collapse")
                      : (locale === "zh" ? "导览信息" : "Guide Info")}
                  </button>
                </div>

                {/* Expanded guide info */}
                {selectedSpot === spot.id && (
                  <div className="mt-3 pt-3 border-t border-charcoal/5 animate-fade-in-up">
                    <p className="text-xs font-body text-charcoal/70 leading-relaxed">
                      {spot.description[locale]}
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-display text-charcoal/50 tracking-wider mb-1.5">
                        {locale === "zh" ? "历史背景" : "History"}
                      </p>
                      <p className="text-xs font-body text-charcoal/60 leading-relaxed">
                        {spot.history[locale]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}

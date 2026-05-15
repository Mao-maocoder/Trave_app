"use client";

import Link from "next/link";
import { spots } from "@/lib/spots";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";

export default function MapPage() {
  const { locale } = useLocaleStore();

  // Calculate relative positions for visualization
  const latRange = {
    min: Math.min(...spots.map((s) => s.location.lat)),
    max: Math.max(...spots.map((s) => s.location.lat)),
  };
  const lngRange = {
    min: Math.min(...spots.map((s) => s.location.lng)),
    max: Math.max(...spots.map((s) => s.location.lng)),
  };

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - lngRange.min) / (lngRange.max - lngRange.min)) * 80 + 10;
    const y =
      ((latRange.max - lat) / (latRange.max - latRange.min)) * 80 + 10;
    return { x, y };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {t(locale, "nav.map")}
      </h1>
      <p className="text-gray-600 mb-8">
        {locale === "zh"
          ? "北京中轴线七大核心景点分布图"
          : "Distribution of 7 core attractions on Beijing's Central Axis"}
      </p>

      {/* Map Visualization */}
      <div className="relative bg-green-50 rounded-xl border-2 border-green-200 h-[600px] mb-8 overflow-hidden">
        {/* Axis line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <line
            x1="50%"
            y1="5%"
            x2="50%"
            y2="95%"
            stroke="#dc2626"
            strokeWidth="3"
            strokeDasharray="8,4"
            opacity="0.5"
          />
        </svg>

        {/* Spot markers */}
        {spots.map((spot, i) => {
          const pos = getPosition(spot.location.lat, spot.location.lng);
          return (
            <Link
              key={spot.id}
              href={`/spots/${spot.id}`}
              className="absolute group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Marker */}
              <div className="relative">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:bg-red-700 group-hover:scale-110 transition-all cursor-pointer">
                  {i + 1}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    <div className="font-bold text-gray-900 text-sm">
                      {spot.name[locale]}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {spot.subtitle[locale]}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow-md">
          <div className="text-xs text-gray-500 mb-1">
            {locale === "zh" ? "图例" : "Legend"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full" />
            <span className="text-sm text-gray-700">
              {locale === "zh" ? "景点" : "Attraction"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-0.5 bg-red-600" style={{ borderTop: "2px dashed #dc2626" }} />
            <span className="text-sm text-gray-700">
              {locale === "zh" ? "中轴线" : "Central Axis"}
            </span>
          </div>
        </div>
      </div>

      {/* Spot List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spots.map((spot, i) => (
          <Link
            key={spot.id}
            href={`/spots/${spot.id}`}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {i + 1}
            </div>
            <div>
              <div className="font-bold text-gray-900">{spot.name[locale]}</div>
              <div className="text-sm text-gray-500">{spot.subtitle[locale]}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

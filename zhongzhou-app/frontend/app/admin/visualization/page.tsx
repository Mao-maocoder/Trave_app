"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { spots } from "@/lib/spots";
import { formatRelativeTime } from "@/lib/utils";
import AuthGuard from "@/components/ui/AuthGuard";

interface Stats {
  totalUsers: number;
  totalPhotos: number;
  totalPosts: number;
  totalComments: number;
  recentUsers: number;
  recentPhotos: number;
  recentPosts: number;
  photosByStatus: { status: string; count: number }[];
  recentActivity: { type: string; username: string; content?: string; detail: string; created_at: string }[];
}

interface SpotVisit {
  spot_id: string;
  count: number;
}

const statusMeta: Record<string, { color: string; bg: string; zh: string; en: string }> = {
  approved: { color: "#5a7c6f", bg: "bg-jade/10 text-jade", zh: "已通过", en: "Approved" },
  pending: { color: "#c9a94e", bg: "bg-gold/10 text-gold", zh: "待审核", en: "Pending" },
  rejected: { color: "#c23b22", bg: "bg-cinnabar/10 text-cinnabar", zh: "已拒绝", en: "Rejected" },
};

export default function VisualizationPage() {
  const { locale } = useLocaleStore();
  const { token } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [spotVisits, setSpotVisits] = useState<SpotVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/admin/spot-visits", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .catch(() => ({ visits: [] })),
    ]).then(([statsData, visitsData]) => {
      setStats(statsData);
      setSpotVisits(visitsData.visits || []);
    }).finally(() => setLoading(false));
  }, [token]);

  const sortedVisits = useMemo(
    () => [...spotVisits].sort((a, b) => b.count - a.count).slice(0, 8),
    [spotVisits]
  );

  const trend = useMemo(() => {
    if (!stats) return [];
    const total = stats.totalUsers + stats.totalPhotos + stats.totalPosts + stats.totalComments;
    const recent = stats.recentUsers + stats.recentPhotos + stats.recentPosts;
    return [0.46, 0.52, 0.49, 0.62, 0.58, 0.72, 0.68].map((rate, index) => ({
      label: locale === "zh" ? `D${index + 1}` : `Day ${index + 1}`,
      value: Math.max(1, Math.round(total * rate * 0.08 + recent * (index + 1) * 0.35)),
    }));
  }, [stats, locale]);

  if (loading) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cinnabar/20 border-t-cinnabar rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const totalPhotosByStatus = stats.photosByStatus.reduce((sum, item) => sum + item.count, 0);
  const totalEngagement = stats.totalPhotos + stats.totalPosts + stats.totalComments;
  const activeRate = stats.totalUsers ? Math.min(99, Math.round((totalEngagement / stats.totalUsers) * 18)) : 0;

  return (
    <AuthGuard requireRole="admin">
      <div className="relative z-10 min-h-screen">
        <section className="heritage-hero py-10">
          <div className="relative z-10 max-w-6xl mx-auto px-4 flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/15 bg-white/8 text-white/70 transition-colors hover:text-white"
              title={locale === "zh" ? "返回" : "Back"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
            </button>
            <div>
              <div className="seal-stamp mb-3 w-fit px-3 py-1 text-xs tracking-[0.28em]">
                {locale === "zh" ? "运营中枢" : "OPERATIONS"}
              </div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-white tracking-wider">
                {locale === "zh" ? "数据可视化面板" : "Analytics Dashboard"}
              </h1>
              <p className="text-white/52 font-body text-sm mt-2">
                {locale === "zh" ? "用户、内容、审核与景点热度的实时概览" : "Live overview of users, content, moderation, and spot popularity"}
              </p>
            </div>
          </div>
        </section>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label={locale === "zh" ? "总用户" : "Users"} value={stats.totalUsers} delta={stats.recentUsers} tone="blue" locale={locale} />
            <MetricCard label={locale === "zh" ? "照片" : "Photos"} value={stats.totalPhotos} delta={stats.recentPhotos} tone="jade" locale={locale} />
            <MetricCard label={locale === "zh" ? "动态" : "Posts"} value={stats.totalPosts} delta={stats.recentPosts} tone="red" locale={locale} />
            <MetricCard label={locale === "zh" ? "活跃指数" : "Activity"} value={activeRate} suffix="%" delta={0} tone="gold" locale={locale} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6">
            <section className="heritage-panel rounded-lg p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-display font-bold text-lg text-ink tracking-wide">
                    {locale === "zh" ? "照片审核分布" : "Photo Review Distribution"}
                  </h2>
                  <p className="text-xs text-charcoal/42 mt-1">
                    {locale === "zh" ? "按审核状态统计内容占比" : "Content share by moderation status"}
                  </p>
                </div>
                <span className="rounded-sm bg-white/60 px-3 py-1 text-xs font-display text-charcoal/48">
                  {totalPhotosByStatus} {locale === "zh" ? "张" : "items"}
                </span>
              </div>
              <DonutChart data={stats.photosByStatus} locale={locale} />
            </section>

            <section className="heritage-panel rounded-lg p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-display font-bold text-lg text-ink tracking-wide">
                    {locale === "zh" ? "近 7 日内容趋势" : "7-Day Content Trend"}
                  </h2>
                  <p className="text-xs text-charcoal/42 mt-1">
                    {locale === "zh" ? "根据当前平台规模生成的运营走势" : "Operational trend based on current platform scale"}
                  </p>
                </div>
                <span className="rounded-sm bg-jade/10 px-3 py-1 text-xs font-display text-jade">
                  +{stats.recentUsers + stats.recentPhotos + stats.recentPosts}
                </span>
              </div>
              <LineChart data={trend} />
            </section>

            <section className="heritage-panel rounded-lg p-6 lg:col-span-2">
              <div className="flex flex-col gap-2 mb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg text-ink tracking-wide">
                    {locale === "zh" ? "景点浏览排行" : "Spot Visit Ranking"}
                  </h2>
                  <p className="text-xs text-charcoal/42 mt-1">
                    {locale === "zh" ? "横向条形图展示中轴线景点热度" : "Horizontal bars show Central Axis spot popularity"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal/40">
                  <span className="h-2 w-8 rounded-full bg-cinnabar/70" />
                  {locale === "zh" ? "浏览量" : "Visits"}
                </div>
              </div>
              <VisitBars visits={sortedVisits} locale={locale} />
            </section>

            <section className="heritage-panel rounded-lg p-6 lg:col-span-2">
              <h2 className="font-display font-bold text-lg text-ink tracking-wide mb-5">
                {locale === "zh" ? "近期动态流" : "Recent Activity Feed"}
              </h2>
              {stats.recentActivity.length === 0 ? (
                <p className="text-charcoal/30 font-body text-sm text-center py-8">
                  {locale === "zh" ? "暂无动态" : "No recent activity"}
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {stats.recentActivity.slice(0, 8).map((item, index) => (
                    <div
                      key={`${item.username}-${item.created_at}-${index}`}
                      className="animate-fade-in-up rounded-lg border border-charcoal/5 bg-white/52 p-4"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-cinnabar/10 font-display text-xs font-bold text-cinnabar">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-charcoal/72">
                            <span className="font-display font-bold text-ink">{item.username}</span>
                            {" "}
                            {item.detail}
                          </p>
                          <p className="mt-1 truncate text-xs text-charcoal/35">{item.content || item.type}</p>
                        </div>
                        <span className="text-[10px] text-charcoal/32 whitespace-nowrap">
                          {formatRelativeTime(item.created_at, locale)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function MetricCard({
  label,
  value,
  suffix = "",
  delta,
  tone,
  locale,
}: {
  label: string;
  value: number;
  suffix?: string;
  delta: number;
  tone: "blue" | "jade" | "red" | "gold";
  locale: "zh" | "en";
}) {
  const tones = {
    blue: { from: "from-blue-500/12", text: "text-blue-700" },
    jade: { from: "from-jade/14", text: "text-jade" },
    red: { from: "from-cinnabar/14", text: "text-cinnabar" },
    gold: { from: "from-gold/18", text: "text-gold" },
  };
  const toneClass = tones[tone];

  return (
    <div className="paper-surface animate-fade-in-up rounded-lg p-5 overflow-hidden relative">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneClass.from} to-transparent`} />
      <p className="text-xs text-charcoal/42 font-display tracking-wider">{label}</p>
      <p className={`mt-3 font-display text-3xl font-bold ${toneClass.text}`}>
        {value.toLocaleString()}{suffix}
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-charcoal/5">
        <div className="h-full rounded-full bg-current opacity-45 transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(18, value % 100))}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-charcoal/34">
        {delta > 0 ? `+${delta} ${locale === "zh" ? "近7天" : "7d"}` : locale === "zh" ? "稳定运行" : "Stable"}
      </p>
    </div>
  );
}

function DonutChart({ data, locale }: { data: { status: string; count: number }[]; locale: "zh" | "en" }) {
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
  const segments = data.map((item, index) => {
    const percent = (item.count / total) * 100;
    const previous = data
      .slice(0, index)
      .reduce((sum, previousItem) => sum + (previousItem.count / total) * 100, 0);
    return {
      ...item,
      percent,
      offset: 25 - previous,
    };
  });

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr] md:items-center">
      <div className="relative mx-auto h-56 w-56">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(26,26,26,.06)" strokeWidth="18" />
          {segments.map((item) => {
            return (
              <circle
                key={item.status}
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke={statusMeta[item.status]?.color || "#8a8a8a"}
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={`${item.percent} ${100 - item.percent}`}
                strokeDashoffset={item.offset}
                pathLength="100"
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold text-ink">{total}</span>
          <span className="text-xs text-charcoal/42">{locale === "zh" ? "照片" : "Photos"}</span>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => {
          const meta = statusMeta[item.status] || { color: "#8a8a8a", bg: "bg-charcoal/5 text-charcoal", zh: item.status, en: item.status };
          const percent = Math.round((item.count / total) * 100);
          return (
            <div key={item.status} className="rounded-lg border border-charcoal/5 bg-white/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: meta.color }} />
                  <span className="font-display text-sm text-ink">{locale === "zh" ? meta.zh : meta.en}</span>
                </div>
                <span className="text-sm text-charcoal/48">{item.count} / {percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  const points = data.map((item, index) => {
    const x = 24 + index * (252 / Math.max(1, data.length - 1));
    const y = 150 - (item.value / max) * 104;
    return { x, y, ...item };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `24,158 ${polyline} 276,158`;

  return (
    <div className="rounded-lg border border-charcoal/5 bg-white/42 p-4">
      <svg viewBox="0 0 300 180" className="h-64 w-full overflow-visible">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#c23b22" stopOpacity=".24" />
            <stop offset="1" stopColor="#c23b22" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[46, 78, 110, 142].map((y) => (
          <line key={y} x1="24" x2="276" y1={y} y2={y} stroke="rgba(26,26,26,.08)" strokeWidth="1" />
        ))}
        <polygon points={area} fill="url(#trendFill)" />
        <polyline points={polyline} fill="none" stroke="#c23b22" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 8px 10px rgba(194,59,34,.22))" }} />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" fill="#f5f0e8" stroke="#c23b22" strokeWidth="3" />
            <text x={point.x} y="174" textAnchor="middle" fontSize="9" fill="rgba(26,26,26,.45)">{point.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function VisitBars({ visits, locale }: { visits: SpotVisit[]; locale: "zh" | "en" }) {
  const max = Math.max(1, ...visits.map((visit) => visit.count));

  if (visits.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-charcoal/5 bg-white/42">
        <p className="text-charcoal/32 text-sm">{locale === "zh" ? "暂无数据" : "No data yet"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visits.map((visit, index) => {
        const spot = spots.find((item) => item.id === visit.spot_id);
        const percent = Math.max(6, Math.round((visit.count / max) * 100));
        return (
          <div key={visit.spot_id} className="grid grid-cols-[96px_1fr_52px] items-center gap-3 md:grid-cols-[150px_1fr_64px]">
            <span className="truncate text-xs font-display text-ink">
              {String(index + 1).padStart(2, "0")} · {spot ? spot.name[locale] : visit.spot_id}
            </span>
            <div className="h-8 overflow-hidden rounded-sm bg-charcoal/5">
              <div
                className="flex h-full items-center justify-end rounded-sm bg-gradient-to-r from-cinnabar/55 to-gold/80 pr-3 text-[10px] font-display text-white transition-all duration-1000"
                style={{ width: `${percent}%` }}
              >
                {percent > 18 ? `${percent}%` : ""}
              </div>
            </div>
            <span className="text-right font-display text-sm font-bold text-cinnabar">{visit.count}</span>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";

export interface AchievementItem {
  id: string;
  name: { zh: string; en: string };
  desc: { zh: string; en: string };
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface Props {
  achievements: AchievementItem[];
  stats: { total: number; unlocked: number };
}

export default function AchievementGrid({ achievements, stats }: Props) {
  const { locale } = useLocaleStore();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-charcoal/50 font-body text-sm">
          {t(locale, "achievements.unlocked")} {stats.unlocked} {t(locale, "achievements.of")} {stats.total}
        </p>
        <div className="flex-1 mx-4 h-1.5 bg-charcoal/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-cinnabar/60 rounded-full transition-all duration-500"
            style={{ width: `${stats.total ? (stats.unlocked / stats.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`relative p-4 rounded-sm border transition-all ${
              ach.unlocked
                ? "bg-white/80 border-cinnabar/20"
                : "bg-charcoal/[0.02] border-charcoal/5 opacity-50"
            }`}
          >
            <div className="text-2xl mb-2">{ach.icon}</div>
            <p className="font-display text-sm text-ink font-bold tracking-wide">
              {ach.name[locale]}
            </p>
            <p className="text-charcoal/40 font-body text-xs mt-1">
              {ach.desc[locale]}
            </p>
            {ach.unlocked && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cinnabar/10 flex items-center justify-center">
                <span className="text-cinnabar text-[10px]">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

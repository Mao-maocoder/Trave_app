"use client";

import { useEffect, useState } from "react";
import { useLocaleStore } from "@/stores/localeStore";
import { t } from "@/lib/i18n";
import { ACHIEVEMENTS } from "@/lib/achievements-config";

interface Props {
  achievementIds: string[];
  onDone: () => void;
}

export default function AchievementToast({ achievementIds, onDone }: Props) {
  const { locale } = useLocaleStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= achievementIds.length) {
      onDone();
      return;
    }
    const timer = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentIndex, achievementIds.length, onDone]);

  if (currentIndex >= achievementIds.length) return null;

  const ach = ACHIEVEMENTS.find((a) => a.id === achievementIds[currentIndex]);
  if (!ach) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] animate-bounce">
      <div className="bg-white/95 backdrop-blur-md border border-cinnabar/20 shadow-lg rounded-sm px-6 py-4 flex items-center gap-4 min-w-[280px]">
        <div className="text-3xl">{ach.icon}</div>
        <div>
          <p className="text-[10px] text-cinnabar/60 font-display tracking-widest uppercase">
            {t(locale, "achievements.unlockedLabel")}
          </p>
          <p className="font-display text-base text-ink font-bold tracking-wide mt-0.5">
            {ach.name[locale]}
          </p>
          <p className="text-charcoal/50 font-body text-xs mt-0.5">
            {ach.desc[locale]}
          </p>
        </div>
      </div>
    </div>
  );
}

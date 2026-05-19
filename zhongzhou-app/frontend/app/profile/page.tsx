"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { spots } from "@/lib/spots";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AuthGuard from "@/components/ui/AuthGuard";
import AchievementGrid, { type AchievementItem } from "@/components/achievements/AchievementGrid";
import { ChatIcon, MyPhotosIcon, LogoutIcon, MyItineraryIcon, FavoritesIcon, AchievementsIcon, SettingsIcon, TipIcon } from "@/components/icons";

export default function ProfilePage() {
  const { locale } = useLocaleStore();
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  const [showLogout, setShowLogout] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [achievementStats, setAchievementStats] = useState({ total: 0, unlocked: 0 });

  useEffect(() => {
    if (!token) return;
    fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setFavoriteIds(data.favorites || []))
      .catch(() => {});
    fetch("/api/achievements", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setAchievements(data.achievements || []);
        setAchievementStats(data.stats || { total: 0, unlocked: 0 });
      })
      .catch(() => {});
  }, [token]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AuthGuard fallback="login">
    {!user ? null : (
    <div className="relative z-10">
      {/* Header */}
      <section className="heritage-hero py-16">
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          {/* Avatar */}
          <div className="inline-block mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-display font-bold text-white/80">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl text-white tracking-wider">
            {user.username}
          </h1>
          <p className="text-white/40 font-body text-sm mt-1">
            {user.email}
          </p>
          <Link
            href="/profile/edit"
            className="inline-block mt-3 px-5 py-1.5 text-xs font-display text-white/60 border border-white/20 rounded-sm hover:text-white hover:border-white/40 transition-colors tracking-wider"
          >
            {locale === "zh" ? "编辑资料" : "Edit Profile"}
          </Link>
        </div>
      </section>

      {/* Menu */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <div className="heritage-panel overflow-hidden rounded-lg">
          {/* My Photos */}
          <Link
            href="/photo-wall"
            className="flex items-center gap-4 px-5 py-4 hover:bg-charcoal/3 transition-colors"
          >
            <MyPhotosIcon size={18} />
            <span className="font-display text-sm text-ink tracking-wider flex-1">
              {locale === "zh" ? "我的照片" : "My Photos"}
            </span>
            <span className="text-charcoal/20 text-sm">›</span>
          </Link>

          {/* My Messages */}
          <Link
            href="/chat"
            className="flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-charcoal/3 transition-colors"
          >
            <ChatIcon size={18} />
            <span className="font-display text-sm text-ink tracking-wider flex-1">
              {locale === "zh" ? "我的消息" : "My Messages"}
            </span>
            <span className="text-charcoal/20 text-sm">›</span>
          </Link>

          {/* Favorite Spots (toggle) */}
          <button
            onClick={() => setShowFavorites((v) => !v)}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-charcoal/3 transition-colors"
          >
            <FavoritesIcon size={18} />
            <span className="font-display text-sm text-ink tracking-wider flex-1 text-left">
              {locale === "zh" ? `收藏景点 (${favoriteIds.length})` : `Favorite Spots (${favoriteIds.length})`}
            </span>
            <span className="text-charcoal/20 text-sm">{showFavorites ? "⌄" : "›"}</span>
          </button>

          {/* Favorites drawer */}
          {showFavorites && (
            <div className="border-t border-charcoal/5 bg-silk/30">
              {favoriteIds.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-charcoal/30 font-body text-sm">
                    {locale === "zh" ? "还没有收藏景点" : "No favorite spots yet"}
                  </p>
                  <Link href="/map" className="text-cinnabar text-xs font-display tracking-wider mt-2 inline-block">
                    {locale === "zh" ? "去发现景点 →" : "Discover spots →"}
                  </Link>
                </div>
              ) : (
                favoriteIds.map((spotId, i) => {
                  const spot = spots.find((s) => s.id === spotId);
                  if (!spot) return null;
                  return (
                    <Link
                      key={spotId}
                      href={`/spots/${spotId}?from=profile`}
                      className={`flex items-center gap-4 px-5 py-3 hover:bg-charcoal/3 transition-colors ${
                        i > 0 ? "border-t border-charcoal/5" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0 bg-charcoal/5">
                        <Image src={spot.image} alt={spot.name[locale]} width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-ink">{spot.name[locale]}</p>
                        <p className="text-charcoal/40 font-body text-xs">{spot.subtitle[locale]}</p>
                      </div>
                      <span className="text-charcoal/20 text-sm">›</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* My Itinerary */}
          <Link
            href="/itinerary"
            className="flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-charcoal/3 transition-colors"
          >
            <MyItineraryIcon size={18} />
            <span className="font-display text-sm text-ink tracking-wider flex-1">
              {locale === "zh" ? "我的行程" : "My Itinerary"}
            </span>
            <span className="text-charcoal/20 text-sm">›</span>
          </Link>

          {/* Achievements (toggle) */}
          <button
            onClick={() => setShowAchievements((v) => !v)}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-charcoal/3 transition-colors"
          >
            <AchievementsIcon size={18} />
            <span className="font-display text-sm text-ink tracking-wider flex-1 text-left">
              {locale === "zh" ? `我的成就 (${achievementStats.unlocked}/${achievementStats.total})` : `Achievements (${achievementStats.unlocked}/${achievementStats.total})`}
            </span>
            <span className="text-charcoal/20 text-sm">{showAchievements ? "⌄" : "›"}</span>
          </button>

          {/* Achievements drawer */}
          {showAchievements && (
            <div className="border-t border-charcoal/5 bg-silk/30 p-5">
              <AchievementGrid achievements={achievements} stats={achievementStats} />
            </div>
          )}

          {/* Browsing History */}
          <Link
            href="/history"
            className="flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-charcoal/3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[18px] h-[18px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="font-display text-sm text-ink tracking-wider flex-1">
              {locale === "zh" ? "浏览历史" : "Browsing History"}
            </span>
            <span className="text-charcoal/20 text-sm">›</span>
          </Link>

          {/* Feedback */}
          <Link
            href="/feedback"
            className="flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-charcoal/3 transition-colors"
          >
            <TipIcon size={18} />
            <span className="font-display text-sm text-ink tracking-wider flex-1">
              {locale === "zh" ? "意见反馈" : "Feedback"}
            </span>
            <span className="text-charcoal/20 text-sm">›</span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-charcoal/3 transition-colors"
          >
            <SettingsIcon size={18} />
            <span className="font-display text-sm text-ink tracking-wider flex-1">
              {locale === "zh" ? "设置" : "Settings"}
            </span>
            <span className="text-charcoal/20 text-sm">›</span>
          </Link>

          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-cinnabar/3 transition-colors"
          >
            <LogoutIcon size={18} />
            <span className="font-display text-sm text-cinnabar tracking-wider flex-1 text-left">
              {locale === "zh" ? "退出登录" : "Logout"}
            </span>
          </button>
        </div>

        {/* Role badge */}
        <div className="mt-4 text-center">
          <span className="text-[10px] px-3 py-1 bg-charcoal/5 text-charcoal/30 font-display tracking-widest rounded-sm">
            {user.role === "admin" ? "ADMIN" : user.role === "guide" ? "GUIDE" : "USER"}
          </span>
        </div>
      </section>

      {/* Logout confirm */}
      {showLogout && (
        <ConfirmModal
          message={locale === "zh" ? "确定退出登录吗？" : "Are you sure you want to logout?"}
          confirmText={locale === "zh" ? "退出" : "Logout"}
          cancelText={locale === "zh" ? "取消" : "Cancel"}
          danger
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
    )}
    </AuthGuard>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { t } from "@/lib/i18n";
import { spots } from "@/lib/spots";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ProfilePage() {
  const { locale } = useLocaleStore();
  const { user, token, logout, updateUser } = useAuthStore();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setFavoriteIds(data.favorites || []))
      .catch(() => {});
  }, [token]);

  if (!user) {
    return (
      <div className="relative z-10 max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-6">👤</div>
        <h1 className="font-display font-bold text-2xl text-ink mb-4">
          {locale === "zh" ? "请先登录" : "Please login first"}
        </h1>
        <p className="text-charcoal/50 font-body text-sm mb-6">
          {locale === "zh" ? "登录后查看个人中心" : "Login to view your profile"}
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-2.5 bg-cinnabar text-white font-display tracking-[0.1em] text-sm rounded-sm hover:bg-cinnabar-deep transition-colors"
        >
          {t(locale, "nav.login")}
        </Link>
      </div>
    );
  }

  const handleStartEdit = () => {
    setNickname(user.username);
    setError("");
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      setError(locale === "zh" ? "昵称不能为空" : "Username cannot be empty");
      return;
    }
    if (nickname.trim().length > 20) {
      setError(locale === "zh" ? "昵称不能超过20个字符" : "Max 20 characters");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      updateUser(data.user);
      setEditing(false);
    } catch {
      setError(locale === "zh" ? "网络错误" : "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ ...user, avatar: data.avatar });
      }
    } catch {
      // ignore
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-cinnabar/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
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
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-cinnabar rounded-full flex items-center justify-center text-white shadow-md hover:bg-cinnabar-deep transition-colors disabled:opacity-50"
              title={locale === "zh" ? "更换头像" : "Change avatar"}
            >
              {uploadingAvatar ? (
                <span className="text-[10px]">...</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M12.5 2.5a1 1 0 0 1 .7.3l1 1a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-.5.2H3a1 1 0 0 1-1-1v-3.7a1 1 0 0 1 .2-.5l7-7a1 1 0 0 1 1.4 0l1.9 1.9Z" />
                </svg>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {editing ? (
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setError(""); }}
                maxLength={20}
                className="w-full text-center text-xl font-display font-bold bg-white/10 text-white border border-white/20 rounded-sm px-4 py-2 focus:outline-none focus:border-cinnabar/50"
              />
              {error && (
                <p className="text-cinnabar-light text-xs font-body mt-1">{error}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1.5 text-xs font-display text-white/60 hover:text-white transition-colors"
                >
                  {locale === "zh" ? "取消" : "Cancel"}
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-5 py-1.5 text-xs font-display bg-cinnabar text-white rounded-sm hover:bg-cinnabar-deep transition-colors disabled:opacity-50"
                >
                  {saving ? "..." : (locale === "zh" ? "保存" : "Save")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-2xl text-white tracking-wider">
                {user.username}
              </h1>
              <p className="text-white/40 font-body text-sm mt-1">
                {user.email}
              </p>
              <button
                onClick={handleStartEdit}
                className="mt-3 px-5 py-1.5 text-xs font-display text-white/60 border border-white/20 rounded-sm hover:text-white hover:border-white/40 transition-colors tracking-wider"
              >
                {locale === "zh" ? "编辑资料" : "Edit Profile"}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Menu */}
      <section className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white/70 border border-charcoal/5 rounded-sm overflow-hidden">
          {[
            {
              icon: "📷",
              label: locale === "zh" ? "我的照片" : "My Photos",
              href: "/photo-wall",
            },
            {
              icon: "🏯",
              label: locale === "zh" ? `收藏景点 (${favoriteIds.length})` : `Favorite Spots (${favoriteIds.length})`,
              action: () => setShowFavorites((v) => !v),
            },
            {
              icon: "🗓️",
              label: locale === "zh" ? "我的行程" : "My Itinerary",
              href: "/itinerary",
            },
          ].map((item, i) =>
            item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-charcoal/3 transition-colors ${
                  i > 0 ? "border-t border-charcoal/5" : ""
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-display text-sm text-ink tracking-wider flex-1">
                  {item.label}
                </span>
                <span className="text-charcoal/20 text-sm">&gt;</span>
              </Link>
            ) : (
              <button
                key={i}
                onClick={item.action}
                className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-charcoal/3 transition-colors ${
                  i > 0 ? "border-t border-charcoal/5" : ""
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-display text-sm text-ink tracking-wider flex-1 text-left">
                  {item.label}
                </span>
                <span className="text-charcoal/20 text-sm">{showFavorites ? "∨" : "&gt;"}</span>
              </button>
            )
          )}

          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-charcoal/5 hover:bg-cinnabar/3 transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span className="font-display text-sm text-cinnabar tracking-wider flex-1 text-left">
              {locale === "zh" ? "退出登录" : "Logout"}
            </span>
          </button>
        </div>

        {/* Favorites list */}
        {showFavorites && (
          <div className="mt-3 bg-white/70 border border-charcoal/5 rounded-sm overflow-hidden">
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
                    href={`/spots/${spotId}`}
                    className={`flex items-center gap-4 px-5 py-3 hover:bg-charcoal/3 transition-colors ${
                      i > 0 ? "border-t border-charcoal/5" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0 bg-charcoal/5">
                      <img src={spot.image} alt={spot.name[locale]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-ink">{spot.name[locale]}</p>
                      <p className="text-charcoal/40 font-body text-xs">{spot.subtitle[locale]}</p>
                    </div>
                    <span className="text-charcoal/20 text-sm">&gt;</span>
                  </Link>
                );
              })
            )}
          </div>
        )}

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
  );
}

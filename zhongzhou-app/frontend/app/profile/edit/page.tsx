"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import AuthGuard from "@/components/ui/AuthGuard";

export default function ProfileEditPage() {
  const { locale } = useLocaleStore();
  const { user, token, updateUser } = useAuthStore();
  const router = useRouter();

  const [username, setUsername] = useState(() => user?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSave = async () => {
    if (!username.trim()) {
      setError(locale === "zh" ? "昵称不能为空" : "Username cannot be empty");
      return;
    }
    if (username.trim().length > 20) {
      setError(locale === "zh" ? "昵称不能超过20个字符" : "Max 20 characters");
      return;
    }
    if (username.trim() === user.username) {
      router.back();
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      updateUser(data.user);
      setSuccess(locale === "zh" ? "保存成功" : "Saved successfully");
      setTimeout(() => router.back(), 800);
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
        setSuccess(locale === "zh" ? "头像更新成功" : "Avatar updated");
      } else {
        setError(data.error || (locale === "zh" ? "上传失败" : "Upload failed"));
      }
    } catch {
      setError(locale === "zh" ? "上传失败" : "Upload failed");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <AuthGuard fallback="login">
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <div className="bg-ink text-white py-8">
        <div className="max-w-lg mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-lg tracking-wider">
            {locale === "zh" ? "编辑资料" : "Edit Profile"}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-cinnabar/5 border border-cinnabar/20 rounded-sm text-cinnabar text-sm font-body">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-700 text-sm font-body">
            {success}
          </div>
        )}

        {/* Avatar */}
        <div className="bg-white/70 border border-charcoal/5 rounded-sm p-6 mb-4">
          <label className="block text-xs font-display text-charcoal/50 tracking-wider mb-4">
            {locale === "zh" ? "头像" : "Avatar"}
          </label>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-charcoal/10 border-2 border-charcoal/10">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.username} width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-display font-bold text-charcoal/30">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 text-xs font-display bg-charcoal/5 text-ink rounded-sm hover:bg-charcoal/10 transition-colors tracking-wider disabled:opacity-50"
              >
                {locale === "zh" ? "更换头像" : "Change Avatar"}
              </button>
              <p className="text-[10px] text-charcoal/30 font-body mt-1.5">
                {locale === "zh" ? "支持 JPG、PNG、WebP，最大 5MB" : "JPG, PNG, WebP, max 5MB"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="bg-white/70 border border-charcoal/5 rounded-sm p-6 mb-4">
          <label className="block text-xs font-display text-charcoal/50 tracking-wider mb-3">
            {locale === "zh" ? "昵称" : "Username"}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); setSuccess(""); }}
            maxLength={20}
            className="w-full px-4 py-3 bg-charcoal/5 border border-transparent rounded-sm focus:outline-none focus:border-cinnabar/30 focus:bg-white font-body text-sm text-ink transition-all"
            placeholder={locale === "zh" ? "请输入昵称" : "Enter username"}
          />
          <p className="text-[10px] text-charcoal/30 font-body mt-1.5">
            {username.length}/20
          </p>
        </div>

        {/* Email (read only) */}
        <div className="bg-white/70 border border-charcoal/5 rounded-sm p-6 mb-6">
          <label className="block text-xs font-display text-charcoal/50 tracking-wider mb-3">
            {locale === "zh" ? "邮箱" : "Email"}
          </label>
          <div className="px-4 py-3 bg-charcoal/3 rounded-sm text-sm text-charcoal/60 font-body">
            {user.email}
          </div>
          <p className="text-[10px] text-charcoal/30 font-body mt-1.5">
            {locale === "zh" ? "邮箱不可修改" : "Email cannot be changed"}
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || username.trim() === user.username}
          className="w-full py-3 bg-cinnabar text-white font-display tracking-[0.15em] text-sm rounded-sm hover:bg-cinnabar-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(194,59,34,0.2)]"
        >
          {saving
            ? (locale === "zh" ? "保存中..." : "Saving...")
            : (locale === "zh" ? "保存修改" : "Save Changes")}
        </button>
      </div>
    </div>
    </AuthGuard>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { spots } from "@/lib/spots";
import { formatRelativeTime } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Post {
  id: number;
  user_id: number;
  username: string;
  user_avatar: string | null;
  content: string;
  spot_id: string | null;
  image_path: string | null;
  ip_location: string | null;
  likes: number;
  liked: boolean;
  comment_count: number;
  latest_comment_text: string | null;
  latest_comment_user: string | null;
  latest_comment_time: string | null;
  created_at: string;
}

export default function CommunityPage() {
  const { locale } = useLocaleStore();
  const { user, token } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCompose, setShowCompose] = useState(false);
  const [content, setContent] = useState("");
  const [spotId, setSpotId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [tick, setTick] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/posts?${params}`, { headers });
      const data = await res.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handlePost = async () => {
    if (!token || !content.trim() || posting) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      if (spotId) formData.append("spotId", spotId);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [data.post, ...prev]);
        setContent("");
        setSpotId("");
        handleRemoveImage();
        setShowCompose(false);
      }
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes: data.likes, liked: data.liked } : p
          )
        );
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!token || confirmDelete === null) return;
    const postId = confirmDelete;
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="seal-stamp text-xs tracking-[0.3em] w-fit px-3 py-1 mb-3">
              {locale === "zh" ? "旅行社区" : "COMMUNITY"}
            </div>
            <h1 className="font-display font-bold text-3xl text-ink tracking-wide">
              {locale === "zh" ? "旅人心声" : "Travelers' Stories"}
            </h1>
            <div className="mt-3 w-16 h-[2px] bg-gradient-to-r from-cinnabar via-gold to-transparent" />
          </div>
          {user && (
            <button
              onClick={() => setShowCompose((v) => !v)}
              className="px-5 py-2.5 bg-cinnabar text-white font-display tracking-[0.1em] text-sm rounded-sm hover:bg-cinnabar-deep transition-colors shadow-[0_4px_16px_rgba(194,59,34,0.2)]"
            >
              {showCompose ? (locale === "zh" ? "收起" : "Close") : (locale === "zh" ? "发动态" : "New Post")}
            </button>
          )}
        </div>
      </section>

      {/* Compose */}
      {showCompose && user && (
        <section className="max-w-3xl mx-auto px-4 pb-6 animate-fade-in-up">
          <div className="bg-white/70 border border-charcoal/5 rounded-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <Image src={user.avatar} alt="" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-cinnabar text-sm font-display font-bold">{user.username[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={locale === "zh" ? "分享你的旅行故事..." : "Share your travel story..."}
                  className="w-full min-h-[100px] bg-transparent focus:outline-none font-body text-sm text-charcoal placeholder:text-charcoal/30 resize-none"
                  maxLength={2000}
                />

                {/* Image preview */}
                {imagePreview && (
                  <div className="relative inline-block mt-2 mb-3">
                    <img src={imagePreview} alt="" className="max-h-40 rounded-sm border border-charcoal/10" />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-cinnabar text-white rounded-full text-xs flex items-center justify-center"
                    >
                      x
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-charcoal/5">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer text-charcoal/40 hover:text-cinnabar transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.875c0-.621.504-1.125 1.125-1.125h11.25c.621 0 1.125.504 1.125 1.125v3.875c0 .621-.504 1.125-1.125 1.125H3.625A1.125 1.125 0 0 1 2.5 15V11.125Zm4.15-2.563a.75.75 0 0 1 1.035.175l.006.008 2.228 2.785a.75.75 0 0 1-.094.963l-2.784 2.458a.75.75 0 0 1-1.024-.098l-2.13-2.556a.75.75 0 0 1 .11-1.063Z" clipRule="evenodd" />
                      </svg>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagePick} />
                    </label>
                    <select
                      value={spotId}
                      onChange={(e) => setSpotId(e.target.value)}
                      className="text-xs bg-transparent border border-charcoal/10 rounded-sm px-2 py-1 font-body text-charcoal/60 focus:outline-none focus:border-cinnabar/30"
                    >
                      <option value="">{locale === "zh" ? "关联景点（可选）" : "Tag a spot (optional)"}</option>
                      {spots.map((s) => (
                        <option key={s.id} value={s.id}>{s.name[locale]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-charcoal/20 font-body">{content.length}/2000</span>
                    <button
                      onClick={handlePost}
                      disabled={!content.trim() || posting}
                      className="px-5 py-1.5 bg-cinnabar text-white text-sm font-display tracking-wider rounded-sm hover:bg-cinnabar-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {posting ? "..." : (locale === "zh" ? "发布" : "Post")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feed */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-16 text-charcoal/30 font-body">
            {locale === "zh" ? "加载中..." : "Loading..."}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-charcoal/30 font-body">
              {locale === "zh" ? "还没有动态，快来发布第一条吧！" : "No posts yet. Be the first to share!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <article
                key={post.id}
                className="bg-white/70 border border-charcoal/5 rounded-sm overflow-hidden hover:border-charcoal/10 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                  <div className="w-9 h-9 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {post.user_avatar ? (
                      <Image src={post.user_avatar} alt="" width={36} height={36} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-cinnabar text-sm font-display font-bold">
                        {post.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-display font-bold text-sm text-ink">{post.username}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-charcoal/30 font-body">
                        {formatRelativeTime(post.created_at, locale)}
                      </span>
                      {post.ip_location && (
                        <span className="text-[10px] text-charcoal/30 font-body">
                          {locale === "zh" ? `IP属地：${post.ip_location}` : `IP: ${post.ip_location}`}
                        </span>
                      )}
                    </div>
                  </div>
                  {user && (user.id === post.user_id || user.role === "admin") && (
                    <button
                      onClick={() => setConfirmDelete(post.id)}
                      className="text-charcoal/20 hover:text-cinnabar transition-colors text-sm"
                      title={locale === "zh" ? "删除" : "Delete"}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="px-5 pb-3">
                  <p className="text-charcoal/80 font-body text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Image */}
                {post.image_path && (
                  <div className="px-5 pb-3">
                    <img
                      src={post.image_path}
                      alt=""
                      className="max-h-80 rounded-sm border border-charcoal/5 object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 px-5 py-3 border-t border-charcoal/5">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
                      post.liked ? "text-cinnabar" : "text-charcoal/30 hover:text-cinnabar"
                    }`}
                  >
                    <span className="text-base">{post.liked ? "❤" : "♡"}</span>
                    <span className="font-body">{post.likes || ""}</span>
                  </button>
                  <Link
                    href={`/community/${post.id}`}
                    className="flex items-center gap-1.5 text-sm text-charcoal/30 hover:text-cinnabar transition-colors"
                  >
                    <span className="text-base">💬</span>
                    <span className="font-body">{post.comment_count || ""}</span>
                  </Link>
                  <Link
                    href={`/community/${post.id}`}
                    className="flex items-center gap-1.5 text-sm text-charcoal/30 hover:text-cinnabar transition-colors ml-auto"
                  >
                    <span className="font-body text-xs">{locale === "zh" ? "详情 →" : "Details →"}</span>
                  </Link>
                </div>

                {/* Latest comment preview */}
                {post.latest_comment_text && (
                  <Link
                    href={`/community/${post.id}`}
                    className="block px-5 py-3 bg-charcoal/[0.02] border-t border-charcoal/5 hover:bg-charcoal/[0.04] transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-charcoal/40 font-body flex-shrink-0">
                        {locale === "zh" ? "最新评论" : "Latest"}:
                      </span>
                      <p className="text-xs text-charcoal/50 font-body truncate">
                        <span className="font-display font-bold text-charcoal/60">{post.latest_comment_user}</span>
                        {" "}{post.latest_comment_text}
                      </p>
                    </div>
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-sm font-display rounded-sm transition-colors ${
                  p === page
                    ? "bg-cinnabar text-white"
                    : "bg-charcoal/5 text-charcoal/60 hover:text-cinnabar"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Delete confirm */}
      {confirmDelete !== null && (
        <ConfirmModal
          message={locale === "zh" ? "确定删除这条动态吗？" : "Delete this post?"}
          confirmText={locale === "zh" ? "删除" : "Delete"}
          cancelText={locale === "zh" ? "取消" : "Cancel"}
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

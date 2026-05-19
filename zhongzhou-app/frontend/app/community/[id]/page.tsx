"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { formatRelativeTime } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { ReturnIcon, DeleteIcon, ChatIcon, CancelIcon, LikeIcon } from "@/components/icons";

interface PostComment {
  id: number;
  post_id: number;
  user_id: string;
  username: string;
  avatar: string | null;
  content: string;
  parent_id: number | null;
  reply_to_username: string | null;
  created_at: string;
  replies?: PostComment[];
}

interface Post {
  id: number;
  user_id: string;
  username: string;
  user_avatar: string | null;
  content: string;
  spot_id: string | null;
  image_path: string | null;
  ip_location: string | null;
  likes: number;
  liked: boolean;
  comment_count: number;
  created_at: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const { locale } = useLocaleStore();
  const { user, token } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/posts/${params.id}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setPost(data.post);
      setComments(data.comments || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLike = async () => {
    if (!token || !post) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPost((prev) => prev ? { ...prev, likes: data.likes, liked: data.liked } : prev);
    } catch {
      // ignore
    }
  };

  const handleDeletePost = async () => {
    if (!token || !post) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) window.location.href = "/community";
    } catch {
      // ignore
    }
  };

  const handleComment = async () => {
    if (!token || !commentText.trim() || commenting || !post) return;
    setCommenting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content: commentText.trim(),
          parentId: replyTo?.id,
          replyToUsername: replyTo?.username,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const comment = data.comment;
        if (comment.parent_id) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === comment.parent_id
                ? { ...c, replies: [...(c.replies || []), comment] }
                : c
            )
          );
        } else {
          setComments((prev) => [...prev, { ...comment, replies: [] }]);
        }
        setPost((prev) => prev ? { ...prev, comment_count: data.comment_count } : prev);
        setCommentText("");
        setReplyTo(null);
      }
    } catch {
      // ignore
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-charcoal/30 font-body">{locale === "zh" ? "加载中..." : "Loading..."}</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal/40 font-body mb-4">{locale === "zh" ? "动态不存在" : "Post not found"}</p>
          <Link href="/community" className="text-cinnabar hover:text-cinnabar-deep font-display text-sm tracking-wider">
            <ReturnIcon size={16} className="inline-block align-middle mr-0.5" /> {locale === "zh" ? "返回社区" : "Back to Community"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-20">
        {/* Back */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-charcoal/50 hover:text-cinnabar text-sm mb-8 font-body transition-colors"
        >
          <ReturnIcon size={20} />
          {locale === "zh" ? "返回社区" : "Back"}
        </Link>

        {/* Post */}
        <article className="bg-white/70 border border-charcoal/5 rounded-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-3">
            <div className="w-10 h-10 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {post.user_avatar ? (
                <Image src={post.user_avatar} alt="" width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <span className="text-cinnabar text-base font-display font-bold">{post.username[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-display font-bold text-sm text-ink">{post.username}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-charcoal/30 font-body">{formatRelativeTime(post.created_at, locale)}</span>
                {post.ip_location && (
                  <span className="text-xs text-charcoal/30 font-body">
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
                <DeleteIcon size={14} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <p className="text-charcoal/80 font-body text-sm leading-[1.9] whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Image */}
          {post.image_path && (
            <div className="px-6 pb-4">
              <Image src={post.image_path} alt="" width={800} height={500} className="max-h-[500px] rounded-sm border border-charcoal/5 object-cover w-full h-auto" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 px-6 py-3 border-t border-charcoal/5">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
                post.liked ? "text-cinnabar" : "text-charcoal/30 hover:text-cinnabar"
              }`}
            >
              <LikeIcon size={16} filled={post.liked} />
              <span className="font-body">{post.likes || ""}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-charcoal/30">
              <ChatIcon size={16} />
              <span className="font-body">{post.comment_count}</span>
            </span>
          </div>
        </article>

        {/* Comments */}
        <section className="mt-6">
          <h2 className="font-display font-bold text-lg text-ink mb-4">
            {locale === "zh" ? "评论" : "Comments"}
            <span className="text-charcoal/30 text-sm ml-2">({post.comment_count})</span>
          </h2>

          {comments.length === 0 ? (
            <p className="text-sm text-charcoal/30 font-body py-6 text-center">
              {locale === "zh" ? "暂无评论，快来抢沙发！" : "No comments yet. Be the first!"}
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="bg-white/50 border border-charcoal/5 rounded-sm px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {c.avatar ? (
                        <Image src={c.avatar} alt="" width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-cinnabar text-xs font-display font-bold">{c.username[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-ink">{c.username}</span>
                        <span className="text-[10px] text-charcoal/25 font-body">{formatRelativeTime(c.created_at, locale)}</span>
                      </div>
                      <p className="text-charcoal/70 font-body text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
                      {user && (
                        <button
                          onClick={() => { setReplyTo({ id: c.id, username: c.username }); setCommentText(""); }}
                          className="text-xs text-charcoal/30 hover:text-cinnabar mt-2 font-body"
                        >
                          {locale === "zh" ? "回复" : "Reply"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="ml-11 mt-3 space-y-3">
                      {c.replies.map((r) => (
                        <div key={r.id} className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {r.avatar ? (
                              <Image src={r.avatar} alt="" width={28} height={28} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-cinnabar text-[10px] font-display font-bold">{r.username[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-xs text-ink">{r.username}</span>
                              {r.reply_to_username && (
                                <span className="text-[10px] text-charcoal/30 font-body">@{r.reply_to_username}</span>
                              )}
                              <span className="text-[10px] text-charcoal/25 font-body">{formatRelativeTime(r.created_at, locale)}</span>
                            </div>
                            <p className="text-charcoal/70 font-body text-xs mt-0.5 whitespace-pre-wrap">{r.content}</p>
                            {user && (
                              <button
                                onClick={() => { setReplyTo({ id: c.id, username: r.username }); setCommentText(""); }}
                                className="text-[10px] text-charcoal/30 hover:text-cinnabar mt-1 font-body"
                              >
                                {locale === "zh" ? "回复" : "Reply"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Comment input */}
        <section className="mt-6 bg-white/70 border border-charcoal/5 rounded-sm p-5">
          {user ? (
            <>
              {replyTo && (
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-xs text-charcoal/40 font-body">
                    {locale === "zh" ? `回复 @${replyTo.username}` : `Replying to @${replyTo.username}`}
                  </span>
                  <button onClick={() => setReplyTo(null)} className="text-xs text-charcoal/30 hover:text-cinnabar"><CancelIcon size={12} /></button>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-cinnabar text-xs font-display font-bold">{user.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={locale === "zh" ? "写下你的评论..." : "Write a comment..."}
                    className="w-full min-h-[80px] bg-transparent focus:outline-none font-body text-sm text-charcoal placeholder:text-charcoal/30 resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-charcoal/5">
                    <span className="text-xs text-charcoal/20 font-body">{commentText.length}/500</span>
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || commenting}
                      className="px-5 py-1.5 bg-cinnabar text-white text-sm font-display tracking-wider rounded-sm hover:bg-cinnabar-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {commenting ? "..." : (locale === "zh" ? "发表评论" : "Post Comment")}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-charcoal/30 font-body text-center">
              <Link href="/login" className="text-cinnabar hover:text-cinnabar-deep">{locale === "zh" ? "登录" : "Login"}</Link>
              {locale === "zh" ? " 后即可评论" : " to comment"}
            </p>
          )}
        </section>
      </div>

      {/* Delete confirm */}
      {confirmDelete !== null && (
        <ConfirmModal
          message={locale === "zh" ? "确定删除这条动态吗？" : "Delete this post?"}
          confirmText={locale === "zh" ? "删除" : "Delete"}
          cancelText={locale === "zh" ? "取消" : "Cancel"}
          danger
          onConfirm={handleDeletePost}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

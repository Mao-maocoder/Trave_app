"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { spots } from "@/lib/spots";
import { formatRelativeTime } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Photo {
  id: number;
  user_id: number;
  username: string;
  user_avatar: string | null;
  image_path: string;
  spot_id: string | null;
  caption: string | null;
  likes: number;
  comment_count: number;
  created_at: string;
}

interface Comment {
  id: number;
  user_id: number;
  username: string;
  avatar: string | null;
  content: string;
  parent_id: number | null;
  reply_to_username: string | null;
  likes: number;
  liked: boolean;
  created_at: string;
  replies?: Comment[];
}

interface PhotoLightboxProps {
  photo: Photo;
  liked: boolean;
  isOwner: boolean;
  currentUserId: number | null;
  token: string | null;
  onLike: () => void;
  onDelete: () => void;
  onCommentCountChange: (count: number) => void;
  onClose: () => void;
}

export default function PhotoLightbox({
  photo,
  liked,
  isOwner,
  currentUserId,
  token,
  onLike,
  onDelete,
  onCommentCountChange,
  onClose,
}: PhotoLightboxProps) {
  const { locale } = useLocaleStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyUsername, setReplyUsername] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [tick, setTick] = useState(0);
  const [confirmDeleteComment, setConfirmDeleteComment] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const spotName = photo.spot_id
    ? spots.find((s) => s.id === photo.spot_id)?.name[locale] || null
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Global timer for relative time display
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(`/api/photos/${photo.id}/comments`, { headers })
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => {});
  }, [photo.id, token]);

  const handleToggleInput = () => {
    setShowInput((prev) => !prev);
    if (!showInput) {
      setReplyTo(null);
      setReplyUsername("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleReply = (commentId: number, username: string) => {
    setReplyTo(commentId);
    setReplyUsername(username);
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyUsername("");
  };

  const handleToggleZoom = () => {
    if (zoomed) {
      setZoomed(false);
      setPanX(0);
      setPanY(0);
    } else {
      setZoomed(true);
    }
  };

  const handleDoubleClick = () => {
    handleToggleZoom();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomed) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanX(dragStart.current.panX + dx);
    setPanY(dragStart.current.panY + dy);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleDeleteComment = (commentId: number) => {
    setConfirmDeleteComment(commentId);
  };

  const executeDeleteComment = async () => {
    if (!token || confirmDeleteComment === null) return;
    const commentId = confirmDeleteComment;
    setConfirmDeleteComment(null);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => {
          const filtered = prev.filter((c) => c.id !== commentId);
          return filtered.map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r.id !== commentId),
          }));
        });
        onCommentCountChange(data.comment_count);
      }
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(photo.image_path);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.image_path.split("/").pop() || "photo.webp";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const handleToggleReplies = (commentId: number) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const handleLikeComment = async (commentId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const updateComment = (c: Comment): Comment => {
        if (c.id === commentId) return { ...c, likes: data.likes, liked: data.liked };
        if (c.replies) return { ...c, replies: c.replies.map(updateComment) };
        return c;
      };
      setComments((prev) => prev.map(updateComment));
    } catch {
      // ignore
    }
  };

  const handleSubmitComment = async () => {
    if (!token || !commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const body: { content: string; parentId?: number; replyToUsername?: string } = { content: commentText.trim() };
      if (replyTo) {
        body.parentId = replyTo;
        body.replyToUsername = replyUsername;
      }

      const res = await fetch(`/api/photos/${photo.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        const newComment = { ...data.comment, liked: false, replies: [] };

        if (replyTo) {
          // Add reply to parent
          setComments((prev) =>
            prev.map((c) =>
              c.id === replyTo
                ? { ...c, replies: [...(c.replies || []), newComment] }
                : c
            )
          );
          // Auto-expand replies
          setExpandedReplies((prev) => new Set(prev).add(replyTo));
        } else {
          setComments((prev) => [...prev, newComment]);
        }

        setCommentText("");
        setReplyTo(null);
        setReplyUsername("");
        setShowInput(false);
        onCommentCountChange(getTotalCommentCount() + 1);
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalCommentCount = (): number => {
    return comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);
  };

  return (
    <div className="fixed inset-0 z-[200] isolate">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
        <div
          className="relative pointer-events-auto flex w-full max-w-4xl rounded-sm overflow-hidden shadow-2xl"
          style={{ maxHeight: "88vh" }}
        >
          {/* Left: Image */}
          <div
            ref={imageContainerRef}
            className="relative bg-ink flex items-center justify-center overflow-hidden select-none"
            style={{ width: "62%", cursor: zoomed ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Image
              src={photo.image_path}
              alt={photo.caption || ""}
              width={800}
              height={600}
              className="w-full h-auto max-h-[80vh] object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoomed ? 2 : 1}) translate(${panX / 2}px, ${panY / 2}px)`,
                pointerEvents: "none",
              }}
              sizes="55vw"
              draggable={false}
            />

            {/* Image controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleZoom(); }}
                className="w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white/80 hover:text-white rounded-sm transition-colors text-sm backdrop-blur-sm"
                title={zoomed ? (locale === "zh" ? "缩小" : "Zoom out") : (locale === "zh" ? "放大" : "Zoom in")}
              >
                {zoomed ? "−" : "+"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white/80 hover:text-white rounded-sm transition-colors text-sm backdrop-blur-sm"
                title={locale === "zh" ? "下载" : "Download"}
              >
                ↓
              </button>
            </div>

            {zoomed && (
              <div className="absolute top-3 left-3 text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-sm pointer-events-none">
                {locale === "zh" ? "拖动查看 · 双击缩小" : "Drag to pan · Double-click to zoom out"}
              </div>
            )}
          </div>

          {/* Right: Info panel */}
          <div
            className="flex flex-col bg-rice-paper border-l border-charcoal/10 self-stretch"
            style={{ width: "38%" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden">
                  {photo.user_avatar ? (
                    <Image src={photo.user_avatar} alt="" width={28} height={28} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-cinnabar text-xs font-display font-bold">
                      {photo.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-display font-bold text-sm text-ink">
                  {photo.username}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {isOwner && (
                  <button
                    onClick={onDelete}
                    className="w-7 h-7 flex items-center justify-center text-charcoal/30 hover:text-cinnabar hover:bg-cinnabar/5 rounded-sm transition-colors text-sm"
                    title={locale === "zh" ? "删除" : "Delete"}
                  >
                    🗑
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center text-charcoal/40 hover:text-ink hover:bg-charcoal/5 rounded-sm transition-colors"
                >
                  x
                </button>
              </div>
            </div>

            {/* Caption area — scrollable */}
            <div className="px-5 py-4 flex-1 overflow-y-auto min-h-0">
              {spotName && (
                <span className="inline-block text-[10px] px-2 py-0.5 bg-cinnabar/5 text-cinnabar border border-cinnabar/10 rounded-sm font-display tracking-wider mb-3">
                  {spotName}
                </span>
              )}
              {photo.caption && (
                <p className="text-sm text-charcoal/70 font-body leading-relaxed">
                  {photo.caption}
                </p>
              )}
              <p className="text-xs text-charcoal/30 font-body mt-2">
                {new Date(photo.created_at).toLocaleString()}
              </p>

              {/* Comments panel — always visible */}
              {showComments && (
                <div className="mt-4 pt-4 border-t border-charcoal/10 space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-xs text-charcoal/30 font-body text-center py-2">
                      {locale === "zh" ? "还没有评论" : "No comments yet"}
                    </p>
                  ) : (
                    comments.map((c) => (
                      <CommentItem
                        key={c.id}
                        comment={c}
                        locale={locale}
                        token={token}
                        tick={tick}
                        currentUserId={currentUserId}
                        isPhotoOwner={isOwner}
                        expanded={expandedReplies.has(c.id)}
                        onReply={handleReply}
                        onLike={handleLikeComment}
                        onToggleReplies={handleToggleReplies}
                        onDelete={handleDeleteComment}
                      />
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-charcoal/10 flex-shrink-0">
              {/* Action icons */}
              <div className="flex items-center gap-6 px-5 py-3">
                <button
                  onClick={onLike}
                  className={`flex items-center gap-1.5 transition-all duration-200 ${
                    liked ? "text-cinnabar scale-105" : "text-charcoal/40 hover:text-cinnabar"
                  }`}
                >
                  <span className="text-lg">{liked ? "❤" : "♡"}</span>
                  <span className="text-sm font-body">{photo.likes}</span>
                </button>
                <button
                  onClick={handleToggleInput}
                  className={`flex items-center gap-1.5 transition-colors ${
                    showInput ? "text-cinnabar" : "text-charcoal/40 hover:text-cinnabar"
                  }`}
                >
                  <span className="text-lg">💬</span>
                  <span className="text-sm font-body">{getTotalCommentCount() || photo.comment_count}</span>
                </button>
              </div>

              {/* Comment input */}
              {showInput && token && (
                <div className="px-5 py-3 border-t border-charcoal/5">
                  {replyTo && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-charcoal/50 font-body">
                        {locale === "zh" ? `回复 @${replyUsername}` : `Replying to @${replyUsername}`}
                      </span>
                      <button
                        onClick={handleCancelReply}
                        className="text-xs text-charcoal/30 hover:text-cinnabar"
                      >
                        x
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                      placeholder={
                        replyTo
                          ? (locale === "zh" ? `回复 @${replyUsername}...` : `Reply to @${replyUsername}...`)
                          : (locale === "zh" ? "写评论..." : "Write a comment...")
                      }
                      className="flex-1 text-sm bg-transparent focus:outline-none font-body text-charcoal placeholder:text-charcoal/30"
                      maxLength={500}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || submitting}
                      className="text-sm font-display text-cinnabar hover:text-cinnabar-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed tracking-wider"
                    >
                      {locale === "zh" ? "发送" : "Send"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Comment Confirm */}
      {confirmDeleteComment !== null && (
        <ConfirmModal
          message={locale === "zh" ? "确定删除这条评论吗？" : "Delete this comment?"}
          confirmText={locale === "zh" ? "删除" : "Delete"}
          cancelText={locale === "zh" ? "取消" : "Cancel"}
          danger
          onConfirm={executeDeleteComment}
          onCancel={() => setConfirmDeleteComment(null)}
        />
      )}
    </div>
  );
}

// Comment item component
function CommentItem({
  comment,
  locale,
  token,
  tick,
  currentUserId,
  isPhotoOwner,
  expanded,
  onReply,
  onLike,
  onToggleReplies,
  onDelete,
}: {
  comment: Comment;
  locale: string;
  token: string | null;
  tick: number;
  currentUserId: number | null;
  isPhotoOwner: boolean;
  expanded: boolean;
  onReply: (id: number, username: string) => void;
  onLike: (id: number) => void;
  onToggleReplies: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const replyCount = comment.replies?.length || 0;

  return (
    <div>
      <div className="flex gap-2">
        <div className="w-6 h-6 rounded-full bg-cinnabar/10 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
          {comment.avatar ? (
            <Image src={comment.avatar} alt="" width={24} height={24} className="w-full h-full object-cover" />
          ) : (
            <span className="text-cinnabar text-[10px] font-display font-bold">
              {comment.username[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* Line 1: username */}
          <span className="text-xs font-display font-bold text-ink">
            {comment.username}
          </span>
          {/* Line 2: content */}
          <p className="text-sm text-charcoal/70 font-body mt-0.5 break-words">
            {comment.content}
          </p>
          {/* Line 3: time left, actions right */}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-charcoal/30 font-body">
              {formatRelativeTime(comment.created_at, locale)}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onLike(comment.id)}
                className={`flex items-center gap-1 text-xs transition-all duration-200 ${
                  comment.liked ? "text-cinnabar" : "text-charcoal/30 hover:text-cinnabar"
                }`}
              >
                <span>{comment.liked ? "❤" : "♡"}</span>
                {comment.likes > 0 && <span className="font-body">{comment.likes}</span>}
              </button>
              {token && (
                <button
                  onClick={() => onReply(comment.id, comment.username)}
                  className="text-xs text-charcoal/30 hover:text-cinnabar transition-colors font-body"
                >
                  {locale === "zh" ? "回复" : "Reply"}
                </button>
              )}
              {(currentUserId === comment.user_id || isPhotoOwner) && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-charcoal/20 hover:text-cinnabar transition-colors font-body"
                  title={locale === "zh" ? "删除" : "Delete"}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Replies toggle */}
          {replyCount > 0 && (
            <button
              onClick={() => onToggleReplies(comment.id)}
              className="mt-2 text-xs text-cinnabar/70 hover:text-cinnabar transition-colors font-body"
            >
              {expanded
                ? (locale === "zh" ? "收起" : "Collapse")
                : (locale === "zh" ? `展开显示更多 (${replyCount})` : `Show replies (${replyCount})`)}
            </button>
          )}

          {/* Nested replies */}
          {expanded && comment.replies && (
            <div className="mt-3 pl-4 border-l-2 border-charcoal/8 space-y-3">
              {comment.replies.map((r) => (
                <ReplyItem
                  key={r.id}
                  reply={r}
                  locale={locale}
                  token={token}
                  tick={tick}
                  parentId={comment.id}
                  currentUserId={currentUserId}
                  isPhotoOwner={isPhotoOwner}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reply item component
function ReplyItem({
  reply,
  locale,
  token,
  tick,
  parentId,
  currentUserId,
  isPhotoOwner,
  onReply,
  onLike,
  onDelete,
}: {
  reply: Comment;
  locale: string;
  token: string | null;
  tick: number;
  parentId: number;
  currentUserId: number | null;
  isPhotoOwner: boolean;
  onReply: (id: number, username: string) => void;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
}) {

  return (
    <div className="flex gap-2">
      <div className="w-5 h-5 rounded-full bg-jade/10 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
        {reply.avatar ? (
          <Image src={reply.avatar} alt="" width={20} height={20} className="w-full h-full object-cover" />
        ) : (
          <span className="text-jade text-[9px] font-display font-bold">
            {reply.username[0].toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {/* Line 1: username > reply target */}
        <span className="text-[11px] font-display font-bold text-ink">
          {reply.username}
        </span>
        {reply.reply_to_username && (
          <span className="text-cinnabar/60 text-[11px]">
            {" > "}{reply.reply_to_username}
          </span>
        )}
        {/* Line 2: content */}
        <p className="text-[13px] text-charcoal/70 font-body mt-0.5 break-words">
          {reply.content}
        </p>
        {/* Line 3: time left, actions right */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-charcoal/30 font-body">
            {formatRelativeTime(reply.created_at, locale)}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLike(reply.id)}
              className={`flex items-center gap-1 text-xs transition-all duration-200 ${
                reply.liked ? "text-cinnabar" : "text-charcoal/30 hover:text-cinnabar"
              }`}
            >
              <span>{reply.liked ? "❤" : "♡"}</span>
              {reply.likes > 0 && <span className="font-body">{reply.likes}</span>}
            </button>
            {token && (
              <button
                onClick={() => onReply(parentId, reply.username)}
                className="text-xs text-charcoal/30 hover:text-cinnabar transition-colors font-body"
              >
                {locale === "zh" ? "回复" : "Reply"}
              </button>
            )}
            {(currentUserId === reply.user_id || isPhotoOwner) && (
              <button
                onClick={() => onDelete(reply.id)}
                className="text-xs text-charcoal/20 hover:text-cinnabar transition-colors font-body"
                title={locale === "zh" ? "删除" : "Delete"}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

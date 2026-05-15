import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/photos/[id]/comments — return nested comments
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photoId = parseInt(id);

  const allComments = db
    .prepare(`
      SELECT c.id, c.photo_id, c.user_id, c.username, c.content, c.parent_id, c.reply_to_username, c.likes, c.created_at,
             u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.photo_id = ?
      ORDER BY c.created_at ASC
    `)
    .all(photoId) as {
    id: number;
    photo_id: number;
    user_id: number;
    username: string;
    content: string;
    parent_id: number | null;
    reply_to_username: string | null;
    likes: number;
    created_at: string;
    avatar: string | null;
  }[];

  // Check if user has liked any comments
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  let likedCommentIds = new Set<number>();

  if (token) {
    try {
      const payload = await verifyToken(token);
      const liked = db
        .prepare("SELECT comment_id FROM comment_likes WHERE user_id = ?")
        .all(payload.id) as { comment_id: number }[];
      likedCommentIds = new Set(liked.map((l) => l.comment_id));
    } catch {
      // ignore
    }
  }

  // Build parent username map for backfill
  const usernameMap = new Map<number, string>();
  for (const c of allComments) {
    usernameMap.set(c.id, c.username);
  }

  // Backfill reply_to_username from parent for old data
  for (const c of allComments) {
    if (c.parent_id && !c.reply_to_username) {
      c.reply_to_username = usernameMap.get(c.parent_id) || null;
    }
  }

  // Build nested structure
  const topLevel = allComments.filter((c) => !c.parent_id);
  const repliesMap = new Map<number, typeof allComments>();

  for (const c of allComments) {
    if (c.parent_id) {
      const replies = repliesMap.get(c.parent_id) || [];
      replies.push(c);
      repliesMap.set(c.parent_id, replies);
    }
  }

  const comments = topLevel.map((c) => ({
    ...c,
    liked: likedCommentIds.has(c.id),
    replies: (repliesMap.get(c.id) || []).map((r) => ({
      ...r,
      liked: likedCommentIds.has(r.id),
    })),
  }));

  return NextResponse.json({ comments });
}

// POST /api/photos/[id]/comments — add comment or reply
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photoId = parseInt(id);

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const { content, parentId, replyToUsername } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "评论不能超过500字" }, { status: 400 });
    }

    const photo = db.prepare("SELECT id FROM photos WHERE id = ?").get(photoId);
    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    let validParentId: number | null = null;
    if (parentId) {
      const parent = db.prepare("SELECT id FROM comments WHERE id = ? AND photo_id = ?").get(parentId, photoId) as { id: number } | undefined;
      if (!parent) {
        return NextResponse.json({ error: "回复的评论不存在" }, { status: 400 });
      }
      validParentId = parent.id;
    }

    const result = db
      .prepare("INSERT INTO comments (photo_id, user_id, username, content, parent_id, reply_to_username) VALUES (?, ?, ?, ?, ?, ?)")
      .run(photoId, payload.id, payload.username, content.trim(), validParentId, replyToUsername || null);

    const comment = db
      .prepare(`
        SELECT c.id, c.photo_id, c.user_id, c.username, c.content, c.parent_id, c.reply_to_username, c.likes, c.created_at,
               u.avatar
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `)
      .get(result.lastInsertRowid);

    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}

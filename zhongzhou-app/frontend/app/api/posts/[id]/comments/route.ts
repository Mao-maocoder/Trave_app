import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

interface CommentRow {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  content: string;
  parent_id: number | null;
  reply_to_username: string | null;
  created_at: string;
  avatar: string | null;
}

// GET /api/posts/[id]/comments
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const comments = db
      .prepare(
        `SELECT pc.*, u.avatar FROM post_comments pc
         LEFT JOIN users u ON pc.user_id = u.id
         WHERE pc.post_id = ?
         ORDER BY pc.created_at ASC`
      )
      .all(postId) as CommentRow[];

    const topLevel = comments.filter((c) => !c.parent_id);
    const replies = comments.filter((c) => c.parent_id);

    const threaded = topLevel.map((c) => ({
      ...c,
      replies: replies.filter((r) => r.parent_id === c.id),
    }));

    return NextResponse.json({ comments: threaded, total: comments.length });
  } catch {
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    const post = db.prepare("SELECT id FROM posts WHERE id = ?").get(postId) as
      | { id: number }
      | undefined;

    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    const body = await req.json();
    const { content, parentId, replyToUsername } = body as {
      content: string;
      parentId?: number;
      replyToUsername?: string;
    };

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "评论不能为空" }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "评论不能超过500字" }, { status: 400 });
    }

    let validParentId: number | null = null;
    if (parentId) {
      const parent = db
        .prepare("SELECT id FROM post_comments WHERE id = ? AND post_id = ?")
        .get(parentId, postId) as { id: number } | undefined;
      if (parent) validParentId = parent.id;
    }

    const result = db
      .prepare(
        "INSERT INTO post_comments (post_id, user_id, username, content, parent_id, reply_to_username) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(postId, payload.id, payload.username, content.trim(), validParentId, replyToUsername || null);

    const comment = db
      .prepare("SELECT pc.*, u.avatar FROM post_comments pc LEFT JOIN users u ON pc.user_id = u.id WHERE pc.id = ?")
      .get(result.lastInsertRowid) as CommentRow;

    const commentCount = (
      db.prepare("SELECT COUNT(*) as count FROM post_comments WHERE post_id = ?").get(postId) as { count: number }
    ).count;

    return NextResponse.json({ comment, comment_count: commentCount });
  } catch {
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}

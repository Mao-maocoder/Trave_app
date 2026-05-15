import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// POST /api/comments/[id]/like — toggle like
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = parseInt(id);

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    const comment = db.prepare("SELECT id, likes FROM comments WHERE id = ?").get(commentId) as
      | { id: number; likes: number }
      | undefined;

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    const existing = db
      .prepare("SELECT * FROM comment_likes WHERE user_id = ? AND comment_id = ?")
      .get(payload.id, commentId) as { user_id: number; comment_id: number } | undefined;

    if (existing) {
      db.prepare("DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?").run(payload.id, commentId);
      db.prepare("UPDATE comments SET likes = MAX(0, likes - 1) WHERE id = ?").run(commentId);
      return NextResponse.json({ liked: false, likes: comment.likes - 1 });
    } else {
      db.prepare("INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)").run(payload.id, commentId);
      db.prepare("UPDATE comments SET likes = likes + 1 WHERE id = ?").run(commentId);
      return NextResponse.json({ liked: true, likes: comment.likes + 1 });
    }
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

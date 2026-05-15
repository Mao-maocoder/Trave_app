import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// POST /api/posts/[id]/like — toggle like
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

    const post = db.prepare("SELECT id, likes FROM posts WHERE id = ?").get(postId) as
      | { id: number; likes: number }
      | undefined;

    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    const existing = db
      .prepare("SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?")
      .get(payload.id, postId) as { user_id: number; post_id: number } | undefined;

    if (existing) {
      db.prepare("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?").run(payload.id, postId);
      db.prepare("UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?").run(postId);
      return NextResponse.json({ liked: false, likes: post.likes - 1 });
    } else {
      db.prepare("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)").run(payload.id, postId);
      db.prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?").run(postId);
      return NextResponse.json({ liked: true, likes: post.likes + 1 });
    }
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { deletePhoto } from "@/lib/storage";

// GET /api/posts/[id] — single post with comments
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const post = db
      .prepare(
        `SELECT p.*, u.avatar as user_avatar,
         (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count
         FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?`
      )
      .get(postId) as any | undefined;

    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    // Check liked status
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    let liked = false;

    if (token) {
      try {
        const payload = await verifyToken(token);
        const existing = db
          .prepare("SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?")
          .get(payload.id, postId);
        liked = !!existing;
      } catch {
        // ignore
      }
    }

    // Get comments
    const comments = db
      .prepare(
        `SELECT pc.*, u.avatar FROM post_comments pc
         LEFT JOIN users u ON pc.user_id = u.id
         WHERE pc.post_id = ?
         ORDER BY pc.created_at ASC`
      )
      .all(postId) as any[];

    const topLevel = comments.filter((c: any) => !c.parent_id);
    const replies = comments.filter((c: any) => c.parent_id);

    const threaded = topLevel.map((c: any) => ({
      ...c,
      replies: replies.filter((r: any) => r.parent_id === c.id),
    }));

    return NextResponse.json({ post: { ...post, liked }, comments: threaded });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// DELETE /api/posts/[id] — delete own post
export async function DELETE(
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

    const post = db
      .prepare("SELECT id, user_id, image_path FROM posts WHERE id = ?")
      .get(postId) as { id: number; user_id: number; image_path: string | null } | undefined;

    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    if (post.user_id !== payload.id && payload.role !== "admin") {
      return NextResponse.json({ error: "无权删除" }, { status: 403 });
    }

    if (post.image_path) {
      await deletePhoto(post.image_path);
    }

    db.prepare("DELETE FROM posts WHERE id = ?").run(postId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

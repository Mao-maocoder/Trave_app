import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// DELETE /api/comments/[id] — delete a comment
export async function DELETE(
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

    // Find the comment and its photo owner
    const comment = db
      .prepare(`
        SELECT c.id, c.user_id, c.photo_id, p.user_id AS photo_owner_id
        FROM comments c
        JOIN photos p ON c.photo_id = p.id
        WHERE c.id = ?
      `)
      .get(commentId) as
      | { id: number; user_id: number; photo_id: number; photo_owner_id: number }
      | undefined;

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    // Only comment author or photo owner can delete
    const isCommentAuthor = comment.user_id === payload.id;
    const isPhotoOwner = comment.photo_owner_id === payload.id;

    if (!isCommentAuthor && !isPhotoOwner) {
      return NextResponse.json({ error: "无权删除此评论" }, { status: 403 });
    }

    // Delete comment (CASCADE will remove replies and likes)
    db.prepare("DELETE FROM comments WHERE id = ?").run(commentId);

    // Update photo comment count
    const count = db
      .prepare("SELECT COUNT(*) AS cnt FROM comments WHERE photo_id = ?")
      .get(comment.photo_id) as { cnt: number };

    return NextResponse.json({ success: true, comment_count: count.cnt });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

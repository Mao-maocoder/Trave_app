import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// POST /api/photos/[id]/like — toggle like
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

    const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(photoId) as
      | { id: number; likes: number }
      | undefined;

    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    const existing = db
      .prepare("SELECT * FROM photo_likes WHERE user_id = ? AND photo_id = ?")
      .get(payload.id, photoId) as { user_id: number; photo_id: number } | undefined;

    if (existing) {
      // Unlike
      db.prepare("DELETE FROM photo_likes WHERE user_id = ? AND photo_id = ?").run(
        payload.id,
        photoId
      );
      db.prepare("UPDATE photos SET likes = MAX(0, likes - 1) WHERE id = ?").run(photoId);
      return NextResponse.json({ liked: false, likes: photo.likes - 1 });
    } else {
      // Like
      db.prepare("INSERT INTO photo_likes (user_id, photo_id) VALUES (?, ?)").run(
        payload.id,
        photoId
      );
      db.prepare("UPDATE photos SET likes = likes + 1 WHERE id = ?").run(photoId);
      return NextResponse.json({ liked: true, likes: photo.likes + 1 });
    }
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

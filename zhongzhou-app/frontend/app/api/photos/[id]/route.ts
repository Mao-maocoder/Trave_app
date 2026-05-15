import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { deletePhoto } from "@/lib/storage";

// DELETE /api/photos/[id]
export async function DELETE(
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

    const photo = db
      .prepare("SELECT * FROM photos WHERE id = ?")
      .get(photoId) as { id: number; user_id: number; image_path: string } | undefined;

    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    if (photo.user_id !== payload.id && payload.role !== "admin") {
      return NextResponse.json({ error: "只能删除自己的照片" }, { status: 403 });
    }

    // Delete file and DB records
    await deletePhoto(photo.image_path);
    db.prepare("DELETE FROM photo_likes WHERE photo_id = ?").run(photoId);
    db.prepare("DELETE FROM comments WHERE photo_id = ?").run(photoId);
    db.prepare("DELETE FROM photos WHERE id = ?").run(photoId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

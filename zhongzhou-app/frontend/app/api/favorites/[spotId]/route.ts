import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// POST /api/favorites/[spotId] — toggle favorite
export async function POST(
  req: Request,
  { params }: { params: Promise<{ spotId: string }> }
) {
  try {
    const { spotId } = await params;

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    const existing = db
      .prepare("SELECT * FROM favorites WHERE user_id = ? AND spot_id = ?")
      .get(payload.id, spotId) as { user_id: number; spot_id: string } | undefined;

    if (existing) {
      db.prepare("DELETE FROM favorites WHERE user_id = ? AND spot_id = ?").run(payload.id, spotId);
      return NextResponse.json({ favorited: false });
    } else {
      db.prepare("INSERT INTO favorites (user_id, spot_id) VALUES (?, ?)").run(payload.id, spotId);
      return NextResponse.json({ favorited: true });
    }
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

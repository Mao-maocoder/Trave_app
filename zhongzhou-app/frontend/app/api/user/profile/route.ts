import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// PUT /api/user/profile — update username
export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const { username } = await req.json();

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
    }

    if (username.trim().length > 20) {
      return NextResponse.json({ error: "昵称不能超过20个字符" }, { status: 400 });
    }

    const trimmed = username.trim();

    // Check uniqueness (excluding self)
    const existing = db
      .prepare("SELECT id FROM users WHERE username = ? AND id != ?")
      .get(trimmed, payload.id) as { id: number } | undefined;

    if (existing) {
      return NextResponse.json({ error: "该昵称已被使用" }, { status: 409 });
    }

    db.prepare("UPDATE users SET username = ? WHERE id = ?").run(trimmed, payload.id);

    // Also update username in photos and comments
    db.prepare("UPDATE photos SET username = ? WHERE user_id = ?").run(trimmed, payload.id);
    db.prepare("UPDATE comments SET username = ? WHERE user_id = ?").run(trimmed, payload.id);

    const user = db
      .prepare("SELECT id, username, email, role, avatar FROM users WHERE id = ?")
      .get(payload.id);

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    const user = db
      .prepare("SELECT id, username, email, role, avatar FROM users WHERE id = ?")
      .get(payload.id) as {
      id: number;
      username: string;
      email: string;
      role: string;
      avatar: string | null;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Token 无效或已过期" },
      { status: 401 }
    );
  }
}

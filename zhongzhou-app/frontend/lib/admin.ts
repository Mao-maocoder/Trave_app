import { NextResponse } from "next/server";
import { getUserFromToken, getUserProfile } from "@/lib/auth";

export interface AdminPayload {
  id: string;
  username: string;
  role: string;
}

export async function requireAdmin(req: Request): Promise<
  | { ok: true; payload: AdminPayload }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "请先登录" }, { status: 401 }) };
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return { ok: false, response: NextResponse.json({ error: "登录已过期" }, { status: 401 }) };
    }

    const profile = await getUserProfile(user.id);
    if (!profile || profile.role !== "admin") {
      return { ok: false, response: NextResponse.json({ error: "权限不足" }, { status: 403 }) };
    }

    return { ok: true, payload: { id: user.id, username: profile.username, role: profile.role } };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "登录已过期" }, { status: 401 }) };
  }
}

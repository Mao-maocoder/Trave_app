import { NextResponse } from "next/server";
import { getUserFromToken, getUserProfile } from "@/lib/auth";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const authUser = await getUserFromToken(token);
    if (!authUser) {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }

    const profile = await getUserProfile(authUser.id);

    const user = {
      id: authUser.id,
      username: profile?.username || authUser.user_metadata?.username || authUser.email?.split("@")[0],
      email: authUser.email,
      role: profile?.role || "user",
      avatar: profile?.avatar || null,
    };

    return NextResponse.json({ user, token });
  } catch {
    return NextResponse.json({ error: "登录已过期" }, { status: 401 });
  }
}

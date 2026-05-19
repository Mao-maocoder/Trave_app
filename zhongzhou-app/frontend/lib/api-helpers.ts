import { NextResponse } from "next/server";
import { getUserFromToken, getUserProfile } from "@/lib/auth";

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const authUser = await getUserFromToken(token);
    if (!authUser) return null;
    const profile = await getUserProfile(authUser.id);
    return {
      id: authUser.id,
      username: profile?.username || authUser.email?.split("@")[0] || "unknown",
      role: profile?.role || "user",
    };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "请先登录" }, { status: 401 });
}

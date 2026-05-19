import { NextResponse } from "next/server";
import { signIn, getUserProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "请填写用户名和密码" }, { status: 400 });
    }

    // Look up email by username
    const { data: userRow } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("username", username)
      .maybeSingle();

    if (!userRow) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const data = await signIn(userRow.email, password);

    if (!data.user || !data.session) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const profile = await getUserProfile(data.user.id);

    const user = {
      id: data.user.id,
      username: profile?.username || data.user.user_metadata?.username || username,
      email: data.user.email || userRow.email,
      role: profile?.role || "user",
      avatar: profile?.avatar || null,
    };

    return NextResponse.json({ user, token: data.session.access_token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "登录失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

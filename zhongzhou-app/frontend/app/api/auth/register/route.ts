import { NextResponse } from "next/server";
import { signUp, getUserProfile } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json({ error: "用户名长度需要 2-20 个字符" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少 6 个字符" }, { status: 400 });
    }

    const data = await signUp(email, password, username);

    if (!data.user) {
      return NextResponse.json({ error: "注册失败" }, { status: 500 });
    }

    // Wait a moment for the trigger to create the profile
    await new Promise((r) => setTimeout(r, 500));

    const profile = await getUserProfile(data.user.id);
    const userRole = profile?.role || "user";

    const user = {
      id: data.user.id,
      username: profile?.username || username,
      email: data.user.email || email,
      role: userRole,
      avatar: profile?.avatar || null,
    };

    const token = data.session?.access_token || "";

    return NextResponse.json({ user, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "注册失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

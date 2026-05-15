import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "请填写用户名和密码" },
        { status: 400 }
      );
    }

    const user = db
      .prepare("SELECT id, username, email, password_hash, role, avatar FROM users WHERE username = ?")
      .get(username) as {
      id: number;
      username: string;
      email: string;
      password_hash: string;
      role: string;
      avatar: string | null;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "用户名不存在" },
        { status: 401 }
      );
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json(
        { error: "密码错误" },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch {
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}

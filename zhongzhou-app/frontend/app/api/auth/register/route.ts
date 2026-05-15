import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "请填写所有字段" },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: "用户名长度需要 2-20 个字符" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少 6 个字符" },
        { status: 400 }
      );
    }

    const existing = db
      .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
      .get(username, email) as { id: number } | undefined;

    if (existing) {
      return NextResponse.json(
        { error: "用户名或邮箱已存在" },
        { status: 409 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db
      .prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
      .run(username, email, passwordHash);

    const user = {
      id: result.lastInsertRowid as number,
      username,
      role: "user",
    };

    const token = await signToken(user);

    return NextResponse.json({
      user: { ...user, email },
      token,
    });
  } catch {
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}

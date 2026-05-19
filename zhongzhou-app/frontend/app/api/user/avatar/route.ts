import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { saveAvatar, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "仅支持 JPG、PNG、WebP 格式" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "文件大小不能超过 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `avatar_${authUser.id}_${Date.now()}.${ext}`;
    const avatarUrl = await saveAvatar(buffer, filename);

    await supabaseAdmin.from("users").update({ avatar: avatarUrl }).eq("id", authUser.id);

    return NextResponse.json({ avatar: avatarUrl });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

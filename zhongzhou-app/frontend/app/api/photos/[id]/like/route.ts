import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// POST /api/photos/[id]/like — toggle like
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photoId = parseInt(id);

    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: photo } = await supabaseAdmin
      .from("photos")
      .select("id, likes")
      .eq("id", photoId)
      .single();

    if (!photo) return NextResponse.json({ error: "照片不存在" }, { status: 404 });

    const { data: existing } = await supabaseAdmin
      .from("photo_likes")
      .select("photo_id")
      .eq("user_id", authUser.id)
      .eq("photo_id", photoId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("photo_likes").delete().eq("user_id", authUser.id).eq("photo_id", photoId);
      await supabaseAdmin.from("photos").update({ likes: Math.max(0, photo.likes - 1) }).eq("id", photoId);
      return NextResponse.json({ liked: false, likes: photo.likes - 1 });
    } else {
      await supabaseAdmin.from("photo_likes").insert({ user_id: authUser.id, photo_id: photoId });
      await supabaseAdmin.from("photos").update({ likes: photo.likes + 1 }).eq("id", photoId);
      return NextResponse.json({ liked: true, likes: photo.likes + 1 });
    }
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { deletePhoto } from "@/lib/storage";

// DELETE /api/photos/[id]
export async function DELETE(
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
      .select("id, user_id, image_path")
      .eq("id", photoId)
      .single();

    if (!photo) return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    if (photo.user_id !== authUser.id && authUser.role !== "admin") {
      return NextResponse.json({ error: "只能删除自己的照片" }, { status: 403 });
    }

    await deletePhoto(photo.image_path);
    await supabaseAdmin.from("photos").delete().eq("id", photoId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

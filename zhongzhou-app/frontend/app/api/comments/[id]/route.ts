import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// DELETE /api/comments/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = parseInt(id);

    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: comment } = await supabaseAdmin
      .from("comments")
      .select("id, user_id, photo_id")
      .eq("id", commentId)
      .single();

    if (!comment) return NextResponse.json({ error: "评论不存在" }, { status: 404 });

    const { data: photo } = await supabaseAdmin
      .from("photos")
      .select("user_id")
      .eq("id", comment.photo_id)
      .single();

    const isAuthor = comment.user_id === authUser.id;
    const isPhotoOwner = photo?.user_id === authUser.id;

    if (!isAuthor && !isPhotoOwner) {
      return NextResponse.json({ error: "无权删除此评论" }, { status: 403 });
    }

    await supabaseAdmin.from("comments").delete().eq("id", commentId);

    const { count } = await supabaseAdmin
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("photo_id", comment.photo_id);

    return NextResponse.json({ success: true, comment_count: count || 0 });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

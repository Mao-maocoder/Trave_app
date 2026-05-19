import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// POST /api/comments/[id]/like — toggle like
export async function POST(
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
      .select("id, likes")
      .eq("id", commentId)
      .single();

    if (!comment) return NextResponse.json({ error: "评论不存在" }, { status: 404 });

    const { data: existing } = await supabaseAdmin
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", authUser.id)
      .eq("comment_id", commentId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("comment_likes").delete().eq("user_id", authUser.id).eq("comment_id", commentId);
      await supabaseAdmin.from("comments").update({ likes: Math.max(0, comment.likes - 1) }).eq("id", commentId);
      return NextResponse.json({ liked: false, likes: comment.likes - 1 });
    } else {
      await supabaseAdmin.from("comment_likes").insert({ user_id: authUser.id, comment_id: commentId });
      await supabaseAdmin.from("comments").update({ likes: comment.likes + 1 }).eq("id", commentId);
      return NextResponse.json({ liked: true, likes: comment.likes + 1 });
    }
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

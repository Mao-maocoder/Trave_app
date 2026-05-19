import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// POST /api/posts/[id]/like — toggle like
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("id, likes")
      .eq("id", postId)
      .single();

    if (!post) return NextResponse.json({ error: "动态不存在" }, { status: 404 });

    const { data: existing } = await supabaseAdmin
      .from("post_likes")
      .select("post_id")
      .eq("user_id", authUser.id)
      .eq("post_id", postId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("post_likes").delete().eq("user_id", authUser.id).eq("post_id", postId);
      await supabaseAdmin.from("posts").update({ likes: Math.max(0, post.likes - 1) }).eq("id", postId);
      return NextResponse.json({ liked: false, likes: post.likes - 1 });
    } else {
      await supabaseAdmin.from("post_likes").insert({ user_id: authUser.id, post_id: postId });
      await supabaseAdmin.from("posts").update({ likes: post.likes + 1 }).eq("id", postId);
      return NextResponse.json({ liked: true, likes: post.likes + 1 });
    }
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

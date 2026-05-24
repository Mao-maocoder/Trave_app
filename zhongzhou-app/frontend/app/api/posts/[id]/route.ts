import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { deletePhoto } from "@/lib/storage";

// GET /api/posts/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    // Fetch author avatar
    const { data: author } = await supabaseAdmin
      .from("users")
      .select("avatar")
      .eq("id", post.user_id)
      .single();

    // Check liked status
    const authUser = await getAuthUser(req);
    let liked = false;
    if (authUser) {
      const { data: existing } = await supabaseAdmin
        .from("post_likes")
        .select("post_id")
        .eq("user_id", authUser.id)
        .eq("post_id", postId)
        .maybeSingle();
      liked = !!existing;
    }

    // Get comments
    const { data: comments } = await supabaseAdmin
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    const allComments = comments || [];

    // Fetch avatars for comment authors
    const commentUserIds = [...new Set(allComments.map((c) => c.user_id))];
    const avatarMap = new Map<string, string | null>();
    if (commentUserIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("id, avatar")
        .in("id", commentUserIds);
      (users || []).forEach((u) => avatarMap.set(u.id, u.avatar));
    }

    const commentsWithAvatar = allComments.map((c) => ({
      ...c,
      avatar: avatarMap.get(c.user_id) || null,
    }));

    const topLevel = commentsWithAvatar.filter((c) => !c.parent_id);
    const replies = commentsWithAvatar.filter((c) => c.parent_id);
    const threaded = topLevel.map((c) => ({
      ...c,
      replies: replies.filter((r) => r.parent_id === c.id),
    }));

    return NextResponse.json({
      post: {
        ...post,
        user_avatar: author?.avatar || null,
        liked,
        comment_count: allComments.length,
      },
      comments: threaded,
    });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// DELETE /api/posts/[id]
export async function DELETE(
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
      .select("id, user_id, image_path")
      .eq("id", postId)
      .single();

    if (!post) return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    if (post.user_id !== authUser.id && authUser.role !== "admin") {
      return NextResponse.json({ error: "无权删除" }, { status: 403 });
    }

    if (post.image_path) await deletePhoto(post.image_path);
    await supabaseAdmin.from("posts").delete().eq("id", postId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

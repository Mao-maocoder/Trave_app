import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// GET /api/posts/[id]/comments
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const { data: comments } = await supabaseAdmin
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    const allComments = comments || [];

    // Fetch avatars for comment authors
    const userIds = [...new Set(allComments.map((c) => c.user_id))];
    const avatarMap = new Map<string, string | null>();
    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("id, avatar")
        .in("id", userIds);
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

    return NextResponse.json({ comments: threaded, total: commentsWithAvatar.length });
  } catch {
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: post } = await supabaseAdmin.from("posts").select("id").eq("id", postId).single();
    if (!post) return NextResponse.json({ error: "动态不存在" }, { status: 404 });

    const body = await req.json();
    const { content, parentId, replyToUsername } = body as {
      content: string;
      parentId?: number;
      replyToUsername?: string;
    };

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "评论不能为空" }, { status: 400 });
    }
    if (content.length > 500) {
      return NextResponse.json({ error: "评论不能超过500字" }, { status: 400 });
    }

    let validParentId: number | null = null;
    if (parentId) {
      const { data: parent } = await supabaseAdmin
        .from("post_comments")
        .select("id")
        .eq("id", parentId)
        .eq("post_id", postId)
        .maybeSingle();
      if (parent) validParentId = parent.id;
    }

    const { data: comment, error } = await supabaseAdmin
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: authUser.id,
        username: authUser.username,
        content: content.trim(),
        parent_id: validParentId,
        reply_to_username: replyToUsername || null,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: avatarRow } = await supabaseAdmin
      .from("users")
      .select("avatar")
      .eq("id", authUser.id)
      .single();

    const { count } = await supabaseAdmin
      .from("post_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    return NextResponse.json({
      comment: { ...comment, avatar: avatarRow?.avatar || null },
      comment_count: count || 0,
    });
  } catch {
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}

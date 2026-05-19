import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// GET /api/photos/[id]/comments
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photoId = parseInt(id);

  const { data: comments } = await supabaseAdmin
    .from("comments")
    .select("*")
    .eq("photo_id", photoId)
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

  // Check liked status
  const authUser = await getAuthUser(req);
  const likedCommentIds = new Set<number>();
  if (authUser) {
    const { data: likes } = await supabaseAdmin
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", authUser.id);
    (likes || []).forEach((l) => likedCommentIds.add(l.comment_id));
  }

  // Backfill reply_to_username
  const usernameMap = new Map<number, string>();
  for (const c of commentsWithAvatar) usernameMap.set(c.id, c.username);
  for (const c of commentsWithAvatar) {
    if (c.parent_id && !c.reply_to_username) {
      c.reply_to_username = usernameMap.get(c.parent_id) || null;
    }
  }

  const topLevel = commentsWithAvatar.filter((c) => !c.parent_id);
  const repliesMap = new Map<number, typeof commentsWithAvatar>();
  for (const c of commentsWithAvatar) {
    if (c.parent_id) {
      const replies = repliesMap.get(c.parent_id) || [];
      replies.push(c);
      repliesMap.set(c.parent_id, replies);
    }
  }

  const nested = topLevel.map((c) => ({
    ...c,
    liked: likedCommentIds.has(c.id),
    replies: (repliesMap.get(c.id) || []).map((r) => ({
      ...r,
      liked: likedCommentIds.has(r.id),
    })),
  }));

  return NextResponse.json({ comments: nested });
}

// POST /api/photos/[id]/comments
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photoId = parseInt(id);

    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { content, parentId, replyToUsername } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
    }
    if (content.length > 500) {
      return NextResponse.json({ error: "评论不能超过500字" }, { status: 400 });
    }

    const { data: photo } = await supabaseAdmin.from("photos").select("id").eq("id", photoId).single();
    if (!photo) return NextResponse.json({ error: "照片不存在" }, { status: 404 });

    let validParentId: number | null = null;
    if (parentId) {
      const { data: parent } = await supabaseAdmin
        .from("comments")
        .select("id")
        .eq("id", parentId)
        .eq("photo_id", photoId)
        .maybeSingle();
      if (parent) validParentId = parent.id;
    }

    const { data: comment, error } = await supabaseAdmin
      .from("comments")
      .insert({
        photo_id: photoId,
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

    return NextResponse.json({ comment: { ...comment, avatar: avatarRow?.avatar || null } });
  } catch {
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}

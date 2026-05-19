import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/posts?search=&page=1&limit=20
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`content.ilike.%${search}%,username.ilike.%${search}%`);
  }

  const { data: posts, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get comment counts
  const postIds = (posts || []).map((p) => p.id);
  const commentCounts: Record<number, number> = {};
  if (postIds.length > 0) {
    const { data: comments } = await supabaseAdmin
      .from("post_comments")
      .select("post_id")
      .in("post_id", postIds);
    (comments || []).forEach((c) => {
      commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
    });
  }

  const postsWithCounts = (posts || []).map((p) => ({
    ...p,
    comment_count: commentCounts[p.id] || 0,
  }));

  return NextResponse.json({
    posts: postsWithCounts,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// DELETE /api/admin/posts
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  await supabaseAdmin.from("posts").delete().eq("id", postId);
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const [usersRes, photosRes, postsRes, commentsRes, postCommentsRes] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("photos").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("posts").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("comments").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("post_comments").select("*", { count: "exact", head: true }),
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [recentUsers, recentPhotos, recentPosts] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabaseAdmin.from("photos").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabaseAdmin.from("posts").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
  ]);

  const { data: photosByStatus } = await supabaseAdmin
    .from("photos")
    .select("status");

  const statusCounts: Record<string, number> = {};
  (photosByStatus || []).forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  const { data: recentActivity } = await supabaseAdmin
    .from("posts")
    .select("username, content, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    totalUsers: usersRes.count || 0,
    totalPhotos: photosRes.count || 0,
    totalPosts: postsRes.count || 0,
    totalComments: (commentsRes.count || 0) + (postCommentsRes.count || 0),
    recentUsers: recentUsers.count || 0,
    recentPhotos: recentPhotos.count || 0,
    recentPosts: recentPosts.count || 0,
    photosByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    recentActivity: (recentActivity || []).map((a) => ({ type: "post", detail: a.content, ...a })),
  });
}

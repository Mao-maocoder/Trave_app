import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { savePhoto, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/storage";
import { getIpLocation } from "@/lib/ip";
import { checkAchievements } from "@/lib/achievements";

// GET /api/posts?page=1&limit=20&spotId=xxx&search=keyword
export async function GET(req: Request) {
  const url = new URL(req.url);
  const spotId = url.searchParams.get("spotId");
  const search = url.searchParams.get("search")?.trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (spotId) query = query.eq("spot_id", spotId);
  if (search) query = query.or(`content.ilike.%${search}%,username.ilike.%${search}%`);

  const { data: posts, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch avatars for post authors
  const userIds = [...new Set((posts || []).map((p) => p.user_id))];
  const avatarMap = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, avatar")
      .in("id", userIds);
    (users || []).forEach((u) => avatarMap.set(u.id, u.avatar));
  }

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

  // Check liked status
  const authUser = await getAuthUser(req);
  const likedPostIds = new Set<number>();
  if (authUser && postIds.length > 0) {
    const { data: likes } = await supabaseAdmin
      .from("post_likes")
      .select("post_id")
      .eq("user_id", authUser.id)
      .in("post_id", postIds);
    (likes || []).forEach((l) => likedPostIds.add(l.post_id));
  }

  const postsWithMeta = (posts || []).map((p) => ({
    ...p,
    user_avatar: avatarMap.get(p.user_id) || null,
    comment_count: commentCounts[p.id] || 0,
    liked: likedPostIds.has(p.id),
  }));

  return NextResponse.json({
    posts: postsWithMeta,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST /api/posts — create post
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const formData = await req.formData();
    const content = formData.get("content") as string;
    const spotId = formData.get("spotId") as string | null;
    const file = formData.get("image") as File | null;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "内容不能超过2000字" }, { status: 400 });
    }

    let imagePath: string | null = null;
    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "仅支持 JPG、PNG、WebP 格式" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "文件大小不能超过 5MB" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `post_${authUser.id}_${Date.now()}.${ext}`;
      imagePath = await savePhoto(buffer, filename);
    }

    const ipLocation = await getIpLocation(req);

    const { data, error } = await supabaseAdmin
      .from("posts")
      .insert({
        user_id: authUser.id,
        username: authUser.username,
        content: content.trim(),
        spot_id: spotId || null,
        image_path: imagePath,
        ip_location: ipLocation,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: avatarRow } = await supabaseAdmin
      .from("users")
      .select("avatar")
      .eq("id", authUser.id)
      .single();

    const newAchievements = await checkAchievements(authUser.id).catch(() => []);

    return NextResponse.json({
      post: { ...data, user_avatar: avatarRow?.avatar || null, comment_count: 0, liked: false },
      newAchievements,
    });
  } catch {
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}

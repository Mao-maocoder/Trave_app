import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { savePhoto, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/storage";
import { checkAchievements } from "@/lib/achievements";

// GET /api/photos?spotId=xxx&page=1&limit=20&search=keyword
export async function GET(req: Request) {
  const url = new URL(req.url);
  const spotId = url.searchParams.get("spotId");
  const search = url.searchParams.get("search")?.trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("photos")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (spotId) query = query.eq("spot_id", spotId);
  if (search) query = query.or(`caption.ilike.%${search}%,username.ilike.%${search}%`);

  const { data: photos, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch avatars for photo authors
  const userIds = [...new Set((photos || []).map((p) => p.user_id))];
  const avatarMap = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, avatar")
      .in("id", userIds);
    (users || []).forEach((u) => avatarMap.set(u.id, u.avatar));
  }

  const photoIds = (photos || []).map((p) => p.id);
  const commentCounts: Record<number, number> = {};
  if (photoIds.length > 0) {
    const { data: comments } = await supabaseAdmin
      .from("comments")
      .select("photo_id")
      .in("photo_id", photoIds);
    (comments || []).forEach((c) => {
      commentCounts[c.photo_id] = (commentCounts[c.photo_id] || 0) + 1;
    });
  }

  const authUser = await getAuthUser(req);
  const likedPhotoIds = new Set<number>();
  if (authUser && photoIds.length > 0) {
    const { data: likes } = await supabaseAdmin
      .from("photo_likes")
      .select("photo_id")
      .eq("user_id", authUser.id)
      .in("photo_id", photoIds);
    (likes || []).forEach((l) => likedPhotoIds.add(l.photo_id));
  }

  const photosWithAvatar = (photos || []).map((p) => ({
    ...p,
    user_avatar: avatarMap.get(p.user_id) || null,
    comment_count: commentCounts[p.id] || 0,
    liked: likedPhotoIds.has(p.id),
  }));

  return NextResponse.json({
    photos: photosWithAvatar,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST /api/photos — upload
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const spotId = formData.get("spotId") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file) return NextResponse.json({ error: "请选择图片" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "仅支持 JPG、PNG、WebP 格式" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "文件大小不能超过 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const imagePath = await savePhoto(buffer, filename);

    const { data: photo, error } = await supabaseAdmin
      .from("photos")
      .insert({
        user_id: authUser.id,
        username: authUser.username,
        image_path: imagePath,
        spot_id: spotId || null,
        caption: caption || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const newAchievements = await checkAchievements(authUser.id).catch(() => []);

    return NextResponse.json({
      photo: { ...photo, user_avatar: null, comment_count: 0, liked: false },
      newAchievements,
    });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

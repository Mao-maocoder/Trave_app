import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { savePhoto, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/storage";
import { getIpLocation } from "@/lib/ip";

// GET /api/posts?page=1&limit=20&spotId=xxx
export async function GET(req: Request) {
  const url = new URL(req.url);
  const spotId = url.searchParams.get("spotId");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  let query = `SELECT p.*, u.avatar as user_avatar,
    (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count,
    (SELECT pc.content FROM post_comments pc WHERE pc.post_id = p.id ORDER BY pc.created_at DESC LIMIT 1) as latest_comment_text,
    (SELECT pc.username FROM post_comments pc WHERE pc.post_id = p.id ORDER BY pc.created_at DESC LIMIT 1) as latest_comment_user,
    (SELECT pc.created_at FROM post_comments pc WHERE pc.post_id = p.id ORDER BY pc.created_at DESC LIMIT 1) as latest_comment_time
    FROM posts p LEFT JOIN users u ON p.user_id = u.id`;
  const params: (string | number)[] = [];

  if (spotId) {
    query += " WHERE p.spot_id = ?";
    params.push(spotId);
  }

  const countQuery = "SELECT COUNT(*) as total FROM posts" + (spotId ? " WHERE spot_id = ?" : "");
  const total = (db.prepare(countQuery).get(...params) as { total: number }).total;

  query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const posts = db.prepare(query).all(...params);

  // Check liked status
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  let likedPostIds = new Set<number>();

  if (token) {
    try {
      const payload = await verifyToken(token);
      const liked = db
        .prepare("SELECT post_id FROM post_likes WHERE user_id = ?")
        .all(payload.id) as { post_id: number }[];
      likedPostIds = new Set(liked.map((l) => l.post_id));
    } catch {
      // ignore
    }
  }

  const postsWithLike = (posts as any[]).map((p) => ({
    ...p,
    liked: likedPostIds.has(p.id),
  }));

  return NextResponse.json({
    posts: postsWithLike,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/posts — create post
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const payload = await verifyToken(token);
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
      const filename = `post_${payload.id}_${Date.now()}.${ext}`;
      imagePath = await savePhoto(buffer, filename);
    }

    const ipLocation = await getIpLocation(req);

    const result = db
      .prepare("INSERT INTO posts (user_id, username, content, spot_id, image_path, ip_location) VALUES (?, ?, ?, ?, ?, ?)")
      .run(payload.id, payload.username, content.trim(), spotId || null, imagePath, ipLocation);

    const post = db
      .prepare("SELECT p.*, u.avatar as user_avatar, 0 as comment_count FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json({ post: { ...(post as any), liked: false } });
  } catch {
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}

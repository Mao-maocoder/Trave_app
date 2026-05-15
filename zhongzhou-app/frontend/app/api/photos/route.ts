import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { savePhoto, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/storage";

// GET /api/photos?spotId=xxx&page=1&limit=20
export async function GET(req: Request) {
  const url = new URL(req.url);
  const spotId = url.searchParams.get("spotId");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  let query = "SELECT photos.*, u.avatar as user_avatar, (SELECT COUNT(*) FROM comments WHERE comments.photo_id = photos.id) as comment_count FROM photos LEFT JOIN users u ON photos.user_id = u.id WHERE photos.status = 'approved'";
  const params: (string | number)[] = [];

  if (spotId) {
    query += " AND spot_id = ?";
    params.push(spotId);
  }

  const countQuery = "SELECT COUNT(*) as total FROM photos WHERE status = 'approved'" + (spotId ? " AND spot_id = ?" : "");
  const total = (db.prepare(countQuery).get(...params) as { total: number }).total;

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const photos = db.prepare(query).all(...params);

  return NextResponse.json({
    photos,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/photos — upload
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const spotId = formData.get("spotId") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json({ error: "请选择图片" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPG、PNG、WebP 格式" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "文件大小不能超过 5MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const imagePath = await savePhoto(buffer, filename);

    const result = db
      .prepare(
        "INSERT INTO photos (user_id, username, image_path, spot_id, caption) VALUES (?, ?, ?, ?, ?)"
      )
      .run(payload.id, payload.username, imagePath, spotId || null, caption || null);

    const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(result.lastInsertRowid);

    return NextResponse.json({ photo });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/photos?status=&page=1&limit=20
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("photos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data: photos, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    photos: photos || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// PUT /api/admin/photos — approve/reject
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { photoId, status } = await req.json();
  if (!photoId || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  await supabaseAdmin.from("photos").update({ status }).eq("id", photoId);
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/photos
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { photoId } = await req.json();
  if (!photoId) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  await supabaseAdmin.from("photos").delete().eq("id", photoId);
  return NextResponse.json({ success: true });
}

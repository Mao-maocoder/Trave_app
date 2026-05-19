import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/users?search=&page=1&limit=20
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("users")
    .select("id, username, email, role, avatar, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    users: users || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// PUT /api/admin/users — change role
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { userId, role } = await req.json();
  if (!userId || !["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }
  if (userId === auth.payload.id) {
    return NextResponse.json({ error: "不能修改自己的角色" }, { status: 400 });
  }

  await supabaseAdmin.from("users").update({ role }).eq("id", userId);
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/users — delete user
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  if (userId === auth.payload.id) {
    return NextResponse.json({ error: "不能删除自己" }, { status: 400 });
  }

  await supabaseAdmin.from("users").delete().eq("id", userId);
  return NextResponse.json({ success: true });
}

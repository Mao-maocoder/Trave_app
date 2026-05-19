import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// POST /api/favorites/[spotId] — toggle favorite
export async function POST(
  req: Request,
  { params }: { params: Promise<{ spotId: string }> }
) {
  try {
    const { spotId } = await params;

    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: existing } = await supabaseAdmin
      .from("favorites")
      .select("spot_id")
      .eq("user_id", authUser.id)
      .eq("spot_id", spotId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from("favorites").delete().eq("user_id", authUser.id).eq("spot_id", spotId);
      return NextResponse.json({ favorited: false });
    } else {
      await supabaseAdmin.from("favorites").insert({ user_id: authUser.id, spot_id: spotId });
      return NextResponse.json({ favorited: true });
    }
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

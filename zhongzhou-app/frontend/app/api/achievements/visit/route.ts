import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { checkAchievements } from "@/lib/achievements";

export async function POST(req: Request) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { spotId } = await req.json();
  if (!spotId) return NextResponse.json({ error: "缺少 spotId" }, { status: 400 });

  await supabaseAdmin
    .from("spot_visits")
    .upsert({ user_id: authUser.id, spot_id: spotId }, { onConflict: "user_id,spot_id", ignoreDuplicates: true });

  const newAchievements = await checkAchievements(authUser.id);

  return NextResponse.json({ visited: true, newAchievements });
}

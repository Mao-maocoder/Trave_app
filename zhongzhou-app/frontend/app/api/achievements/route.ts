import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { ACHIEVEMENTS } from "@/lib/achievements";

export async function GET(req: Request) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { data: unlocked } = await supabaseAdmin
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", authUser.id);

  const unlockedMap = new Map((unlocked || []).map((r) => [r.achievement_id, r.unlocked_at]));

  const achievements = ACHIEVEMENTS.map((ach) => ({
    ...ach,
    unlocked: unlockedMap.has(ach.id),
    unlockedAt: unlockedMap.get(ach.id) || null,
  }));

  return NextResponse.json({
    achievements,
    stats: { total: ACHIEVEMENTS.length, unlocked: (unlocked || []).length },
  });
}

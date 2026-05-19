import { supabaseAdmin } from "@/lib/supabase-admin";
import { ACHIEVEMENTS } from "@/lib/achievements-config";

export { ACHIEVEMENTS };
export type { Achievement } from "@/lib/achievements-config";

export async function checkAchievements(userId: string): Promise<string[]> {
  const { data: existing } = await supabaseAdmin
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlocked = new Set((existing || []).map((r) => r.achievement_id));

  if (ACHIEVEMENTS.every((a) => unlocked.has(a.id))) return [];

  const [visits, photos, posts, postComments, comments, favs] = await Promise.all([
    supabaseAdmin.from("spot_visits").select("spot_id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("photos").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("post_comments").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("comments").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const stats = {
    visited_spots: visits.count || 0,
    photo_count: photos.count || 0,
    post_count: posts.count || 0,
    comment_count: (postComments.count || 0) + (comments.count || 0),
    fav_count: favs.count || 0,
  };

  const checks: Record<string, boolean> = {
    first_step: stats.visited_spots >= 1,
    explorer_3: stats.visited_spots >= 3,
    axis_master: stats.visited_spots >= 7,
    first_photo: stats.photo_count >= 1,
    photographer: stats.photo_count >= 5,
    first_post: stats.post_count >= 1,
    social_butterfly: stats.post_count >= 10,
    commenter: stats.comment_count >= 10,
    first_fav: stats.fav_count >= 1,
    collector: stats.fav_count >= 7,
  };

  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (!unlocked.has(ach.id) && checks[ach.id]) {
      await supabaseAdmin
        .from("user_achievements")
        .insert({ user_id: userId, achievement_id: ach.id });
      newlyUnlocked.push(ach.id);
    }
  }

  return newlyUnlocked;
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// GET /api/favorites — list user's favorite spot IDs
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ favorites: [] });

    const { data } = await supabaseAdmin
      .from("favorites")
      .select("spot_id")
      .eq("user_id", authUser.id);

    return NextResponse.json({ favorites: (data || []).map((r) => r.spot_id) });
  } catch {
    return NextResponse.json({ favorites: [] });
  }
}

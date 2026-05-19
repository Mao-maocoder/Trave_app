import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/spot-visits
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { data } = await supabaseAdmin
    .from("spot_visits")
    .select("spot_id");

  const counts: Record<string, number> = {};
  (data || []).forEach((r) => {
    counts[r.spot_id] = (counts[r.spot_id] || 0) + 1;
  });

  const visits = Object.entries(counts)
    .map(([spot_id, count]) => ({ spot_id, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ visits });
}

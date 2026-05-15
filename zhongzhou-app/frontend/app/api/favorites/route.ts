import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/favorites — list user's favorite spot IDs
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ favorites: [] });
    }

    const payload = await verifyToken(token);
    const rows = db
      .prepare("SELECT spot_id FROM favorites WHERE user_id = ?")
      .all(payload.id) as { spot_id: string }[];

    return NextResponse.json({ favorites: rows.map((r) => r.spot_id) });
  } catch {
    return NextResponse.json({ favorites: [] });
  }
}

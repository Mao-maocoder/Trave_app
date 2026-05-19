import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
  try {
    await signOut();
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}

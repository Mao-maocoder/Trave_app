import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// PUT /api/chat/conversations/[id]/read — mark as read
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);

    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
      .single();

    if (!conv) return NextResponse.json({ error: "会话不存在" }, { status: 404 });

    await supabaseAdmin
      .from("messages")
      .update({ read: 1 })
      .eq("conversation_id", conversationId)
      .neq("sender_id", authUser.id)
      .eq("read", 0);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

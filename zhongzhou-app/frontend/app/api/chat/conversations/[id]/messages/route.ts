import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// GET /api/chat/conversations/[id]/messages?after=ID&limit=50
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    const url = new URL(req.url);
    const after = parseInt(url.searchParams.get("after") || "0");
    const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "50"));

    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    // Verify participant
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
      .single();

    if (!conv) return NextResponse.json({ error: "会话不存在" }, { status: 404 });

    let query = supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: after > 0 ? true : false })
      .limit(limit);

    if (after > 0) query = query.gt("id", after);

    const { data: messages } = await query;
    const result = after > 0 ? messages : (messages || []).reverse();

    return NextResponse.json({ messages: result });
  } catch {
    return NextResponse.json({ error: "获取消息失败" }, { status: 500 });
  }
}

// POST /api/chat/conversations/[id]/messages — send message
export async function POST(
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

    const { content } = await req.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "消息不能超过2000字" }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("username, avatar")
      .eq("id", authUser.id)
      .single();

    const { data: message, error } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: authUser.id,
        sender_name: user?.username || authUser.username,
        sender_avatar: user?.avatar || null,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}

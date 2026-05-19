import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// GET /api/chat/conversations
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { data: convs } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
      .order("last_message_at", { ascending: false });

    if (!convs || convs.length === 0) return NextResponse.json({ conversations: [] });

    // Get other user info and last messages
    const conversations = await Promise.all(
      convs.map(async (c) => {
        const otherId = c.user1_id === authUser.id ? c.user2_id : c.user1_id;
        const { data: other } = await supabaseAdmin
          .from("users")
          .select("id, username, avatar")
          .eq("id", otherId)
          .single();

        const { data: lastMsg } = await supabaseAdmin
          .from("messages")
          .select("content")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count: unread } = await supabaseAdmin
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .neq("sender_id", authUser.id)
          .eq("read", 0);

        return {
          ...c,
          other_id: other?.id,
          other_name: other?.username,
          other_avatar: other?.avatar,
          last_message: lastMsg?.content || null,
          unread_count: unread || 0,
        };
      })
    );

    return NextResponse.json({ conversations });
  } catch {
    return NextResponse.json({ error: "获取会话列表失败" }, { status: 500 });
  }
}

// POST /api/chat/conversations — create/get conversation
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { targetId } = await req.json();
    if (!targetId || targetId === authUser.id) {
      return NextResponse.json({ error: "无效的目标用户" }, { status: 400 });
    }

    const { data: target } = await supabaseAdmin
      .from("users")
      .select("id, username, avatar")
      .eq("id", targetId)
      .single();

    if (!target) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    // Sort IDs for uniqueness
    const [u1, u2] = [authUser.id, targetId].sort();

    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("user1_id", u1)
      .eq("user2_id", u2)
      .maybeSingle();

    let conversation = existing;
    if (!conversation) {
      const { data: created } = await supabaseAdmin
        .from("conversations")
        .insert({ user1_id: u1, user2_id: u2 })
        .select()
        .single();
      conversation = created;
    }

    return NextResponse.json({ conversation, other: target });
  } catch {
    return NextResponse.json({ error: "创建会话失败" }, { status: 500 });
  }
}

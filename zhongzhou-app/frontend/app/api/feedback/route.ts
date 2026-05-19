import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    const { rating, category, content, contact } = await req.json();

    const numericRating = Number(rating);
    const trimmedCategory = typeof category === "string" ? category.trim() : "";
    const trimmedContent = typeof content === "string" ? content.trim() : "";
    const trimmedContact = typeof contact === "string" ? contact.trim() : "";

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: "评分必须在 1-5 之间" }, { status: 400 });
    }
    if (!trimmedCategory) {
      return NextResponse.json({ error: "请选择评价类别" }, { status: 400 });
    }
    if (trimmedContent.length < 10) {
      return NextResponse.json({ error: "评价内容至少需要10个字符" }, { status: 400 });
    }
    if (trimmedContent.length > 500) {
      return NextResponse.json({ error: "评价内容不能超过500个字符" }, { status: 400 });
    }
    if (trimmedContact.length > 100) {
      return NextResponse.json({ error: "联系方式不能超过100个字符" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("feedback")
      .insert({
        user_id: authUser?.id || null,
        rating: numericRating,
        category: trimmedCategory,
        content: trimmedContent,
        contact: trimmedContact || null,
      })
      .select("id, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ feedback: data });
  } catch {
    return NextResponse.json({ error: "提交失败，请稍后重试" }, { status: 500 });
  }
}

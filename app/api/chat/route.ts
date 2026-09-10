import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBotReply, type StoredMessage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { visitorId, message } = await req.json();

    if (!visitorId || !message || typeof message !== "string") {
      return NextResponse.json({ error: "Thiếu visitorId hoặc message" }, { status: 400 });
    }

    // Tìm hội thoại gần nhất của visitor này, hoặc tạo mới
    let conversation = await prisma.conversation.findFirst({
      where: { visitorId },
      orderBy: { createdAt: "desc" },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({ data: { visitorId } });
    }

    await prisma.chatMessage.create({
      data: { conversationId: conversation.id, role: "user", content: message },
    });

    const historyRows = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 40, // giới hạn context để tránh phình quá dài
    });

    const history: StoredMessage[] = historyRows.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const reply = await getBotReply(history, conversation.id);

    await prisma.chatMessage.create({
      data: { conversationId: conversation.id, role: "assistant", content: reply },
    });

    return NextResponse.json({ reply, conversationId: conversation.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Đã có lỗi xảy ra, vui lòng thử lại." },
      { status: 500 }
    );
  }
}

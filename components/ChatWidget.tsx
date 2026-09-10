"use client";

import { useEffect, useRef, useState } from "react";
import { getVisitorId } from "@/lib/visitor";
import { useChatUiStore } from "@/lib/chatUiStore";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content:
    "Chào bạn 👋 Mình là trợ lý bán hàng ở đây. Bạn cần tư vấn sản phẩm nào, hoặc muốn đặt hàng luôn thì cứ nhắn cho mình nhé!",
};

export default function ChatWidget() {
  const { isOpen, prefill, open, close, clearPrefill } = useChatUiStore();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefill) {
      setInput(prefill);
      clearPrefill();
    }
  }, [prefill, clearPrefill]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const visitorId = getVisitorId();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, message: userMsg.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${err.message || "Không gửi được tin nhắn, thử lại nhé."}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Nút nổi */}
      {!isOpen && (
        <button
          onClick={() => open()}
          className="fixed bottom-5 right-5 z-50 bg-brand hover:bg-brand-dark text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl transition"
          aria-label="Mở khung chat"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-brand text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Nhắn tin với shop</p>
              <p className="text-xs text-white/80">Thường trả lời ngay</p>
            </div>
            <button onClick={close} className="text-white/90 hover:text-white text-xl leading-none">
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-brand text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 rounded-2xl rounded-bl-sm shadow-sm px-3 py-2 text-sm">
                  Đang trả lời...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="border-t p-2 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand hover:bg-brand-dark disabled:opacity-40 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
              aria-label="Gửi"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

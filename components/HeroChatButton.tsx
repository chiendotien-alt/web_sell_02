"use client";

import { useChatUiStore } from "@/lib/chatUiStore";

export default function HeroChatButton() {
  const open = useChatUiStore((s) => s.open);

  return (
    <button
      onClick={() => open()}
      className="mt-5 inline-flex items-center gap-2 bg-white text-brand font-semibold text-sm rounded-full pl-4 pr-5 py-2.5 hover:bg-white/90 transition"
    >
      <span aria-hidden>💬</span>
      Chat với shop ngay
    </button>
  );
}

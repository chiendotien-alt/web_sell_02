"use client";

import { create } from "zustand";

type ChatUiState = {
  isOpen: boolean;
  prefill: string;
  open: (prefill?: string) => void;
  close: () => void;
  clearPrefill: () => void;
};

export const useChatUiStore = create<ChatUiState>((set) => ({
  isOpen: false,
  prefill: "",
  open: (prefill) => set({ isOpen: true, prefill: prefill || "" }),
  close: () => set({ isOpen: false }),
  clearPrefill: () => set({ prefill: "" }),
}));

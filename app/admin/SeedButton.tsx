"use client";

import { useState } from "react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/admin/seed", { method: "POST" });
    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium"
    >
      {loading ? "Đang tạo..." : "Tạo 6 sản phẩm mẫu"}
    </button>
  );
}

"use client";

import { useState } from "react";

type ShowcaseImage = {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
};

export default function ShowcaseClient({ initialImages }: { initialImages: ShowcaseImage[] }) {
  const [images, setImages] = useState(initialImages);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!imageUrl.trim()) {
      setError("Vui lòng dán link ảnh.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, caption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thêm được ảnh.");
      setImages((prev) => [...prev, data.image]);
      setImageUrl("");
      setCaption("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa ảnh này khỏi khu trưng bày?")) return;
    setImages((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/admin/showcase/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Góc trưng bày</h1>
      <p className="text-sm text-gray-500 mb-4">
        Đăng ảnh đẹp về sản phẩm, không gian làm hàng, quy trình thủ công... để hiển thị thành khu trưng bày ở trang chủ.
      </p>

      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-3">
        <input
          placeholder="Link ảnh (URL)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Chú thích ngắn (không bắt buộc, VD: Xưởng đan mây)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          {saving ? "Đang thêm..." : "+ Thêm ảnh"}
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div key={img.id} className="bg-white rounded-xl shadow-sm overflow-hidden group relative">
            <img src={img.imageUrl} alt={img.caption || ""} className="w-full aspect-square object-cover" />
            {img.caption && (
              <p className="text-xs text-gray-500 px-2 py-1.5 truncate">{img.caption}</p>
            )}
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm py-10">
            Chưa có ảnh nào. Thêm ảnh đầu tiên ở trên nhé.
          </p>
        )}
      </div>
    </div>
  );
}

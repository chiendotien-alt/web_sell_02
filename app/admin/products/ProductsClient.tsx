"use client";

import { useState } from "react";
import { formatVND } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt: number | null;
  imageUrl: string;
  stock: number;
  category: string;
  isActive: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAt: "",
  imageUrl: "",
  stock: "",
  category: "",
  isActive: true,
};

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      compareAt: p.compareAt ? String(p.compareAt) : "",
      imageUrl: p.imageUrl,
      stock: String(p.stock),
      category: p.category,
      isActive: p.isActive,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === editingId ? data.product : p)));
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        setProducts((prev) => [data.product, ...prev]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa sản phẩm này?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Sản phẩm ({products.length})</h1>
        <button
          onClick={startCreate}
          className="bg-brand hover:bg-brand-dark text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-4 mb-4 grid sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Tên sản phẩm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg px-3 py-2 sm:col-span-2"
          />
          <textarea
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded-lg px-3 py-2 sm:col-span-2"
            rows={3}
          />
          <input
            required
            type="number"
            placeholder="Giá bán (VNĐ)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="number"
            placeholder="Giá gạch ngang (nếu có)"
            value={form.compareAt}
            onChange={(e) => setForm({ ...form, compareAt: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required
            type="number"
            placeholder="Tồn kho"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            placeholder="Danh mục (VD: Thời trang)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            placeholder="Link ảnh sản phẩm (URL)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="border rounded-lg px-3 py-2 sm:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Đang bán (hiển thị trên web)
          </label>

          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand hover:bg-brand-dark text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border rounded-lg px-4 py-2 text-sm"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-4">
            <img src={p.imageUrl} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-gray-500">{p.category} • Tồn: {p.stock}</p>
            </div>
            <span className="text-brand font-semibold text-sm">{formatVND(p.price)}</span>
            {!p.isActive && <span className="text-xs bg-gray-200 text-gray-500 rounded px-2 py-0.5">Ẩn</span>}
            <button onClick={() => startEdit(p)} className="text-sm text-brand hover:underline ml-2">
              Sửa
            </button>
            <button onClick={() => handleDelete(p.id)} className="text-sm text-red-500 hover:underline">
              Xóa
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <p className="p-6 text-center text-gray-400 text-sm">Chưa có sản phẩm nào.</p>
        )}
      </div>
    </div>
  );
}

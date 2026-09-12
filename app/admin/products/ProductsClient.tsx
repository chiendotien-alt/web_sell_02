"use client";

import { useState } from "react";
import { formatVND } from "@/lib/format";

type Variant = {
  id: string;
  optionValue1: string | null;
  optionValue2: string | null;
  stock: number;
  priceOverride: number | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt: number | null;
  imageUrl: string;
  images: string[];
  stock: number;
  category: string;
  isActive: boolean;
  optionName1: string | null;
  optionName2: string | null;
  variants: Variant[];
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAt: "",
  imageUrl: "",
  imagesRaw: "",
  stock: "",
  category: "",
  isActive: true,
  optionName1: "",
  optionValues1: "",
  optionName2: "",
  optionValues2: "",
};

function variantLabel(v: Variant) {
  return [v.optionValue1, v.optionValue2].filter(Boolean).join(" / ");
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      imagesRaw: (p.images || []).join("\n"),
      stock: String(p.stock),
      category: p.category,
      isActive: p.isActive,
      optionName1: p.optionName1 || "",
      optionValues1: Array.from(new Set(p.variants.map((v) => v.optionValue1).filter(Boolean))).join(", "),
      optionName2: p.optionName2 || "",
      optionValues2: Array.from(new Set(p.variants.map((v) => v.optionValue2).filter(Boolean))).join(", "),
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

  async function updateVariant(
    productId: string,
    variantId: string,
    patch: { stock?: number; priceOverride?: number | null }
  ) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, ...patch } : v)) }
      )
    );
    await fetch(`/api/admin/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
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
            placeholder="Giá bán mặc định (VNĐ)"
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
            placeholder="Danh mục (VD: Giỏ & Rổ)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            placeholder="Link ảnh sản phẩm (URL) — ảnh đại diện chính"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />

          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 block mb-1">
              Ảnh phụ khác (không bắt buộc) — mỗi link 1 dòng
            </label>
            <textarea
              placeholder={"https://...anh1.jpg\nhttps://...anh2.jpg"}
              value={form.imagesRaw}
              onChange={(e) => setForm({ ...form, imagesRaw: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
              rows={3}
            />
          </div>

          <div className="sm:col-span-2 border-t pt-3 mt-1">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Phân loại sản phẩm (bỏ trống nếu sản phẩm chỉ có 1 loại duy nhất)
            </p>
          </div>

          <input
            required={!!form.optionValues1}
            placeholder='Tên nhóm 1, VD: "Màu sắc"'
            value={form.optionName1}
            onChange={(e) => setForm({ ...form, optionName1: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            placeholder='Các giá trị, cách nhau bởi dấu phẩy. VD: "Đỏ, Xanh, Vàng"'
            value={form.optionValues1}
            onChange={(e) => setForm({ ...form, optionValues1: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required={!!form.optionValues2}
            placeholder='Tên nhóm 2 (không bắt buộc), VD: "Size"'
            value={form.optionName2}
            onChange={(e) => setForm({ ...form, optionName2: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            placeholder='Các giá trị. VD: "S, M, L, XL"'
            value={form.optionValues2}
            onChange={(e) => setForm({ ...form, optionValues2: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />

          <input
            required={!form.optionValues1}
            type="number"
            placeholder={form.optionValues1 ? "Tồn kho (bỏ qua nếu đã có phân loại)" : "Tồn kho"}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="border rounded-lg px-3 py-2 sm:col-span-2"
          />
          {form.optionValues1 && (
            <p className="sm:col-span-2 text-xs text-gray-400 -mt-2">
              Sản phẩm có phân loại: sau khi lưu, vào phần "Quản lý biến thể" bên dưới danh sách để nhập tồn kho/giá riêng cho từng loại.
            </p>
          )}

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
          <div key={p.id}>
            <div className="flex items-center gap-3 p-4">
              <img src={p.imageUrl} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.category}
                  {p.variants.length > 0 ? ` • ${p.variants.length} phân loại` : ` • Tồn: ${p.stock}`}
                </p>
              </div>
              <span className="text-brand font-semibold text-sm">{formatVND(p.price)}</span>
              {!p.isActive && <span className="text-xs bg-gray-200 text-gray-500 rounded px-2 py-0.5">Ẩn</span>}
              {p.variants.length > 0 && (
                <button
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  className="text-sm text-gray-500 hover:underline ml-2"
                >
                  {expandedId === p.id ? "Ẩn biến thể" : "Quản lý biến thể"}
                </button>
              )}
              <button onClick={() => startEdit(p)} className="text-sm text-brand hover:underline ml-2">
                Sửa
              </button>
              <button onClick={() => handleDelete(p.id)} className="text-sm text-red-500 hover:underline">
                Xóa
              </button>
            </div>

            {expandedId === p.id && p.variants.length > 0 && (
              <div className="px-4 pb-4">
                <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                  <table className="w-full text-sm min-w-[420px]">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pb-2 font-normal">Phân loại</th>
                        <th className="pb-2 font-normal w-28">Tồn kho</th>
                        <th className="pb-2 font-normal w-40">Giá riêng (bỏ trống = mặc định)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.variants.map((v) => (
                        <tr key={v.id} className="border-t">
                          <td className="py-2">{variantLabel(v)}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => updateVariant(p.id, v.id, { stock: Number(e.target.value) || 0 })}
                              className="w-20 border rounded px-2 py-1"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              placeholder={String(p.price)}
                              value={v.priceOverride ?? ""}
                              onChange={(e) =>
                                updateVariant(p.id, v.id, {
                                  priceOverride: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              className="w-32 border rounded px-2 py-1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
        {products.length === 0 && (
          <p className="p-6 text-center text-gray-400 text-sm">Chưa có sản phẩm nào.</p>
        )}
      </div>
    </div>
  );
}

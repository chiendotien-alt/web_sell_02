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
  price: number;
  stock: number;
  variants: Variant[];
};

type Line = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

function variantLabel(v: Variant) {
  return [v.optionValue1, v.optionValue2].filter(Boolean).join(" / ");
}

export default function AdminCreateOrderModal({
  products,
  onClose,
  onCreated,
}: {
  products: Product[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [lines, setLines] = useState<Line[]>([
    { productId: products[0]?.id || "", variantId: null, quantity: 1 },
  ]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [markPaid, setMarkPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function addLine() {
    setLines((prev) => [...prev, { productId: products[0]?.id || "", variantId: null, quantity: 1 }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function lineTotal(line: Line) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) return 0;
    if (line.variantId) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      return (variant?.priceOverride ?? product.price) * line.quantity;
    }
    return product.price * line.quantity;
  }

  const total = lines.reduce((sum, l) => sum + lineTotal(l), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.");
      return;
    }
    if (lines.length === 0 || lines.some((l) => !l.productId)) {
      setError("Vui lòng chọn ít nhất 1 sản phẩm.");
      return;
    }
    for (const l of lines) {
      const product = products.find((p) => p.id === l.productId);
      if (product && product.variants.length > 0 && !l.variantId) {
        setError(`Vui lòng chọn phân loại cho "${product.name}".`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
          customerName,
          phone,
          address,
          note,
          paymentMethod,
          markPaid,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tạo được đơn hàng.");
      onCreated();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Tạo đơn hàng thủ công</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Sản phẩm</p>
          {lines.map((line, i) => {
            const product = products.find((p) => p.id === line.productId);
            return (
              <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                <div className="flex gap-2">
                  <select
                    value={line.productId}
                    onChange={(e) => updateLine(i, { productId: e.target.value, variantId: null })}
                    className="flex-1 border rounded-lg px-2 py-2 text-sm bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatVND(p.price)}
                      </option>
                    ))}
                  </select>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      className="text-red-500 hover:text-red-600 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {product && product.variants.length > 0 && (
                  <select
                    value={line.variantId || ""}
                    onChange={(e) => updateLine(i, { variantId: e.target.value || null })}
                    className="w-full border rounded-lg px-2 py-2 text-sm bg-white"
                  >
                    <option value="">-- Chọn phân loại --</option>
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id} disabled={v.stock === 0}>
                        {variantLabel(v)} (còn {v.stock}){v.stock === 0 ? " - hết hàng" : ""}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Số lượng</span>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => updateLine(i, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-20 border rounded-lg px-2 py-1 text-sm bg-white"
                  />
                  <span className="ml-auto text-sm font-medium">{formatVND(lineTotal(line))}</span>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={addLine}
            className="text-sm text-brand hover:underline"
          >
            + Thêm sản phẩm
          </button>

          <div className="border-t pt-3 space-y-2">
            <input
              placeholder="Họ và tên khách hàng"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Địa chỉ giao hàng"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Ghi chú (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-3">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="COD">COD (nhận hàng trả tiền)</option>
                <option value="VNPAY">VNPAY / Chuyển khoản</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={markPaid} onChange={(e) => setMarkPaid(e.target.checked)} />
                Đã thanh toán
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-gray-600">Tổng cộng</span>
            <span className="text-lg font-bold text-brand">{formatVND(total)}</span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg py-3 font-medium"
          >
            {submitting ? "Đang tạo..." : "Tạo đơn hàng"}
          </button>
        </form>
      </div>
    </div>
  );
}

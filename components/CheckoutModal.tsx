"use client";

import { useState } from "react";
import { formatVND } from "@/lib/format";

export type CheckoutItem = {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  price: number;
  quantity: number;
};

export default function CheckoutModal({
  items,
  onClose,
  onSuccess,
}: {
  items: CheckoutItem[];
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ orderId: string; total: number } | null>(null);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.");
      return;
    }
    if (!/^[0-9+\s-]{8,15}$/.test(phone.trim())) {
      setError("Số điện thoại có vẻ không đúng, kiểm tra lại giúp mình nhé.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
          customerName,
          phone,
          address,
          note,
          paymentMethod: "COD",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tạo được đơn hàng.");
      setResult({ orderId: data.orderId, total: data.total });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, thử lại nhé.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
        {result ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-lg font-semibold mb-1">Đặt hàng thành công!</h2>
            <p className="text-sm text-gray-500 mb-4">
              Mã đơn: <span className="font-mono">{result.orderId.slice(-8).toUpperCase()}</span>
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-left text-sm mb-4">
              {items.map((i) => (
                <div key={`${i.productId}-${i.variantId ?? "base"}`} className="flex justify-between py-0.5">
                  <span className="text-gray-600">
                    {i.name}
                    {i.variantLabel ? ` (${i.variantLabel})` : ""} x{i.quantity}
                  </span>
                  <span>{formatVND(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span className="text-brand">{formatVND(result.total)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Thanh toán khi nhận hàng (COD). Shop sẽ liên hệ số điện thoại bạn cung cấp để xác nhận giao hàng.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-brand hover:bg-brand-dark text-white rounded-lg py-2.5 font-medium"
            >
              Đóng
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Thông tin đặt hàng</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                ×
              </button>
            </div>

            <div className="p-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
                {items.map((i) => (
                  <div key={`${i.productId}-${i.variantId ?? "base"}`} className="flex justify-between py-0.5">
                    <span className="text-gray-600">
                      {i.name}
                      {i.variantLabel ? ` (${i.variantLabel})` : ""} x{i.quantity}
                    </span>
                    <span>{formatVND(i.price * i.quantity)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-brand">{formatVND(total)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  placeholder="Họ và tên người nhận"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 outline-none focus:border-brand"
                />
                <input
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 outline-none focus:border-brand"
                />
                <textarea
                  placeholder="Địa chỉ giao hàng đầy đủ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2.5 outline-none focus:border-brand"
                />
                <textarea
                  placeholder="Ghi chú (không bắt buộc)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2.5 outline-none focus:border-brand"
                />

                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  Thanh toán: <span className="font-medium text-gray-700">COD (nhận hàng trả tiền)</span>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg py-3 font-medium"
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

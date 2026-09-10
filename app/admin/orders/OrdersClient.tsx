"use client";

import { useState } from "react";
import { formatVND } from "@/lib/format";

type OrderItem = { id: string; quantity: number; price: number; product: { name: string } };
type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  note: string | null;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Mới",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DONE: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_COLOR: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-yellow-100 text-yellow-700",
  SHIPPING: "bg-purple-100 text-purple-700",
  DONE: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-500",
};

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  async function updateStatus(id: string, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function togglePaid(id: string, current: string) {
    const next = current === "PAID" ? "PENDING" : "PAID";
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: next } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: next }),
    });
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Đơn hàng ({orders.length})</h1>

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <p className="font-medium">{o.customerName} • {o.phone}</p>
                <p className="text-xs text-gray-500">{o.address}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_COLOR[o.status]}`}>
                {STATUS_LABEL[o.status]}
              </span>
            </div>

            <div className="text-sm text-gray-600 border-t pt-2 mt-2 space-y-0.5">
              {o.items.map((it) => (
                <p key={it.id}>
                  {it.product.name} x{it.quantity} — {formatVND(it.price * it.quantity)}
                </p>
              ))}
              {o.note && <p className="text-gray-400 italic">Ghi chú: {o.note}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t">
              <p className="font-semibold text-brand">{formatVND(o.total)}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => togglePaid(o.id, o.paymentStatus)}
                  className={`text-xs px-2 py-1 rounded border ${
                    o.paymentStatus === "PAID"
                      ? "border-green-400 text-green-600"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {o.paymentMethod} • {o.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                </button>

                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">Chưa có đơn hàng nào.</p>
        )}
      </div>
    </div>
  );
}

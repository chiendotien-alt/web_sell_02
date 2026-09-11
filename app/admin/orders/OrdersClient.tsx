"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatVND } from "@/lib/format";
import { exportOrdersToCsv } from "@/lib/csv";
import AdminCreateOrderModal from "./AdminCreateOrderModal";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variantLabel: string | null;
  product: { name: string };
};
type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  note: string | null;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  total: number;
  items: OrderItem[];
};

type Variant = {
  id: string;
  optionValue1: string | null;
  optionValue2: string | null;
  stock: number;
  priceOverride: number | null;
};
type Product = { id: string; name: string; price: number; stock: number; variants: Variant[] };

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

export default function OrdersClient({
  initialOrders,
  products,
}: {
  initialOrders: Order[];
  products: Product[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  async function refreshOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.orders || []);
  }

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchesSearch =
        !q ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Đơn hàng ({filteredOrders.length}/{orders.length})</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportOrdersToCsv(filteredOrders, `don-hang-${Date.now()}.csv`)}
            className="border border-gray-300 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium"
          >
            📊 Xuất Excel
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand hover:bg-brand-dark text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            + Tạo đơn thủ công
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder="Tìm theo tên, SĐT, mã đơn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <p className="font-medium">
                  {o.customerName} • {o.phone}
                </p>
                <p className="text-xs text-gray-500">{o.address}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  #{o.id.slice(-8).toUpperCase()} · {new Date(o.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_COLOR[o.status]}`}>
                {STATUS_LABEL[o.status]}
              </span>
            </div>

            <div className="text-sm text-gray-600 border-t pt-2 mt-2 space-y-0.5">
              {o.items.map((it) => (
                <p key={it.id}>
                  {it.product.name}
                  {it.variantLabel ? ` (${it.variantLabel})` : ""} x{it.quantity} — {formatVND(it.price * it.quantity)}
                </p>
              ))}
              {o.note && <p className="text-gray-400 italic">Ghi chú: {o.note}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t">
              <p className="font-semibold text-brand">{formatVND(o.total)}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/admin/orders/${o.id}/print`}
                  target="_blank"
                  className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50"
                >
                  🖨️ In đơn
                </Link>

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
        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            {orders.length === 0 ? "Chưa có đơn hàng nào." : "Không tìm thấy đơn hàng phù hợp."}
          </p>
        )}
      </div>

      {showCreateModal && (
        <AdminCreateOrderModal
          products={products}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            refreshOrders();
          }}
        />
      )}
    </div>
  );
}

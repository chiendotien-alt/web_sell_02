"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { useChatUiStore } from "@/lib/chatUiStore";
import { formatVND } from "@/lib/format";
import CheckoutModal, { type CheckoutItem } from "@/components/CheckoutModal";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalPrice, clear } = useCartStore();
  const openChat = useChatUiStore((s) => s.open);
  const [showCheckout, setShowCheckout] = useState(false);

  function handleCheckoutViaChat() {
    if (items.length === 0) return;
    const summary = items
      .map(
        (i) =>
          `- ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity} (${formatVND(
            i.price * i.quantity
          )})`
      )
      .join("\n");
    openChat(
      `Mình muốn đặt các sản phẩm sau:\n${summary}\nTổng cộng: ${formatVND(
        totalPrice()
      )}\nGiúp mình chốt đơn nhé.`
    );
  }

  const checkoutItems: CheckoutItem[] = items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    variantLabel: i.variantLabel,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-muted mb-4">Giỏ hàng của bạn đang trống.</p>
        <Link href="/" className="text-brand font-medium hover:underline">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-ink mb-4">Giỏ hàng của bạn</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? "base"}`} className="flex items-center gap-3 p-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink truncate">{item.name}</p>
              {item.variantLabel && <p className="text-xs text-ink-soft">{item.variantLabel}</p>}
              <p className="text-brand font-semibold text-sm">{formatVND(item.price)}</p>
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                className="w-8 h-8 hover:bg-gray-50"
                onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                className="w-8 h-8 hover:bg-gray-50"
                onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="text-ink-soft hover:text-red-500 text-sm ml-2"
              aria-label="Xóa"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 p-4 flex items-center justify-between">
        <span className="text-ink-muted">Tổng cộng</span>
        <span className="text-xl font-bold text-brand">{formatVND(totalPrice())}</span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowCheckout(true)}
          className="flex-1 bg-brand hover:bg-brand-dark text-white rounded-lg px-5 py-3 font-medium"
        >
          Đặt hàng
        </button>
        <button
          onClick={handleCheckoutViaChat}
          className="flex-1 border border-brand text-brand hover:bg-brand-light rounded-lg px-5 py-3 font-medium"
        >
          💬 Chốt đơn qua chat
        </button>
      </div>
      <p className="mt-2 text-xs text-ink-soft text-center">
        "Đặt hàng" mở form điền thông tin giao hàng ngay. "Chốt đơn qua chat" nếu bạn muốn hỏi thêm trước khi mua.
      </p>

      {showCheckout && (
        <CheckoutModal
          items={checkoutItems}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => clear()}
        />
      )}
    </div>
  );
}

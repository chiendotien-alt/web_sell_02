"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { useChatUiStore } from "@/lib/chatUiStore";
import { formatVND } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalPrice } = useCartStore();
  const openChat = useChatUiStore((s) => s.open);

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

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống.</p>
        <Link href="/" className="text-brand font-medium hover:underline">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Giỏ hàng của bạn</h1>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? "base"}`} className="flex items-center gap-3 p-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{item.name}</p>
              {item.variantLabel && <p className="text-xs text-gray-400">{item.variantLabel}</p>}
              <p className="text-brand font-semibold text-sm">{formatVND(item.price)}</p>
            </div>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                className="w-8 h-8 hover:bg-gray-100"
                onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                className="w-8 h-8 hover:bg-gray-100"
                onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="text-gray-400 hover:text-red-500 text-sm ml-2"
              aria-label="Xóa"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm mt-4 p-4 flex items-center justify-between">
        <span className="text-gray-600">Tổng cộng</span>
        <span className="text-xl font-bold text-brand">{formatVND(totalPrice())}</span>
      </div>

      <button
        onClick={handleCheckoutViaChat}
        className="mt-4 w-full bg-brand hover:bg-brand-dark text-white rounded-lg px-5 py-3 font-medium"
      >
        💬 Chốt đơn qua chat
      </button>
      <p className="mt-2 text-xs text-gray-400 text-center">
        Bấm vào đây, khung chat sẽ mở sẵn với danh sách sản phẩm — bot sẽ hỏi thông tin giao hàng để hoàn tất đơn.
      </p>
    </div>
  );
}

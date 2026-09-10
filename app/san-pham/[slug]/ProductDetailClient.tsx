"use client";

import { useState } from "react";
import Image from "next/image";
import { formatVND } from "@/lib/format";
import { useCartStore } from "@/lib/cartStore";
import { useChatUiStore } from "@/lib/chatUiStore";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt: number | null;
  imageUrl: string;
  stock: number;
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openChat = useChatUiStore((s) => s.open);

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      quantity
    );
  }

  function handleBuyNowViaChat() {
    openChat(
      `Mình muốn đặt mua "${product.name}" số lượng ${quantity}. Giúp mình chốt đơn nhé.`
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 grid md:grid-cols-2 gap-6">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl text-brand font-bold">{formatVND(product.price)}</span>
            {product.compareAt && (
              <span className="text-gray-400 line-through">{formatVND(product.compareAt)}</span>
            )}
          </div>

          <p className="mt-4 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Tình trạng: {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Tạm hết hàng"}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm text-gray-600">Số lượng</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                className="w-9 h-9 hover:bg-gray-100"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                className="w-9 h-9 hover:bg-gray-100"
                onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="border border-brand text-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-5 py-3 font-medium flex-1"
            >
              Thêm vào giỏ
            </button>
            <button
              onClick={handleBuyNowViaChat}
              disabled={product.stock === 0}
              className="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-3 font-medium flex-1"
            >
              💬 Nhắn tin đặt ngay
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Đặt hàng qua khung chat — bot sẽ hỏi thông tin giao hàng và chốt đơn giúp bạn.
          </p>
        </div>
      </div>
    </div>
  );
}

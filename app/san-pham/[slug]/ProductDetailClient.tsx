"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatVND } from "@/lib/format";
import { useCartStore } from "@/lib/cartStore";
import { useChatUiStore } from "@/lib/chatUiStore";

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
  stock: number;
  optionName1: string | null;
  optionName2: string | null;
  variants: Variant[];
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const hasVariants = product.variants.length > 0;

  const values1 = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.optionValue1).filter(Boolean))) as string[],
    [product.variants]
  );
  const values2 = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.optionValue2).filter(Boolean))) as string[],
    [product.variants]
  );

  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openChat = useChatUiStore((s) => s.open);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return (
      product.variants.find(
        (v) =>
          (values1.length === 0 || v.optionValue1 === selected1) &&
          (values2.length === 0 || v.optionValue2 === selected2)
      ) || null
    );
  }, [hasVariants, product.variants, selected1, selected2, values1.length, values2.length]);

  const needsSelection =
    hasVariants && ((values1.length > 0 && !selected1) || (values2.length > 0 && !selected2));

  const effectivePrice = selectedVariant?.priceOverride ?? product.price;
  const effectiveStock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock;
  const canBuy = hasVariants ? !needsSelection && effectiveStock > 0 : product.stock > 0;

  function variantText() {
    return [selected1, selected2].filter(Boolean).join(" / ") || null;
  }

  function handleAddToCart() {
    if (!canBuy) return;
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        variantLabel: variantText(),
        name: product.name,
        price: effectivePrice,
        imageUrl: product.imageUrl,
      },
      quantity
    );
  }

  function handleBuyNowViaChat() {
    if (!canBuy) return;
    const variantPart = variantText() ? ` (${variantText()})` : "";
    openChat(
      `Mình muốn đặt mua "${product.name}"${variantPart} số lượng ${quantity}. Giúp mình chốt đơn nhé.`
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 grid md:grid-cols-2 gap-6">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl text-brand font-bold">{formatVND(effectivePrice)}</span>
            {product.compareAt && (
              <span className="text-gray-400 line-through">{formatVND(product.compareAt)}</span>
            )}
          </div>

          <p className="mt-4 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

          {values1.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-gray-600 mb-2">{product.optionName1 || "Phân loại"}</p>
              <div className="flex flex-wrap gap-2">
                {values1.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelected1(v)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      selected1 === v
                        ? "border-brand text-brand bg-brand-light"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {values2.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{product.optionName2 || "Phân loại"}</p>
              <div className="flex flex-wrap gap-2">
                {values2.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelected2(v)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      selected2 === v
                        ? "border-brand text-brand bg-brand-light"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-500">
            {hasVariants
              ? needsSelection
                ? "Chọn phân loại để xem tình trạng còn hàng"
                : effectiveStock > 0
                ? `Còn ${effectiveStock} sản phẩm`
                : "Loại này tạm hết hàng"
              : product.stock > 0
              ? `Còn ${product.stock} sản phẩm`
              : "Tạm hết hàng"}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm text-gray-600">Số lượng</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button className="w-9 h-9 hover:bg-gray-100" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                className="w-9 h-9 hover:bg-gray-100"
                onClick={() => setQuantity((q) => Math.min(Math.max(effectiveStock, 1), q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!canBuy}
              className="border border-brand text-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-5 py-3 font-medium flex-1"
            >
              Thêm vào giỏ
            </button>
            <button
              onClick={handleBuyNowViaChat}
              disabled={!canBuy}
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

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatVND } from "@/lib/format";
import { useCartStore } from "@/lib/cartStore";
import { useChatUiStore } from "@/lib/chatUiStore";
import CheckoutModal, { type CheckoutItem } from "@/components/CheckoutModal";

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
  optionName1: string | null;
  optionName2: string | null;
  variants: Variant[];
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const hasVariants = product.variants.length > 0;
  const allImages = useMemo(
    () => Array.from(new Set([product.imageUrl, ...product.images].filter(Boolean))),
    [product.imageUrl, product.images]
  );
  const [activeImage, setActiveImage] = useState(allImages[0]);

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
  const [showCheckout, setShowCheckout] = useState(false);
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

  function handleChatQuestion() {
    const variantPart = variantText() ? ` (${variantText()})` : "";
    openChat(`Cho mình hỏi về sản phẩm "${product.name}"${variantPart} nhé.`);
  }

  const checkoutItems: CheckoutItem[] = [
    {
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      variantLabel: variantText(),
      name: product.name,
      price: effectivePrice,
      quantity,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 grid md:grid-cols-2 gap-6">
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {allImages.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                    activeImage === img ? "border-brand" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">{product.name}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl text-brand font-bold">{formatVND(effectivePrice)}</span>
            {product.compareAt && (
              <span className="text-ink-soft line-through">{formatVND(product.compareAt)}</span>
            )}
          </div>

          <p className="mt-4 text-ink-muted text-sm leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

          {values1.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-ink-muted mb-2">{product.optionName1 || "Phân loại"}</p>
              <div className="flex flex-wrap gap-2">
                {values1.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelected1(v)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      selected1 === v
                        ? "border-brand text-brand bg-brand-light"
                        : "border-gray-300 text-ink-muted hover:border-gray-400"
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
              <p className="text-sm text-ink-muted mb-2">{product.optionName2 || "Phân loại"}</p>
              <div className="flex flex-wrap gap-2">
                {values2.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelected2(v)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      selected2 === v
                        ? "border-brand text-brand bg-brand-light"
                        : "border-gray-300 text-ink-muted hover:border-gray-400"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-sm text-ink-soft">
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
            <span className="text-sm text-ink-muted">Số lượng</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button className="w-9 h-9 hover:bg-gray-50" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                className="w-9 h-9 hover:bg-gray-50"
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
              onClick={() => canBuy && setShowCheckout(true)}
              disabled={!canBuy}
              className="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-3 font-medium flex-1"
            >
              Đặt ngay
            </button>
          </div>
          <button
            onClick={handleChatQuestion}
            className="mt-3 text-sm text-ink-muted hover:text-brand transition"
          >
            💬 Có thắc mắc? Chat với shop
          </button>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal items={checkoutItems} onClose={() => setShowCheckout(false)} />
      )}
    </div>
  );
}

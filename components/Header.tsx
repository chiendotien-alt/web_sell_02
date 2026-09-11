"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Shop Của Bạn";

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white text-base font-bold shrink-0">
            {shopName.trim().charAt(0).toUpperCase() || "S"}
          </span>
          <span className="text-lg font-bold tracking-tight text-ink whitespace-nowrap">{shopName}</span>
        </Link>

        <Link
          href="/gio-hang"
          className="relative flex items-center gap-2 border border-brand text-brand hover:bg-brand-light transition rounded-full pl-3.5 pr-4 py-2 text-sm font-medium"
        >
          <span aria-hidden>🛒</span>
          Giỏ hàng
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

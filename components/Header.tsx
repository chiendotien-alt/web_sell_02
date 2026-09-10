"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Shop Của Bạn";

  return (
    <header className="bg-brand text-white sticky top-0 z-40 shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold tracking-tight whitespace-nowrap">
          🛍️ {shopName}
        </Link>
        <Link
          href="/gio-hang"
          className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 transition rounded-lg px-3 py-2 text-sm font-medium"
        >
          Giỏ hàng
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-brand text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

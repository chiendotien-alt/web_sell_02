import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import HeroChatButton from "@/components/HeroChatButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Shop Của Bạn";
  const categories: string[] = Array.from(new Set(products.map((p) => p.category as string)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark text-white rounded-3xl p-8 md:p-10 mb-10">
        <div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-16 right-24 w-40 h-40 rounded-full bg-white/10 pointer-events-none"
          aria-hidden
        />
        <div className="relative max-w-lg">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{shopName}</h1>
          <p className="text-white/90 text-sm md:text-base mt-2">
            Xem hàng thoải mái — có gì thắc mắc cứ nhắn, mình tư vấn và lên đơn cho bạn ngay trong chat.
          </p>
          <HeroChatButton />
        </div>
      </section>

      {products.length === 0 ? (
        <p className="text-ink-muted">Chưa có sản phẩm nào. Vào /admin để thêm sản phẩm.</p>
      ) : (
        categories.map((cat) => (
          <div key={cat} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-4 rounded-full bg-brand" aria-hidden />
              <h2 className="text-base font-semibold text-ink">{cat}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products
                .filter((p) => p.category === cat)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </div>
        ))
      )}

      <footer className="border-t border-gray-200 mt-12 pt-6 pb-10 text-center text-sm text-ink-soft">
        <p>{shopName} · Đặt hàng qua khung chat 💬 ở góc phải màn hình</p>
      </footer>
    </div>
  );
}

import { prisma } from "@/lib/db";
import ProductGrid from "@/components/ProductGrid";
import HeroChatButton from "@/components/HeroChatButton";
import ShowcaseGallery from "@/components/ShowcaseGallery";
import { FadeIn } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, showcaseImages] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    prisma.showcaseImage.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Shop Của Bạn";
  const categories: string[] = Array.from(new Set(products.map((p) => p.category as string)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <FadeIn>
        <section
          className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark text-white rounded-3xl p-8 md:p-12 mb-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,.07) 0px, rgba(255,255,255,.07) 2px, transparent 2px, transparent 14px), repeating-linear-gradient(-45deg, rgba(255,255,255,.07) 0px, rgba(255,255,255,.07) 2px, transparent 2px, transparent 14px), linear-gradient(to bottom right, var(--tw-gradient-stops))",
          }}
        >
          <div className="relative max-w-lg">
            <p className="text-white/80 text-xs tracking-[0.2em] uppercase mb-2">Hàng thủ công mây tre đan</p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold leading-tight">{shopName}</h1>
            <p className="text-white/90 text-sm md:text-base mt-3">
              Từng sản phẩm đan tay tỉ mỉ — có gì thắc mắc cứ nhắn, mình tư vấn và lên đơn cho bạn ngay trong chat.
            </p>
            <HeroChatButton />
          </div>
        </section>
      </FadeIn>

      <ShowcaseGallery images={showcaseImages} />

      {products.length === 0 ? (
        <p className="text-ink-muted">Chưa có sản phẩm nào. Vào /admin để thêm sản phẩm.</p>
      ) : (
        categories.map((cat) => (
          <div key={cat} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-4 rounded-full bg-brand" aria-hidden />
              <h2 className="font-serif text-lg font-semibold text-ink">{cat}</h2>
            </div>
            <ProductGrid products={products.filter((p) => p.category === cat)} />
          </div>
        ))
      )}

      <footer className="border-t border-gray-200 mt-12 pt-6 pb-10 text-center text-sm text-ink-soft">
        <p>{shopName} · Đặt hàng qua khung chat 💬 ở góc phải màn hình</p>
      </footer>
    </div>
  );
}

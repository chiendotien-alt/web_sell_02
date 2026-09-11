import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const categories: string[] = Array.from(new Set(products.map((p) => p.category as string)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl p-7 mb-8 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold mb-1.5">Chào mừng bạn đến với shop 🎉</h1>
        <p className="text-white/90 text-sm md:text-base">
          Có thắc mắc gì cứ bấm vào khung chat ở góc phải để được tư vấn và đặt hàng nhanh nhé!
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">Chưa có sản phẩm nào. Vào /admin để thêm sản phẩm.</p>
      ) : (
        categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{cat}</h2>
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
    </div>
  );
}

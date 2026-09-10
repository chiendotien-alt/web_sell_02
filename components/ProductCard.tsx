import Link from "next/link";
import Image from "next/image";
import { formatVND } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  imageUrl: string;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(100 - (product.price / product.compareAt) * 100)
      : null;

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
    >
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition"
          sizes="(max-width: 768px) 50vw, 20vw"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-brand text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-gray-800 line-clamp-2 min-h-[2.5rem]">{product.name}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-brand font-semibold">{formatVND(product.price)}</span>
          {product.compareAt && (
            <span className="text-gray-400 text-xs line-through">
              {formatVND(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

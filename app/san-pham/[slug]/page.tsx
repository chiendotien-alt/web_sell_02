import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { variants: true },
  });
  if (!product || !product.isActive) notFound();

  return <ProductDetailClient product={product} />;
}

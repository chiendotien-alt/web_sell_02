import { isAdminAuthed } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import AdminLogin from "../AdminLogin";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!isAdminAuthed()) return <AdminLogin />;

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return <ProductsClient initialProducts={products} />;
}

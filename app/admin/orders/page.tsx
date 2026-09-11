import { isAdminAuthed } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import AdminLogin from "../AdminLogin";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!isAdminAuthed()) return <AdminLogin />;

  const [ordersRaw, products] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { variants: true },
    }),
  ]);

  const orders = ordersRaw.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }));

  return <OrdersClient initialOrders={orders} products={products} />;
}

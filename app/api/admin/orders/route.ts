import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";
import { createOrder } from "@/lib/orders";

export async function GET() {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ orders });
}

// Tạo đơn hàng thủ công từ admin (khách gọi điện, nhắn tin ngoài khung chat...)
export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json();

  try {
    const order = await createOrder({
      items: body.items,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      note: body.note,
      paymentMethod: body.paymentMethod || "COD",
    });

    if (body.markPaid) {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
    }

    return NextResponse.json({ ok: true, orderId: order.id, total: order.total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Không tạo được đơn hàng." }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const order = await createOrder({
      items: body.items,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      note: body.note,
      paymentMethod: body.paymentMethod || "COD",
    });

    return NextResponse.json({ ok: true, orderId: order.id, total: order.total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Không tạo được đơn hàng, thử lại nhé." }, { status: 400 });
  }
}

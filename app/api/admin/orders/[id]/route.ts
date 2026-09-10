import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json();

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status: body.status,
      paymentStatus: body.paymentStatus,
    },
  });

  return NextResponse.json({ order });
}

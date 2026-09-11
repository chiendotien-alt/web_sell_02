import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json();

  const variant = await prisma.productVariant.update({
    where: { id: params.id },
    data: {
      stock: body.stock !== undefined ? Number(body.stock) || 0 : undefined,
      priceOverride:
        body.priceOverride === "" || body.priceOverride === null
          ? null
          : body.priceOverride !== undefined
          ? Number(body.priceOverride)
          : undefined,
    },
  });

  return NextResponse.json({ variant });
}

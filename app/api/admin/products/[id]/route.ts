import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";
import { parseOptionValues, syncProductVariants } from "@/lib/variants";
import { parseImageUrls } from "@/lib/images";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json();

  const values1 = parseOptionValues(body.optionValues1);
  const values2 = parseOptionValues(body.optionValues2);

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      price: Number(body.price) || 0,
      compareAt: body.compareAt ? Number(body.compareAt) : null,
      imageUrl: body.imageUrl,
      images: parseImageUrls(body.imagesRaw),
      stock: Number(body.stock) || 0,
      category: body.category,
      isActive: !!body.isActive,
      optionName1: values1.length ? body.optionName1 || null : null,
      optionName2: values2.length ? body.optionName2 || null : null,
    },
  });

  await syncProductVariants(product.id, values1, values2);

  const full = await prisma.product.findUnique({ where: { id: product.id }, include: { variants: true } });

  return NextResponse.json({ product: full });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

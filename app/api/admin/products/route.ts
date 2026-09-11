import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";
import { parseOptionValues, syncProductVariants } from "@/lib/variants";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json();

  const slugBase = slugify(body.name || "san-pham");
  let slug = slugBase;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${i++}`;
  }

  const values1 = parseOptionValues(body.optionValues1);
  const values2 = parseOptionValues(body.optionValues2);

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      description: body.description || "",
      price: Number(body.price) || 0,
      compareAt: body.compareAt ? Number(body.compareAt) : null,
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      stock: Number(body.stock) || 0,
      category: body.category || "Khác",
      isActive: body.isActive !== false,
      optionName1: values1.length ? body.optionName1 || null : null,
      optionName2: values2.length ? body.optionName2 || null : null,
    },
  });

  if (values1.length || values2.length) {
    await syncProductVariants(product.id, values1, values2);
  }

  const full = await prisma.product.findUnique({ where: { id: product.id }, include: { variants: true } });

  return NextResponse.json({ product: full });
}

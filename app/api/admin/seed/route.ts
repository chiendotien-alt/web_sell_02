import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";
import { sampleProducts } from "@/lib/sampleProducts";
import { parseOptionValues, syncProductVariants } from "@/lib/variants";

export async function POST() {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  for (const p of sampleProducts) {
    const { optionName1, optionValues1, optionName2, optionValues2, ...productFields } = p as any;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: productFields,
    });

    const values1 = parseOptionValues(optionValues1);
    const values2 = parseOptionValues(optionValues2);
    if (values1.length || values2.length) {
      if (!product.optionName1 && optionName1) {
        await prisma.product.update({ where: { id: product.id }, data: { optionName1, optionName2 } });
      }
      await syncProductVariants(product.id, values1, values2);
    }
  }

  return NextResponse.json({ ok: true, count: sampleProducts.length });
}

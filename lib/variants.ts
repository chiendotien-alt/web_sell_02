import { prisma } from "./db";

export function parseOptionValues(raw?: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const v = part.trim();
    if (v && !seen.has(v.toLowerCase())) {
      seen.add(v.toLowerCase());
      out.push(v);
    }
  }
  return out;
}

/**
 * Đồng bộ danh sách ProductVariant của 1 sản phẩm theo 2 nhóm giá trị phân loại.
 * - Tổ hợp nào đã tồn tại thì GIỮ NGUYÊN (không mất tồn kho/giá riêng đã nhập).
 * - Tổ hợp mới thì tạo thêm (tồn kho mặc định 0).
 * - Tổ hợp không còn trong danh sách thì xóa.
 * Nếu cả 2 nhóm đều rỗng, sản phẩm được coi là không có phân loại (xóa hết biến thể cũ nếu có).
 */
export async function syncProductVariants(
  productId: string,
  values1: string[],
  values2: string[]
) {
  const combos: { optionValue1: string | null; optionValue2: string | null }[] = [];

  if (values1.length === 0 && values2.length === 0) {
    combos.length = 0;
  } else if (values1.length > 0 && values2.length === 0) {
    for (const v1 of values1) combos.push({ optionValue1: v1, optionValue2: null });
  } else if (values1.length === 0 && values2.length > 0) {
    for (const v2 of values2) combos.push({ optionValue1: null, optionValue2: v2 });
  } else {
    for (const v1 of values1) {
      for (const v2 of values2) {
        combos.push({ optionValue1: v1, optionValue2: v2 });
      }
    }
  }

  const existing = await prisma.productVariant.findMany({ where: { productId } });

  const key = (v1: string | null, v2: string | null) => `${v1 ?? ""}||${v2 ?? ""}`;
  const desiredKeys = new Set(combos.map((c) => key(c.optionValue1, c.optionValue2)));
  const existingKeys = new Set(existing.map((e) => key(e.optionValue1, e.optionValue2)));

  const toCreate = combos.filter((c) => !existingKeys.has(key(c.optionValue1, c.optionValue2)));
  const toDelete = existing.filter((e) => !desiredKeys.has(key(e.optionValue1, e.optionValue2)));

  if (toCreate.length > 0) {
    await prisma.productVariant.createMany({
      data: toCreate.map((c) => ({ productId, optionValue1: c.optionValue1, optionValue2: c.optionValue2 })),
    });
  }
  if (toDelete.length > 0) {
    await prisma.productVariant.deleteMany({ where: { id: { in: toDelete.map((d) => d.id) } } });
  }
}

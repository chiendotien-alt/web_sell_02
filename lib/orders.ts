import { prisma } from "./db";
import { notifyNewOrderTelegram } from "./notify";

export type OrderItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type CreateOrderInput = {
  items: OrderItemInput[];
  customerName: string;
  phone: string;
  address: string;
  note?: string | null;
  paymentMethod?: string;
  conversationId?: string | null;
};

/**
 * Tạo đơn hàng: kiểm tra tồn kho, tính tổng tiền, lưu đơn + trừ kho.
 * Dùng chung cho cả API đặt hàng bằng form (/api/orders) và bot chat AI.
 */
export async function createOrder(input: CreateOrderInput) {
  const { items, customerName, phone, address, note, paymentMethod, conversationId } = input;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Giỏ hàng trống.");
  }
  if (!customerName?.trim() || !phone?.trim() || !address?.trim()) {
    throw new Error("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ.");
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  let total = 0;
  const orderItemsData: {
    productId: string;
    variantId: string | null;
    variantLabel: string | null;
    quantity: number;
    price: number;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error("Không tìm thấy sản phẩm trong đơn hàng.");
    const quantity = Math.max(1, Math.floor(item.quantity) || 1);

    if (product.variants.length > 0) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        throw new Error(`Vui lòng chọn phân loại hợp lệ cho "${product.name}".`);
      }
      if (variant.stock < quantity) {
        const label = [variant.optionValue1, variant.optionValue2].filter(Boolean).join(" / ");
        throw new Error(`"${product.name}" (${label}) chỉ còn ${variant.stock} sản phẩm.`);
      }
      const price = variant.priceOverride ?? product.price;
      total += price * quantity;
      orderItemsData.push({
        productId: product.id,
        variantId: variant.id,
        variantLabel: [variant.optionValue1, variant.optionValue2].filter(Boolean).join(" / "),
        quantity,
        price,
      });
    } else {
      if (product.stock < quantity) {
        throw new Error(`"${product.name}" chỉ còn ${product.stock} sản phẩm.`);
      }
      total += product.price * quantity;
      orderItemsData.push({
        productId: product.id,
        variantId: null,
        variantLabel: null,
        quantity,
        price: product.price,
      });
    }
  }

  const order = await prisma.order.create({
    data: {
      conversationId: conversationId || null,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      note: note?.trim() || null,
      paymentMethod: paymentMethod || "COD",
      total,
      items: { create: orderItemsData },
    },
    include: { items: { include: { product: true } } },
  });

  for (const item of orderItemsData) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  notifyNewOrderTelegram(order).catch(() => {});

  return order;
}

/** Tìm đúng sản phẩm + biến thể theo slug và tên phân loại (dùng cho bot chat, vì bot chỉ biết slug/tên loại chứ không biết id). */
export async function resolveProductAndVariant(
  slug: string,
  option1?: string | null,
  option2?: string | null
) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });
  if (!product) return null;

  if (product.variants.length === 0) {
    return { productId: product.id, variantId: null as string | null, product };
  }

  const variant = product.variants.find(
    (v) => (v.optionValue1 ?? null) === (option1 ?? null) && (v.optionValue2 ?? null) === (option2 ?? null)
  );
  return { productId: product.id, variantId: variant?.id ?? null, product };
}

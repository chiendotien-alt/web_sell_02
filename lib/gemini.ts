import { prisma } from "./db";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
// gemini-3.1-flash-lite: bản ổn định (stable), nằm trong gói miễn phí của Google.
const MODEL = "gemini-3.1-flash-lite";

type ChatRole = "user" | "assistant";

const createOrderFunction = {
  name: "create_order",
  description:
    "Tạo một đơn hàng mới trong hệ thống khi khách đã xác nhận rõ ràng muốn mua và đã cung cấp đủ: sản phẩm + số lượng (+ phân loại như màu/size nếu sản phẩm đó có phân loại), họ tên, số điện thoại, địa chỉ giao hàng. KHÔNG gọi hàm này nếu còn thiếu thông tin, kể cả khi khách chưa chọn phân loại cho sản phẩm có nhiều loại — hãy hỏi khách trước.",
  parameters: {
    type: "object",
    properties: {
      items: {
        type: "array",
        description: "Danh sách sản phẩm khách muốn mua",
        items: {
          type: "object",
          properties: {
            productSlug: {
              type: "string",
              description: "slug sản phẩm, lấy đúng từ danh mục sản phẩm được cung cấp",
            },
            option1: {
              type: "string",
              description:
                "Giá trị phân loại nhóm 1 khách chọn (VD: màu 'Đỏ'). Chỉ điền nếu sản phẩm có nhóm phân loại 1, lấy đúng giá trị trong danh mục.",
            },
            option2: {
              type: "string",
              description:
                "Giá trị phân loại nhóm 2 khách chọn (VD: size 'M'). Chỉ điền nếu sản phẩm có nhóm phân loại 2, lấy đúng giá trị trong danh mục.",
            },
            quantity: { type: "integer" },
          },
          required: ["productSlug", "quantity"],
        },
      },
      customerName: { type: "string" },
      phone: { type: "string" },
      address: { type: "string" },
      note: { type: "string", description: "Ghi chú thêm nếu có" },
      paymentMethod: {
        type: "string",
        enum: ["COD", "VNPAY"],
        description: "Mặc định COD (thanh toán khi nhận hàng) nếu khách không nói gì khác",
      },
    },
    required: ["items", "customerName", "phone", "address"],
  },
};

async function callGemini(contents: any[], systemPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Thiếu GEMINI_API_KEY trong biến môi trường. Xem hướng dẫn trong README.md."
    );
  }

  const res = await fetch(`${GEMINI_API_URL}/${MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      tools: [{ functionDeclarations: [createOrderFunction] }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lỗi gọi Gemini API (${res.status}): ${text}`);
  }

  return res.json();
}

async function buildSystemPrompt() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true },
  });

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Shop";

  const catalogText = products
    .map((p) => {
      const base = `- ${p.name} (slug: ${p.slug}) | Giá: ${p.price.toLocaleString("vi-VN")}đ | Danh mục: ${p.category} | Mô tả: ${p.description}`;
      if (p.variants.length === 0) {
        return `${base} | Còn hàng: ${p.stock}`;
      }
      const groupLabel = [p.optionName1, p.optionName2].filter(Boolean).join(" + ");
      const variantsText = p.variants
        .map((v) => {
          const label = [v.optionValue1, v.optionValue2].filter(Boolean).join(" / ");
          const priceText = v.priceOverride ? `, giá riêng ${v.priceOverride.toLocaleString("vi-VN")}đ` : "";
          return `${label} (còn ${v.stock}${priceText})`;
        })
        .join("; ");
      return `${base} | Có phân loại theo ${groupLabel}: ${variantsText}`;
    })
    .join("\n");

  return `Bạn là nhân viên tư vấn bán hàng của "${shopName}", nhắn tin trực tiếp với khách qua khung chat trên website.

Phong cách: thân thiện, ngắn gọn, tự nhiên như người bán hàng thật trên mạng xã hội — KHÔNG dùng văn phong máy móc, KHÔNG liệt kê nhiều gạch đầu dòng trừ khi khách hỏi so sánh nhiều sản phẩm.

Danh mục sản phẩm hiện có:
${catalogText}

Nhiệm vụ của bạn:
1. Trả lời câu hỏi của khách về sản phẩm (giá, size, màu, chất liệu, tồn kho...) dựa trên danh mục ở trên. Nếu không có thông tin, thành thật nói chưa rõ và có thể hỏi lại hoặc gợi ý sản phẩm khác phù hợp.
2. Nếu sản phẩm khách hỏi có phân loại (màu/size...), PHẢI hỏi khách chọn cụ thể loại nào trước khi chốt đơn — không tự ý chọn thay khách. Nếu khách chọn loại đã hết hàng, báo cho khách biết và gợi ý loại khác còn hàng.
3. Khi khách có ý định mua, chủ động hỏi các thông tin còn thiếu: sản phẩm + phân loại (nếu có) + số lượng cụ thể, họ tên người nhận, số điện thoại, địa chỉ giao hàng đầy đủ. Hỏi từng bước, đừng hỏi dồn một lúc quá nhiều nếu khách mới chỉ đang hỏi thăm.
4. Khi đã có ĐỦ thông tin và khách đã xác nhận chốt đơn, gọi hàm create_order để tạo đơn hàng thật trong hệ thống. Mặc định hình thức thanh toán là COD (thanh toán khi nhận hàng) trừ khi khách yêu cầu khác.
5. Sau khi tạo đơn thành công, xác nhận lại với khách bằng giọng điệu tự nhiên: cảm ơn, tóm tắt đơn hàng (bao gồm phân loại đã chọn), cho biết đơn đã được ghi nhận.
6. Không tự bịa thông tin sản phẩm hoặc phân loại không có trong danh mục. Không hứa hẹn thời gian giao hàng cụ thể nếu không được cung cấp.`;
}

export type StoredMessage = { role: ChatRole; content: string };

export async function getBotReply(
  history: StoredMessage[],
  conversationId: string
): Promise<string> {
  const systemPrompt = await buildSystemPrompt();

  const contents: any[] = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let response = await callGemini(contents, systemPrompt);

  let safetyCounter = 0;
  while (safetyCounter < 3) {
    safetyCounter++;
    const parts = response.candidates?.[0]?.content?.parts || [];
    const functionCallPart = parts.find((p: any) => p.functionCall);
    if (!functionCallPart) break;

    const fnCall = functionCallPart.functionCall;
    let toolResult: any;
    try {
      toolResult = await executeCreateOrder(fnCall.args, conversationId);
    } catch (err: any) {
      toolResult = { error: err.message || "Không tạo được đơn hàng." };
    }

    // Lưu lại lượt trả lời của model (chứa functionCall) rồi gửi kết quả hàm về
    contents.push(response.candidates[0].content);
    contents.push({
      role: "user",
      parts: [
        {
          functionResponse: {
            name: fnCall.name,
            response: toolResult,
            ...(fnCall.id ? { id: fnCall.id } : {}),
          },
        },
      ],
    });

    response = await callGemini(contents, systemPrompt);
  }

  const parts = response.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((p: any) => p.text);
  return (
    textPart?.text ||
    "Xin lỗi, mình chưa xử lý được yêu cầu này, bạn nhắn lại giúp mình nhé."
  );
}

async function executeCreateOrder(input: any, conversationId: string) {
  const { items, customerName, phone, address, note, paymentMethod } = input;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Danh sách sản phẩm trống.");
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: items.map((i: any) => i.productSlug) } },
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
    const product = products.find((p) => p.slug === item.productSlug);
    if (!product) throw new Error(`Không tìm thấy sản phẩm: ${item.productSlug}`);

    if (product.variants.length > 0) {
      const variant = product.variants.find(
        (v) =>
          (v.optionValue1 ?? null) === (item.option1 ?? null) &&
          (v.optionValue2 ?? null) === (item.option2 ?? null)
      );
      if (!variant) {
        throw new Error(
          `Sản phẩm "${product.name}" cần chọn đúng phân loại (${[product.optionName1, product.optionName2]
            .filter(Boolean)
            .join(" / ")}) trong danh mục.`
        );
      }
      if (variant.stock < item.quantity) {
        throw new Error(
          `Loại "${[variant.optionValue1, variant.optionValue2].filter(Boolean).join(" / ")}" của "${product.name}" chỉ còn ${variant.stock} trong kho.`
        );
      }
      const price = variant.priceOverride ?? product.price;
      total += price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        variantId: variant.id,
        variantLabel: [variant.optionValue1, variant.optionValue2].filter(Boolean).join(" / "),
        quantity: item.quantity,
        price,
      });
    } else {
      if (product.stock < item.quantity) {
        throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho.`);
      }
      total += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        variantId: null,
        variantLabel: null,
        quantity: item.quantity,
        price: product.price,
      });
    }
  }

  const order = await prisma.order.create({
    data: {
      conversationId,
      customerName,
      phone,
      address,
      note: note || null,
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

  return {
    success: true,
    orderId: order.id,
    total: order.total,
    items: order.items.map((i) => ({
      name: i.product.name,
      variant: i.variantLabel,
      quantity: i.quantity,
      price: i.price,
    })),
  };
}

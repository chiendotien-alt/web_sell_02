/**
 * Gửi tin nhắn báo đơn hàng mới qua Telegram.
 * Nếu chưa cấu hình TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID thì bỏ qua âm thầm
 * (không làm hỏng việc tạo đơn hàng nếu gửi thông báo thất bại).
 */
export async function notifyNewOrderTelegram(order: {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  paymentMethod: string;
  items: { quantity: number; variantLabel?: string | null; product: { name: string } }[];
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Shop";
  const itemsText = order.items
    .map((i) => `• ${i.product.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`)
    .join("\n");

  const text = [
    `🛎️ ĐƠN HÀNG MỚI — ${shopName}`,
    ``,
    `Mã đơn: #${order.id.slice(-8).toUpperCase()}`,
    `Khách: ${order.customerName}`,
    `SĐT: ${order.phone}`,
    `Địa chỉ: ${order.address}`,
    ``,
    itemsText,
    ``,
    `Tổng: ${order.total.toLocaleString("vi-VN")}đ (${order.paymentMethod})`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {
    // Không chặn việc tạo đơn hàng nếu gửi thông báo lỗi.
  }
}

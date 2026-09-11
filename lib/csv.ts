function csvEscape(value: string) {
  const v = value.replace(/"/g, '""');
  return `"${v}"`;
}

type OrderForExport = {
  id: string;
  createdAt: string | Date;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  total: number;
  note?: string | null;
  items: { quantity: number; variantLabel?: string | null; product: { name: string } }[];
};

const STATUS_LABEL_VI: Record<string, string> = {
  NEW: "Mới",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DONE: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export function exportOrdersToCsv(orders: OrderForExport[], filename = "don-hang.csv") {
  const headers = [
    "Mã đơn",
    "Ngày đặt",
    "Khách hàng",
    "Số điện thoại",
    "Địa chỉ",
    "Sản phẩm",
    "Tổng tiền",
    "Thanh toán",
    "Trạng thái TT",
    "Trạng thái đơn",
    "Ghi chú",
  ];

  const rows = orders.map((o) => {
    const itemsText = o.items
      .map((i) => `${i.product.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`)
      .join("; ");
    const date = new Date(o.createdAt);
    return [
      o.id,
      date.toLocaleString("vi-VN"),
      o.customerName,
      o.phone,
      o.address,
      itemsText,
      String(o.total),
      o.paymentMethod,
      o.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán",
      STATUS_LABEL_VI[o.status] || o.status,
      o.note || "",
    ];
  });

  // Thêm BOM để Excel đọc đúng tiếng Việt có dấu
  const csvContent =
    "\uFEFF" + [headers, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(",")).join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

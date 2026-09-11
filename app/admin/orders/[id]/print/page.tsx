import { isAdminAuthed } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { formatVND } from "@/lib/format";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Mới",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DONE: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export default async function OrderPrintPage({ params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return <p className="p-8 text-center text-gray-500">Vui lòng đăng nhập /admin trước.</p>;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Shop Của Bạn";

  return (
    <div className="max-w-2xl mx-auto p-8 print:p-0">
      <div className="flex justify-end mb-4 print:hidden">
        <PrintButton />
      </div>

      <div className="border border-gray-300 rounded-lg p-8 print:border-0">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold">{shopName}</h1>
            <p className="text-sm text-gray-500 mt-1">Hóa đơn bán hàng</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-500">Mã đơn</p>
            <p className="font-mono font-medium">{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Khách hàng</p>
            <p className="font-medium">{order.customerName}</p>
            <p>{order.phone}</p>
            <p>{order.address}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 mb-1">Ngày đặt</p>
            <p>{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
            <p className="text-gray-500 mt-2 mb-1">Trạng thái</p>
            <p>{STATUS_LABEL[order.status] || order.status}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-300 text-left text-gray-500">
              <th className="pb-2">Sản phẩm</th>
              <th className="pb-2 text-center">SL</th>
              <th className="pb-2 text-right">Đơn giá</th>
              <th className="pb-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2">
                  {item.product.name}
                  {item.variantLabel ? ` (${item.variantLabel})` : ""}
                </td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{formatVND(item.price)}</td>
                <td className="py-2 text-right">{formatVND(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-48 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Tổng cộng</span>
              <span className="font-bold text-base">{formatVND(order.total)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Thanh toán</span>
              <span>{order.paymentMethod === "COD" ? "COD" : "Chuyển khoản"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Tình trạng TT</span>
              <span>{order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}</span>
            </div>
          </div>
        </div>

        {order.note && (
          <div className="text-sm border-t border-gray-200 pt-3">
            <span className="text-gray-500">Ghi chú: </span>
            {order.note}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">Cảm ơn bạn đã mua hàng tại {shopName}!</p>
      </div>
    </div>
  );
}

import { isAdminAuthed } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import AdminLogin from "./AdminLogin";
import Link from "next/link";
import { formatVND } from "@/lib/format";
import SeedButton from "./SeedButton";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  if (!isAdminAuthed()) return <AdminLogin />;

  const [productCount, orderCount, newOrders, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Tổng quan</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Sản phẩm" value={productCount} href="/admin/products" />
        <Card label="Tổng đơn hàng" value={orderCount} href="/admin/orders" />
        <Card label="Đơn mới" value={newOrders} href="/admin/orders" />
        <Card label="Doanh thu đã thu" value={formatVND(revenue._sum.total || 0)} href="/admin/orders" />
      </div>

      {productCount === 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <p className="font-medium text-gray-800 mb-1">Web đang chưa có sản phẩm nào</p>
          <p className="text-sm text-gray-500 mb-3">
            Bấm nút dưới đây để tạo 6 sản phẩm mẫu, giúp bạn xem thử giao diện web trước khi tự thêm sản phẩm thật.
          </p>
          <SeedButton />
        </div>
      )}

      <div className="mt-6 bg-white rounded-xl shadow-sm p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-1">Mẹo nhanh</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Thêm sản phẩm mới ở mục "Sản phẩm".</li>
          <li>Đơn hàng do khách chốt qua khung chat AI sẽ tự động xuất hiện ở mục "Đơn hàng".</li>
          <li>Nhớ đổi mật khẩu quản trị trong biến môi trường ADMIN_PASSWORD trước khi public web.</li>
        </ul>
      </div>
    </div>
  );
}

function Card({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </Link>
  );
}

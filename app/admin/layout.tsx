import { isAdminAuthed } from "@/lib/adminAuth";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdminAuthed();

  return (
    <div className="min-h-screen bg-gray-100">
      {authed && (
        <div className="bg-gray-900 text-white print:hidden">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6 text-sm">
            <span className="font-semibold">🔧 Quản trị shop</span>
            <Link href="/admin" className="hover:text-brand-light">Tổng quan</Link>
            <Link href="/admin/products" className="hover:text-brand-light">Sản phẩm</Link>
            <Link href="/admin/orders" className="hover:text-brand-light">Đơn hàng</Link>
            <Link href="/admin/showcase" className="hover:text-brand-light">Trưng bày</Link>
            <Link href="/" className="hover:text-brand-light ml-auto">Xem website →</Link>
            <LogoutButton />
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}

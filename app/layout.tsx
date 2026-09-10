import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SHOP_NAME || "Shop Của Bạn",
  description: "Website bán hàng trực tuyến",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <ChatWidget />
      </body>
    </html>
  );
}

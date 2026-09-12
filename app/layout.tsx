import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SHOP_NAME || "Shop Của Bạn",
  description: "Website bán hàng trực tuyến",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} ${playfairDisplay.variable}`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <ChatWidget />
      </body>
    </html>
  );
}

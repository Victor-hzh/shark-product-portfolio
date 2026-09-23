import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shark Product Portfolio",
  description: "Shark 品牌产品线与官方来源监控",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

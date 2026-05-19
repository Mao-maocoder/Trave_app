import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "中轴奇遇 | Axis Odyssey",
  description:
    "北京中轴线文明互鉴旅行应用 - Beijing Central Axis Cultural Travel App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="min-h-screen flex flex-col font-body antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

'use client'; 

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { usePathname } from "next/navigation"; // ← add this
import { initSmoothScroll } from "@/lib/smooth-scroll";
import Header from "@/components/layout/Header";
import Preloader from "@/components/ui/Prloader";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/cart/CartSidebar";
import { AuthProvider } from "@/context/AuthContext";
import FloatingPhone from "@/components/ui/FloatingPhone";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // ← add this
  const isAdmin = pathname?.startsWith('/admin'); // ← add this

  useEffect(() => {
    initSmoothScroll();
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <CartSidebar />
            {!isAdmin && <Preloader />}  {/* ← hide on admin */}
            {!isAdmin && <Header />}     {/* ← hide on admin */}
            {!isAdmin && <FloatingPhone />}
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
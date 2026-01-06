'use client'; 

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { initSmoothScroll } from "@/lib/smooth-scroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Header from "@/components/layout/Header";
import Preloader from "@/components/ui/Prloader";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/cart/CartSidebar";

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
  
  useEffect(() => {
    initSmoothScroll();
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* PROVIDER MUST WRAP EVERYTHING */}
        <CartProvider>
          
          <CartSidebar />
          <Preloader/>
          <Header />
          <CustomCursor />
          
          {/* MOVED INSIDE THE PROVIDER */}
          {children}

        </CartProvider>
      </body>
    </html>
  );
}
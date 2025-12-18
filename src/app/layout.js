"use client";

import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { usePathname } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Check if we are on a dashboard route
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/products") || pathname.startsWith("/orders") || pathname.startsWith("/users");

  return (
    <html className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`} lang="en">
      <body className="antialiased">
        {!isDashboard && <Navbar />}
        {children}
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}

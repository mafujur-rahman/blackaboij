"use client";

import { usePathname } from "next/navigation";
import Navbar from "../shared/Navbar";
import { CartWishlistProvider } from "../context/CartWishlistContext";
import Footer from "../shared/Footer";


export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/users");

  return (
    <>
      {!isDashboard && <Navbar />}
      <CartWishlistProvider>{children}</CartWishlistProvider>
      {!isDashboard && <Footer />}
    </>
  );
}

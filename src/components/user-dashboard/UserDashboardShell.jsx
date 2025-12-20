"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiMenu,
  FiGlobe,
  FiMaximize2,
  FiRefreshCcw,
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

export default function UserDashboardShell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightFullScreen, setRightFullScreen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setRightFullScreen(!sidebarOpen);
  };

  const toggleFullscreen = () => {
    setRightFullScreen(!rightFullScreen);
  };

  const openWebsite = () => {
    window.open("http://www.blackaboij.com", "_blank");
  };

  const isActive = (path) =>
    pathname === path ? "bg-white/10" : "hover:bg-white/10";

  const linkClass =
    "flex items-center gap-3 py-2 px-3 rounded transition text-[16px]";

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      {sidebarOpen && (
        <aside className="w-[260px] bg-black text-white flex flex-col transition-all duration-300">

          {/* LOGO */}
          <div className="h-16 flex items-center justify-center border-b border-white/10">
            <Image
              src="/images/logo-white.png"
              alt="Blackaboj"
              width={140}
              height={40}
              priority
            />
          </div>

          {/* NAV */}
          <nav className="flex-1 px-4 py-6">

            <Link
              href="/user/dashboard"
              className={`${linkClass} ${isActive("/user/dashboard")}`}
            >
              <FiHome className="text-xl" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/user/orders"
              className={`${linkClass} ${isActive("/user/orders")}`}
            >
              <FiShoppingBag className="text-xl" />
              <span>Orders</span>
            </Link>

            <Link
              href="/user/wishlist"
              className={`${linkClass} ${isActive("/user/wishlist")}`}
            >
              <FiHeart className="text-xl" />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/user/profile"
              className={`${linkClass} ${isActive("/user/profile")}`}
            >
              <FiUser className="text-xl" />
              <span>Profile</span>
            </Link>

            <Link
              href="/logout"
              className="flex items-center gap-3 py-2 px-3 mt-8 rounded text-red-400 hover:bg-white/10"
            >
              <FiLogOut className="text-xl" />
              <span>Logout</span>
            </Link>

          </nav>
        </aside>
      )}

      {/* RIGHT SIDE */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300`}>

        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 text-sm">
          <div className="flex items-center gap-4">
            <FiMenu
              className="text-lg cursor-pointer"
              onClick={toggleSidebar}
            />
            <FiGlobe
              className="text-lg cursor-pointer"
              onClick={openWebsite}
            />
          </div>

          <div className="flex items-center gap-4">
            <FiMaximize2
              className="text-lg cursor-pointer"
              onClick={toggleFullscreen}
            />
            <FiRefreshCcw
              className="text-lg cursor-pointer"
              onClick={() => window.location.reload()}
            />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            rightFullScreen ? "w-full" : ""
          }`}
        >
          {children}
        </main>

        {/* FOOTER */}
        <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center text-[14px] text-gray-500">
          © {new Date().getFullYear()} Blackaboj — User Dashboard
        </footer>

      </div>
    </div>
  );
}

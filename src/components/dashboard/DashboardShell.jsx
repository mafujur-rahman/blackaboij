"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiGlobe, FiMaximize2, FiRefreshCcw, FiGrid, FiBox, FiPlusSquare, FiLayers, FiMaximize, FiDroplet, FiShoppingCart, FiUsers, FiLogOut } from "react-icons/fi";

export default function DashboardShell({ children }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [rightFullScreen, setRightFullScreen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        if (sidebarOpen) {
            setRightFullScreen(true);
        } else {
            setRightFullScreen(false);
        }
    };

    const toggleFullscreen = () => {
        setRightFullScreen(!rightFullScreen);
    };

    const openWebsite = () => {
        window.open("http://www.blackaboij.com", "_blank");
    };

    const isActive = (path) => pathname === path ? "bg-white/10" : "hover:bg-white/10";
    const linkClass = "flex items-center gap-3 py-2 px-3 rounded transition";

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* SIDEBAR */}
            {sidebarOpen && (
                <aside className="w-[260px] bg-black text-white flex flex-col transition-all duration-300">
                    {/* LOGO */}
                    <div className="h-16 flex items-center justify-center border-b border-white/10">
                        <Image
                            src="/images/logo.png"
                            alt="Blackaboj"
                            width={140}
                            height={40}
                            priority
                        />
                    </div>

                    <nav className="flex-1 px-4 py-4 text-lg">
                        <Link href="/dashboard" className={`${linkClass} ${isActive("/dashboard")}`}>
                            <FiGrid className="text-xl" />
                            <span>Dashboard</span>
                        </Link>

                        <p className="mt-5 mb-2 text-[16px] text-white/50">Products</p>

                        <Link href="/dashboard/product-list" className={`${linkClass} ${isActive("/dashboard/product-list")}`}>
                            <FiBox className="text-xl" />
                            <span>Products List</span>
                        </Link>

                        <Link href="/products/add" className={`${linkClass} ${isActive("/products/add")}`}>
                            <FiPlusSquare className="text-xl" />
                            <span>Add Products</span>
                        </Link>

                        <Link href="/products/category" className={`${linkClass} ${isActive("/products/category")}`}>
                            <FiLayers className="text-xl" />
                            <span>Category</span>
                        </Link>

                        <Link href="/products/size" className={`${linkClass} ${isActive("/products/size")}`}>
                            <FiMaximize className="text-xl" />
                            <span>Size</span>
                        </Link>

                        <Link href="/products/color" className={`${linkClass} ${isActive("/products/color")}`}>
                            <FiDroplet className="text-xl" />
                            <span>Color</span>
                        </Link>

                        <p className="mt-5 mb-2 text-[16px] text-white/50">Order</p>

                        <Link href="/orders" className={`${linkClass} ${isActive("/orders")}`}>
                            <FiShoppingCart className="text-xl" />
                            <span>Order List</span>
                        </Link>

                        <p className="mt-5 mb-2 text-[16px] text-white/50">All User</p>

                        <Link href="/users" className={`${linkClass} ${isActive("/users")}`}>
                            <FiUsers className="text-xl" />
                            <span>Customer List</span>
                        </Link>

                        <Link href="/" className="flex items-center gap-3 py-2 px-3 mt-6 rounded text-red-400 hover:bg-white/10">
                            <FiLogOut className="text-xl" />
                            <span>Logout</span>
                        </Link>
                    </nav>
                </aside>
            )}

            {/* RIGHT SIDE */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? "" : "w-full"}`}>

                {/* TOPBAR */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 text-sm">
                    <div className="flex items-center gap-4">
                        <FiMenu className="text-lg cursor-pointer" onClick={toggleSidebar} />
                        <FiGlobe className="text-lg cursor-pointer" onClick={openWebsite} />
                    </div>

                    <div className="flex items-center gap-4">
                        <FiMaximize2 className="text-lg cursor-pointer" onClick={toggleFullscreen} />
                        <FiRefreshCcw className="text-lg cursor-pointer" onClick={() => window.location.reload()} />
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className={`flex-1 p-6 transition-all duration-300 ${rightFullScreen ? "w-full" : ""}`}>
                    {children}
                </main>

                {/* FOOTER */}
                <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center text-[16px] text-gray-500">
                    Copyright © {new Date().getFullYear()} Blackaboj All rights reserved | Made By Jewel
                </footer>

            </div>
        </div>
    );
}

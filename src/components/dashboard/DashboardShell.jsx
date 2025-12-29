"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { FiMenu, FiGlobe, FiMaximize2, FiRefreshCcw, FiGrid, FiBox, FiPlusSquare, FiLayers, FiMaximize, FiDroplet, FiShoppingCart, FiUsers, FiLogOut, FiPercent, } from "react-icons/fi";


export default function DashboardShell({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [rightFullScreen, setRightFullScreen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };


    const toggleFullscreen = () => {
        setRightFullScreen(!rightFullScreen);
    };

    const openWebsite = () => {
        window.open("https://blackaboij.com", "_blank");
    };

    const handleLogout = async () => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out from the dashboard",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#000",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Logout",
        });

        if (!confirm.isConfirmed) return;

        // Clear tokens locally first
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
        localStorage.removeItem("user_role");

        try {
            await api.post("/api/user/logout/");
        } catch (error) {
            console.warn("Logout API failed:", error?.response?.status);
        }

        Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been logged out successfully",
            confirmButtonColor: "#000",
        });

        router.replace("/signin");
    };

    const isActive = (path) =>
        pathname === path ? "bg-white/10" : "hover:bg-white/10";

    const linkClass = "flex items-center gap-3 py-2 px-3 rounded transition";

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* SIDEBAR */}
            {sidebarOpen && (
                <aside className="w-[260px] bg-black text-white flex flex-col transition-all duration-300 fixed top-0 left-0 h-screen shadow-md z-30">
                    {/* LOGO / HEADER */}
                    <div className="h-16 flex items-center justify-center border-b border-white/10">
                        <Link href={'/'}>
                            <Image
                                src="/images/new-logo.png"
                                alt="Blackaboj"
                                width={140}
                                height={40}
                                priority
                            />
                        </Link>
                    </div>

                    {/* NAVIGATION */}
                    <nav className="flex-1 px-4 py-4 text-lg overflow-y-auto">
                        <Link href="/dashboard" className={`${linkClass} ${isActive("/dashboard")}`}>
                            <FiGrid className="text-xl" />
                            <span>Dashboard</span>
                        </Link>

                        <p className="mt-5 mb-2 text-[16px] text-white/50">Products</p>

                        <Link href="/dashboard/product-list" className={`${linkClass} ${isActive("/dashboard/product-list")}`}>
                            <FiBox className="text-xl" />
                            <span>Products List</span>
                        </Link>

                        <Link href="/dashboard/add-product" className={`${linkClass} ${isActive("/dashboard/add-product")}`}>
                            <FiPlusSquare className="text-xl" />
                            <span>Add Products</span>
                        </Link>

                        <Link href="/dashboard/category" className={`${linkClass} ${isActive("/dashboard/category")}`}>
                            <FiLayers className="text-xl" />
                            <span>Category</span>
                        </Link>

                        <Link href="/dashboard/size" className={`${linkClass} ${isActive("/dashboard/size")}`}>
                            <FiMaximize className="text-xl" />
                            <span>Size</span>
                        </Link>

                        <Link href="/dashboard/color" className={`${linkClass} ${isActive("/dashboard/color")}`}>
                            <FiDroplet className="text-xl" />
                            <span>Color</span>
                        </Link>

                        <Link href="/dashboard/discount" className={`${linkClass} ${isActive("/dashboard/discount")}`}>
                            <FiPercent className="text-xl" />
                            <span>Discount</span>
                        </Link>

                        <p className="mt-5 mb-2 text-[16px] text-white/50">Order</p>

                        <Link href="/dashboard/order-list" className={`${linkClass} ${isActive("/dashboard/order-list")}`}>
                            <FiShoppingCart className="text-xl" />
                            <span>Order List</span>
                        </Link>

                        <p className="mt-5 mb-2 text-[16px] text-white/50">All User</p>

                        <Link href="/dashboard/customer-list" className={`${linkClass} ${isActive("/dashboard/customer-list")}`}>
                            <FiUsers className="text-xl" />
                            <span>Customer List</span>
                        </Link>

                        <Link href="/dashboard/subscriber-list" className={`${linkClass} ${isActive("/dashboard/subscriber-list")}`}>
                            <FiUsers className="text-xl" />
                            <span>Subscriber List</span>
                        </Link>

                        {/* LOGOUT */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 py-2 px-3 mt-6 rounded text-red-400 hover:bg-white/10 w-full text-left"
                        >
                            <FiLogOut className="text-xl" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </aside>
            )}


            {/* RIGHT SIDE */}
            <div
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-[260px]' : 'ml-0'
                    }`}
            >
                <header className="h-16 bg-white border-b border-black/10 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <FiMenu className="cursor-pointer" onClick={toggleSidebar} />
                        <FiGlobe className="cursor-pointer" onClick={openWebsite} />
                    </div>

                    <div className="flex items-center gap-4">
                        <FiMaximize2 className="cursor-pointer" onClick={toggleFullscreen} />
                        <FiRefreshCcw className="cursor-pointer" onClick={() => window.location.reload()} />
                    </div>
                </header>

                <main className="flex-1 p-6">{children}</main>

                <footer className="h-12 bg-white border-t border-black/10 flex items-center justify-center text-gray-500">
                    © {new Date().getFullYear()} Blackaboj All rights reserved
                </footer>
            </div>


        </div>
    );
}

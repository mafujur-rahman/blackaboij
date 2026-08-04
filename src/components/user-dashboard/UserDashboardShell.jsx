"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiHome, FiShoppingBag, FiHeart, FiUser, FiLogOut } from "react-icons/fi";
import Swal from "sweetalert2";
import api from "@/lib/axios";

export default function UserDashboardShell({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const CLOUDINARY_BASE = "https://res.cloudinary.com/dwsp8rft8/";

    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        username: "", 
        email: "",
        profile_pic: "/images/profile.webp",
    });


    const isActive = (path) =>
        pathname === path ? "bg-black/10" : "hover:bg-black/10";

    const linkClass = "flex items-center gap-3 py-2 px-3 rounded transition text-[16px]";

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
                if (!token) return;

                const res = await api.get("/api/user/get-my-profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log(res.data)

                setUser({
                    first_name: res.data.first_name,
                    last_name: res.data.last_name,
                    username: res.data.username,
                    email: res.data.email,
                    profile_pic: res.data.profile_pic
                        ? `${CLOUDINARY_BASE}${res.data.profile_pic}`
                        : "/images/profile.webp",
                });
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            }
        };

        fetchProfile();
    }, []);

    // Logout handler
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

        router.replace("/");
    };

    return (
        <div className="flex min-h-screen bg-gray-100 px-4 lg:px-12 xl:px-24 2xl:px-48">
            {/* SIDEBAR */}
            {sidebarOpen && (
                <aside className="w-[260px] bg-white text-black flex flex-col transition-all duration-300">
                    {/* USER PROFILE */}
                    <div className="flex flex-col items-center py-8 border-b border-black/10">
                        <Image
                            src={user.profile_pic || "/images/profile.webp"}
                            alt="User Profile"
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                        />
                        <h2 className="mt-4 text-lg font-semibold">
                            {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                        </h2>
                        <p className="text-sm text-gray-500">{user.email || "Loading..."}</p>
                    </div>

                    {/* NAVIGATION */}
                    <nav className="flex-1 px-4 py-6">
                        <Link href="/user/dashboard" className={`${linkClass} ${isActive("/user/dashboard")}`}>
                            <FiHome className="text-xl" />
                            <span>Dashboard</span>
                        </Link>

                        <Link href="/user/orders" className={`${linkClass} ${isActive("/user/orders")}`}>
                            <FiShoppingBag className="text-xl" />
                            <span>Orders</span>
                        </Link>

                        <Link href="/user/wishlist" className={`${linkClass} ${isActive("/user/wishlist")}`}>
                            <FiHeart className="text-xl" />
                            <span>Wishlist</span>
                        </Link>

                        <Link href="/user/profile" className={`${linkClass} ${isActive("/user/profile")}`}>
                            <FiUser className="text-xl" />
                            <span>Profile</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 py-2 px-3 mt-8 rounded text-red-400 hover:bg-white/10 w-full text-left cursor-pointer"
                        >
                            <FiLogOut className="text-xl" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </aside>
            )}

            {/* RIGHT SIDE */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
                <main className="flex-1 p-6 transition-all duration-300">
                    {children}
                </main>

                <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center text-[14px] text-gray-500">
                    © {new Date().getFullYear()} Blackaboj — User Dashboard | Designed & Developed by Graphitricks
                </footer>
            </div>
        </div>
    );
}

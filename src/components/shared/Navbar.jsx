"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
    FiSearch,
    FiUser,
    FiHeart,
    FiShoppingBag,
    FiMenu,
    FiX,
} from "react-icons/fi";
import Link from "next/link";

const navLinks = [
    {
        name: "Men",
        href: "/men",
        dropdown: [
            { name: "Men New Arrivals", href: "/men/new-arrivals" },
            { name: "Tees", href: "/men/tees" },
            { name: "Hoodies and sweaters", href: "/men/hoodies-sweaters" },
            { name: "Pants", href: "/men/pants" },
            { name: "Outwears", href: "/men/outwears" },
            { name: "Shoes", href: "/men/shoes" },
        ],
    },
    {
        name: "Women",
        href: "/women",
        dropdown: [
            { name: "Women New Arrivals", href: "/women/new-arrivals" },
            { name: "Tees", href: "/women/tees" },
            { name: "Hoodies and sweaters", href: "/women/hoodies-sweaters" },
            { name: "Pants", href: "/women/pants" },
            { name: "Outwears", href: "/women/outwears" },
            { name: "Shoes", href: "/women/shoes" },
        ],
    },
    {
        name: "Accessories",
        href: "/accessories",
        dropdown: [
            { name: "Men's Accessories", href: "/accessories/mens" },
            { name: "Women's Accessories", href: "/accessories/womens" },
        ],
    },
    { name: "Store", href: "/store" },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log(searchQuery);
        setMobileSearchOpen(false);
    };

    return (
        <nav className="bg-black text-white sticky top-0 z-50">
            {/* ================= TOP BAR (FULL WIDTH BORDER) ================= */}
            <div className="md:border-b md:border-white/50">
                <div className="px-4 lg:px-12 xl:container xl:mx-auto xl:px-0">
                    <div className="relative flex items-center h-20">
                        {/* LEFT */}
                        <div className="flex items-center w-1/3">
                            {/* Mobile Menu */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2"
                            >
                                {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                            </button>

                            {/* Desktop Search */}
                            <form
                                onSubmit={handleSearch}
                                className="hidden md:block w-full max-w-xs ml-2"
                            >
                                <div className="relative rounded-full border border-white/50 px-4 py-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="bg-transparent text-sm text-gray-300 placeholder-gray-300 focus:outline-none w-full pr-8"
                                    />
                                    <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                            </form>
                        </div>

                        {/* CENTER LOGO (RESPONSIVE SIZE) */}
                        <div className="absolute left-1/2 -translate-x-1/2">
                            <Link href="/">
                                <Image
                                    src="/images/logo.png"
                                    alt="Logo"
                                    className="w-[80px] md:w-[120px] lg:w-[140px] h-auto"
                                    width={140}
                                    height={40}
                                    priority
                                />
                            </Link>
                        </div>

                        {/* RIGHT */}
                        <div className="flex items-center ml-auto">
                            {/* User */}
                            <Link href="/account" className="md:p-2 p-1">
                                <FiUser size={20} />
                            </Link>

                            {/* Cart */}
                            <Link href="/cart" className="md:p-2 p-1">
                                <FiShoppingBag size={20} />
                            </Link>

                            {/* Mobile Search Toggle */}
                            <button
                                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                className="md:hidden md:p-2 p-1"
                            >
                                {mobileSearchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
                            </button>

                            {/* Desktop Wishlist */}
                            <Link href="/wishlist" className="hidden md:block md:p-2 p-1">
                                <FiHeart size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= MOBILE SEARCH BAR ================= */}
            {mobileSearchOpen && (
                <div className="md:hidden px-4 py-4 border-b border-white/20">
                    <form onSubmit={handleSearch} className="max-w-md mx-auto">
                        <div className="relative rounded-full border border-white/50 px-4 py-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none w-full pr-8"
                            />
                            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </form>
                </div>
            )}

            {/* ================= DESKTOP NAV ================= */}
            <div className="hidden md:flex justify-center space-x-8 py-4">
                {navLinks.map((link) => (
                    <div key={link.name} className="relative group">
                        <Link href={link.href}>{link.name}</Link>

                        {link.dropdown && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56 bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4">
                                {link.dropdown.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block px-5 py-1.5 text-sm uppercase"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ================= MOBILE MENU ================= */}
            {isMenuOpen && (
                <div className="md:hidden bg-black px-4">
                    {navLinks.map((link) => (
                        <div key={link.name}>
                            <button
                                onClick={() =>
                                    setOpenDropdown(
                                        openDropdown === link.name ? null : link.name
                                    )
                                }
                                className="w-full py-4 text-left border-b border-white/50"
                            >
                                {link.name}
                            </button>

                            {link.dropdown && openDropdown === link.name && (
                                <div>
                                    {link.dropdown.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="block px-8 py-3 text-sm"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </nav>
    );
}

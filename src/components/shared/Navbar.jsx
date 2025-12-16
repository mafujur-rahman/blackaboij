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
  FiChevronDown,
} from "react-icons/fi";
import Link from "next/link";
import Cart from "../cart/Cart";

const navLinks = [
  {
    name: "Men",
    dropdown: [
      { name: "Men New Arrivals", href: "/men/men-collection" },
      { name: "Tees", href: "/men/men-tees" },
      { name: "Hoodies and sweaters", href: "/men/men-hoodies-sweaters" },
      { name: "Pants", href: "/men/men-pants" },
      { name: "Outwears", href: "/men/men-outwears" },
      { name: "Shoes", href: "/men/men-shoes" },
    ],
  },
  {
    name: "Women",
    dropdown: [
      { name: "Women New Arrivals", href: "/women/women-collection" },
      { name: "Tees", href: "/women/women-tees" },
      { name: "Hoodies and sweaters", href: "/women/women-hoodies-sweaters" },
      { name: "Pants", href: "/women/women-pants" },
      { name: "Outwears", href: "/women/women-outwears" },
      { name: "Shoes", href: "/women/women-shoes" },
    ],
  },
  {
    name: "Accessories",
    dropdown: [
      { name: "Men's Accessories", href: "/men-accesories" },
      { name: "Women's Accessories", href: "/women-accesories" },
    ],
  },
  {
    name: "Store",
    href: "/store",
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setMobileSearchOpen(false);
  };

  return (
    <>
      <nav className="bg-black text-white top-0 z-50">
        {/* ================= TOP BAR ================= */}
        <div className="md:border-b md:border-white/50">
          <div className="px-4 lg:px-12 xl:container xl:mx-auto xl:px-0">
            <div className="relative flex items-center h-20">
              {/* LEFT */}
              <div className="flex items-center w-1/3">
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
                  <div className="relative rounded-full border border-white/40 px-4 py-2">
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

              {/* LOGO */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <Link href="/">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    className="w-[80px] md:w-[120px] lg:w-[140px]"
                    width={140}
                    height={40}
                    priority
                  />
                </Link>
              </div>

              {/* RIGHT */}
              <div className="flex items-center ml-auto">
                <Link href="/signin" className="p-2">
                  <FiUser size={20} />
                </Link>

                <button onClick={() => setIsCartOpen(true)} className="p-2">
                  <FiShoppingBag size={20} />
                </button>

                {/* Mobile Search Toggle */}
                <button
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                  className="md:hidden p-2"
                >
                  {mobileSearchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
                </button>

                <Link href="/" className="hidden md:block p-2">
                  <FiHeart size={20} />
                </Link>
              </div>
            </div>

            {/* ===== MOBILE SEARCH FIELD (CENTERED UNDER LOGO) ===== */}
            {mobileSearchOpen && (
              <form
                onSubmit={handleSearch}
                className="md:hidden flex justify-center pb-4"
              >
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-full border border-white/40 bg-black px-4 py-2 text-sm text-gray-300 placeholder-gray-400 focus:outline-none"
                  />
                  <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden md:flex justify-center space-x-8 py-4">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              {link.href ? (
                <Link href={link.href} className="uppercase">
                  {link.name}
                </Link>
              ) : (
                <span className="uppercase cursor-pointer">
                  {link.name}
                </span>
              )}

              {link.dropdown && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-56 bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4 z-50">
                  {link.dropdown.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-5 py-2 text-sm uppercase"
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
                    link.dropdown &&
                    setOpenDropdown(
                      openDropdown === link.name ? null : link.name
                    )
                  }
                  className="w-full py-4 flex justify-between items-center border-b border-white/50"
                >
                  <span>{link.name}</span>
                  {link.dropdown && <FiChevronDown />}
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

                {!link.dropdown && link.href && (
                  <Link
                    href={link.href}
                    className="block py-4 border-b border-white/50"
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* CART */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

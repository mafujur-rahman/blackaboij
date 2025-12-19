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
import { useRouter } from "next/navigation";
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
  { name: "Accessories", href: "/accessories" },
  { name: "Store", href: "/store" },
];

export default function Navbar() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);



  return (
    <>
      <nav className="bg-black text-white top-0 z-50">
        {/* ================= TOP BAR ================= */}
        <div className="md:border-b md:border-white/50">
          <div className="px-4 lg:px-12 xl:px-12.5">
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
                  className="hidden md:block w-full max-w-[270px] ml-2"
                >
                  <div className="relative rounded-full border border-white/40 px-4 py-1.5">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="bg-transparent text-sm text-gray-300 placeholder-gray-300 focus:outline-none w-full pr-8"
                    />
                    <button type="submit">
                      <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    </button>
                  </div>
                </form>
              </div>

              {/* LOGO */} <div className="absolute left-1/2 -translate-x-1/2">
                <Link href="/">
                  <Image src="/images/logo-white.png"
                    alt="Logo"
                    className="w-[100px] md:w-[120px] lg:w-[140px] xl:w-[160px]"
                    width={540}
                    height={540}
                    priority />
                </Link>
              </div>

              {/* RIGHT */}
              <div className="flex items-center ml-auto">
                <Link href="/signin" className="p-0 md:p-2 ">
                  <FiUser className="w-4 h-4 md:w-5 md:h-5" />
                </Link>

                <button onClick={() => setIsCartOpen(true)} className="p-1 md:p-2 ">
                  <FiShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                  className="md:hidden p-1 md:p-2 "
                >
                  {mobileSearchOpen ? (
                    <FiX className="w-4 h-4" />
                  ) : (
                    <FiSearch className="w-4 h-4" />
                  )}
                </button>

                <Link href="/" className="hidden md:block p-1 md:p-2 ">
                  <FiHeart className="w-5 h-5" />
                </Link>
              </div>

            </div>

            {/* MOBILE SEARCH */}
            {mobileSearchOpen && (
              <form
                className="md:hidden flex justify-center pb-4"
              >
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-full border border-white/40 bg-black px-4 py-2 text-sm text-gray-300 focus:outline-none"
                  />
                  <button type="submit">
                    <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex justify-center space-x-8 py-4">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              {link.href ? (
                <Link href={link.href}>{link.name}</Link>
              ) : (
                <span>{link.name}</span>
              )}

              {link.dropdown && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-56 bg-black opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-4 z-50">
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

        {/* MOBILE MENU */}
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
              </div>
            ))}
          </div>
        )}
      </nav>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
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
import gsap from "gsap";

/* ================= NAV LINKS ================= */
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
      { name: "Cap", href: "/men/men-cap" },
      { name: "Hat", href: "/men/men-hat" },
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
      { name: "Cap", href: "/women/women-cap" },
      { name: "Hat", href: "/women/women-hat" },
    ],
  },
  { name: "Accessories", href: "/accessories" },
  { name: "Store", href: "/store" },
];

export default function Navbar() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const tickerRef = useRef(null);


  /* ================= GSAP SCROLL ================= */
  useEffect(() => {
    const ticker = tickerRef.current;

    // Create original text items
    const textArray = [];
    for (let i = 0; i < 5; i++) {
      const span = document.createElement("span");
      span.innerText = "Black Friday Discount 20% Off";
      span.className = "ticker-item text-black font-medium text-lg px-8";
      ticker.appendChild(span);
      textArray.push(span);
    }

    // Duplicate the content for seamless infinite scroll
    ticker.innerHTML += ticker.innerHTML;

    // Get width of original content
    const originalWidth = Array.from(ticker.children)
      .slice(0, textArray.length)
      .reduce((total, item) => total + item.offsetWidth, 0) + 8 * 5;

    // Animate the entire container
    gsap.to(ticker, {
      x: -originalWidth,
      duration: 25, // adjust speed
      ease: "linear",
      repeat: -1,
    });
  }, []);


  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");

    setIsLoggedIn(!!token);
  }, []);


  /* ================= HANDLERS ================= */
  const handleProfileClick = () => {
    if (isLoggedIn) {
      const userRole =
        localStorage.getItem("user_role") ||
        sessionStorage.getItem("user_role");

      if (userRole === "CUSTOMER") {
        router.push("/user/dashboard");
      } else if (userRole === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/signin");
      }
    } else {
      router.push("/signin");
    }
  };


  const handleWishlistClick = () => {
    if (isLoggedIn) {
      router.push("/user/wishlist");
    } else {
      router.push("/signin");
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ===== TOP SCROLLING BAR ===== */}
      <div className="w-full overflow-hidden bg-white">
        <div
          ref={tickerRef}
          className="relative flex whitespace-nowrap py-2"
          style={{ height: "40px" }}
        ></div>
      </div>


      {/* ===== NAVBAR ===== */}
      <nav className="bg-black text-white top-0 z-50">
        {/* ===== TOP BAR ===== */}
        <div className="md:border-b md:border-white/50">
          <div className="px-4 lg:px-12">
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
                <form className="hidden md:block w-full max-w-[270px] ml-2">
                  <div className="relative rounded-full border border-white/40 px-4 py-1.5">
                    <input
                      type="text"
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
                    src="/images/new-logo.png"
                    alt="Logo"
                    width={160}
                    height={60}
                    priority
                  />
                </Link>
              </div>

              {/* RIGHT */}
              <div className="flex items-center ml-auto gap-2">
                <button onClick={handleProfileClick}>
                  <FiUser className="w-5 h-5" />
                </button>

                <button onClick={() => setIsCartOpen(true)}>
                  <FiShoppingBag className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                  className="md:hidden"
                >
                  {mobileSearchOpen ? (
                    <FiX className="w-4 h-4" />
                  ) : (
                    <FiSearch className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={handleWishlistClick}
                  className="hidden md:block"
                >
                  <FiHeart
                    className={`w-5 h-5 ${isLoggedIn ? "text-red-500" : "text-white"
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* MOBILE SEARCH */}
            {mobileSearchOpen && (
              <div className="md:hidden pb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-full border border-white/40 bg-black px-4 py-2 text-sm text-gray-300 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* ===== DESKTOP NAV ===== */}
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

        {/* ===== MOBILE MENU ===== */}
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

      {/* CART DRAWER */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
import api from "@/lib/axios";

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
  { name: "Shop", href: "/shop" },
  { name: "Store", href: "/store" },
];

// Helper function to get cart count
const getCartCount = () => {
  if (typeof window === 'undefined') return 0;

  try {
    const cart = JSON.parse(localStorage.getItem('cart_items') || '[]');
    if (Array.isArray(cart)) {
      return cart.reduce((total, item) => total + (item.quantity || 1), 0);
    }
    return 0;
  } catch (error) {
    console.error('Error reading cart:', error);
    return 0;
  }
};

// Helper function to get wishlist count
const getWishlistCount = () => {
  if (typeof window === 'undefined') return 0;

  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return Array.isArray(wishlist) ? wishlist.length : 0;
  } catch (error) {
    console.error('Error reading wishlist:', error);
    return 0;
  }
};

export default function Navbar() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const tickerRef = useRef(null);

  /* ================= GSAP SCROLL ================= */
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    let animation;

    if (ticker.dataset.animated) return;
    ticker.dataset.animated = "true";

    const initTicker = async () => {
      try {
        const res = await api.get("/api/products/get-discounted-percentage/");

        const discountPercent = res.data?.data;

        const text =
          discountPercent && discountPercent > 0
            ? `Black Friday Discount ${discountPercent}% Off`
            : "There is no discount available right now";

        // Clear old content
        ticker.innerHTML = "";

        const items = [];

        // Create items
        for (let i = 0; i < 6; i++) {
          const span = document.createElement("span");
          span.textContent = text;
          span.className =
            "text-black font-medium text-[16px] px-8 whitespace-nowrap";
          ticker.appendChild(span);
          items.push(span);
        }

        // Duplicate for infinite loop
        items.forEach((item) => {
          ticker.appendChild(item.cloneNode(true));
        });

        // Wait for DOM paint
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const totalWidth = items.reduce(
              (sum, el) => sum + el.offsetWidth,
              0
            );

            if (!totalWidth) return;

            gsap.set(ticker, { x: 0 });

            animation = gsap.to(ticker, {
              x: -totalWidth,
              duration: totalWidth / 40, // auto speed
              ease: "linear",
              repeat: -1,
            });
          });
        });
      } catch (error) {
        console.error("Discount API failed:", error);
      }
    };

    initTicker();

    return () => {
      if (animation) animation.kill();
    };
  }, []);



  /* ================= AUTH CHECK & LOAD COUNTS ================= */
  useEffect(() => {
    // Check auth
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");

    setIsLoggedIn(!!token);

    // Load initial counts
    setCartCount(getCartCount());
    setWishlistCount(getWishlistCount());
  }, []);

  /* ================= REAL-TIME UPDATES ================= */
  useEffect(() => {
    // Function to update counts from localStorage
    const updateCounts = () => {
      setCartCount(getCartCount());
      setWishlistCount(getWishlistCount());
    };

    // Listen for custom events
    const handleCartUpdate = () => {
      setTimeout(updateCounts, 100); // Small delay to ensure localStorage is updated
    };

    const handleWishlistUpdate = () => {
      setTimeout(updateCounts, 100);
    };

    // Listen for storage events (if another tab updates)
    const handleStorageChange = (e) => {
      if (e.key === 'cart' || e.key === 'wishlist') {
        updateCounts();
      }
    };

    // Listen for custom events
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('storage', handleStorageChange);

    // Polling for updates (fallback)
    const interval = setInterval(updateCounts, 2000); // Update every 2 seconds

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Function to trigger cart update (call this when adding/removing from cart)
  const triggerCartUpdate = useCallback(() => {
    const event = new CustomEvent('cartUpdated');
    window.dispatchEvent(event);
  }, []);

  // Function to trigger wishlist update (call this when adding/removing from wishlist)
  const triggerWishlistUpdate = useCallback(() => {
    const event = new CustomEvent('wishlistUpdated');
    window.dispatchEvent(event);
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

  /* ================= Search Handler ================= */
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  /* ================= Counter Badge Component ================= */
  const CounterBadge = ({ count, className = "" }) => {
    if (count <= 0) return null;

    return (
      <div className={`absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-black text-xs font-bold ${className}`}>
        {count > 99 ? "99+" : count}
      </div>
    );
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ===== TOP SCROLLING BAR ===== */}
      <div className="w-full bg-white flex justify-center py-2">
        <div
          className="overflow-hidden relative"
          style={{ width: "400px", height: "30px" }}
        >
          <div
            ref={tickerRef}
            className="flex whitespace-nowrap absolute left-0 top-0 will-change-transform"
          />
        </div>
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
                <form
                  onSubmit={handleSearch}
                  className="hidden md:block w-full max-w-[270px] ml-2"
                >
                  <div className="relative rounded-full border border-white/40 px-4 py-1.5">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-sm text-gray-300 placeholder-gray-300 focus:outline-none w-full pr-8"
                    />
                    <button type="submit">
                      <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    </button>
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
              <div className="flex items-center ml-auto gap-4">
                {/* Profile */}
                <button onClick={handleProfileClick} className="relative p-1">
                  <FiUser className="w-6 h-6" />
                </button>

                {/* Cart with Counter */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-1"
                >
                  <FiShoppingBag className="w-6 h-6" />
                  <CounterBadge count={cartCount} />
                </button>

                {/* Mobile Search Toggle */}
                <button
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                  className="md:hidden p-1"
                >
                  {mobileSearchOpen ? (
                    <FiX className="w-5 h-5" />
                  ) : (
                    <FiSearch className="w-5 h-5" />
                  )}
                </button>

                {/* Wishlist with Counter (Desktop) */}
                <button
                  onClick={handleWishlistClick}
                  className="hidden md:block relative p-1"
                >
                  <FiHeart className="w-6 h-6 text-white" />
                  <CounterBadge count={wishlistCount} />
                </button>

                {/* Wishlist with Counter (Mobile - inside menu) */}
                <button
                  onClick={handleWishlistClick}
                  className="md:hidden relative p-1"
                >
                  <FiHeart className="w-6 h-6 text-white" />
                  <CounterBadge count={wishlistCount} />
                </button>
              </div>
            </div>

            {/* MOBILE SEARCH */}
            {mobileSearchOpen && (
              <form onSubmit={handleSearch} className="md:hidden pb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-white/40 bg-black px-4 py-2 text-sm text-gray-300 focus:outline-none"
                />
              </form>
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
                      className="block px-5 py-2 text-sm uppercase hover:bg-white/10"
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
                        className="block px-8 py-3 text-sm hover:bg-white/10"
                        onClick={() => setIsMenuOpen(false)}
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

      {/* CART DRAWER - Pass update triggers */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCartUpdate={triggerCartUpdate}
      />
    </>
  );
}
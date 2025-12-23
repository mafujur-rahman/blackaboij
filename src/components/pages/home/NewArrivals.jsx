"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiHeart } from "react-icons/fi";
import AnimatedButton from "@/components/utils/AnimatedButton";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";

/* ------------------ UI COMPONENTS ------------------ */
const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
  </div>
);

const NewBadge = () => (
  <div className="absolute right-0 top-0 bg-black px-2 py-1 text-xs font-semibold uppercase text-white">
    New
  </div>
);

const ProductCard = ({ product }) => {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setIsWishlisted(wishlist.some((item) => item.id === product.id));
  }, [product.id]);

  const toggleWishlist = () => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");

    if (!token) {
      router.push("/signin");
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const updatedWishlist = isWishlisted
      ? wishlist.filter((item) => item.id !== product.id)
      : [...wishlist, product];

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="flex flex-col overflow-hidden bg-white relative">
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={getImageUrl(product.thumbnail_image)}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-contain"
        />

        {product.is_new && <NewBadge />}

        <button
          onClick={toggleWishlist}
          className={`absolute top-2 left-2 ${
            isWishlisted ? "text-red-500" : "text-black"
          }`}
        >
          <FiHeart size={20} />
        </button>
      </div>

      <div className="p-4 bg-black flex flex-col">
        <h3 className="text-xl font-medium text-white line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-bold text-white">€{product.unit_price}</p>
          <AnimatedButton variant="white">Buy Now</AnimatedButton>
        </div>
      </div>
    </div>
  );
};

const CategoryTab = ({ category, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-1 transition-colors ${
      isActive
        ? "border-b-2 border-black text-black font-bold"
        : "text-gray-600 hover:text-black"
    }`}
  >
    {category.name}
  </button>
);

/* ------------------ MAIN COMPONENT ------------------ */
const NewArrivals = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/products/get-all-products/");
        const sorted = res.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAllProducts(sorted);

        // Extract unique parent categories dynamically
        const uniqueParentCategories = Array.from(
          new Map(
            sorted
              .filter((p) => p.category?.parent)
              .map((p) => [p.category.parent, p.category.parent_name])
          ).entries()
        ).map(([id, name]) => ({ id, name }));

        setCategories(uniqueParentCategories);

        if (uniqueParentCategories.length > 0)
          setActiveCategory(uniqueParentCategories[0].id);

        const initialFiltered = sorted.filter(
          (product) => product.category?.parent === uniqueParentCategories[0]?.id
        );
        setFilteredProducts(initialFiltered.slice(0, 12));
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ---------------- FILTER BY CATEGORY ---------------- */
  useEffect(() => {
    if (!activeCategory) return;

    const filtered = allProducts.filter(
      (product) => product.category?.parent === activeCategory
    );

    setFilteredProducts(filtered.slice(0, 12));
  }, [activeCategory, allProducts]);

  return (
    <div className="mt-12.5 mb-12.5 xl:mb-25">
      <div className="px-4 lg:px-12">
        <h1 className="text-center text-3xl font-bold text-black">New Arrivals</h1>

        {/* CATEGORY TABS */}
        <nav className="mt-8">
          <div className="flex justify-center space-x-6">
            {categories.map((category) => (
              <CategoryTab
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </nav>

        {/* PRODUCTS */}
        {loading ? (
          <Loader />
        ) : filteredProducts.length === 0 ? (
          <p className="text-center mt-12 text-gray-500">No products found</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;

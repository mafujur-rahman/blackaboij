"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiHeart } from "react-icons/fi";
import AnimatedButton from "@/components/utils/AnimatedButton";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import Link from "next/link";

/* ------------------ UI COMPONENTS ------------------ */
const Loader = () => (
    <div className="flex justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
    </div>
);

const NewBadge = () => (
    <div className="absolute right-0 top-0 bg-black px-2 py-1 text-xs md:text-sm font-semibold uppercase text-white">
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
        <div className="flex flex-col overflow-hidden bg-white relative mb-6">
            <div className="relative aspect-square w-full bg-gray-100">
                {/* HEART BUTTON (NO NAVIGATION) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); 
                        toggleWishlist();
                    }}
                    className={`absolute top-2 left-2 z-10 p-2 rounded-full transition-all
        ${isWishlisted
                            ? "bg-red-500 text-white"
                            : "bg-white text-black hover:bg-gray-200"
                        }`}
                >
                    <FiHeart size={18} />
                </button>


                {/* IMAGE ONLY → GO TO DETAILS */}
                <Link href={`/product/${product.id}`}>
                    <Image
                        src={getImageUrl(product.thumbnail_image)}
                        alt={product.name}
                        fill
                        className="object-contain cursor-pointer"
                        sizes="(max-width: 768px) 100vw, 25vw"
                    />
                </Link>

                {product.is_new && <NewBadge />}
            </div>


            <div className="p-4 bg-black flex flex-col">
                <h3 className="text-xl font-medium text-white line-clamp-2">
                    {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-2xl font-bold text-white">
                        €{product.unit_price}
                    </p>
                    <Link href={`/product/${product.id}`}>
                        <AnimatedButton variant="white">
                            Buy Now
                        </AnimatedButton>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const CategoryTab = ({ category, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`pb-1 transition-colors ${isActive
            ? "border-b-2 border-black text-black font-bold"
            : "text-gray-600 hover:text-black"
            }`}
    >
        {category.name}
    </button>
);

/* ------------------ MAIN COMPONENT ------------------ */
const ShopHome = () => {
    const PRODUCTS_PER_PAGE = 8;

    const [activeCategory, setActiveCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    /* -------- FETCH PRODUCTS -------- */
    useEffect(() => {
        const fetchProducts = async () => {
            const cached = sessionStorage.getItem("hot_sale_products");
            if (cached) {
                const parsed = JSON.parse(cached);
                setAllProducts(parsed.allProducts);
                setCategories(parsed.categories);
                setActiveCategory(parsed.activeCategory);
                setFilteredProducts(parsed.filteredProducts);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await api.get("/api/products/get-all-products/");
                const products = res.data.data;

                const uniqueParentCategories = Array.from(
                    new Map(
                        products
                            .filter((p) => p.category?.parent)
                            .map((p) => [p.category.parent, p.category.parent_name])
                    ).entries()
                ).map(([id, name]) => ({ id, name }));

                const initialCategory = uniqueParentCategories[0]?.id || null;
                const initialFiltered = products.filter(
                    (p) => p.category?.parent === initialCategory
                );

                setAllProducts(products);
                setCategories(uniqueParentCategories);
                setActiveCategory(initialCategory);
                setFilteredProducts(initialFiltered);

                sessionStorage.setItem(
                    "hot_sale_products",
                    JSON.stringify({
                        allProducts: products,
                        categories: uniqueParentCategories,
                        activeCategory: initialCategory,
                        filteredProducts: initialFiltered,
                    })
                );
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    /* -------- FILTER BY CATEGORY -------- */
    useEffect(() => {
        if (!activeCategory) return;

        const filtered = allProducts.filter(
            (product) => product.category?.parent === activeCategory
        );

        setFilteredProducts(filtered);
        setCurrentPage(1); // reset pagination
    }, [activeCategory, allProducts]);

    /* -------- PAGINATION LOGIC -------- */
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        <div className="mt-12.5 mb-12.5">
            <div className="px-4 lg:px-12">
                <h1 className="text-center text-3xl font-bold text-black">
                    Our Products
                </h1>

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
                ) : paginatedProducts.length === 0 ? (
                    <p className="text-center mt-12 text-gray-500">
                        No products found
                    </p>
                ) : (
                    <>
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12 space-x-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="px-4 py-2 border disabled:opacity-50"
                                >
                                    Prev
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-4 py-2 border ${currentPage === i + 1
                                            ? "bg-black text-white"
                                            : ""
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="px-4 py-2 border disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ShopHome;

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
import AnimatedButton from "@/components/utils/AnimatedButton";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";


/* ------------------ CONSTANTS ------------------ */
const categories = [
    { id: 10, name: "Men" },
    { id: 20, name: "Women" },
    { id: 30, name: "Accessories" },
];


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
    return (
        <div className="flex flex-col overflow-hidden bg-white relative">
            <div className="relative aspect-square w-full bg-gray-100">
                <Image
                    src={getImageUrl(product.thumbnail_image)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                />

                <NewBadge />

                <button className="absolute top-2 left-2 text-black">
                    <FiHeart size={20} />
                </button>
            </div>

            <div className="p-4 bg-black flex flex-col">
                <h3 className="text-sm md:text-base font-medium text-white line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-white">
                        €{product.unit_price}
                    </p>
                    <AnimatedButton variant="white">Buy Now</AnimatedButton>
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
        {category}
    </button>
);

/* ------------------ MAIN COMPONENT ------------------ */

const NewArrivals = () => {
    const [activeCategory, setActiveCategory] = useState(10); // Men default
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ---------- FETCH ALL PRODUCTS ---------- */
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");

                const res = await api.get("/api/products/get-all-products/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(res.data)
                // sort latest first
                const sorted = res.data.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );

                setAllProducts(sorted);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    /* ---------- FILTER BY CATEGORY ---------- */
    useEffect(() => {
        setLoading(true);

        const filtered = allProducts.filter((product) => {
            return product.category?.parent === activeCategory;
        });

        setTimeout(() => {
            setFilteredProducts(filtered.slice(0, 12));
            setLoading(false);
        }, 300);
    }, [activeCategory, allProducts]);


    return (
        <div className="xl:min-h-screen mt-12 mb-12">
            <div className="px-4 lg:px-12">
                <h1 className="text-center text-3xl font-bold text-black">
                    New Arrivals
                </h1>

                {/* CATEGORY TABS */}
                <nav className="mt-8">
                    <div className="flex justify-center space-x-6">
                        {categories.map((category) => (
                            <CategoryTab
                                key={category.id}
                                category={category.name}
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
                    <p className="text-center mt-12 text-gray-500">
                        No products found
                    </p>
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

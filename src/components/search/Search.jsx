"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";

import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import AnimatedButton from "@/components/utils/AnimatedButton";

/* ------------------ UI COMPONENTS ------------------ */
const NewBadge = () => (
    <div className="absolute right-0 top-0 bg-black px-2 py-1 text-xs md:text-sm font-semibold uppercase text-white">
        New
    </div>
);

/* ------------------ PRODUCT CARD ------------------ */
const ProductCard = ({ product }) => {
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setIsWishlisted(wishlist.some((item) => item.id === product.id));
    }, [product.id]);

    const toggleWishlist = (e) => {
        e.preventDefault();

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
            <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square w-full bg-gray-100">
                    <Image
                        src={getImageUrl(product.thumbnail_image)}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 25vw"
                    />

                    <NewBadge />

                    <button
                        onClick={toggleWishlist}
                        className={`absolute top-2 left-2 ${isWishlisted ? "text-red-500" : "text-black"
                            }`}
                    >
                        <FiHeart size={20} />
                    </button>
                </div>
            </Link>

            <div className="p-4 bg-black flex flex-col">
                <h3 className="text-xl font-medium text-white line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-2xl font-bold text-white">
                        €{product.unit_price}
                    </p>
                    <Link href={`/product/${product.id}`} className="w-full">
                        <AnimatedButton variant="white" className="w-full">
                            Buy Now
                        </AnimatedButton>
                    </Link>
                </div>
            </div>
        </div>
    );
};

/* ------------------ SEARCH PAGE ------------------ */
export default function SearchHome() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/products/get-all-products/");
                const allProducts = res.data?.data || [];

                const filteredProducts = allProducts.filter((product) =>
                    product.name.toLowerCase().includes(query.toLowerCase())
                );

                setProducts(filteredProducts);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    return (
        <div className="px-4 lg:px-12 py-12.5">
            <h1 className="text-2xl font-semibold mb-6">
                Search results for:{" "}
                <span className="italic text-gray-600">{query}</span>
            </h1>

            {loading ? (
                <div className="flex justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-black"></div>
                </div>
            ) : products.length === 0 ? (
                <p className="text-gray-500">No products found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

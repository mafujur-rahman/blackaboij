"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
import AnimatedButton from "../../../utils/AnimatedButton";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import { useRouter } from "next/navigation";

/* ------------------ UI COMPONENTS ------------------ */
const Loader = () => (
    <div className="flex justify-center items-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
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
        const token = localStorage.getItem("token");
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
                <Image
                    src={getImageUrl(product.thumbnail_image)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                />

                <NewBadge />

                <button
                    onClick={toggleWishlist}
                    className={`absolute top-2 left-2 ${isWishlisted ? "text-red-500" : "text-black"}`}
                >
                    <FiHeart size={20} />
                </button>
            </div>

            <div className="p-4 bg-black flex flex-col">
                <h3 className="text-sm md:text-base font-medium text-white line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-xs text-gray-300 mt-1">{product.category?.parent_name}</p>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-white">€{product.unit_price}</p>
                    <AnimatedButton variant="white">Buy Now</AnimatedButton>
                </div>
            </div>
        </div>
    );
};

/* ------------------ MAIN COMPONENT ------------------ */
const MenCollectionArea = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/products/get-all-products/");
                const menProducts = res.data.data
                    .filter((p) => p.category?.parent_name === "Men")
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 20); // latest 20
                setProducts(menProducts);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const displayedProducts = products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className=" my-12.5">
            <div className="px-4 lg:px-12">

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 space-x-2">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1 border rounded ${currentPage === i + 1
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-black border-gray-300"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MenCollectionArea;

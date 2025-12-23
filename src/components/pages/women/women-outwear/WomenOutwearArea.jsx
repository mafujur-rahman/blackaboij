"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
import AnimatedButton from "../../../utils/AnimatedButton";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { getImageUrl } from "@/components/utils/get-image-url";
import Link from "next/link";

const WomenOutwearArea = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ------------------ FETCH PRODUCTS ------------------ */
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "https://blackaboji.vercel.app/api/products/get-all-products/"
            );

            if (res.data?.success) {
                // Filter only Women -> Outwears
                const womenOutwears = res.data.data.filter(
                    (p) =>
                        p.category?.parent_name?.toLowerCase() === "women" &&
                        p.category?.name?.toLowerCase() === "outwear"
                );

                setProducts(womenOutwears);
            } else {
                console.warn("API did not return success:", res.data);
            }
        } catch (error) {
            console.error("API fetch error:", error);
            Swal.fire("Error", "Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    /* ------------------ UI COMPONENTS ------------------ */
    const NewBadge = () => (
        <div className="absolute right-0 top-0 bg-black px-2 py-1 text-[12px] md:text-[15px] font-semibold uppercase text-white">
            New
        </div>
    );

    const ProductCard = ({ product }) => {
        const [isWishlisted, setIsWishlisted] = useState(false);

        useEffect(() => {
            const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
            setIsWishlisted(wishlist.some((item) => item.id === product.id));
        }, [product.id]);

        const toggleWishlist = () => {
            const token =
                localStorage.getItem("auth_token") ||
                sessionStorage.getItem("auth_token");

            // Redirect to signin only when user clicks wishlist and is not logged in
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

        const imageUrl = product.thumbnail_image
            ? product.thumbnail_image.startsWith("http")
                ? product.thumbnail_image
                : `${process.env.NEXT_PUBLIC_BASE_URL}${product.thumbnail_image}`
            : "/placeholder.png";

        return (
            <div className="relative flex flex-col overflow-hidden bg-white shadow-md rounded-md">
                <Link href={`/product/${product.id}`}>
                {/* Image */}
                <div className="relative aspect-square w-full bg-gray-100">
                    <Image
                        src={getImageUrl(imageUrl)}
                        alt={product.name || "Product"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {product.is_new && <NewBadge />}
                    <button
                        onClick={toggleWishlist}
                        className={`absolute top-2 left-2 z-10 ${isWishlisted ? "text-red-500" : "text-white"
                            }`}
                    >
                        <FiHeart size={20} />
                    </button>
                </div>
                </Link>

                {/* Info */}
                <div className="flex flex-col bg-black p-4">
                    <h3 className="text-[16px] md:text-[22px] font-medium text-white line-clamp-2">
                        {product.name || "Unnamed Product"}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-[12px] md:text-[15px] font-bold text-white">
                            €{product.unit_price || "0.00"}
                        </p>
                        <Link href={`/order/${product.id}`} passHref>
                            <AnimatedButton variant="white" className="w-full">
                                Buy Now
                            </AnimatedButton>
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="my-12.5">
            <div className="px-4 lg:px-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center col-span-full">No products found</p>
                )}
            </div>
        </div>
    );
};

export default WomenOutwearArea;

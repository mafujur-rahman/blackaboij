"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import AnimatedButton from "../utils/AnimatedButton";
import { getImageUrl } from "../utils/get-image-url";

const ProductCard = ({ product }) => {
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);

    /* ===============================
       DERIVED VALUES
    =============================== */
    const isOutOfStock = product.quantity === 0;

    const originalPrice = Number(product.original_price);
    const discountPrice = Number(product.discounted_price);
    const hasDiscount = discountPrice < originalPrice;

    /* ===============================
       WISHLIST INIT
    =============================== */
    useEffect(() => {
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setIsWishlisted(wishlist.some((item) => item.id === product.id));
    }, [product.id]);

    /* ===============================
       WISHLIST EVENT
    =============================== */
    const triggerWishlistUpdate = () => {
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        window.dispatchEvent(new Event("storage"));
    };

    /* ===============================
       TOGGLE WISHLIST
    =============================== */
    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        const token =
            localStorage.getItem("auth_token") ||
            sessionStorage.getItem("auth_token");

        if (!token) {
            router.push("/signin");
            return;
        }

        try {
            const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
            let updatedWishlist;

            if (isWishlisted) {
                updatedWishlist = wishlist.filter((item) => item.id !== product.id);
                setIsWishlisted(false);
            } else {
                updatedWishlist = [
                    ...wishlist,
                    {
                        id: product.id,
                        name: product.name,
                        unit_price: discountPrice,
                        thumbnail_image: product.thumbnail_image,
                        slug: product.slug,
                        addedAt: new Date().toISOString(),
                    },
                ];
                setIsWishlisted(true);
            }

            localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
            triggerWishlistUpdate();
        } catch (error) {
            console.error("Wishlist error:", error);
        }
    };

    /* ===============================
       BADGES
    =============================== */
    const NewBadge = () => (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded z-10">
            New
        </div>
    );

    return (
        <div className="flex flex-col overflow-hidden bg-white relative mb-6 group">
            {/* IMAGE */}
            <div className="relative aspect-square w-full bg-gray-100">
                {/* Wishlist */}
                <button
                    onClick={toggleWishlist}
                    className={`absolute top-2 left-2 z-20 p-2 rounded-full 
            ${isWishlisted ? "text-red-500" : "text-gray-700 hover:text-red-500"}
            ${isOutOfStock ? "opacity-40 cursor-not-allowed" : ""}
          `}
                >
                    {isWishlisted ? <FaHeart size={20} /> : <FiHeart size={20} />}
                </button>

                {/* Image / Navigation */}
                {isOutOfStock ? (
                    <div className="relative w-full h-full cursor-not-allowed opacity-60">
                        <Image
                            src={getImageUrl(product.thumbnail_image)}
                            alt={product.name}
                            fill
                            className="object-contain"
                        />
                    </div>
                ) : (
                    <Link href={`/product/${product.slug || product.id}`}>
                        <div className="relative w-full h-full cursor-pointer">
                            <Image
                                src={getImageUrl(product.thumbnail_image)}
                                alt={product.name}
                                fill
                                className="object-contain"
                            />
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition" />
                        </div>
                    </Link>
                )}

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <span className="text-white font-bold uppercase text-lg">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* New Badge */}
                {product.is_new && <NewBadge />}
            </div>

            {/* PRODUCT INFO */}
            <div className="p-4 bg-black flex flex-col flex-grow">
                {/* Title */}
                {isOutOfStock ? (
                    <h3 className="text-xl font-medium text-white mb-2 opacity-60">
                        {product.name}
                    </h3>
                ) : (
                    <Link href={`/product/${product.slug || product.id}`}>
                        <h3 className="text-xl font-medium text-white mb-2 hover:opacity-80">
                            {product.name}
                        </h3>
                    </Link>
                )}

                <div className="mt-auto flex items-center justify-between">
                    {/* PRICE */}
                    <div className="flex flex-col">
                        {hasDiscount ? (
                            <>
                                <p className="text-2xl font-bold text-white">
                                    €{discountPrice}
                                </p>
                                <p className="text-gray-400 line-through text-sm">
                                    €{originalPrice}
                                </p>
                            </>
                        ) : (
                            <p className="text-2xl font-bold text-white">
                                €{originalPrice}
                            </p>
                        )}
                    </div>

                    {/* ACTION */}
                    {isOutOfStock ? (
                        <span className="text-red-500 font-semibold text-sm">
                            Out of Stock
                        </span>
                    ) : (
                        <Link href={`/product/${product.slug || product.id}`}>
                            <AnimatedButton variant="white">
                                Buy Now
                            </AnimatedButton>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

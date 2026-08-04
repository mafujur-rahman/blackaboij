"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import AnimatedButton from "../utils/AnimatedButton";
import { getImageUrl } from "../utils/get-image-url";
import Swal from "sweetalert2";

const ProductCard = ({ product }) => {
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);

    /* ===============================
       DERIVED VALUES 
    =============================== */
    const isOutOfStock = product.quantity === 0;
    const isDesignProduct = product.is_design || false;

    const originalPrice = Number(product.original_price);
    const discountPrice = Number(product.discounted_price);
    const hasDiscount = discountPrice < originalPrice;

    const discountPercent = hasDiscount
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

    /* ===============================
       IMAGE LOGIC 
    =============================== */
    const getDisplayImage = () => {
        if (isDesignProduct) {
            if (product.product_colors?.length > 0) {
                const firstColor = product.product_colors[0];
                if (firstColor.front_image?.image) {
                    return firstColor.front_image.image;
                }
                if (firstColor.back_designs?.length > 0) {
                    return firstColor.back_designs[0].image;
                }
            }
        }
        return product.images?.find(img => img.is_thumbnail)?.image;
    };

    const displayImage = getDisplayImage();

    /* ===============================
       WISHLIST INIT (same)
    =============================== */
    useEffect(() => {
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setIsWishlisted(wishlist.some((item) => item.id === product.id));
    }, [product.id]);

    /* ===============================
       TOGGLE WISHLIST (same)
    =============================== */
    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();

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
                updatedWishlist = wishlist.filter(
                    (item) => item.id !== product.id
                );
                setIsWishlisted(false);
            } else {
                updatedWishlist = [
                    ...wishlist,
                    {
                        id: product.id,
                        name: product.name,
                        unit_price: discountPrice,
                        thumbnail_image: displayImage,
                        slug: product.slug,
                        out_of_stock: isOutOfStock,
                        is_design: isDesignProduct,
                        addedAt: new Date().toISOString(),
                    },
                ];
                setIsWishlisted(true);
            }

            localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        } catch (error) {
            console.error("Wishlist error:", error);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const cart = JSON.parse(localStorage.getItem("cart_items")) || [];

        const originalPrice = Number(product.original_price);
        const discountPrice = Number(product.discounted_price);
        const hasDiscount = discountPrice < originalPrice;
        const price = hasDiscount ? discountPrice : Number(product.unit_price);

        if (product.is_design) {
            const productColor = product.product_colors?.[0];

            cart.push({
                id: `${product.id}-${Date.now()}`,
                product_id: Number(product.id),
                name: product.name,
                price: price,
                original_price: originalPrice,
                discounted_price: discountPrice,
                front_image: productColor?.front_image?.image || "",
                back_image: productColor?.back_designs?.[0]?.image || "",
                design_id: null,
                design_name: "",
                quantity: 1,
                size: null,
                size_id: null,
                color_id: Number(productColor?.color) || null,
                color_name: productColor?.color_name || "",
                hex_code: productColor?.hex_code || "",
                is_design: true
            });

        } else {

            const thumbnail =
                product.images?.find(img => img.is_thumbnail)?.image || "";

            cart.push({
                id: `${product.id}-${Date.now()}`,
                product_id: Number(product.id),
                name: product.name,
                price: price,
                original_price: originalPrice,
                discounted_price: discountPrice,
                image: thumbnail,
                quantity: 1,
                size: null,
                size_id: null,
                color: null,
                color_id: null,
                is_design: false
            });
        }

        localStorage.setItem("cart_items", JSON.stringify(cart));

        window.dispatchEvent(new Event("cartUpdated"));

        Swal.fire({
            icon: "success",
            title: "Added to Cart",
            text: "Item added successfully",
            showConfirmButton: false,
            timer: 1500
        });
    };

    /* ===============================
       HOVER SECOND IMAGE LOGIC
    =============================== */
    const getHoverImage = () => {
        if (isDesignProduct) {
            const firstColor = product.product_colors?.[0];
            return firstColor?.back_designs?.[0]?.image || null;
        }

        const all = product.images || [];
        const second = all.find(img => !img.is_thumbnail);
        return second?.image || null;
    };

    const hoverImage = getHoverImage();

    return (
        <div className=" bg-white mb-8">

            {/* IMAGE */}
            <div className="relative overflow-hidden bg-gray-100 group">

                {/* SALE BADGE */}
                {hasDiscount && (
                    <div className="absolute top-0 right-0 z-20 bg-black text-white text-xs font-medium tracking-wider px-4 py-2.5">
                        Sale -{discountPercent}%
                    </div>
                )}

                {/* wishlist */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-3 left-3 z-20 bg-white/80 backdrop-blur p-2 rounded-full"
                >
                    {isWishlisted
                        ? <FaHeart className="text-red-500" size={18} />
                        : <FiHeart size={18} />}
                </button>

                {/* IMAGE LINK */}
                {!isOutOfStock ? (
                    <Link href={`/product/${product.slug || product.id}`}>
                        <div className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden">

                            {/* MAIN IMAGE - FADES OUT */}
                            {displayImage && (
                                <Image
                                    src={getImageUrl(displayImage)}
                                    alt={product.name}
                                    fill
                                    className={`
                                        object-cover transition-opacity duration-500 ease-in-out
                                        ${hoverImage ? "group-hover:opacity-0" : "opacity-100"}
                                    `}
                                />
                            )}

                            {/* HOVER IMAGE - FADES IN */}
                            {hoverImage && (
                                <Image
                                    src={getImageUrl(hoverImage)}
                                    alt={product.name}
                                    fill
                                    className={`
                                        object-cover transition-opacity duration-500 ease-in-out
                                        opacity-0 group-hover:opacity-100
                                    `}
                                />
                            )}

                        </div>
                    </Link>
                ) : (
                    <div className="relative aspect-[3/4] w-full">
                        {displayImage && (
                            <Image
                                src={getImageUrl(displayImage)}
                                alt={product.name}
                                fill
                                className="object-cover opacity-60"
                            />
                        )}
                    </div>
                )}

                {/* OUT OF STOCK */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* INFO */}
            <div className="text-center mt-4 px-2 pb-2">
                <h3 className="text-lg font-medium tracking-[0.2em] uppercase line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-2">
                    {hasDiscount ? (
                        <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
                            <span className="text-gray-400 line-through">
                                <PriceDisplay value={originalPrice} /> EUR
                            </span>
                            <span className="font-medium">
                                <PriceDisplay value={discountPrice} /> EUR
                            </span>
                            <span className="text-red-500 text-xs">
                                -{discountPercent}% promo
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm font-medium">
                            <PriceDisplay value={originalPrice} /> EUR
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
};

/* ===============================
   PRICE DISPLAY (superscript cents)
=============================== */
const PriceDisplay = ({ value }) => {
    const [whole, decimals] = value.toFixed(2).split(".");
    return (
        <span>
            €{whole}
            <sup className="text-[0.65em] align-super">{decimals}</sup>
        </span>
    );
};

export default ProductCard;
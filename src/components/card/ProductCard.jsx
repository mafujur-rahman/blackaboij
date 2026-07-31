// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { FiHeart } from "react-icons/fi";
// import { FaHeart } from "react-icons/fa";
// import AnimatedButton from "../utils/AnimatedButton";
// import { getImageUrl } from "../utils/get-image-url";
// import { Palette, Layers } from "lucide-react";

// const ProductCard = ({ product }) => {
//     const router = useRouter();
//     const [isWishlisted, setIsWishlisted] = useState(false);

//     /* ===============================
//        DERIVED VALUES
//     =============================== */
//     const isOutOfStock = product.quantity === 0;
//     const isDesignProduct = product.is_design || false;

//     const originalPrice = Number(product.original_price);
//     const discountPrice = Number(product.discounted_price);
//     const hasDiscount = discountPrice < originalPrice;

//     /* ===============================
//        GET DISPLAY IMAGE
//     =============================== */
//     const getDisplayImage = () => {
//         if (isDesignProduct) {
//             // For design products, show first color's front image
//             if (product.product_colors && product.product_colors.length > 0) {
//                 const firstColor = product.product_colors[0];
//                 if (firstColor.front_image?.image) {
//                     return firstColor.front_image.image;
//                 }
//             }
//             // Fallback: if no front image, show the first back image
//             if (product.product_colors && product.product_colors.length > 0) {
//                 const firstColor = product.product_colors[0];
//                 if (firstColor.back_designs && firstColor.back_designs.length > 0) {
//                     return firstColor.back_designs[0].image;
//                 }
//             }
//         }

//         // For regular products, show thumbnail image
//         return product.images?.find(img => img.is_thumbnail)?.image;
//     };

//     const displayImage = getDisplayImage();

//     /* ===============================
//        INIT WISHLIST
//     =============================== */
//     useEffect(() => {
//         const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
//         setIsWishlisted(wishlist.some((item) => item.id === product.id));
//     }, [product.id]);

//     /* ===============================
//        WISHLIST EVENTS
//     =============================== */
//     const triggerWishlistUpdate = () => {
//         window.dispatchEvent(new CustomEvent("wishlistUpdated"));
//         window.dispatchEvent(new Event("storage"));
//     };

//     /* ===============================
//        TOGGLE WISHLIST
//        (OUT OF STOCK ALLOWED)
//     =============================== */
//     const toggleWishlist = (e) => {
//         e.preventDefault();
//         e.stopPropagation();

//         const token =
//             localStorage.getItem("auth_token") ||
//             sessionStorage.getItem("auth_token");

//         if (!token) {
//             router.push("/signin");
//             return;
//         }

//         try {
//             const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
//             let updatedWishlist;

//             if (isWishlisted) {
//                 updatedWishlist = wishlist.filter(
//                     (item) => item.id !== product.id
//                 );
//                 setIsWishlisted(false);
//             } else {
//                 updatedWishlist = [
//                     ...wishlist,
//                     {
//                         id: product.id,
//                         name: product.name,
//                         unit_price: discountPrice,
//                         thumbnail_image: displayImage,
//                         slug: product.slug,
//                         out_of_stock: isOutOfStock,
//                         is_design: isDesignProduct,
//                         addedAt: new Date().toISOString(),
//                     },
//                 ];
//                 setIsWishlisted(true);
//             }

//             localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
//             triggerWishlistUpdate();
//         } catch (error) {
//             console.error("Wishlist error:", error);
//         }
//     };

//     return (
//         <div className="flex flex-col overflow-hidden bg-white relative mb-6 group">
//             {/* IMAGE */}
//             <div className="relative aspect-square w-full bg-gray-100">
//                 {/* Wishlist */}
//                 <button
//                     onClick={toggleWishlist}
//                     className={`absolute top-2 left-2 z-20 p-2 rounded-full
//                         ${isWishlisted ? "text-red-500" : "text-gray-700 hover:text-red-500"}
//                     `}
//                 >
//                     {isWishlisted ? <FaHeart size={20} /> : <FiHeart size={20} />}
//                 </button>

//                 {/* Image */}
//                 {isOutOfStock ? (
//                     <div className="relative w-full h-full cursor-not-allowed">
//                         <Image
//                             src={getImageUrl(displayImage)}
//                             alt={product.name}
//                             fill
//                             className="object-contain"
//                         />
//                     </div>
//                 ) : (
//                     <Link href={`/product/${product.slug || product.id}`}>
//                         <div className="relative w-full h-full cursor-pointer">
//                             <Image
//                                 src={getImageUrl(displayImage)}
//                                 alt={product.name}
//                                 fill
//                                 className="object-contain"
//                             />
//                             <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition" />
//                         </div>
//                     </Link>
//                 )}



//                 {/* New Badge - Show below design badge if both exist */}
//                 {!isDesignProduct && product.is_new && (
//                     <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded z-10">
//                         New
//                     </div>
//                 )}



//                 {/* Stock Status */}
//                 {isOutOfStock && (
//                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
//                         <span className="text-white font-bold text-lg bg-black/70 px-4 py-2 rounded">
//                             Out of Stock
//                         </span>
//                     </div>
//                 )}
//             </div>

//             {/* PRODUCT INFO */}
//             <div className="p-4 bg-black flex flex-col flex-grow">
//                 {/* Title and Design Indicator */}
//                 <div className="mb-2">
//                     <div className="flex items-start justify-between">
//                         {isOutOfStock ? (
//                             <h3 className="text-xl font-medium text-white opacity-60 pr-2">
//                                 {product.name}
//                             </h3>
//                         ) : (
//                             <h3 className="text-xl font-medium text-white pr-2">
//                                 {product.name}
//                             </h3>
//                         )}


//                     </div>


//                 </div>

//                 <div className="mt-auto flex items-center justify-between">
//                     {/* PRICE */}
//                     <div className="flex flex-col">
//                         {hasDiscount ? (
//                             <>
//                                 <p className="text-2xl font-bold text-white">
//                                     €{discountPrice}
//                                 </p>
//                                 <p className="text-gray-400 line-through text-sm">
//                                     €{originalPrice}
//                                 </p>
//                                 <div className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded mt-1 inline-block">
//                                     Save {Math.round(((originalPrice - discountPrice) / originalPrice) * 100)}%
//                                 </div>
//                             </>
//                         ) : (
//                             <p className="text-2xl font-bold text-white">
//                                 €{originalPrice}
//                             </p>
//                         )}


//                     </div>

//                     {/* ACTION */}
//                     {isOutOfStock ? (
//                         <span className="text-red-500 font-semibold text-sm">
//                             Out of Stock
//                         </span>
//                     ) : (
//                         <Link href={`/product/${product.slug || product.id}`}>
//                             <AnimatedButton variant="white">
//                                 {isDesignProduct ? "Customize" : "Buy Now"}
//                             </AnimatedButton>
//                         </Link>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProductCard;



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

                            {/* MAIN IMAGE - SLIDES OUT TO LEFT */}
                            {displayImage && (
                                <Image
                                    src={getImageUrl(displayImage)}
                                    alt={product.name}
                                    fill
                                    className={`
                                        object-cover transition-all duration-500 ease-in-out
                                        ${hoverImage ? "group-hover:-translate-x-full" : ""}
                                    `}
                                />
                            )}

                            {/* HOVER IMAGE - SLIDES IN FROM RIGHT */}
                            {hoverImage && (
                                <Image
                                    src={getImageUrl(hoverImage)}
                                    alt={product.name}
                                    fill
                                    className={`
                                        object-cover transition-all duration-500 ease-in-out
                                        translate-x-full group-hover:translate-x-0
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


                {/* HOVER ADD TO CART */}
                {!isOutOfStock && (
                    <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition duration-300">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-gray-900 hover:bg-black text-white py-3 font-medium tracking-wide cursor-pointer"
                        >
                            Add to cart
                        </button>
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
                <h3 className="text-lg font-medium  line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-1">
                    {hasDiscount ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="font-semibold text-lg">
                                € {discountPrice}
                            </span>
                            <span className="text-gray-400 line-through text-sm">
                                € {originalPrice}
                            </span>
                        </div>
                    ) : (
                        <span className="font-semibold text-lg">
                            € {originalPrice}
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ProductCard;
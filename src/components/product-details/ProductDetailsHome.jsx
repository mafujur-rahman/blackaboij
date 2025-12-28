"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import { addToCart } from "../utils/CartUtlis";

export default function ProductDetailsHome() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const [activeImage, setActiveImage] = useState(null);
    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get("/api/products/get-all-products/");
                const found = res.data?.data?.find(
                    (p) => String(p.id) === String(id)
                );

                if (!found) {
                    Swal.fire("Error", "Product not found", "error");
                    return;
                }

                setProduct(found);
                // Set active image to thumbnail_image if no gallery images
                setActiveImage(found.thumbnail_image);
            } catch {
                Swal.fire("Error", "Failed to load product", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    /* =========================
        VALIDATION
    ========================= */
    const validateOptions = () => {
        if (!selectedSize && !selectedColor) {
            Swal.fire({
                icon: "warning",
                title: "Select Options",
                text: "Please select both size and color",
            });
            return false;
        }

        if (!selectedSize) {
            Swal.fire({
                icon: "warning",
                title: "Size Required",
                text: "Please select a size",
            });
            return false;
        }

        if (!selectedColor) {
            Swal.fire({
                icon: "warning",
                title: "Color Required",
                text: "Please select a color",
            });
            return false;
        }

        return true;
    };

    /* =========================
        ADD TO CART
    ========================= */
// In ProductDetailsHome.js, update the add to cart functions:

const handleAddToCart = () => {
    if (!validateOptions()) return;

    const cart = JSON.parse(localStorage.getItem("cart_items")) || [];

    // Calculate prices
    const originalPrice = Number(product.original_price);
    const discountPrice = Number(product.discounted_price);
    const hasDiscount = discountPrice < originalPrice;
    const displayPrice = hasDiscount ? discountPrice : Number(product.unit_price);

    cart.push({
        id: Number(product.id),
        product_id: Number(product.id),

        name: product.name,
        price: displayPrice, // Use the discounted price if available
        original_price: originalPrice, // Save original price
        discounted_price: discountPrice, // Save discounted price
        image: product.thumbnail_image,

        quantity: Number(quantity),

        size: selectedSize.name,
        size_id: Number(selectedSize.id),

        color: selectedColor.name,
        color_id: Number(selectedColor.id),
    });

    localStorage.setItem("cart_items", JSON.stringify(cart));

    Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Product added successfully",
    });
};

// Also update the handleOrderNow function:
const handleOrderNow = () => {
    if (!validateOptions()) return;

    // Calculate prices
    const originalPrice = Number(product.original_price);
    const discountPrice = Number(product.discounted_price);
    const hasDiscount = discountPrice < originalPrice;
    const displayPrice = hasDiscount ? discountPrice : Number(product.unit_price);

    const checkoutItem = {
        id: Number(product.id),
        product_id: Number(product.id),

        name: product.name,
        price: displayPrice, // Use discounted price
        original_price: originalPrice, // Save original
        discounted_price: discountPrice, // Save discounted
        image: product.thumbnail_image,

        quantity: Number(quantity),

        size: selectedSize.name,
        size_id: Number(selectedSize.id),

        color: selectedColor.name,
        color_id: Number(selectedColor.id),
    };

    localStorage.setItem("checkout_item", JSON.stringify(checkoutItem));
    router.push("/checkout");
};

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) return null;

    // Calculate discount based on your requested logic
    const originalPrice = Number(product.original_price);
    const discountPrice = Number(product.discounted_price);
    const hasDiscount = discountPrice < originalPrice;
    
    // If no discount, use unit_price as the display price
    const displayPrice = hasDiscount ? discountPrice : Number(product.unit_price);
    
    // Calculate discount percentage
    const discountPercentage = hasDiscount 
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

    // Get all available images (thumbnail + gallery images if they exist)
    const allImages = product.thumbnail_image ? [product.thumbnail_image] : [];
    if (product.gallery_images && Array.isArray(product.gallery_images) && product.gallery_images.length > 0) {
        // Filter out any null/undefined gallery images
        const validGalleryImages = product.gallery_images.filter(img => img != null);
        // Add to array (avoid duplicates)
        validGalleryImages.forEach(img => {
            if (img !== product.thumbnail_image && !allImages.includes(img)) {
                allImages.push(img);
            }
        });
    }

    return (
        <div className="px-4 lg:px-16 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* IMAGE - Made square size */}
                <div>
                    <div className="relative aspect-square  overflow-hidden">
                        <Image
                            src={getImageUrl(activeImage)}
                            alt={product.name}
                            fill
                            className="object-contain "
                            priority
                        />
                        
                        {/* Discount badge */}
                        {hasDiscount && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                -{discountPercentage}%
                            </div>
                        )}
                    </div>

                    {/* Gallery Images - Only show if we have more than 1 image */}
                    {allImages.length > 1 && (
                        <div className="mt-4 flex gap-4">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative aspect-square w-24 border rounded-lg overflow-hidden ${activeImage === img
                                        ? "border-black border-2"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <Image
                                        src={getImageUrl(img)}
                                        alt={`${product.name} view ${i + 1}`}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* DETAILS */}
                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="mt-4 text-gray-600">{product.description}</p>
                    
                    {/* PRICE DISPLAY - Shows discount properly */}
                    <div className="mt-6 flex items-center gap-3">
                        {hasDiscount ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-red-600">
                                        €{displayPrice.toFixed(2)}
                                    </span>
                                    <span className="text-xl text-gray-500 line-through">
                                        €{originalPrice.toFixed(2)}
                                    </span>
                                </div>
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                                    Save €{(originalPrice - discountPrice).toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-semibold">
                                €{displayPrice.toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* SIZE */}
                    {product.sizes?.length > 0 && (
                        <div className="mt-6">
                            <p className="mb-2 font-medium">Size</p>
                            <div className="flex gap-2 flex-wrap">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 border rounded ${selectedSize?.id === size.id
                                            ? "bg-black text-white"
                                            : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {size.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* COLOR */}
                    {product.colors?.length > 0 && (
                        <div className="mt-6">
                            <p className="mb-2 font-medium">Color</p>
                            <div className="flex gap-3">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color)}
                                        className={`h-8 w-8 rounded-full border-2 ${selectedColor?.id === color.id
                                            ? "border-black scale-110"
                                            : "border-gray-300"
                                            }`}
                                        style={{
                                            backgroundColor:
                                                color.code ||
                                                color.hex ||
                                                color.name.toLowerCase(),
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QUANTITY */}
                    <div className="mt-6">
                        <p className="mb-2 font-medium">Quantity</p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                −
                            </button>
                            <span className="font-semibold w-8 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-10 flex gap-4">
                        <button
                            onClick={handleOrderNow}
                            disabled={!selectedSize || !selectedColor}
                            className={`w-full py-3 rounded-lg transition ${!selectedSize || !selectedColor
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-900"
                                }`}
                        >
                            Order Now
                        </button>

                        <button
                            onClick={() => {
                                if (!selectedSize || !selectedColor) {
                                    Swal.fire({
                                        icon: "warning",
                                        title: "Select Options",
                                        text: "Please select both size and color",
                                    });
                                    return;
                                }

                                const success = addToCart(product, quantity, selectedSize, selectedColor);

                                if (success) {
                                    Swal.fire({
                                        icon: "success",
                                        title: "Added to Cart",
                                        text: "Product added successfully",
                                    });
                                } else {
                                    Swal.fire({
                                        icon: "error",
                                        title: "Error",
                                        text: "Failed to add product to cart",
                                    });
                                }
                            }}
                            className={`w-full py-3 border rounded-lg transition ${!selectedSize || !selectedColor
                                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                    : "border-black hover:bg-black hover:text-white"
                                }`}
                            disabled={!selectedSize || !selectedColor}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
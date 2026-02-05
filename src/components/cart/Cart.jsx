"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { getImageUrl } from "@/components/utils/get-image-url";
import { Palette, Layers } from "lucide-react";

const Cart = ({ isOpen, onClose }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadCartItems();
        }
    }, [isOpen]);

    // Function to load and calculate cart items with discount
    const loadCartItems = () => {
        const storedCart = JSON.parse(localStorage.getItem("cart_items")) || [];

        // Process each item to apply discount logic
        const processedCart = storedCart.map(item => {
            // Apply the same discount logic as product details
            const originalPrice = Number(item.original_price) || Number(item.price);
            const discountPrice = Number(item.discounted_price) || Number(item.price);
            const hasDiscount = discountPrice < originalPrice;

            // Use discounted price if available, otherwise use regular price
            const displayPrice = hasDiscount ? discountPrice : Number(item.price);

            // Calculate discount percentage
            const discountPercentage = hasDiscount
                ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
                : 0;

            // Calculate item totals
            const quantity = Number(item.quantity) || 1;
            const itemTotal = displayPrice * quantity;
            const originalItemTotal = originalPrice * quantity;
            const itemDiscount = hasDiscount ? originalItemTotal - itemTotal : 0;

            // Ensure design product properties
            const isDesignProduct = item.is_design || false;
            const frontImage = item.front_image || '';
            const backImage = item.back_image || '';
            const designName = item.design_name || '';
            const designId = item.design_id || null;
            const colorName = item.color_name || item.color || '';
            const hexCode = item.hex_code || '';
            const colorId = item.color_id || null;

            return {
                ...item,
                original_price: originalPrice,
                discounted_price: discountPrice,
                has_discount: hasDiscount,
                discount_percentage: discountPercentage,
                price: displayPrice, // This is the price to display
                quantity: quantity,
                item_total: itemTotal,
                original_item_total: originalItemTotal,
                item_discount: itemDiscount,
                // Design product properties
                is_design: isDesignProduct,
                front_image: frontImage,
                back_image: backImage,
                design_name: designName,
                design_id: designId,
                color_name: colorName,
                hex_code: hexCode,
                color_id: colorId
            };
        });

        setCartItems(processedCart);
    };

    const handleRemove = (index) => {
        // Remove from localStorage without processing
        const storedCart = JSON.parse(localStorage.getItem("cart_items")) || [];
        const updatedCart = storedCart.filter((_, i) => i !== index);
        localStorage.setItem("cart_items", JSON.stringify(updatedCart));

        // Reload cart items
        loadCartItems();

        Swal.fire({
            icon: "success",
            title: "Removed",
            text: "Item removed from cart",
            timer: 1200,
            showConfirmButton: false,
        });
    };

    const handleUpdateQuantity = (index, newQuantity) => {
        if (newQuantity < 1) {
            handleRemove(index);
            return;
        }

        const storedCart = JSON.parse(localStorage.getItem("cart_items")) || [];
        if (index >= 0 && index < storedCart.length) {
            storedCart[index].quantity = newQuantity;
            localStorage.setItem("cart_items", JSON.stringify(storedCart));
            loadCartItems();
        }
    };

    // Calculate totals with discount awareness
    const calculateTotals = () => {
        let subtotal = 0;
        let originalSubtotal = 0;
        let totalDiscount = 0;
        let totalItems = 0;

        cartItems.forEach(item => {
            subtotal += item.item_total;
            originalSubtotal += item.original_item_total;
            totalDiscount += item.item_discount;
            totalItems += item.quantity;
        });

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            originalSubtotal: parseFloat(originalSubtotal.toFixed(2)),
            totalDiscount: parseFloat(totalDiscount.toFixed(2)),
            totalItems,
            hasDiscount: totalDiscount > 0
        };
    };

    const totals = calculateTotals();
    const isCartEmpty = cartItems.length === 0;

    // Validation for both product types
    const hasInvalidOptions = cartItems.some((item) => {
        if (item.is_design) {
            // For design products: need size, color, and design
            return !item.size_id || !item.color_id || !item.design_id;
        } else {
            // For regular products: need size and color
            return !item.size_id || !item.color_id;
        }
    });

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-40 transition ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 bg-white w-full sm:w-[420px] min-h-screen flex flex-col transform transition-transform
                ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-200">
                    <h2 className="text-xl font-semibold">
                        Your Cart ({cartItems.length})
                    </h2>
                    <button onClick={onClose}>
                        <FiX size={22} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {isCartEmpty ? (
                        <p className="text-center text-gray-500 py-8">
                            Your cart is empty
                        </p>
                    ) : (
                        cartItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex gap-4 border-b pb-4 mb-4"
                            >
                                <div className="relative w-20 h-20 bg-gray-100 rounded">
                                    {item.is_design ? (
                                        // Design Product: Show back image or front image
                                        <div className="relative w-full h-full">
                                            {item.back_image ? (
                                                <Image
                                                    src={getImageUrl(item.back_image)}
                                                    alt={`${item.name} - Back Design`}
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : item.front_image ? (
                                                <Image
                                                    src={getImageUrl(item.front_image)}
                                                    alt={`${item.name} - Front View`}
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Palette size={24} />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Regular Product
                                        <Image
                                            src={getImageUrl(
                                                item.thumbnail_image || item.image
                                            )}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}

                                    {/* Discount badge */}
                                    {item.has_discount && item.discount_percentage > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                            -{item.discount_percentage}%
                                        </div>
                                    )}

                                    {/* Design Product Badge */}
                                    {item.is_design && (
                                        <div className="absolute -top-1 -left-1 bg-gray-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                            Design
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium">{item.name}</p>

                                    </div>

                                    {/* Product Details - Different for Design vs Regular */}
                                    <div className="mt-1">
                                        {item.is_design ? (
                                            // Design Product Details
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <span>Size:</span>
                                                    <span className="font-medium">{item.size || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>Color:</span>
                                                    {item.hex_code ? (
                                                        <div className="flex items-center gap-1">
                                                            <div
                                                                className="w-3 h-3 rounded-full border border-gray-300"
                                                                style={{ backgroundColor: item.hex_code }}
                                                                title={item.hex_code}
                                                            />
                                                            <span className="font-medium">{item.color_name || "N/A"}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-medium">{item.color_name || item.color || "N/A"}</span>
                                                    )}
                                                </div>
                                                {item.design_name && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <span>Design:</span>
                                                        <span className="font-medium">{item.design_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Regular Product Details
                                            <p className="text-sm text-gray-500">
                                                Size: {item.size || "N/A"} | Color:{" "}
                                                {item.color || "N/A"}
                                            </p>
                                        )}
                                    </div>

                                    {/* Image Previews for Design Products */}
                                    {item.is_design && (item.front_image || item.back_image) && (
                                        <div className="mt-2 flex gap-1">
                                            {item.front_image && (
                                                <div className="relative w-8 h-8 border border-gray-200 rounded overflow-hidden">
                                                    <Image
                                                        src={getImageUrl(item.front_image)}
                                                        alt="Front View"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                                        <span className="text-[7px] text-white bg-blue-500 px-0.5">F</span>
                                                    </div>
                                                </div>
                                            )}
                                            {item.back_image && (
                                                <div className="relative w-8 h-8 border border-gray-200 rounded overflow-hidden">
                                                    <Image
                                                        src={getImageUrl(item.back_image)}
                                                        alt="Back Design"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gray-500/30 flex items-center justify-center">
                                                        <span className="text-[7px] text-white bg-gray-500 px-0.5">B</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 my-2">
                                        <button
                                            onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                                        >
                                            −
                                        </button>
                                        <span className="text-sm font-medium w-6 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Price Display with Discount */}
                                    <div className="mt-1">
                                        {item.has_discount ? (
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-red-600">
                                                        €{(item.item_total).toFixed(2)}
                                                    </span>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        €{(item.original_item_total).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-red-600">
                                                    <span className="font-medium">
                                                        €{item.price.toFixed(2)}
                                                    </span>
                                                    <span className="text-gray-500 ml-1">
                                                        per item
                                                    </span>
                                                    {item.discount_percentage > 0 && (
                                                        <span className="ml-2 bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                                                            Save {item.discount_percentage}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="font-bold">
                                                    €{(item.item_total).toFixed(2)}
                                                </span>
                                                <div className="text-xs text-gray-600">
                                                    <span className="font-medium">
                                                        €{item.price.toFixed(2)}
                                                    </span>
                                                    <span className="ml-1">
                                                        per item
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 🔴 Warning if missing options */}
                                    {item.is_design ? (
                                        // Design product validation
                                        (!item.size_id || !item.color_id || !item.design_id) && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Please reselect size, color & design
                                            </p>
                                        )
                                    ) : (
                                        // Regular product validation
                                        (!item.size_id || !item.color_id) && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Please reselect size & color
                                            </p>
                                        )
                                    )}
                                </div>

                                <button
                                    onClick={() => handleRemove(index)}
                                    className="self-start text-gray-500 hover:text-red-500"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer with Discount Summary */}
                <div className="border-t p-4">
                    {/* Design Products Notice */}
                    {cartItems.some(item => item.is_design) && (
                        <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded">
                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                                <Layers size={14} />
                                <span className="font-medium">Design Products in Cart</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Your custom designs will be printed as selected
                            </p>
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="space-y-2 mb-4">
                        {/* Original Subtotal (if discount exists) */}
                        {totals.hasDiscount && (
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Original Price</span>
                                <span className="line-through">
                                    €{totals.originalSubtotal.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {/* Discount Line */}
                        {totals.hasDiscount && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span className="font-semibold">
                                    -€{totals.totalDiscount.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {/* Subtotal */}
                        <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Subtotal</span>
                            <div>
                                {totals.hasDiscount ? (
                                    <span className="text-red-600">
                                        €{totals.subtotal.toFixed(2)}
                                    </span>
                                ) : (
                                    <span>€{totals.subtotal.toFixed(2)}</span>
                                )}
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span className="text-green-600 font-semibold">Free</span>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>€{totals.subtotal.toFixed(2)}</span>
                        </div>

                        {/* Total Savings Message */}
                        {totals.hasDiscount && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                <p className="text-green-700 text-sm font-medium text-center">
                                    🎉 You saved €{totals.totalDiscount.toFixed(2)}!
                                </p>
                            </div>
                        )}
                    </div>

                    {hasInvalidOptions && (
                        <p className="mt-3 text-sm text-red-600 text-center mb-3">
                            {cartItems.some(item => item.is_design)
                                ? "Some items are missing size, color, or design. Please remove and re-add them."
                                : "Some items are missing size or color. Please remove and re-add them."
                            }
                        </p>
                    )}

                    <button
                        disabled={isCartEmpty || hasInvalidOptions}
                        onClick={() => {
                            // Save cart items to checkout (without processing)
                            const originalCart = JSON.parse(localStorage.getItem("cart_items")) || [];
                            localStorage.setItem("checkout_items", JSON.stringify(originalCart));
                            onClose();
                            window.location.href = "/checkout-cart";
                        }}
                        className={`w-full p-4 text-white transition font-medium cursor-pointer ${isCartEmpty || hasInvalidOptions
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-black hover:bg-gray-800"
                            }`}
                    >
                        Proceed to Checkout
                    </button>


                </div>
            </div>
        </>
    );
};

export default Cart;
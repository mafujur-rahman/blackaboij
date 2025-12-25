"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { getImageUrl } from "@/components/utils/get-image-url";

const Cart = ({ isOpen, onClose }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const storedCart =
                JSON.parse(localStorage.getItem("cart_items")) || [];
            setCartItems(storedCart);
        }
    }, [isOpen]);

    const handleRemove = (index) => {
        const updatedCart = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCart);
        localStorage.setItem("cart_items", JSON.stringify(updatedCart));

        Swal.fire({
            icon: "success",
            title: "Removed",
            text: "Item removed from cart",
            timer: 1200,
            showConfirmButton: false,
        });
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
        0
    );

    const isCartEmpty = cartItems.length === 0;

    // 🔴 IMPORTANT VALIDATION
    const hasInvalidOptions = cartItems.some(
        (item) => !item.size_id || !item.color_id
    );

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
                        <p className="text-center text-gray-500">
                            Your cart is empty
                        </p>
                    ) : (
                        cartItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex gap-4 border-b pb-4 mb-4"
                            >
                                <div className="relative w-20 h-20 bg-gray-100 rounded">
                                    <Image
                                        src={getImageUrl(
                                            item.thumbnail_image || item.image
                                        )}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>

                                    <p className="text-sm text-gray-500">
                                        Size: {item.size || "N/A"} | Color:{" "}
                                        {item.color || "N/A"}
                                    </p>

                                    <p className="text-sm">
                                        Qty: {item.quantity || 1}
                                    </p>

                                    <p className="font-semibold">
                                        €{Number(item.price).toFixed(2)}
                                    </p>

                                    {/* 🔴 Warning if missing options */}
                                    {(!item.size_id || !item.color_id) && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Please reselect size & color
                                        </p>
                                    )}
                                </div>

                                <button onClick={() => handleRemove(index)}>
                                    <FiX size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4">
                    <div className="flex justify-between font-semibold">
                        <span>Subtotal</span>
                        <span>€{subtotal.toFixed(2)}</span>
                    </div>

                    {hasInvalidOptions && (
                        <p className="mt-3 text-sm text-red-600 text-center">
                            Some items are missing size or color.
                            Please remove and re-add them.
                        </p>
                    )}

                    <button
                        disabled={isCartEmpty || hasInvalidOptions}
                        onClick={() => {
                            localStorage.setItem(
                                "checkout_items",
                                JSON.stringify(cartItems)
                            );
                            onClose();
                            window.location.href = "/checkout-cart";
                        }}
                        className={`w-full mt-4 p-4 text-white transition ${isCartEmpty || hasInvalidOptions
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-black hover:bg-gray-800"
                            }`}
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Cart;

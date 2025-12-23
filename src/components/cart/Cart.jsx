"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { getImageUrl } from "@/components/utils/get-image-url";

const Cart = ({ isOpen, onClose }) => {
    const [cartItems, setCartItems] = useState([]);

    /* ---------------- LOAD CART ---------------- */
    useEffect(() => {
        if (isOpen) {
            const storedCart =
                JSON.parse(localStorage.getItem("cart_items")) || [];
            setCartItems(storedCart);
        }
    }, [isOpen]);

    /* ---------------- REMOVE ITEM ---------------- */
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

    const cartItemCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const isCartEmpty = cartItems.length === 0;

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            />

            {/* Cart Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 bg-white w-full sm:w-[420px] min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="p-4 border-b border-black/10 flex justify-between items-center bg-gray-200">
                    <h2 className="text-xl font-semibold text-black">
                        Your Cart ({cartItemCount})
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black transition"
                        aria-label="Close cart"
                    >
                        <FiX size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {isCartEmpty ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-lg text-gray-500">
                                Your cart is empty
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item, index) => {
                                const imageUrl = item.thumbnail_image
                                    ? item.thumbnail_image.startsWith("http")
                                        ? item.thumbnail_image
                                        : `${process.env.NEXT_PUBLIC_BASE_URL}${item.thumbnail_image}`
                                    : "/placeholder.png";

                                return (
                                    <div
                                        key={index}
                                        className="flex gap-4 border-b border-black/10 pb-4"
                                    >
                                        {/* IMAGE */}
                                        <div className="relative w-20 h-20 bg-gray-100 flex-shrink-0">
                                            <Image
                                                src={getImageUrl(imageUrl)}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* INFO */}
                                        <div className="flex-1">
                                            <h4 className="font-medium">
                                                {item.name}
                                            </h4>

                                            <p className="text-sm text-gray-500">
                                                Size: {item.size} | Color:{" "}
                                                {item.color}
                                            </p>

                                            <p className="text-sm mt-1">
                                                Qty: {item.quantity}
                                            </p>

                                            <p className="font-semibold mt-1">
                                                €{item.price}
                                            </p>
                                        </div>

                                        {/* REMOVE */}
                                        <button
                                            onClick={() =>
                                                handleRemove(index)
                                            }
                                            className="text-gray-400 hover:text-black"
                                            aria-label="Remove item"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Subtotal</span>
                        <span>€{subtotal.toFixed(2)}</span>
                    </div>

                    <button
                        disabled={isCartEmpty}
                        className={`w-full p-4 mt-4 text-white text-lg transition ${
                            isCartEmpty
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

"use client";
import React from "react";
import { FiX } from "react-icons/fi";

const Cart = ({ isOpen, onClose }) => {
    const cartItemCount = 0;
    const isCartEmpty = cartItemCount === 0;
    const subtotal = 0.0;

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            {/* Cart Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 bg-white w-full sm:w-[420px] min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-200">
                    <h2 className="text-xl font-semibold text-black ">
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
                <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
                    {isCartEmpty ? (
                        <p className="text-lg text-gray-500">
                            Your cart is empty
                        </p>
                    ) : (
                        <div>
                            {/* Cart items will go here */}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 ">
                    <div className="flex gap-3 items-center text-lg font-semibold">
                        <span>Subtotal : </span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>

                    <button
                        disabled={isCartEmpty}
                        className={`w-full p-4 mt-4 text-white text-lg transition ${isCartEmpty
                                ? " bg-black cursor-not-allowed"
                                : "bg-gray-400 hover:bg-gray-800"
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

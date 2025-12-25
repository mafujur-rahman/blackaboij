"use client";

import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ThankYouPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Thank You for Your Order!
                </h1>

                <p className="text-gray-600 mb-6">
                    Your payment was successful and your order has been placed
                    successfully. We’ll contact you soon with delivery details.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push("/user/orders")}
                        className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
                    >
                        View My Orders
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

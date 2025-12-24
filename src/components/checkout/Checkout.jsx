"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaCcVisa, FaLock, FaShieldAlt } from "react-icons/fa";
import { getImageUrl } from "@/components/utils/get-image-url";
import api from "@/lib/axios";

export default function CheckoutPage() {
    const [item, setItem] = useState(null);
    const [payment, setPayment] = useState("cod");
    const [loading, setLoading] = useState(false);

    // Form state
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");

    useEffect(() => {
        const data = localStorage.getItem("checkout_item");
        if (data) setItem(JSON.parse(data));
    }, []);

    if (!item) return null;

    const handlePlaceOrder = async () => {
        if (!fullName || !phoneNumber || !streetAddress || !city || !zipCode) {
            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please fill in all shipping details.",
            });
            return;
        }

        setLoading(true);
        try {
            // 1️⃣ Create Order
            const orderRes = await api.post("/api/order/create-order/", {
                payment_method: payment === "cod" ? "cod" : "online",
                full_name: fullName,
                phone_number: phoneNumber,
                street_address: streetAddress,
                city: city,
                zip_code: zipCode,
                items: [
                    {
                        product_id: item.id,
                        quantity: item.quantity || 1,
                        size: item.size || null,
                        color: item.color || null,
                    },
                ],
            });

            const orderNumber = orderRes.data.data.order_number;
            const orderId = orderRes.data.data.id;

            if (payment === "cod") {
                Swal.fire({
                    icon: "success",
                    title: "Order Placed!",
                    text: `Your order number is ${orderNumber}`,
                });
                localStorage.removeItem("checkout_item");
            } else {
                const paypalRes = await api.post(`/api/paypal/create/${orderId}/`);
                const approvalUrl = paypalRes.data.approval_url;
                window.location.href = approvalUrl;
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.response?.data?.message || "Failed to place order!",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 lg:px-16 py-14">
                {/* HEADER */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold">Checkout</h1>
                    <p className="mt-2 text-gray-500">
                        Please fill in your details to complete the order
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* LEFT SIDE */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* SHIPPING */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <input
                                    type="text"
                                    placeholder="Full Name (e.g. John Doe)"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                />

                                <input
                                    type="tel"
                                    placeholder="Phone Number (e.g. +8801XXXXXXXXX)"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                />

                                <input
                                    type="text"
                                    placeholder="Street Address (House, Road, Area)"
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                    className="md:col-span-2 w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                />

                                <input
                                    type="text"
                                    placeholder="City / Town"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                />

                                <input
                                    type="text"
                                    placeholder="ZIP / Postal Code"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>
                        </section>

                        {/* PAYMENT */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

                            <div className="space-y-4">
                                {/* CASH ON DELIVERY */}
                                <label
                                    className={`flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition ${payment === "cod"
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200 hover:border-gray-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <FaMoneyBillWave size={22} />
                                        <div>
                                            <p className="font-medium">Cash on Delivery</p>
                                            <p className="text-sm text-gray-500">Pay when your order arrives</p>
                                        </div>
                                    </div>

                                    <input
                                        type="radio"
                                        checked={payment === "cod"}
                                        onChange={() => setPayment("cod")}
                                        className="hidden"
                                    />
                                </label>

                                {/* VISA / PAYPAL */}
                                <label
                                    className={`flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition ${payment === "visa"
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200 hover:border-gray-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <FaCcVisa size={26} />
                                        <div>
                                            <p className="font-medium">Visa / PayPal</p>
                                            <p className="text-sm text-gray-500">Secure online payment via PayPal</p>
                                        </div>
                                    </div>

                                    <input
                                        type="radio"
                                        checked={payment === "visa"}
                                        onChange={() => setPayment("visa")}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT SUMMARY */}
                    <aside className="bg-white rounded-2xl p-8 shadow-sm h-fit sticky top-24">
                        <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                        <div className="flex gap-4">
                            <div className="relative w-24 h-24 bg-gray-100 rounded-lg">
                                <Image
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Size: {item.size} · Color: {item.color}
                                </p>
                                <p className="mt-2 font-semibold">€{item.price}</p>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-4 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>€{item.price}</span>
                            </div>

                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span>€{item.price}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
                            <FaShieldAlt />
                            <span>100% Secure & Encrypted Checkout</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="mt-8 w-full rounded-xl bg-black py-4 text-white font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition disabled:opacity-50"
                        >
                            <FaLock />
                            {loading ? "Processing..." : "Place Order"}
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
}

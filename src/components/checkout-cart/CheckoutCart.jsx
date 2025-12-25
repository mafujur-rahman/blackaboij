"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaCcVisa, FaLock, FaShieldAlt } from "react-icons/fa";
import { getImageUrl } from "@/components/utils/get-image-url";
import api from "@/lib/axios";

export default function CheckoutCartHome() {
    const [items, setItems] = useState([]);
    const [payment, setPayment] = useState("cod");
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");

    useEffect(() => {
        const cartData = localStorage.getItem("checkout_items");
        const singleData = localStorage.getItem("checkout_item");

        if (cartData) {
            setItems(JSON.parse(cartData));
        } else if (singleData) {
            setItems([JSON.parse(singleData)]);
        } else {
            window.location.href = "/";
        }
    }, []);

    if (!items.length) return null;

    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const hasInvalidOptions = items.some(
        (item) => !item.size_id || !item.color_id
    );

    const handlePlaceOrder = async () => {
        const token =
            localStorage.getItem("auth_token") ||
            sessionStorage.getItem("auth_token");

        if (!token) {
            Swal.fire("Login required", "", "warning");
            return;
        }

        if (!fullName || !phoneNumber || !streetAddress || !city || !zipCode) {
            Swal.fire("Fill all shipping fields", "", "warning");
            return;
        }

        if (hasInvalidOptions) {
            Swal.fire("Missing size or color", "", "warning");
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                payment_method: payment === "cod" ? "cod" : "online",
                full_name: fullName,
                phone_number: phoneNumber,
                street_address: streetAddress,
                city,
                zip_code: zipCode,
                items: items.map((i) => ({
                    product_id: Number(i.id),
                    quantity: Number(i.quantity),
                    size_id: Number(i.size_id),
                    color_id: Number(i.color_id),
                })),
            };

            const res = await api.post("/api/order/create-order/", orderData);

            if (payment === "cod") {
                Swal.fire(
                    "Order Placed",
                    `Order #${res.data.data.order_number}`,
                    "success"
                ).then(() => {
                    localStorage.clear();
                    window.location.href = "/";
                });
            } else {
                const paypal = await api.post(
                    `/api/paypal/create/${res.data.data.order_id}/`
                );
                window.location.href = paypal.data.approval_url;
            }
        } catch {
            Swal.fire("Order failed", "", "error");
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
                            <h2 className="text-xl font-semibold mb-6">
                                Shipping Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                    required
                                />

                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                    className="md:col-span-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="City / Town"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="ZIP / Postal Code"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                    required
                                />
                            </div>
                        </section>


                        {/* PAYMENT */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">
                                Payment Method
                            </h2>

                            <div className="space-y-4">
                                <label
                                    className={`flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition ${payment === "cod"
                                            ? "border-black bg-gray-50"
                                            : "border-gray-200 hover:border-gray-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <FaMoneyBillWave size={22} />
                                        <div>
                                            <p className="font-medium">
                                                Cash on Delivery
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Pay when your order arrives
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        checked={payment === "cod"}
                                        onChange={() => setPayment("cod")}
                                        className="hidden"
                                    />
                                </label>

                                <label
                                    className={`flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition ${payment === "visa"
                                            ? "border-black bg-gray-50"
                                            : "border-gray-200 hover:border-gray-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <FaCcVisa size={26} />
                                        <div>
                                            <p className="font-medium">
                                                Visa / PayPal
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Secure online payment
                                            </p>
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

                    {/* RIGHT SIDE */}
                    <aside className="bg-white rounded-2xl p-8 shadow-sm h-fit sticky top-24">
                        <h2 className="text-xl font-semibold mb-6">
                            Order Summary
                        </h2>

                        <div className="space-y-6">
                            {items.map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg">
                                        <Image
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {item.name}
                                        </p>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>Size: {item.size}</p>
                                            <p>Color: {item.color}</p>
                                            <p>
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="mt-2 font-semibold">
                                            €
                                            {(item.price * item.quantity).toFixed(
                                                2
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 border-t pt-4 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>€{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold border-t pt-3">
                                <span>Total</span>
                                <span>€{subtotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
                            <FaShieldAlt />
                            <span>100% Secure & Encrypted Checkout</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || hasInvalidOptions}
                            className={`mt-8 w-full rounded-xl py-4 font-medium flex items-center justify-center gap-2 transition ${loading || hasInvalidOptions
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-900"
                                }`}
                        >
                            <FaLock />
                            {loading ? "Processing..." : "Place Order"}
                        </button>

                        {hasInvalidOptions && (
                            <p className="mt-3 text-sm text-red-600 text-center">
                                Please go back and reselect product options
                            </p>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}

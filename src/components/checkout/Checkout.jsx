"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaCcVisa, FaLock, FaShieldAlt } from "react-icons/fa";
import { getImageUrl } from "@/components/utils/get-image-url";
import api from "@/lib/axios";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function Checkout() {
    const [items, setItems] = useState([]);
    const [payment, setPayment] = useState("cod");
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    // Form state
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");

    // Fetch user profile on component mount
    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Load checkout items from localStorage
    useEffect(() => {
        const checkoutData = localStorage.getItem("checkout_items");
        
        if (checkoutData) {
            try {
                const parsedItems = JSON.parse(checkoutData);
                const itemsWithDiscount = parsedItems.map(item => {
                    const originalPrice = Number(item.original_price) || Number(item.price);
                    const discountPrice = Number(item.discounted_price) || Number(item.price);
                    const hasDiscount = discountPrice < originalPrice;
                    
                    return {
                        ...item,
                        original_price: originalPrice,
                        discounted_price: discountPrice,
                        has_discount: hasDiscount,
                        display_price: hasDiscount ? discountPrice : Number(item.price)
                    };
                });
                setItems(itemsWithDiscount);
            } catch (error) {
                console.error("Error parsing checkout data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Invalid Checkout Data",
                    text: "Please select the product again.",
                    confirmButtonText: "Continue Shopping"
                }).then(() => {
                    localStorage.removeItem("checkout_items");
                    window.location.href = "/";
                });
            }
        } else {
            window.location.href = "/";
        }
    }, []);

    // Fetch user profile from API
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
            if (!token) return;

            const res = await api.get("/api/user/get-my-profile/", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUserProfile(res.data);
            
            // Pre-fill form with user data if available
            if (res.data.first_name && res.data.last_name) {
                setFullName(`${res.data.first_name} ${res.data.last_name}`);
            }
            
            if (res.data.phone_number) {
                setPhoneNumber(res.data.phone_number);
            }
            
            // Fill address fields if available
            if (res.data.street_address) {
                setStreetAddress(res.data.street_address);
            }
            
            if (res.data.city) {
                setCity(res.data.city);
            }
            
            if (res.data.zip_code) {
                setZipCode(res.data.zip_code);
            }

        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    };

    if (!items.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                </div>
            </div>
        );
    }

    // Calculate totals with discount awareness
    const calculateTotals = () => {
        let subtotal = 0;
        let originalSubtotal = 0;
        let totalDiscount = 0;
        
        items.forEach(item => {
            const quantity = Number(item.quantity) || 1;
            const displayPrice = item.display_price || Number(item.price);
            const originalPrice = item.original_price || displayPrice;
            
            subtotal += displayPrice * quantity;
            originalSubtotal += originalPrice * quantity;
            totalDiscount += (originalPrice - displayPrice) * quantity;
        });

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            originalSubtotal: parseFloat(originalSubtotal.toFixed(2)),
            totalDiscount: parseFloat(totalDiscount.toFixed(2)),
            total: parseFloat(subtotal.toFixed(2)),
            hasDiscount: totalDiscount > 0
        };
    };

    const totals = calculateTotals();
    const hasInvalidOptions = items.some(
        (item) => !item.size_id || !item.color_id
    );

    const handlePlaceOrder = async () => {
        const token =
            localStorage.getItem("auth_token") ||
            sessionStorage.getItem("auth_token");

        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Login Required",
                text: "Please login to place an order",
                showCancelButton: true,
                confirmButtonText: "Login",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "/signin";
                }
            });
            return;
        }

        if (!fullName || !phoneNumber || !streetAddress || !city || !zipCode) {
            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please fill in all shipping details."
            });
            return;
        }

        if (hasInvalidOptions) {
            Swal.fire({
                icon: "warning",
                title: "Product Selection Incomplete",
                text: "Please go back and reselect product options.",
                showCancelButton: true,
                confirmButtonText: "Go Back",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.history.back();
                }
            });
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
                    product_id: Number(i.product_id),
                    quantity: Number(i.quantity) || 1,
                    size_id: Number(i.size_id),
                    color_id: Number(i.color_id),
                })),
            };

            console.log("Sending order data:", orderData);

            const res = await api.post("/api/order/create-order/", orderData);

            if (payment === "cod") {
                Swal.fire({
                    icon: "success",
                    title: "Order Placed!",
                    html: `
                        <div class="text-center">
                            <h3 class="text-xl font-bold mb-2">Order Confirmed!</h3>
                            <p class="mb-4">Your order number is: <strong>${res.data.data.order_number}</strong></p>
                            ${totals.hasDiscount ? `<p class="text-green-600 font-medium">You saved €${totals.totalDiscount.toFixed(2)}!</p>` : ''}
                            <p class="text-sm text-gray-600 mt-4">You will receive a confirmation email shortly.</p>
                        </div>
                    `,
                    confirmButtonText: "Continue Shopping"
                }).then(() => {
                    localStorage.removeItem("checkout_items");
                    localStorage.removeItem("checkout_item");
                    localStorage.removeItem("cart_items");
                    window.location.href = "/";
                });
            } else {
                const paypal = await api.post(
                    `/api/paypal/create/${res.data.data.order_id}/`
                );
                window.location.href = paypal.data.approval_url;
            }
        } catch (error) {
            console.error("Order error:", error);
            
            let errorMessage = "Order failed. Please try again.";
            
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (errorData.items && Array.isArray(errorData.items)) {
                    errorMessage = "Invalid product selection. Please check your items.";
                } else if (errorData.non_field_errors) {
                    errorMessage = Array.isArray(errorData.non_field_errors) 
                        ? errorData.non_field_errors.join(', ')
                        : errorData.non_field_errors;
                }
            } else if (error.response?.status === 401) {
                errorMessage = "Your session has expired. Please login again.";
            }
            
            Swal.fire({
                icon: "error",
                title: "Order Failed",
                text: errorMessage,
                confirmButtonText: "OK"
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
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                    Shipping Information
                                </h2>
                                {userProfile && (userProfile.street_address || userProfile.city || userProfile.zip_code) && (
                                    <div className="text-sm text-green-600">
                                        <span className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Using your saved address
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                    required
                                />

                                {/* Phone Input with Tailwind styling */}
                                <div className="w-full [&_.PhoneInput]:flex [&_.PhoneInput]:items-center [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:border [&_.PhoneInputInput]:border-gray-300 [&_.PhoneInputInput]:rounded-lg [&_.PhoneInputInput]:px-4 [&_.PhoneInputInput]:py-3 [&_.PhoneInputInput]:focus:outline-none [&_.PhoneInputInput]:focus:border-black [&_.PhoneInputInput]:focus:ring-2 [&_.PhoneInputInput]:focus:ring-black [&_.PhoneInputCountry]:border [&_.PhoneInputCountry]:border-gray-300 [&_.PhoneInputCountry]:border-r-0 [&_.PhoneInputCountry]:rounded-l-lg [&_.PhoneInputCountry]:px-3 [&_.PhoneInputCountry]:py-3 [&_.PhoneInputCountry]:bg-white">
                                    <PhoneInput
                                        international
                                        defaultCountry="BD"
                                        value={phoneNumber}
                                        onChange={setPhoneNumber}
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>

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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-border-black focus:ring-2 focus:ring-black focus:outline-none"
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

                    {/* RIGHT SIDE - Order Summary */}
                    <aside className="bg-white rounded-2xl p-8 shadow-sm h-fit sticky top-24">
                        <h2 className="text-xl font-semibold mb-6">
                            Order Summary
                        </h2>

                        <div className="space-y-6">
                            {items.map((item, i) => {
                                const quantity = Number(item.quantity) || 1;
                                const displayPrice = item.display_price || Number(item.price);
                                const originalPrice = item.original_price || displayPrice;
                                const hasDiscount = item.has_discount || (originalPrice > displayPrice);
                                const discountPercentage = hasDiscount 
                                    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
                                    : 0;
                                
                                return (
                                    <div key={i} className="flex gap-4">
                                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg">
                                            <Image
                                                src={getImageUrl(item.image)}
                                                alt={item.name}
                                                fill
                                                className="object-contain"
                                            />
                                            {hasDiscount && discountPercentage > 0 && (
                                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    -{discountPercentage}%
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-semibold">
                                                {item.name}
                                            </p>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <p>Size: {item.size}</p>
                                                <p>Color: {item.color}</p>
                                                <p>Quantity: {quantity}</p>
                                            </div>
                                            
                                            {/* Price Display */}
                                            <div className="mt-2">
                                                {hasDiscount ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-red-600">
                                                                €{(displayPrice * quantity).toFixed(2)}
                                                            </span>
                                                            <span className="text-sm text-gray-500 line-through">
                                                                €{(originalPrice * quantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded inline-block">
                                                            Save €{((originalPrice - displayPrice) * quantity).toFixed(2)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="font-semibold">
                                                        €{(displayPrice * quantity).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 border-t pt-4 space-y-3">
                            {/* Subtotal */}
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                {totals.hasDiscount ? (
                                    <div className="text-right">
                                        <div className="text-gray-500 line-through text-sm">
                                            €{totals.originalSubtotal.toFixed(2)}
                                        </div>
                                        <div className="text-red-600 font-semibold">
                                            €{totals.subtotal.toFixed(2)}
                                        </div>
                                    </div>
                                ) : (
                                    <span>€{totals.subtotal.toFixed(2)}</span>
                                )}
                            </div>
                            
                            {/* Discount Line */}
                            {totals.hasDiscount && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount Applied</span>
                                    <span className="font-semibold">-€{totals.totalDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-semibold">Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold border-t pt-3">
                                <span>Total</span>
                                <span className="text-xl">€{totals.total.toFixed(2)}</span>
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
                                    : "bg-black text-white "
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
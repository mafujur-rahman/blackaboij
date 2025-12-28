"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaCcVisa, FaLock, FaShieldAlt } from "react-icons/fa";
import { getImageUrl } from "@/components/utils/get-image-url";
import api from "@/lib/axios";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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

    // Price state
    const [originalPrice, setOriginalPrice] = useState(0);
    const [discountedPrice, setDiscountedPrice] = useState(0);
    const [hasDiscount, setHasDiscount] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState(0);

    useEffect(() => {
        const data = localStorage.getItem("checkout_item");
        if (data) {
            try {
                const parsedItem = JSON.parse(data);
                setItem(parsedItem);
                
                // Try to get detailed product data from localStorage
                const cartData = JSON.parse(localStorage.getItem("cart_items") || "[]");
                const cartItem = cartData.find(cartItem => cartItem.id === parsedItem.id);
                
                if (cartItem) {
                    // Check if cart item has discount data
                    if (cartItem.original_price && cartItem.discounted_price) {
                        const original = parseFloat(cartItem.original_price);
                        const discounted = parseFloat(cartItem.discounted_price);
                        setOriginalPrice(original);
                        setDiscountedPrice(discounted);
                        setHasDiscount(discounted < original);
                        if (discounted < original) {
                            const percentage = Math.round(((original - discounted) / original) * 100);
                            setDiscountPercentage(percentage);
                        }
                    } else if (cartItem.original_price && cartItem.price) {
                        // Some systems store original_price and price (which is discounted)
                        const original = parseFloat(cartItem.original_price);
                        const discounted = parseFloat(cartItem.price);
                        setOriginalPrice(original);
                        setDiscountedPrice(discounted);
                        setHasDiscount(discounted < original);
                        if (discounted < original) {
                            const percentage = Math.round(((original - discounted) / original) * 100);
                            setDiscountPercentage(percentage);
                        }
                    }
                }
                
                // Also check the parsed item itself
                if (parsedItem.original_price && parsedItem.discounted_price) {
                    const original = parseFloat(parsedItem.original_price);
                    const discounted = parseFloat(parsedItem.discounted_price);
                    setOriginalPrice(original);
                    setDiscountedPrice(discounted);
                    setHasDiscount(discounted < original);
                    if (discounted < original) {
                        const percentage = Math.round(((original - discounted) / original) * 100);
                        setDiscountPercentage(percentage);
                    }
                }
                
            } catch (error) {
                console.error("Error parsing checkout data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Invalid Checkout Data",
                    text: "Please select the product again.",
                    confirmButtonText: "Continue Shopping"
                }).then(() => {
                    localStorage.removeItem("checkout_item");
                    window.location.href = "/";
                });
            }
        } else {
            window.location.href = "/";
        }
    }, []);

    if (!item) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                </div>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        // Check if user is authenticated
        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Authentication Required",
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

        // Validate shipping information
        if (!fullName || !phoneNumber || !streetAddress || !city || !zipCode) {
            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please fill in all shipping details.",
            });
            return;
        }

        // Validate phone number
        if (!phoneNumber || phoneNumber.length < 5) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Phone Number",
                text: "Please enter a valid phone number.",
            });
            return;
        }

        // Validate size and color IDs
        if (!item.size_id || !item.color_id) {
            Swal.fire({
                icon: "warning",
                title: "Product Selection Incomplete",
                text: "Please go back and reselect the product options.",
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
            // Prepare items array EXACTLY as API expects
            const orderItems = [{
                product_id: Number(item.id),
                quantity: Number(item.quantity || 1),
                size_id: Number(item.size_id),
                color_id: Number(item.color_id)
            }];

            // Prepare order data EXACTLY as API expects
            const orderData = {
                payment_method: payment === "cod" ? "cod" : "online",
                full_name: fullName,
                phone_number: phoneNumber,
                street_address: streetAddress,
                city: city,
                zip_code: zipCode,
                items: orderItems,
            };

            console.log("Sending order data:", orderData);

            const orderRes = await api.post("/api/order/create-order/", orderData);
            
            const orderDataResponse = orderRes.data.data;
            const orderNumber = orderDataResponse.order_number;
            const orderId = orderDataResponse.order_id;

            if (payment === "cod") {
                Swal.fire({
                    icon: "success",
                    title: "Order Placed!",
                    html: `
                        <div class="text-center">
                            <h3 class="text-xl font-bold mb-2">Order Confirmed!</h3>
                            <p class="mb-4">Your order number is: <strong>${orderNumber}</strong></p>
                            <p class="text-sm text-gray-600">You will receive a confirmation email shortly.</p>
                        </div>
                    `,
                    confirmButtonText: "Continue Shopping"
                }).then(() => {
                    localStorage.removeItem("checkout_item");
                    localStorage.removeItem("cart_items");
                    window.location.href = "/";
                });
            } else {
                const paypalRes = await api.post(`/api/paypal/create/${orderId}/`);
                const approvalUrl = paypalRes.data.approval_url;
                window.location.href = approvalUrl;
            }
        } catch (error) {
            console.error("Order error:", error);
            
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                
                if (errorData.items && Array.isArray(errorData.items)) {
                    const itemErrors = errorData.items.map(itemError => {
                        if (typeof itemError === 'object') {
                            return Object.values(itemError).join(', ');
                        }
                        return itemError;
                    }).join('; ');
                    
                    Swal.fire({
                        icon: "error",
                        title: "Product Error",
                        text: itemErrors || "Invalid product selection",
                    });
                } else if (errorData.non_field_errors) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: Array.isArray(errorData.non_field_errors) 
                            ? errorData.non_field_errors.join(', ')
                            : errorData.non_field_errors,
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Invalid Data",
                        text: errorData.message || errorData.detail || "Please check your product selection",
                    });
                }
            } else if (error.response?.status === 401) {
                Swal.fire({
                    icon: "warning",
                    title: "Session Expired",
                    text: "Your session has expired. Please login again.",
                    confirmButtonText: "Login"
                }).then(() => {
                    localStorage.removeItem("auth_token");
                    sessionStorage.removeItem("auth_token");
                    window.location.href = "/signin";
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error.response?.data?.message || "Failed to place order!",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate prices
    const displayPrice = hasDiscount ? discountedPrice : parseFloat(item.price);
    const itemSubtotal = displayPrice * (item.quantity || 1);
    const originalSubtotal = originalPrice * (item.quantity || 1);
    const discountAmount = hasDiscount ? originalSubtotal - itemSubtotal : 0;

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
                    {/* LEFT SIDE - Shipping and Payment */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* SHIPPING SECTION */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:ring-2 focus:ring-black focus:outline-none"
                                    required
                                />
                                
                                {/* Phone Input with react-phone-number-input */}
                                <div className="w-full">
                                    <PhoneInput
                                        international
                                        defaultCountry="US"
                                        value={phoneNumber}
                                        onChange={setPhoneNumber}
                                        className="phone-input"
                                        placeholder="Enter phone number"
                                    />
                                    <style jsx global>{`
                                        .phone-input .PhoneInputInput {
                                            width: 100%;
                                            border: 1px solid #d1d5db;
                                            border-radius: 0.5rem;
                                            padding: 0.75rem 1rem;
                                            outline: none;
                                            font-size: 1rem;
                                        }
                                        .phone-input .PhoneInputInput:focus {
                                            border-color: #000;
                                            ring-width: 2px;
                                            ring-color: #000;
                                        }
                                        .phone-input .PhoneInputCountry {
                                            border: 1px solid #d1d5db;
                                            border-radius: 0.5rem;
                                            padding: 0.75rem;
                                            margin-right: 0.5rem;
                                        }
                                        .phone-input .PhoneInputCountrySelectArrow {
                                            border-top-color: #6b7280;
                                        }
                                    `}</style>
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

                        {/* PAYMENT SECTION */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                            <div className="space-y-4">
                                <label className={`flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition ${payment === "cod" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}>
                                    <div className="flex items-center gap-4">
                                        <FaMoneyBillWave size={22} />
                                        <div>
                                            <p className="font-medium">Cash on Delivery</p>
                                            <p className="text-sm text-gray-500">Pay when your order arrives</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} className="hidden" />
                                </label>
                                <label className={`flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition ${payment === "visa" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}>
                                    <div className="flex items-center gap-4">
                                        <FaCcVisa size={26} />
                                        <div>
                                            <p className="font-medium">Visa / PayPal</p>
                                            <p className="text-sm text-gray-500">Secure online payment via PayPal</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="payment" checked={payment === "visa"} onChange={() => setPayment("visa")} className="hidden" />
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT SIDE - Order Summary */}
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
                                {/* Discount Badge on Image */}
                                {hasDiscount && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        -{discountPercentage}%
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="font-semibold">{item.name}</p>
                                
                                <div className="mt-2 text-sm text-gray-500">
                                    {item.size && (
                                        <p>Size: {item.size}</p>
                                    )}
                                    {item.color && (
                                        <p>Color: {item.color}</p>
                                    )}
                                    <p className="mt-1">Quantity: {item.quantity || 1}</p>
                                </div>
                                
                                {/* Price Display - Fixed to show discount properly */}
                                <div className="mt-3">
                                    {hasDiscount ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold text-red-600">
                                                    €{displayPrice.toFixed(2)}
                                                </span>
                                                <span className="text-sm text-gray-500 line-through">
                                                    €{originalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded inline-block">
                                                Save €{(originalPrice - displayPrice).toFixed(2)} per item
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xl font-semibold">
                                            €{displayPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-4 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                {hasDiscount ? (
                                    <div className="text-right">
                                        <div className="text-gray-500 line-through text-sm">
                                            €{originalSubtotal.toFixed(2)}
                                        </div>
                                        <div className="text-red-600 font-semibold">
                                            €{itemSubtotal.toFixed(2)}
                                        </div>
                                    </div>
                                ) : (
                                    <span>€{itemSubtotal.toFixed(2)}</span>
                                )}
                            </div>
                            
                            {/* Discount line */}
                            {hasDiscount && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount Applied</span>
                                    <span className="font-semibold">-€{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-semibold">Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold border-t pt-3">
                                <span>Total</span>
                                <span className="text-xl">€{itemSubtotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
                            <FaShieldAlt />
                            <span>100% Secure & Encrypted Checkout</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || !item.size_id || !item.color_id}
                            className={`mt-8 w-full rounded-xl py-4 font-medium flex items-center justify-center gap-2 transition ${!item.size_id || !item.color_id
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-black text-white '}`}
                        >
                            <FaLock />
                            {loading ? "Processing..." : "Place Order"}
                        </button>

                        {(!item.size_id || !item.color_id) && (
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
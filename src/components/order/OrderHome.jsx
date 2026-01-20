"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import Swal from "sweetalert2";

/* ---------------- LOADER ---------------- */
const Loader = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
  </div>
);

/* ---------------- ORDER PAGE ---------------- */
const OrderHome = () => {
    const { id } = useParams(); 

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [ordering, setOrdering] = useState(false); 
    const [quantity, setQuantity] = useState(1);

    /* ---------------- FETCH PRODUCT ---------------- */
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/products/get-all-products/");
                const allProducts = res.data.data;
                const found = allProducts.find((p) => String(p.id) === String(id));
                setProduct(found || null);
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    /* ---------------- CREATE ORDER ---------------- */
    const handleOrder = async () => {
        if (!product) return;

        const token =
            localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "Please login to place an order",
            });
            return;
        }

        setOrdering(true);
        try {
            const payload = {
                payment_method: "online",
                items: [
                    {
                        product_id: product.id,
                        quantity: quantity,
                    },
                ],
            };

            const res = await api.post("/api/order/create-order/", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Order Placed",
                    text: `Your order number is ${res.data.data.order_number}`,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Order Failed",
                    text: res.data.message || "Something went wrong",
                });
            }
        } catch (error) {
            console.error("Failed to create order", error);
            Swal.fire({
                icon: "error",
                title: "Order Failed",
                text: "Something went wrong",
            });
        } finally {
            setOrdering(false);
        }
    };


    if (loading) return <Loader />;
    if (!product) return <p className="text-center py-20">Product not found</p>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 shadow-lg rounded-xl">
                {/* PRODUCT IMAGE */}
                <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    <Image
                        src={getImageUrl(product.images?.find(img => img.is_thumbnail)?.image)}
                        alt={product.name}
                        fill
                        className="object-contain"
                    />
                </div>

                {/* PRODUCT DETAILS */}
                <div className="flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black mb-4">{product.name}</h1>
                        <p className="text-gray-700 mb-6">{product.description}</p>
                        <p className="text-2xl font-bold mb-6">€{product.unit_price}</p>

                        {/* QUANTITY SELECTOR */}
                        <div className="flex items-center space-x-4 mb-6">
                            <span className="font-semibold">Quantity:</span>
                            <input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-20 border rounded px-3 py-1 text-center"
                            />
                        </div>
                    </div>

                    {/* ORDER BUTTON */}
                    <button
                        onClick={handleOrder}
                        disabled={ordering}
                        className="px-6 py-2 bg-black text-white rounded"
                    >
                        {ordering ? "Ordering..." : "Order Now"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderHome;

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import { getImageUrl } from "@/components/utils/get-image-url";
import api from "@/lib/axios";

export default function ProductDetailsHome() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [ordering, setOrdering] = useState(false);
    const [quantity] = useState(1); // ✅ FIX

    /* ---------------- FETCH PRODUCT ---------------- */
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/products/get-all-products/");
                const products = res.data?.data || [];

                const found = products.find(
                    (p) => String(p.id) === String(id)
                );

                if (!found) {
                    Swal.fire("Error", "Product not found", "error");
                }

                setProduct(found || null);
            } catch (error) {
                console.error("Failed to fetch product", error);
                Swal.fire("Error", "Failed to load product", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    /* ---------------- AUTH TOKEN ---------------- */
    const getToken = () =>
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

    /* ---------------- ADD TO CART ---------------- */
    const handleAddToCart = () => {
        const token = getToken();

        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "Please login to add to cart",
            });
            router.push("/signin");
            return;
        }

        if (!selectedSize || !selectedColor) {
            Swal.fire({
                icon: "warning",
                title: "Missing Selection",
                text: "Please select size and color",
            });
            return;
        }

        const cart =
            JSON.parse(localStorage.getItem("cart_items")) || [];

        const cartItem = {
            product_id: product.id,
            name: product.name,
            price: product.unit_price,
            thumbnail_image: product.thumbnail_image,
            size: selectedSize.name,
            color: selectedColor.name,
            quantity: 1,
        };

        cart.push(cartItem);
        localStorage.setItem("cart_items", JSON.stringify(cart));

        Swal.fire({
            icon: "success",
            title: "Added to Cart",
            text: `${product.name} has been added to your cart`,
            timer: 1500,
            showConfirmButton: false,
        });
    };

    /* ---------------- ORDER HANDLER (REAL API) ---------------- */
    const handleOrder = async () => {
        if (!product) return;

        const token = getToken();

        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "Please login to place an order",
            });
            router.push("/signin");
            return;
        }

        if (!selectedSize || !selectedColor) {
            Swal.fire(
                "Select options",
                "Please select size and color",
                "warning"
            );
            return;
        }

        setOrdering(true);

        try {
            const payload = {
                payment_method: "online",
                items: [
                    {
                        product_id: product.id,
                        quantity: quantity, // ✅ FIXED
                    },
                ],
            };

            const res = await api.post(
                "/api/order/create-order/",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Order Placed",
                    text: `Your order number is ${res.data.data.order_number}`,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Order Failed",
                    text: res.data?.message || "Something went wrong",
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

    /* ---------------- LOADING ---------------- */
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
            </div>
        );
    }

    if (!product) return null;


    return (
        <div className="px-4 lg:px-16 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* IMAGE */}
                <div className="relative h-[420px] md:h-[480px] bg-gray-100 flex items-center justify-center">
                    <Image
                        src={getImageUrl(product.thumbnail_image)}
                        alt={product.name}
                        fill
                        className="object-contain"
                    />
                </div>


                {/* DETAILS */}
                <div className="flex flex-col">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        {product.name}
                    </h1>

                    <p className="mt-4 text-gray-600 leading-relaxed">
                        {product.description}
                    </p>

                    <p className="mt-6 text-2xl font-semibold">
                        €{product.unit_price}
                    </p>

                    {/* SIZE & COLOR */}
                    <div className="mt-8 flex flex-col md:flex-row gap-8">
                        {product.sizes?.length > 0 && (
                            <div>
                                <p className="mb-2 font-medium">Size</p>
                                <div className="flex gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[44px] border px-4 py-2 text-sm ${selectedSize?.id === size.id
                                                ? "bg-black text-white"
                                                : "bg-white hover:border-black"
                                                }`}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.colors?.length > 0 && (
                            <div>
                                <p className="mb-2 font-medium">Color</p>
                                <div className="flex gap-3">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() =>
                                                setSelectedColor(color)
                                            }
                                            className={`h-7 w-7 rounded-full border-2 ${selectedColor?.id === color.id
                                                ? "border-black scale-110"
                                                : "border-gray-300 hover:border-black"
                                                }`}
                                            style={{
                                                backgroundColor:
                                                    color.code ||
                                                    color.hex ||
                                                    color.name.toLowerCase(),
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BUTTONS */}
                    <div className="mt-10 flex gap-4">
                        <button
                            onClick={handleOrder}
                            disabled={ordering}
                            className="w-full px-6 py-3 bg-black text-white rounded cursor-pointer"
                        >
                            {ordering ? "Ordering..." : "Order Now"}
                        </button>

                        <button
                            onClick={handleAddToCart}
                            className="w-full px-6 py-3 bg-black text-white rounded cursor-pointer"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

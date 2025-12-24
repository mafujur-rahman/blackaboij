"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";

export default function ProductDetailsHome() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    const [activeImage, setActiveImage] = useState(null);
    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get("/api/products/get-all-products/");
                const found = res.data?.data?.find(
                    (p) => String(p.id) === String(id)
                );

                if (!found) {
                    Swal.fire("Error", "Product not found", "error");
                    return;
                }

                setProduct(found);
                setActiveImage(
                    found.gallery_images?.[0] || found.thumbnail_image
                );
            } catch {
                Swal.fire("Error", "Failed to load product", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            Swal.fire("Missing", "Select size & color", "warning");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart_items")) || [];

        cart.push({
            product_id: product.id,
            name: product.name,
            price: product.unit_price,
            image: product.thumbnail_image,
            size: selectedSize.name,
            color: selectedColor.name,
            quantity: 1,
        });

        localStorage.setItem("cart_items", JSON.stringify(cart));
        Swal.fire("Added", "Product added to cart", "success");
    };

    const handleOrderNow = () => {
        if (!selectedSize || !selectedColor) {
            Swal.fire("Missing", "Select size & color", "warning");
            return;
        }

        localStorage.setItem(
            "checkout_item",
            JSON.stringify({
                id: product.id,
                name: product.name,
                price: product.unit_price,
                image: product.thumbnail_image,
                size: selectedSize.name,
                color: selectedColor.name,
                quantity: 1,
            })
        );

        router.push("/checkout");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="px-4 lg:px-16 py-12">
            {/* TOP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* IMAGE GALLERY */}
                <div>
                    <div className="relative h-[420px] bg-gray-100 rounded-xl">
                        <Image
                            src={getImageUrl(activeImage)}
                            alt={product.name}
                            fill
                            className="object-contain"
                        />
                    </div>

                    <div className="mt-4 flex gap-4">
                        {[product.thumbnail_image, ...(product.gallery_images || [])]
                            .slice(0, 4)
                            .map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative w-24 h-24 border rounded-lg ${activeImage === img
                                            ? "border-black"
                                            : "border-gray-200"
                                        }`}
                                >
                                    <Image
                                        src={getImageUrl(img)}
                                        alt="gallery"
                                        fill
                                        className="object-contain"
                                    />
                                </button>
                            ))}
                    </div>
                </div>

                {/* DETAILS */}
                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="mt-4 text-gray-600">{product.description}</p>
                    <p className="mt-6 text-2xl font-semibold">
                        €{product.unit_price}
                    </p>

                    {/* SIZE */}
                    {product.sizes?.length > 0 && (
                        <div className="mt-6">
                            <p className="mb-2 font-medium">Size</p>
                            <div className="flex gap-2 flex-wrap">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 border rounded ${selectedSize?.id === size.id
                                                ? "bg-black text-white"
                                                : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {size.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* COLOR */}
                    {product.colors?.length > 0 && (
                        <div className="mt-6">
                            <p className="mb-2 font-medium">Color</p>
                            <div className="flex gap-3">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color)}
                                        className={`h-8 w-8 rounded-full border-2 ${selectedColor?.id === color.id
                                                ? "border-black scale-110"
                                                : "border-gray-300"
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

                    {/* ACTIONS */}
                    <div className="mt-10 flex gap-4">
                        <button
                            onClick={handleOrderNow}
                            className="w-full py-3 bg-black text-white rounded-lg  cursor-pointer"
                        >
                            Order Now
                        </button>

                        <button
                            onClick={handleAddToCart}
                            className="w-full py-3 border border-black rounded-lg hover:bg-black hover:text-white transition cursor-pointer"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="mt-20">
                <div className="flex gap-8 border-b border-black/10">
                    {["description", "reviews", "recommended"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 capitalize font-medium ${activeTab === tab
                                    ? "border-b-2 border-black"
                                    : "text-gray-500"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="mt-8">
                    {activeTab === "description" && (
                        <p className="max-w-3xl text-gray-600 leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    {activeTab === "reviews" && (
                        <div className="space-y-6 max-w-3xl">
                            {[1, 2].map((i) => (
                                <div key={i} className="border border-black/10 p-5 rounded-lg">
                                    <p className="font-semibold">John Doe</p>
                                    <p className="text-sm text-gray-500">⭐⭐⭐⭐⭐</p>
                                    <p className="mt-2 text-gray-600">
                                        Excellent product quality!
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "recommended" && (
                        <div className="space-y-6 max-w-5xl">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex flex-col sm:flex-row items-center gap-6 border border-black/10 rounded-xl p-5 hover:shadow-sm transition"
                                >
                                    {/* IMAGE */}
                                    <div className="relative w-32 h-32 bg-gray-100 rounded-lg shrink-0">
                                        <Image
                                            src="/images/placeholder.png"
                                            alt="recommended"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>

                                    {/* INFO */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">
                                            Recommended Product
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            High quality product with premium finish
                                        </p>
                                        <p className="mt-2 font-semibold text-lg">€120</p>
                                    </div>

                                    {/* ACTION */}
                                    <div className="w-full sm:w-auto">
                                        <button
                                            onClick={() => router.push("/checkout")}
                                            className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}
                </div>
            </div>
        </div>
    );
}

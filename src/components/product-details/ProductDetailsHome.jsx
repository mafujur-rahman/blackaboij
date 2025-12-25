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
    const [quantity, setQuantity] = useState(1);

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

    /* =========================
        ADD TO CART
    ========================= */
    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            Swal.fire("Missing", "Select size & color", "warning");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart_items")) || [];

        cart.push({
            // 🔑 REQUIRED FOR CHECKOUT
            id: Number(product.id),
            product_id: Number(product.id),

            name: product.name,
            price: Number(product.unit_price),
            image: product.thumbnail_image,

            quantity: Number(quantity),

            size: selectedSize.name,
            size_id: Number(selectedSize.id),

            color: selectedColor.name,
            color_id: Number(selectedColor.id),
        });

        localStorage.setItem("cart_items", JSON.stringify(cart));

        Swal.fire("Added", "Product added to cart", "success");
    };

    /* =========================
        ORDER NOW
    ========================= */
    const handleOrderNow = () => {
        if (!selectedSize || !selectedColor) {
            Swal.fire("Missing", "Select size & color", "warning");
            return;
        }

        const checkoutItem = {
            id: Number(product.id),
            product_id: Number(product.id),

            name: product.name,
            price: Number(product.unit_price),
            image: product.thumbnail_image,

            quantity: Number(quantity),

            size: selectedSize.name,
            size_id: Number(selectedSize.id),

            color: selectedColor.name,
            color_id: Number(selectedColor.id),
        };

        localStorage.setItem(
            "checkout_item",
            JSON.stringify(checkoutItem)
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* IMAGE */}
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
                                    className={`relative w-24 h-24 border rounded-lg ${
                                        activeImage === img
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
                                        className={`px-4 py-2 border rounded ${
                                            selectedSize?.id === size.id
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
                                        className={`h-8 w-8 rounded-full border-2 ${
                                            selectedColor?.id === color.id
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

                    {/* QUANTITY */}
                    <div className="mt-6">
                        <p className="mb-2 font-medium">Quantity</p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                className="px-4 py-2 border rounded"
                            >
                                −
                            </button>
                            <span className="font-semibold">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="px-4 py-2 border rounded"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-10 flex gap-4">
                        <button
                            onClick={handleOrderNow}
                            disabled={!selectedSize || !selectedColor}
                            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900"
                        >
                            Order Now
                        </button>

                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedSize || !selectedColor}
                            className="w-full py-3 border border-black rounded-lg hover:bg-black hover:text-white"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

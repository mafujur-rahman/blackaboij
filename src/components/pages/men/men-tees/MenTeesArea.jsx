"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
import AnimatedButton from "../../../utils/AnimatedButton";
import axios from "axios";
import Swal from "sweetalert2";

const MenTeesArea = () => {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get("https://blackaboji.vercel.app/api/products/get-all-products/");
            console.log("API Response:", res.data); // <-- see what is coming

            if (res.data?.success) {
                setProducts(res.data.data);
            } else {
                console.warn("API did not return success:", res.data);
            }
        } catch (error) {
            console.error("API fetch error:", error);
            Swal.fire("Error", "Failed to load products", "error");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const NewBadge = () => (
        <div className="absolute right-0 top-0 bg-black px-2 py-1 text-[12px] md:text-[15px] font-semibold uppercase text-white">
            New
        </div>
    );

    const ProductCard = ({ product }) => {
        // Safe image URL
        const imageUrl = product.image
            ? product.image.startsWith("http")
                ? product.image
                : `${process.env.NEXT_PUBLIC_BASE_URL}${product.image}`
            : "/placeholder.png"; // fallback image

        return (
            <div className="relative flex flex-col overflow-hidden bg-white shadow-md rounded-md">
                {/* Image */}
                <div className="relative aspect-square w-full bg-gray-100">
                    <Image
                        src={imageUrl}
                        alt={product.name || "Product"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {product.isNew && <NewBadge />}
                    <button className="absolute top-2 left-2 z-10 text-white">
                        <FiHeart size={20} />
                    </button>
                </div>

                {/* Info */}
                <div className="flex flex-col bg-black p-4">
                    <h3 className="text-[16px] md:text-[22px] font-medium text-white">
                        {product.name || "Unnamed Product"}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-[12px] md:text-[15px] font-bold text-white">
                            ${product.price || "0.00"}
                        </p>
                        <AnimatedButton variant="white">Buy Now</AnimatedButton>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="my-12.5">
            <div className="px-4 lg:px-12 xl:px-12.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p className="text-center col-span-full">No products found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenTeesArea;

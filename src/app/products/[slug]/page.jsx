"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { useState } from "react";

// ----------------------
// Sample product for design
// ----------------------
const mainProduct = {
    id: 1,
    slug: "blackaboij-mens-tshirt-white",
    name: "Blackaboij Men's T-Shirt - White Edition",
    price: "€40",
    description:
        "Elevate your streetwear game with the Blackaboij Men's T-Shirt. Featuring a bold and stylish design, this comfortable and versatile piece is perfect for any casual outing.",
    image: "/images/new.webp",
    images: ["/images/new.webp", "/images/new.webp"],
    isNew: true,
    sizes: ["M", "XL", "XXL"],
    colors: ["#e5e7eb", "#fde2e2", "#ffffff", "#000000"],
    details: [
        { label: "Style", value: "Classic fit with a modern twist" },
        { label: "Design", value: "Blackaboij logo printed on the front" },
        { label: "Material", value: "Soft, breathable cotton blend" },
        { label: "Care", value: "Machine washable" },
    ],
};

export default function ProductDetails({ params }) {
    const { slug } = params;

    // temporary slug check
    if (slug !== mainProduct.slug) return notFound();


    return (
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* LEFT IMAGE */}
            <div>
                <div className="relative w-full h-[520px] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                        src={mainProduct.images[activeImg]}
                        alt={mainProduct.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    {mainProduct.isNew && (
                        <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1">
                            NEW
                        </span>
                    )}
                </div>

                <div className="flex gap-3 mt-4">
                    {mainProduct.images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`relative w-24 h-24 rounded-md overflow-hidden border ${activeImg === i ? "border-black" : "border-gray-200"
                                }`}
                        >
                            <Image src={img} alt="" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT DETAILS */}
            <div>
                <h1 className="text-3xl font-bold mb-4">{mainProduct.name}</h1>
                <p className="text-gray-600 mb-6">{mainProduct.description}</p>

                <ul className="space-y-2 mb-6">
                    {mainProduct.details.map((item, i) => (
                        <li key={i} className="text-sm">
                            <span className="font-semibold">{item.label}:</span>{" "}
                            {item.value}
                        </li>
                    ))}
                </ul>

                <p className="text-2xl font-bold mb-6">{mainProduct.price}</p>

                {/* SIZES */}
                <div className="mb-6">
                    <p className="font-medium mb-2">Sizes</p>
                    <div className="flex gap-3">
                        {mainProduct.sizes.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSize(s)}
                                className={`px-4 py-2 border rounded ${size === s ? "bg-black text-white" : ""
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* COLORS */}
                <div className="mb-8">
                    <p className="font-medium mb-2">Colors</p>
                    <div className="flex gap-3">
                        {mainProduct.colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-black" : "border-gray-300"
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-black text-white py-4 font-semibold">
                        ADD TO CART
                    </button>
                    <button className="border border-black py-4 font-semibold">
                        Add to Wish List
                    </button>
                </div>
            </div>
        </div>
    );
}

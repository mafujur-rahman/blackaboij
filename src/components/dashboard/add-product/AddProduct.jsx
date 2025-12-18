"use client";

import React, { useState } from "react";
import { Home, ChevronRight, Bold, Italic, Underline, Link2, List } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Link from "next/link";
import AnimatedButton from "@/components/utils/AnimatedButton";

const AddProduct = () => {
    const [mainCategory, setMainCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);

    const subCategories = {
        Men: ["Tees", "Hoodies & Sweaters", "Pants", "Outwear", "Shoes"],
        Women: ["Tees", "Hoodies & Sweaters", "Pants", "Outwear", "Shoes"],
        Accessories: ["Men Accessories", "Women Accessories"],
    };

    const toggleValue = (value, list, setList) => {
        setList(list.includes(value)
            ? list.filter(v => v !== value)
            : [...list, value]);
    };

    const colorList = [
        { name: "Gray", code: "#9CA3AF" },
        { name: "Pink", code: "#EC4899" },
        { name: "White", code: "#FFFFFF" },
        { name: "Black", code: "#000000" },
    ];

    return (
        <DashboardShell>
            <div className="min-h-screen">

                {/* HEADER */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Add Product</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        {/* Home navigation */}
                        <Link href="/" className="flex items-center space-x-1 hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/add-product" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Products</span>
                        </Link>

                        <ChevronRight size={14} />
                        <Link href="/add-product" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Add Product</span>
                        </Link>
                    </div>
                </div>

                {/* PRODUCT INFORMATION */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                    <h2 className="text-xl font-bold mb-4">Product Information</h2>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-[16px] font-medium mb-1">Product Name</label>
                            <input
                                type="text"
                                placeholder="Enter product name"
                                className="w-full border border-black/20 rounded px-3 py-2"
                            />
                        </div>

                        {/* Main Category */}
                        <div>
                            <label className="block text-[16px] font-medium mb-1">Main Category</label>
                            <select
                                value={mainCategory}
                                onChange={(e) => {
                                    setMainCategory(e.target.value);
                                    setSubCategory("");
                                }}
                                className="w-full border border-black/20 rounded px-3 py-2"
                            >
                                <option value="">Select main category</option>
                                <option>Men</option>
                                <option>Women</option>
                                <option>Accessories</option>
                            </select>
                        </div>

                        {/* Sub Category */}
                        <div>
                            <label className="block text-[16px] font-medium mb-1">Sub Category</label>
                            <select
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                disabled={!mainCategory}
                                className="w-full border border-black/20 rounded px-3 py-2 disabled:bg-gray-100"
                            >
                                <option value="">Select sub category</option>
                                {mainCategory &&
                                    subCategories[mainCategory].map((sub) => (
                                        <option key={sub}>{sub}</option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mt-6">
                        <label className="block text-[16px] font-medium mb-1">Product Description</label>
                        <div className="border border-black/20 rounded">
                            <div className="flex gap-2 border-b bg-gray-50 px-3 py-2 text-gray-600">
                                <Bold size={16} />
                                <Italic size={16} />
                                <Underline size={16} />
                                <Link2 size={16} />
                                <List size={16} />
                            </div>
                            <textarea
                                rows={6}
                                placeholder="Enter product description here..."
                                className="w-full p-4 outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* PRICING */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-4">Pricing & Stock</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[16px] font-medium mb-1">Unit Price</label>
                            <input
                                type="number"
                                defaultValue={10}
                                className="w-full border border-black/20 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-[16px] font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                defaultValue={10}
                                className="w-full border border-black/20 rounded px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* VARIATIONS */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-4">Sizes & Colors</h2>

                    {/* Sizes */}
                    <label className="block text-[16px] font-medium mb-2">Sizes</label>
                    <div className="flex gap-3 mb-6">
                        {["XL", "M", "XXL"].map(s => (
                            <button
                                key={s}
                                onClick={() => toggleValue(s, sizes, setSizes)}
                                className={`px-4 py-2 rounded border ${sizes.includes(s)
                                    ? "bg-black text-white"
                                    : "border-black/20"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Colors */}
                    <label className="block text-[16px] font-medium mb-2">Colors</label>
                    <div className="flex gap-6">
                        {colorList.map(c => (
                            <div
                                key={c.name}
                                onClick={() => toggleValue(c.name, colors, setColors)}
                                className="cursor-pointer text-center"
                            >
                                <div
                                    className={`w-10 h-10 rounded-full border-2 mx-auto ${colors.includes(c.name)
                                        ? "border-black"
                                        : "border-black/20"
                                        }`}
                                    style={{ backgroundColor: c.code }}
                                />
                                <span className="text-[16px] mt-1 block">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MEDIA */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-4">Product Media</h2>

                    <div className="grid grid-cols-2 gap-6">
                        {["Gallery Images", "Thumbnail Image"].map((label, i) => (
                            <div key={i}>
                                <label className="block text-[16px] font-medium mb-1">{label}</label>
                                <div className="flex items-center justify-between border border-black/20 rounded px-4 py-3">
                                    <span className="text-[16px] text-gray-600">No file chosen</span>
                                    <label className="bg-black text-white px-4 py-2 rounded cursor-pointer text-[16px]">
                                        Choose File
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-4">Product SEO</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[16px] font-medium mb-1">Meta Title</label>
                            <input
                                placeholder="Enter meta title"
                                className="w-full border border-black/20 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-[16px] font-medium mb-1">Meta Description</label>
                            <textarea
                                rows={3}
                                placeholder="Enter meta description"
                                className="w-full border border-black/20 rounded px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <AnimatedButton variant="black">Add Product</AnimatedButton>
                </div>

            </div>
        </DashboardShell>
    );
};

export default AddProduct;

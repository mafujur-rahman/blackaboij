"use client";

import React, { useState } from "react";
import { Home, ChevronRight, Trash2, Plus } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import Link from "next/link";

const Size = () => {
    // Generate unique IDs using Date.now()
    const [sizes, setSizes] = useState([
        { id: Date.now() + 1, name: "XL" },
        { id: Date.now() + 2, name: "M" },
        { id: Date.now() + 3, name: "XXL" },
    ]);

    const [sizeName, setSizeName] = useState("");

    const addSize = () => {
        if (!sizeName.trim()) return;
        const newSize = { id: Date.now(), name: sizeName };
        setSizes([...sizes, newSize]);
        setSizeName("");
    };

    const deleteSize = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This size will be deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                setSizes(sizes.filter((size) => size.id !== id));
                Swal.fire("Deleted!", "Size has been deleted.", "success");
            }
        });
    };

    return (
        <DashboardShell>
            <div className="min-h-screen">
                {/* Header Section */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Size</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        {/* Home navigation */}
                        <Link href="/" className="flex items-center space-x-1 hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/size" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Products</span>
                        </Link>

                        <ChevronRight size={14} />
                        <Link href="/size" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Size</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Left: Add New Size */}
                    <div className="bg-white shadow-sm p-6 rounded-md w-1/3 h-fit">
                        <h2 className="text-2xl font-bold mb-4">Add New Size</h2>

                        <label className="block text-sm font-medium mb-2">Size Name</label>
                        <input
                            type="text"
                            placeholder="Enter Size name"
                            value={sizeName}
                            onChange={(e) => setSizeName(e.target.value)}
                            className="w-full border border-black/20 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <button
                            onClick={addSize}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded cursor-pointer"
                        >
                            <Plus size={16} />
                            Add Size
                        </button>
                    </div>

                    {/* Right: Size List */}
                    <div className="bg-white shadow-sm p-6 rounded-md flex-1 max-h-[500px] overflow-auto">
                        <h2 className="text-2xl font-bold mb-4">Size List</h2>
                        <table className="w-full text-left border-collapse border-l border-r border-black/10">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                                    <th className="px-4 py-3 w-16 text-center text-black border-r border-black/10">
                                        SL
                                    </th>
                                    <th className="px-4 py-3 border-r border-black/10">Name</th>
                                    <th className="px-4 py-3 w-24 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sizes.map((size, index) => (
                                    <tr
                                        key={size.id}
                                        className="border-b border-black/10 hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-4 py-4 border-r border-black/10 text-center font-bold text-slate-700">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-4 border-r border-black/10 text-slate-700">
                                            {size.name}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => deleteSize(size.id)}
                                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
};

export default Size;

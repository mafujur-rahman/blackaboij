"use client";

import React, { useState } from "react";
import { Home, ChevronRight, Plus, Eye, Edit, Trash2 } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const ProductList = () => {
    const router = useRouter();

    const [products, setProducts] = useState([
        {
            id: 1,
            sl: 1,
            name: "Blackaboij Men's T-Shirt - White Edition",
            image: "/images/new.webp",
            stock: "In Stock",
            price: "40 €",
            qty: 20,
        },
    ]);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const currentProducts = products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // DELETE HANDLER
    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This product will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#000",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it",
        }).then((result) => {
            if (result.isConfirmed) {
                setProducts(products.filter((p) => p.id !== id));
                Swal.fire("Deleted!", "Product has been deleted.", "success");
            }
        });
    };

    return (
        <DashboardShell>
            <div className="min-h-screen">

                {/* HEADER */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Products List</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        <Link href="/" className="hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <span>Products</span>
                        <ChevronRight size={14} />
                        <span>Products List</span>
                    </div>
                </div>

                {/* MAIN CARD */}
                <div className="bg-white shadow-sm p-6">

                    {/* ADD PRODUCT */}
                    <Link
                        href="/dashboard/add-product"
                        className="flex items-center w-fit bg-black text-white px-4 py-3 rounded-sm text-[16px] font-medium mb-6"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Product
                    </Link>

                    {/* TABLE */}
                    <div className="overflow-x-auto border border-black/10 rounded-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                                    <th className="px-4 py-3 border-r border-black/10 w-16 text-center text-black">
                                        SL
                                    </th>
                                    <th className="px-4 py-3 border-r border-black/10">Product</th>
                                    <th className="px-4 py-3 border-r border-black/10 w-32">
                                        Stock
                                    </th>
                                    <th className="px-4 py-3 border-r border-black/10 w-32">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 border-r border-black/10 w-24 text-center">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 w-32">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentProducts.map((product, index) => (
                                    <tr
                                        key={product.id}
                                        className="border-b border-black/10 hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-4 border-r border-black/10 text-center font-bold">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-4 border-r border-black/10">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded border border-black/10 object-cover"
                                                />
                                                <span className="text-sm font-medium">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 border-r border-black/10 text-xs">
                                            <span className="bg-indigo-50 text-indigo-500 px-2 py-1 rounded-full font-semibold">
                                                {product.stock}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 border-r border-black/10 font-semibold">
                                            {product.price}
                                        </td>

                                        <td className="px-4 py-4 border-r border-black/10 text-center">
                                            {product.qty}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex gap-2">

                                                {/* VIEW */}
                                                <button
                                                    onClick={() =>
                                                        router.push(`/dashboard/product/${product.id}`)
                                                    }
                                                    className="p-1.5 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 cursor-pointer"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* EDIT */}
                                                <button
                                                    onClick={() =>
                                                        router.push(`/dashboard/edit-product/${product.id}`)
                                                    }
                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 cursor-pointer"
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex justify-end mt-6 space-x-1">
                        <button
                            className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                            disabled
                        >
                            Previous
                        </button>
                        <button className="px-4 py-2 text-sm bg-black text-white rounded">
                            1
                        </button>
                        <button
                            className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                            disabled
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
};

export default ProductList;

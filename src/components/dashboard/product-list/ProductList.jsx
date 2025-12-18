"use client"
import React, { useState } from 'react';
import { Home, ChevronRight, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import DashboardShell from '../DashboardShell';
import Image from 'next/image';
import Link from 'next/link';

const ProductList = () => {
    const products = [
        {
            id: 1,
            sl: 1,
            name: "Blackaboij Men's T-Shirt - White Edition",
            image: "/images/new.webp",
            stock: "In Stock",
            price: "40 €",
            qty: 20,
        },
    ];

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const currentProducts = products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <DashboardShell>
            <div className="min-h-screen">
                {/* Header Section */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Products List</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        {/* Home navigation */}
                        <Link href="/" className="flex items-center space-x-1 hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/product-list" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Products</span>
                        </Link>

                        <ChevronRight size={14} />
                        <Link href="/product-list" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Products List</span>
                        </Link>

                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white shadow-sm p-6">
                    {/* Add Product Button */}
                    <button className="flex items-center bg-black text-white px-4 py-4 rounded-sm text-[16px] font-medium mb-6 cursor-pointer">
                        <Plus size={18} className="mr-2" />
                        Add Product
                    </button>

                    {/* Table Section */}
                    <div className="overflow-x-auto border border-black/10 rounded-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                                    <th className="px-4 py-3 border-r border-black/10 w-16 text-center text-black">SL</th>
                                    <th className="px-4 py-3 border-r border-black/10">Product</th>
                                    <th className="px-4 py-3 border-r border-black/10 w-32">Stock</th>
                                    <th className="px-4 py-3 border-r border-black/10 w-32">Price</th>
                                    <th className="px-4 py-3 border-r border-black/10 w-24 text-center">Qty</th>
                                    <th className="px-4 py-3 w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-black/10 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4 border-r border-black/10 text-center font-bold text-slate-700">{product.sl}</td>
                                        <td className="px-4 py-4 border-r border-black/10">
                                            <div className="flex items-center space-x-3">
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded border border-black/10 object-cover"
                                                />
                                                <span className="text-sm font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 border-r border-black/10 text-xs">
                                            <span className="bg-indigo-50 text-indigo-500 px-2 py-1 rounded-full font-semibold">
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 border-r border-black/10 font-semibold text-slate-700">{product.price}</td>
                                        <td className="px-4 py-4 border-r border-black/10 text-center font-medium">{product.qty}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-start space-x-2">
                                                <button className="p-1.5 bg-yellow-50 text-yellow-500 rounded-md hover:bg-yellow-100">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-1.5 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Section */}
                    {totalPages > 1 ? (
                        <div className="flex justify-end mt-6 space-x-1">
                            <button
                                className="px-4 py-2 text-sm bg-red-400 text-white rounded hover:bg-red-500"
                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    className={`px-4 py-2 text-sm rounded ${currentPage === i + 1
                                        ? 'bg-indigo-900 text-white'
                                        : 'bg-slate-500 text-white hover:bg-slate-600'
                                        }`}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="px-4 py-2 text-sm bg-slate-500 text-white rounded hover:bg-slate-600"
                                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-end mt-6 space-x-1">
                            <button className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded cursor-not-allowed" disabled>
                                Previous
                            </button>
                            <button className="px-4 py-2 text-sm bg-indigo-900 text-white rounded">
                                1
                            </button>
                            <button className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded cursor-not-allowed" disabled>
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
};

export default ProductList;

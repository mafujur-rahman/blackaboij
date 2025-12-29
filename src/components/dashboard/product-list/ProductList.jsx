"use client";

import React, { useEffect, useState } from "react";
import { Home, ChevronRight, Plus, Eye, Edit, Trash2, Percent, Package } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";

const ProductList = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Discount Modal State
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [discountPercent, setDiscountPercent] = useState("");
    const [applyingDiscount, setApplyingDiscount] = useState(false);

    // Quantity Update Modal State
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [quantityValue, setQuantityValue] = useState("");
    const [updatingQuantity, setUpdatingQuantity] = useState(false);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch products from API with pagination
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                const res = await api.get(`/api/products/get-all-products/?page=${currentPage}&limit=${itemsPerPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.success) {
                    setProducts(res.data.data);
                    const total = res.data.total || 0;
                    setTotalPages(Math.ceil(total / itemsPerPage));
                } else {
                    Swal.fire("Error", res.data.message, "error");
                }
            } catch (error) {
                Swal.fire("Error", "Failed to fetch products", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage]);

    // Pagination controls
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // OPEN DISCOUNT MODAL
    const openDiscountModal = (product) => {
        setSelectedProduct(product);
        setDiscountPercent(product.discount_percent || "");
        setShowDiscountModal(true);
    };

    // OPEN QUANTITY UPDATE MODAL
    const openQuantityModal = (product) => {
        setSelectedProduct(product);
        setQuantityValue(product.quantity || "");
        setShowQuantityModal(true);
    };

    // APPLY DISCOUNT
    const applyDiscount = async () => {
        if (!discountPercent || isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
            Swal.fire("Warning", "Please enter a valid discount percentage (0-100)", "warning");
            return;
        }

        setApplyingDiscount(true);
        try {
            const token = localStorage.getItem("auth_token");
            const res = await api.post(
                `/api/product/apply-discount/${selectedProduct.id}/`,
                {
                    discount_percent: parseFloat(discountPercent)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                }
            );

            if (res.data.success) {
                setProducts(prevProducts =>
                    prevProducts.map(p =>
                        p.id === selectedProduct.id
                            ? { ...p, discount_percent: parseFloat(discountPercent) }
                            : p
                    )
                );

                Swal.fire("Success", res.data.message, "success");
                setShowDiscountModal(false);
                setSelectedProduct(null);
                setDiscountPercent("");
            } else {
                Swal.fire("Error", res.data.message, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Failed to apply discount", "error");
        } finally {
            setApplyingDiscount(false);
        }
    };

    // UPDATE QUANTITY
    const updateQuantity = async () => {
        if (!quantityValue || isNaN(quantityValue) || quantityValue < 0) {
            Swal.fire("Warning", "Please enter a valid quantity (minimum 0)", "warning");
            return;
        }

        setUpdatingQuantity(true);
        try {
            const token = localStorage.getItem("auth_token");
            const res = await api.post(
                `/product/update-quantity/${selectedProduct.id}/`,
                {
                    quantity: parseInt(quantityValue)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                }
            );

            if (res.data.success) {
                setProducts(prevProducts =>
                    prevProducts.map(p =>
                        p.id === selectedProduct.id
                            ? { ...p, quantity: parseInt(quantityValue) }
                            : p
                    )
                );

                Swal.fire("Success", res.data.message, "success");
                setShowQuantityModal(false);
                setSelectedProduct(null);
                setQuantityValue("");
            } else {
                Swal.fire("Error", res.data.message, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Failed to update quantity", "error");
        } finally {
            setUpdatingQuantity(false);
        }
    };

    // REMOVE DISCOUNT
    const removeDiscount = async (productId) => {
        Swal.fire({
            title: "Remove Discount?",
            text: "Are you sure you want to remove the discount from this product?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#000",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, remove it",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem("auth_token");
                    const res = await api.post(
                        `/api/product/apply-discount/${productId}/`,
                        {
                            discount_percent: 0
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                        }
                    );

                    if (res.data.success) {
                        setProducts(prevProducts =>
                            prevProducts.map(p =>
                                p.id === productId
                                    ? { ...p, discount_percent: 0 }
                                    : p
                            )
                        );

                        Swal.fire("Success", "Discount removed successfully", "success");
                    } else {
                        Swal.fire("Error", res.data.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error", "Failed to remove discount", "error");
                }
            }
        });
    };

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
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem("auth_token");
                    const res = await api.delete(`/api/product/delete-product/${id}/`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (res.data.success) {
                        setProducts(products.filter((p) => p.id !== id));
                        Swal.fire("Deleted!", "Product has been deleted.", "success");
                    } else {
                        Swal.fire("Error", res.data.message, "error");
                    }
                } catch (error) {
                    Swal.fire("Error", "Failed to delete product", "error");
                }
            }
        });
    };

    return (
        <>
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
                        {loading ? (
                            <div className="text-center py-20">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                No products found
                            </div>
                        ) : (
                            <>
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
                                                <th className="px-4 py-3 border-r border-black/10 w-32">
                                                    Discount
                                                </th>
                                                <th className="px-4 py-3 border-r border-black/10 w-24 text-center">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 w-56 text-center">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {products.map((product, index) => {
                                                const discountedPrice = product.discount_percent > 0
                                                    ? product.unit_price * (1 - product.discount_percent / 100)
                                                    : null;

                                                return (
                                                    <tr
                                                        key={product.id}
                                                        className="border-b border-black/10 hover:bg-slate-50"
                                                    >
                                                        <td className="px-4 py-4 border-r border-black/10 text-center font-bold">
                                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                                        </td>

                                                        <td className="px-4 py-4 border-r border-black/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded-full border border-black/10">
                                                                    <Image
                                                                        src={getImageUrl(product.thumbnail_image)}
                                                                        alt={product.name}
                                                                        width={40}
                                                                        height={40}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>

                                                                <span className="text-sm font-medium">{product.name}</span>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-4 border-r border-black/10 text-xs">
                                                            <span
                                                                className={`px-2 py-1 rounded-full font-semibold ${product.quantity > 0
                                                                    ? "bg-indigo-50 text-indigo-500"
                                                                    : "bg-red-50 text-red-500"
                                                                    }`}
                                                            >
                                                                {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-4 border-r border-black/10">
                                                            <div className="flex flex-col">
                                                                {product.discount_percent > 0 ? (
                                                                    <>
                                                                        <span className="text-sm text-gray-500 line-through">
                                                                            {product.unit_price} €
                                                                        </span>
                                                                        <span className="font-semibold text-red-600">
                                                                            {discountedPrice.toFixed(2)} €
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="font-semibold">
                                                                        {product.unit_price} €
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-4 border-r border-black/10">
                                                            {product.discount_percent > 0 ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                                                                        -{product.discount_percent}%
                                                                    </span>
                                                                    <button
                                                                        onClick={() => removeDiscount(product.id)}
                                                                        className="text-xs text-red-500 hover:text-red-700"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">No discount</span>
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-4 border-r border-black/10 text-center font-medium">
                                                            {product.quantity}
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <div className="flex gap-2 justify-center">
                                                                <button
                                                                    onClick={() =>
                                                                        router.push(`/product/${product.id}`)
                                                                    }
                                                                    className="p-1.5 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 cursor-pointer"
                                                                    title="View"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>

                                                                <button
                                                                    onClick={() => openQuantityModal(product)}
                                                                    className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 cursor-pointer"
                                                                    title="Update Quantity"
                                                                >
                                                                    <Package size={16} />
                                                                </button>

                                                                <button
                                                                    onClick={() => openDiscountModal(product)}
                                                                    className="p-1.5 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 cursor-pointer"
                                                                    title="Apply Discount"
                                                                >
                                                                    <Percent size={16} />
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        router.push(`/dashboard/edit-product/${product.id}`)
                                                                    }
                                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 cursor-pointer"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>

                                                                <button
                                                                    onClick={() => handleDelete(product.id)}
                                                                    className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 cursor-pointer"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-6 space-x-1">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 text-sm rounded ${currentPage === 1
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-gray-800 text-white hover:bg-black"
                                                }`}
                                        >
                                            Previous
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className={`px-4 py-2 text-sm rounded ${currentPage === pageNum
                                                        ? "bg-black text-white"
                                                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-4 py-2 text-sm rounded ${currentPage === totalPages
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-gray-800 text-white hover:bg-black"
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </DashboardShell>

            {/* DISCOUNT MODAL */}
            {showDiscountModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-xl font-bold">Apply Discount</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Apply discount to: <span className="font-semibold">{selectedProduct.name}</span>
                            </p>
                        </div>

                        <div className="px-6 py-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Current Price: <span className="font-semibold">{selectedProduct.unit_price} €</span>
                                    </label>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Discount Percentage (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={discountPercent}
                                            onChange={(e) => setDiscountPercent(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="Enter discount percentage"
                                        />
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            %
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter a value between 0 and 100
                                    </p>
                                </div>

                                {discountPercent && !isNaN(discountPercent) && discountPercent > 0 && (
                                    <div className="bg-gray-50 p-3 rounded">
                                        <h3 className="text-sm font-semibold mb-2">Discount Preview:</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Original Price:</span>
                                            <span className="font-medium">{selectedProduct.unit_price} €</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-600">Discount:</span>
                                            <span className="font-medium text-red-600">
                                                -{discountPercent}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1 border-t pt-1">
                                            <span className="text-gray-600">New Price:</span>
                                            <span className="font-bold text-green-600">
                                                {(selectedProduct.unit_price * (1 - discountPercent / 100)).toFixed(2)} €
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDiscountModal(false);
                                    setSelectedProduct(null);
                                    setDiscountPercent("");
                                }}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                disabled={applyingDiscount}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyDiscount}
                                disabled={applyingDiscount || !discountPercent || isNaN(discountPercent)}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {applyingDiscount ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Applying...
                                    </span>
                                ) : (
                                    "Apply Discount"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QUANTITY UPDATE MODAL */}
            {showQuantityModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-xl font-bold">Update Quantity</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Update stock for: <span className="font-semibold">{selectedProduct.name}</span>
                            </p>
                        </div>

                        <div className="px-6 py-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Current Stock Status: 
                                        <span className={`ml-2 font-semibold ${selectedProduct.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                            {selectedProduct.quantity > 0 ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </label>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Current Quantity
                                    </label>
                                    <div className="text-lg font-bold p-3 bg-gray-50 rounded">
                                        {selectedProduct.quantity} units
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        New Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={quantityValue}
                                        onChange={(e) => setQuantityValue(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                        placeholder="Enter new quantity"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter the total number of units available in stock
                                    </p>
                                </div>

                                {quantityValue && !isNaN(quantityValue) && (
                                    <div className="bg-gray-50 p-3 rounded">
                                        <h3 className="text-sm font-semibold mb-2">Stock Status Preview:</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Current Quantity:</span>
                                            <span className="font-medium">{selectedProduct.quantity}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-600">New Quantity:</span>
                                            <span className="font-bold text-blue-600">
                                                {quantityValue}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1 border-t pt-1">
                                            <span className="text-gray-600">Status Change:</span>
                                            <span className={`font-semibold ${parseInt(quantityValue) > 0 ? "text-green-600" : "text-red-600"}`}>
                                                {parseInt(quantityValue) > 0 ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowQuantityModal(false);
                                    setSelectedProduct(null);
                                    setQuantityValue("");
                                }}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                disabled={updatingQuantity}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateQuantity}
                                disabled={updatingQuantity || !quantityValue || isNaN(quantityValue)}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {updatingQuantity ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </span>
                                ) : (
                                    "Update Quantity"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductList;
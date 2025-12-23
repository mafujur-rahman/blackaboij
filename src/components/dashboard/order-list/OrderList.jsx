"use client";
import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Eye } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Link from "next/link";
import api from "@/lib/axios";
import Swal from "sweetalert2";

const itemsPerPage = 10;

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOrder, setModalOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/orders/get-all-orders/");
                setOrders(response.data.data || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch orders.");
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleTrackingChange = async (order_number, newStatus) => {
        try {
            if (!newStatus) {
                throw new Error("No status selected");
            }

            // Check allowed statuses
            const allowedStatuses = ["confirmed", "delivered", "cancelled", "shipped"];
            if (!allowedStatuses.includes(newStatus.toLowerCase())) {
                Swal.fire({
                    icon: "error",
                    title: "Invalid Status",
                    text: `Status "${newStatus}" is not allowed`,
                });
                return;
            }

            // Optimistic update
            setOrders((prev) =>
                prev.map((order) =>
                    order.order_number === order_number ? { ...order, status: newStatus } : order
                )
            );




            const response = await api.put(
                `/api/admin/order/update-status/${order_number}/`,
                { status: newStatus },
            );

            console.log("API Response:", response.data);

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: `Order status updated to ${newStatus}`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                throw new Error(response.data.message || "Failed to update status");
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "Failed to update order status",
            });

            // Revert optimistic update
            setOrders((prev) => [...prev]);
        }
    };


    // Filtered orders
    const filteredOrders = orders.filter(
        (order) =>
            (filterStatus === "All" || order.status === filterStatus) &&
            ((order.order_number?.toLowerCase() || "").includes(filterText.toLowerCase()) ||
                (order.customer_name?.toLowerCase() || "").includes(filterText.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const currentOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <DashboardShell>
            <div className="min-h-screen">
                {/* Header */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Order List</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        <Link href="/" className="flex items-center space-x-1 hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/order-list" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Order</span>
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/order-list" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Order List</span>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white px-6 py-4 rounded-sm shadow-sm mb-4">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by order code or customer"
                            className="border px-3 py-2 rounded w-1/2"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                        <select
                            className="border px-3 py-2 rounded"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option>All</option>
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Complete</option>
                            <option>Cancel</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white px-6 py-4 rounded-sm shadow-sm overflow-x-auto border border-black/10">
                    {loading ? (
                        <p className="text-center py-4">Loading orders...</p>
                    ) : error ? (
                        <p className="text-center py-4 text-red-500">{error}</p>
                    ) : currentOrders.length === 0 ? (
                        <p className="text-center py-4">No orders found.</p>
                    ) : (
                        <>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                                        <th className="px-4 py-3 border-r border-black/10 w-16 text-center text-black">SL</th>
                                        <th className="px-4 py-3 border-r border-black/10">Order Code</th>
                                        <th className="px-4 py-3 border-r border-black/10">Customer Name</th>
                                        <th className="px-4 py-3 border-r border-black/10">Amount</th>
                                        <th className="px-4 py-3 border-r border-black/10">Status</th>
                                        <th className="px-4 py-3 border-r border-black/10">Payment Method</th>
                                        <th className="px-4 py-3 border-r border-black/10">Order Tracking</th>
                                        <th className="px-4 py-3 border-r border-black/10">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrders.map((order, index) => (
                                        <tr
                                            key={`${order.order_number ?? index}-${index}`}
                                            className="border-b border-black/10 hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-4 py-4 border-r border-black/10 text-center font-bold text-slate-700">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-4 py-4 border-r border-black/10 font-semibold">{order.order_number}</td>
                                            <td className="px-4 py-4 border-r border-black/10">{order.customer_name}</td>
                                            <td className="px-4 py-4 border-r border-black/10 font-semibold">{order.total_amount}</td>
                                            <td className="px-4 py-4 border-r border-black/10">{order.status}</td>
                                            <td className="px-4 py-4 border-r border-black/10">{order.payment_method}</td>
                                            <td className="px-4 py-4 border-r border-black/10">
                                                <select
                                                    className={`border px-2 py-1 rounded text-sm ${order.status === "delivered" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                    value={order.status}
                                                    onChange={(e) => handleTrackingChange(order.order_number, e.target.value)}
                                                    disabled={order.status === "delivered"}
                                                >
                                                    <option>Pending</option>
                                                    <option>shipped</option>
                                                    <option>confirmed</option>
                                                    <option>delivered</option>
                                                    <option>cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    className="p-1.5 bg-gray-200 text-black rounded-md hover:bg-gray-300"
                                                    onClick={() => setModalOrder(order)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-400 text-white hover:bg-red-500"}`}
                                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-indigo-900 text-white" : "bg-gray-200 text-black hover:bg-gray-300"}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-400 text-white hover:bg-red-500"}`}
                                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal */}
                {modalOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-1/3 max-w-4xl relative overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
                                <h2 className="text-black text-xl font-semibold">Order Details</h2>
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition"
                                    onClick={() => setModalOrder(null)}
                                >
                                    X
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Order Number:</span>
                                    <span className="text-black font-semibold">{modalOrder.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Customer Name:</span>
                                    <span className="text-black font-semibold">{modalOrder.customer_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Amount:</span>
                                    <span className="text-black font-semibold">{modalOrder.total_amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Status:</span>
                                    <span className="text-black font-semibold">{modalOrder.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Payment Method:</span>
                                    <span className="text-black font-semibold">{modalOrder.payment_method}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                <button
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                                    onClick={() => setModalOrder(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
};

export default OrderList;

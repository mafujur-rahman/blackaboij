"use client";
import React, { useState } from "react";
import { Home, ChevronRight, Eye } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Link from "next/link";

const initialOrders = [
    { id: 1, orderCode: "ORD-1001", customerName: "John Doe", amount: "€ 50", deliveryStatus: "Pending", paymentMethod: "Credit Card", orderTracking: "Pending" },
    { id: 2, orderCode: "ORD-1002", customerName: "Jane Smith", amount: "€ 120", deliveryStatus: "Shipped", paymentMethod: "Paypal", orderTracking: "Shipped" },
    { id: 3, orderCode: "ORD-1003", customerName: "Alice Johnson", amount: "€ 80", deliveryStatus: "Processing", paymentMethod: "Cash On Delivery", orderTracking: "Processing" },
    { id: 4, orderCode: "ORD-1004", customerName: "Bob Brown", amount: "€ 60", deliveryStatus: "Complete", paymentMethod: "Credit Card", orderTracking: "Complete" },
    { id: 5, orderCode: "ORD-1005", customerName: "Carol White", amount: "€ 90", deliveryStatus: "Pending", paymentMethod: "Paypal", orderTracking: "Pending" },
    { id: 6, orderCode: "ORD-1006", customerName: "David Green", amount: "€ 150", deliveryStatus: "Shipped", paymentMethod: "Credit Card", orderTracking: "Shipped" },
    { id: 7, orderCode: "ORD-1007", customerName: "Eva Black", amount: "€ 70", deliveryStatus: "Processing", paymentMethod: "Cash On Delivery", orderTracking: "Processing" },
    { id: 8, orderCode: "ORD-1008", customerName: "Frank Gray", amount: "€ 110", deliveryStatus: "Complete", paymentMethod: "Paypal", orderTracking: "Complete" },
    { id: 9, orderCode: "ORD-1009", customerName: "Grace Blue", amount: "€ 85", deliveryStatus: "Pending", paymentMethod: "Credit Card", orderTracking: "Pending" },
    { id: 10, orderCode: "ORD-1010", customerName: "Hank Orange", amount: "€ 95", deliveryStatus: "Processing", paymentMethod: "Cash On Delivery", orderTracking: "Processing" },
    { id: 11, orderCode: "ORD-1011", customerName: "Ivy Red", amount: "€ 130", deliveryStatus: "Shipped", paymentMethod: "Paypal", orderTracking: "Shipped" },
];

const itemsPerPage = 10;

const OrderList = () => {
    const [orders, setOrders] = useState(initialOrders);
    const [filterText, setFilterText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOrder, setModalOrder] = useState(null);

    const handleTrackingChange = (id, newStatus) => {
        const updatedOrders = orders.map((order) =>
            order.id === id ? { ...order, orderTracking: newStatus } : order
        );
        setOrders(updatedOrders);
    };

    const filteredOrders = orders.filter(
        (order) =>
            (filterStatus === "All" || order.deliveryStatus === filterStatus) &&
            (order.orderCode.toLowerCase().includes(filterText.toLowerCase()) ||
                order.customerName.toLowerCase().includes(filterText.toLowerCase()))
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
                <div className="bg-white px-6 py-4 rounded-sm shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                                <th className="px-4 py-3 border-r border-black/10 w-16 text-center text-black">SL</th>
                                <th className="px-4 py-3 border-r border-black/10">Order Code</th>
                                <th className="px-4 py-3 border-r border-black/10">Customer Name</th>
                                <th className="px-4 py-3 border-r border-black/10">Amount</th>
                                <th className="px-4 py-3 border-r border-black/10">Delivery Status</th>
                                <th className="px-4 py-3 border-r border-black/10">Payment Method</th>
                                <th className="px-4 py-3 border-r border-black/10">Order Tracking</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map((order, index) => (
                                <tr key={order.id} className="border-b border-black/10 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 border-r border-black/10 text-center font-bold text-slate-700">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-4 border-r border-black/10 font-semibold">{order.orderCode}</td>
                                    <td className="px-4 py-4 border-r border-black/10">{order.customerName}</td>
                                    <td className="px-4 py-4 border-r border-black/10 font-semibold">{order.amount}</td>
                                    <td className="px-4 py-4 border-r border-black/10">{order.deliveryStatus}</td>
                                    <td className="px-4 py-4 border-r border-black/10">{order.paymentMethod}</td>
                                    <td className="px-4 py-4 border-r border-black/10">
                                        <select
                                            className={`border px-2 py-1 rounded text-sm ${order.orderTracking === "Complete" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            value={order.orderTracking}
                                            onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                                            disabled={order.orderTracking === "Complete"}
                                        >
                                            <option>Pending</option>
                                            <option>Processing</option>
                                            <option>Shipped</option>
                                            <option>Complete</option>
                                            <option>Cancel</option>
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
                </div>

                {/* Modal */}
                {modalOrder && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded w-1/3 relative">
                            <h2 className="text-xl font-bold mb-4">Order Details</h2>
                            <p><strong>Order Code:</strong> {modalOrder.orderCode}</p>
                            <p><strong>Customer Name:</strong> {modalOrder.customerName}</p>
                            <p><strong>Amount:</strong> {modalOrder.amount}</p>
                            <p><strong>Delivery Status:</strong> {modalOrder.deliveryStatus}</p>
                            <p><strong>Payment Method:</strong> {modalOrder.paymentMethod}</p>
                            <p><strong>Order Tracking:</strong> {modalOrder.orderTracking}</p>
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold"
                                onClick={() => setModalOrder(null)}
                            >
                                X
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
};

export default OrderList;

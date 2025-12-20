"use client";

import React, { useState } from "react";
import UserDashboardShell from "./UserDashboardShell";
import { Eye, X } from "lucide-react";

const orders = [
    {
        id: "ORD-1001",
        date: "2025-01-10",
        amount: "$120.00",
        orderStatus: "Delivered",
        paymentMethod: "Credit Card",
        paymentStatus: "Paid",
        items: [
            { name: "Black Hoodie", qty: 1, price: "$60" },
            { name: "Sneakers", qty: 1, price: "$60" },
        ],
    },
    {
        id: "ORD-1002",
        date: "2025-01-15",
        amount: "$75.00",
        orderStatus: "Processing",
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        items: [{ name: "T-Shirt", qty: 3, price: "$25" }],
    },
];

const UserOrdersHome = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    return (
        <UserDashboardShell>
            {/* TITLE */}
            <div className="bg-white rounded-md px-6 py-4 mb-6">
                <h2 className="font-semibold text-lg">My Orders</h2>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-md overflow-x-auto border border-black/10">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50 border-b border-black/10">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                                Order Status
                            </th>
                            <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                                Payment Method
                            </th>
                            <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                                Payment Status
                            </th>
                            <th className="px-6 py-3 text-center font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order, index) => (
                            <tr
                                key={order.id}
                                className="border-b border-black/10 hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 border-r border-black/10">
                                    {order.date}
                                </td>

                                <td className="px-6 py-4 font-medium border-r border-black/10">
                                    {order.amount}
                                </td>

                                <td className="px-6 py-4 border-r border-black/10">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === "Delivered"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </td>

                                <td className="px-6 py-4 border-r border-black/10">
                                    {order.paymentMethod}
                                </td>

                                <td className="px-6 py-4 border-r border-black/10">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentStatus === "Paid"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {order.paymentStatus}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-2  hover:bg-gray-100"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {/* MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-md w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute right-4 top-4"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-lg font-semibold mb-4">
                            Order Details ({selectedOrder.id})
                        </h3>

                        <div className="space-y-2 text-sm">
                            <p>
                                <strong>Date:</strong> {selectedOrder.date}
                            </p>
                            <p>
                                <strong>Amount:</strong> {selectedOrder.amount}
                            </p>
                            <p>
                                <strong>Order Status:</strong> {selectedOrder.orderStatus}
                            </p>
                            <p>
                                <strong>Payment Method:</strong>{" "}
                                {selectedOrder.paymentMethod}
                            </p>
                            <p>
                                <strong>Payment Status:</strong>{" "}
                                {selectedOrder.paymentStatus}
                            </p>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Items</h4>
                            <ul className="text-sm space-y-1">
                                {selectedOrder.items.map((item, index) => (
                                    <li key={index} className="flex justify-between">
                                        <span>
                                            {item.name} × {item.qty}
                                        </span>
                                        <span>{item.price}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </UserDashboardShell>
    );
};

export default UserOrdersHome;

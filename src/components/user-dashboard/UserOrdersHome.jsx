"use client";

import React, { useState, useEffect } from "react";
import UserDashboardShell from "./UserDashboardShell";
import { Eye, X, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import Swal from "sweetalert2";

const UserOrdersHome = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await api.get("/api/order/get-my-orders/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderNumber) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await api.get(
          `/api/order/cancel-order/${orderNumber}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          Swal.fire("Cancelled!", response.data.message, "success");
          // Update orders list
          setOrders((prev) =>
            prev.map((o) =>
              o.order_number === orderNumber ? { ...o, status: "cancelled" } : o
            )
          );
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        Swal.fire("Error", "Failed to cancel order", "error");
      }
    }
  };

  if (loading) return <p className="text-center mt-6">Loading orders...</p>;

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
                Order Number
              </th>
              <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                Date
              </th>
              <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                Amount
              </th>
              <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                Status
              </th>
              <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                Payment Method
              </th>
              <th className="px-6 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.order_number}
                className="border-b border-black/10 hover:bg-gray-50"
              >
                <td className="px-6 py-4 border-r border-black/10">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 border-r border-black/10">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-medium border-r border-black/10">
                  ${order.total_amount}
                </td>
                <td className="px-6 py-4 border-r border-black/10">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 border-r border-black/10">
                  {order.payment_method}
                </td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Eye size={18} />
                  </button>
                  {order.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancelOrder(order.order_number)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Trash2 size={18} color="red" />
                    </button>
                  )}
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
              Order Details ({selectedOrder.order_number})
            </h3>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.created_at).toLocaleDateString()}
              </p>
              <p>
                <strong>Amount:</strong> ${selectedOrder.total_amount}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Payment Method:</strong>{" "}
                {selectedOrder.payment_method}
              </p>
            </div>

            {selectedOrder.items && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Items</h4>
                <ul className="text-sm space-y-1">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span>${item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </UserDashboardShell>
  );
};

export default UserOrdersHome;

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

  const handleCancelOrder = async (order) => {
    // Only allow cancelling pending orders
    if (order.status !== "pending") {
      Swal.fire({
        icon: "info",
        title: "Cannot Cancel",
        text: "This order cannot be cancelled now",
        confirmButtonColor: "#000",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("auth_token");

      if (order.payment_method === "cod") {
        // Cancel COD order
        await api.post(
          `/api/order/cancel-order/${order.order_number}/`,
          undefined,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Cancel Online / PayPal order
        await api.get(`/api/paypal/cancel/${order.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      Swal.fire("Cancelled!", "Order has been cancelled successfully", "success");

      // Update order status in UI
      setOrders((prev) =>
        prev.map((o) =>
          o.order_number === order.order_number
            ? { ...o, status: "cancelled" }
            : o
        )
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      Swal.fire("Error", "Failed to cancel order", "error");
    }
  };

  // Helper function to format text to Title Case
  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to format payment method display
  const formatPaymentMethod = (method) => {
    if (method === "cod") {
      return "Cash On Delivery";
    } else if (method === "online") {
      return "Online Payment";
    }
    return toTitleCase(method);
  };

  // Helper function to format status display
  const formatStatus = (status) => {
    return toTitleCase(status);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `€${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Calculate order totals from items
  const calculateOrderTotals = (items) => {
    if (!items || !Array.isArray(items)) {
      return { subtotal: 0, total: 0 };
    }

    let subtotal = 0;
    
    items.forEach(item => {
      const quantity = item.quantity || 1;
      const price = parseFloat(item.unit_price) || 0;
      subtotal += price * quantity;
    });

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      total: parseFloat(subtotal.toFixed(2)) // Assuming no shipping/tax for now
    };
  };

  if (loading) {
    return (
      <UserDashboardShell>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </UserDashboardShell>
    );
  }

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
                Payment Status
              </th>
              <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                Order Status
              </th>
              <th className="px-6 py-3 text-left font-medium border-r border-black/10">
                Payment Method
              </th>
              <th className="px-6 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                return (
                  <tr
                    key={order.order_number}
                    className="border-b border-black/10 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 border-r border-black/10 font-medium">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 border-r border-black/10">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 border-r border-black/10 font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 border-r border-black/10">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${order.payment_status === "paid" || order.payment_status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.payment_status === "failed" || order.payment_status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {formatStatus(order.payment_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-black/10">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === "delivered" || order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.status === "pending"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-black/10">
                      <span className="font-medium">
                        {formatPaymentMethod(order.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-2 hover:bg-red-50 rounded transition-colors"
                            title="Cancel Order"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL - Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-md w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-6 pb-3 border-b">
              Order Details - {selectedOrder.order_number}
            </h3>

            {/* Order Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Order Information */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Order Date:</span>
                    <span>{new Date(selectedOrder.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Order Status:</span>
                    <span className={`font-medium ${selectedOrder.status === "delivered" ? "text-green-600" : selectedOrder.status === "cancelled" ? "text-red-600" : "text-blue-600"}`}>
                      {formatStatus(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Payment Status:</span>
                    <span className={`font-medium ${selectedOrder.payment_status === "paid" ? "text-green-600" : selectedOrder.payment_status === "pending" ? "text-yellow-600" : "text-red-600"}`}>
                      {formatStatus(selectedOrder.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Payment Method:</span>
                    <span className="font-medium">{formatPaymentMethod(selectedOrder.payment_method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Customer Information</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedOrder.full_name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Phone Number</p>
                    <p className="font-medium">{selectedOrder.phone_number}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-600">Street Address</p>
                    <p className="font-medium">{selectedOrder.street_address}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">City</p>
                    <p className="font-medium">{selectedOrder.city}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">ZIP Code</p>
                    <p className="font-medium">{selectedOrder.zip_code}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Order Items ({selectedOrder.items.length})</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Product</th>
                        <th className="px-4 py-3 text-left font-medium">Size</th>
                        <th className="px-4 py-3 text-left font-medium">Color</th>
                        <th className="px-4 py-3 text-left font-medium">Qty</th>
                        <th className="px-4 py-3 text-left font-medium">Unit Price</th>
                        <th className="px-4 py-3 text-left font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => {
                        const quantity = item.quantity || 1;
                        const price = parseFloat(item.unit_price) || 0;
                        const itemTotal = price * quantity;
                        
                        return (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                {item.id && (
                                  <p className="text-xs text-gray-500">Item ID: {item.id}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                                {item.size_name || `Size ${item.size}`}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border"
                                  style={{ 
                                    backgroundColor: item.color_name?.toLowerCase() || '#ccc'
                                  }}
                                />
                                <span className="font-medium">{item.color_name || `Color ${item.color}`}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium">{quantity}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{formatCurrency(price)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{formatCurrency(itemTotal)}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">Order Summary</h4>
              {selectedOrder.items && (
                <div className="space-y-3">
                  {(() => {
                    const totals = calculateOrderTotals(selectedOrder.items);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Items Subtotal:</span>
                          <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium text-green-600">Free Shipping</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold border-t pt-3">
                          <span>Total Amount:</span>
                          <span>{formatCurrency(selectedOrder.total_amount)}</span>
                        </div>
                        
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UserDashboardShell>
  );
};

export default UserOrdersHome;
"use client";

import React, { useEffect, useState } from "react";
import { Home, ChevronRight, Trash2, Percent } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import api from "@/lib/axios";

const Discount = () => {
  const [discountPercent, setDiscountPercent] = useState("");
  const [activeDiscount, setActiveDiscount] = useState(null); // now just a number
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  /* ===============================
     FETCH CURRENT GLOBAL DISCOUNT
  =============================== */
  const fetchActiveDiscount = async () => {
    try {
      setFetching(true);
      const res = await api.get("/api/products/get-discounted-percentage/");
      console.log("API Response:", res.data); // for debugging
      if (res.data?.success) {
        setActiveDiscount(res.data.data); // data is a number
      } else {
        setActiveDiscount(null);
      }
    } catch (error) {
      console.error("Failed to fetch discount:", error);
      setActiveDiscount(null);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchActiveDiscount();
  }, []);

  /* ===============================
     APPLY GLOBAL DISCOUNT
  =============================== */
  const applyDiscount = async () => {
    if (!discountPercent || discountPercent <= 0) {
      Swal.fire("Warning", "Enter a valid discount percent", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/product/apply-global-discount/", {
        discount_percent: Number(discountPercent),
      });

      if (res.data?.success) {
        Swal.fire("Success", res.data.message, "success");
        setDiscountPercent("");
        fetchActiveDiscount(); // refresh table
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to apply discount",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     REMOVE GLOBAL DISCOUNT
  =============================== */
  const removeDiscount = async () => {
    const confirm = await Swal.fire({
      title: "Remove Discount?",
      text: "This will remove discount from all products",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.post("/api/product/remove-global-discount/");
      if (res.data?.success) {
        Swal.fire("Removed!", res.data.message, "success");
        fetchActiveDiscount(); // refresh table
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to remove discount",
        "error"
      );
    }
  };

  return (
    <DashboardShell>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Global Discount</h1>
          <div className="flex items-center space-x-2 text-[16px]">
            <Home size={16} />
            <ChevronRight size={14} />
            <span>Products</span>
            <ChevronRight size={14} />
            <span>Discount</span>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Apply Discount */}
          <div className="bg-white shadow-sm p-6 rounded-md w-1/3 h-fit">
            <h2 className="text-2xl font-bold mb-4">Apply Discount</h2>

            <label className="block text-sm font-medium mb-2">
              Discount Percent (%)
            </label>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 20"
              />
              <Percent size={18} />
            </div>

            <button
              onClick={applyDiscount}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Applying..." : "Apply Discount"}
            </button>
          </div>

          {/* Discount Table */}
          <div className="bg-white shadow-sm p-6 rounded-md flex-1">
            <h2 className="text-2xl font-bold mb-4">Active Discount</h2>

            <table className="w-full border border-black/10 border-collapse">
              <thead>
                <tr className="bg-slate-50 uppercase text-[16px] font-bold">
                  <th className="px-4 py-3 text-center border border-black/10">
                    Discount %
                  </th>
                  <th className="px-4 py-3 text-center border border-black/10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-400 border border-black/10">
                      Loading...
                    </td>
                  </tr>
                ) : activeDiscount === null ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-400 border border-black/10">
                      No active discount
                    </td>
                  </tr>
                ) : (
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-center border border-black/10 font-bold">
                      {activeDiscount}%
                    </td>
                    <td className="px-4 py-5 flex justify-center border border-black/10">
                      <button
                        onClick={removeDiscount}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default Discount;

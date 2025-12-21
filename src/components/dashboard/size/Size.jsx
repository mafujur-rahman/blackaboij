"use client";

import React, { useEffect, useState } from "react";
import { Home, ChevronRight, Trash2, Plus, Edit } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import Link from "next/link";
import api from "@/lib/axios";


const Size = () => {
    const [sizes, setSizes] = useState([]);
    const [sizeName, setSizeName] = useState("");
    const [loading, setLoading] = useState(false);

    /* ==============================
       GET ALL SIZES
    ============================== */
    const fetchSizes = async () => {
        try {
            const res = await api.get("/api/sizes/get-all-sizes/");
            if (res.data?.success) {
                setSizes(res.data.data);
            }
        } catch {
            Swal.fire("Error", "Failed to load sizes", "error");
        }
    };

    useEffect(() => {
        fetchSizes();
    }, []);

    /* ==============================
       CREATE SIZE
    ============================== */
    const addSize = async () => {
        if (!sizeName.trim()) {
            Swal.fire("Warning", "Size name is required", "warning");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/api/size/create-size/", { name: sizeName });

            if (res.data?.success) {
                Swal.fire("Success", res.data.message, "success");
                setSizeName("");
                fetchSizes();
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error?.response?.data?.message || "Failed to create size",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ==============================
       UPDATE SIZE
    ============================== */
    const editSize = async (size) => {
        const { value: newName } = await Swal.fire({
            title: "Edit Size",
            input: "text",
            inputValue: size.name,
            inputPlaceholder: "Enter new size name",
            showCancelButton: true,
            confirmButtonText: "Update",
            confirmButtonColor: "#000",
            inputValidator: (value) => {
                if (!value) return "Size name cannot be empty";
            },
        });

        if (!newName) return;

        try {
            const res = await api.put(`/api/size/update-size/${size.id}/`, {
                name: newName,
            });

            if (res.data?.success) {
                Swal.fire("Updated!", res.data.message, "success");

                setSizes((prev) =>
                    prev.map((s) =>
                        s.id === size.id ? { ...s, name: newName } : s
                    )
                );
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error?.response?.data?.message || "Failed to update size",
                "error"
            );
        }
    };

    /* ==============================
       DELETE SIZE
    ============================== */
    const deleteSize = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This size will be deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await api.delete(`/api/size/delete-size/${id}/`);

            if (res.data?.success) {
                Swal.fire("Deleted!", res.data.message, "success");
                setSizes((prev) => prev.filter((size) => size.id !== id));
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error?.response?.data?.message || "Failed to delete size",
                "error"
            );
        }
    };

    return (
        <DashboardShell>
            <div className="min-h-screen">
                {/* Header */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Size</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        <Link href="/" className="hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <span>Products</span>
                        <ChevronRight size={14} />
                        <span>Size</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex gap-6">
                    {/* Add Size */}
                    <div className="bg-white shadow-sm p-6 rounded-md w-1/3 h-fit">
                        <h2 className="text-2xl font-bold mb-4">Add New Size</h2>

                        <label className="block text-sm font-medium mb-2">Size Name</label>
                        <input
                            type="text"
                            placeholder="Enter Size name"
                            value={sizeName}
                            onChange={(e) => setSizeName(e.target.value)}
                            className="w-full border border-black/10 rounded px-3 py-2 mb-4"
                        />

                        <button
                            onClick={addSize}
                            disabled={loading}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded cursor-pointer"
                        >
                            <Plus size={16} />
                            {loading ? "Adding..." : "Add Size"}
                        </button>
                    </div>

                    {/* Size List */}
                    <div className="bg-white shadow-sm p-6 rounded-md flex-1 max-h-[500px] overflow-auto">
                        <h2 className="text-2xl font-bold mb-4">Size List</h2>

                        <table className="w-full border border-black/10 border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold">
                                    <th className="px-4 py-3 w-16 text-center border border-black/10">SL</th>
                                    <th className="px-4 py-3 border border-black/10">Name</th>
                                    <th className="px-4 py-3 w-32 text-center border border-black/10">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sizes.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6 text-gray-400 border border-black/10">
                                            No sizes found
                                        </td>
                                    </tr>
                                ) : (
                                    sizes.map((size, index) => (
                                        <tr key={size.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-4 text-center font-bold border border-black/10">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-4 border text-center border-black/10">{size.name}</td>
                                            <td className="px-4 py-4 text-center flex justify-center gap-3 border border-black/10">
                                                <button
                                                    onClick={() => editSize(size)}
                                                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteSize(size.id)}
                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </DashboardShell>
    );
};

export default Size;

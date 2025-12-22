"use client";

import React, { useEffect, useState } from "react";
import { Home, ChevronRight, Trash2, Plus, Edit } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import Link from "next/link";
import api from "@/lib/axios";

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [parents, setParents] = useState([]);
    const [name, setName] = useState("");
    const [parent, setParent] = useState("");
    const [type, setType] = useState("parent"); // parent | sub
    const [loading, setLoading] = useState(false);

    /* ==============================
       FETCH GROUPED CATEGORIES
    ============================== */
    const fetchCategories = async () => {
        try {
            const res = await api.get("/api/categories/get-category-grouped/");
            if (res.data?.success) {
                setCategories(res.data.data);
            }
        } catch {
            Swal.fire("Error", "Failed to load categories", "error");
        }
    };

    /* ==============================
       FETCH PARENT CATEGORIES
    ============================== */
    const fetchParents = async () => {
        try {
            const res = await api.get(
                "/api/categories/get-all-parent-categories/"
            );
            if (res.data?.success) {
                setParents(res.data.data);
            }
        } catch {
            Swal.fire("Error", "Failed to load parent categories", "error");
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchParents();
    }, []);

    /* ==============================
       CREATE CATEGORY
    ============================== */
    const addCategory = async () => {
        if (!name.trim()) {
            Swal.fire("Warning", "Category name is required", "warning");
            return;
        }

        if (type === "sub" && !parent) {
            Swal.fire("Warning", "Please select a parent category", "warning");
            return;
        }

        try {
            setLoading(true);

            const url =
                type === "parent"
                    ? "/api/category/create-category/"
                    : "/api/category/create-sub-category/";

            const payload =
                type === "parent"
                    ? { name, parent: null }
                    : { name, parent };

            const res = await api.post(url, payload);

            if (res.data?.success) {
                Swal.fire("Success", res.data.message, "success");
                setName("");
                setParent("");
                setType("parent");
                fetchCategories();
                fetchParents();
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                "Failed to create category",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ==============================
       UPDATE CATEGORY
    ============================== */
    const editCategory = async (cat, isParent) => {
        const { value: newName } = await Swal.fire({
            title: "Edit Category",
            input: "text",
            inputValue: cat.name,
            showCancelButton: true,
            confirmButtonText: "Update",
            confirmButtonColor: "#000",
            inputValidator: (value) => {
                if (!value) return "Category name is required";
            },
        });

        if (!newName) return;

        try {
            const res = await api.put(
                `/api/category/update-category/${cat.id}/`,
                {
                    name: newName,
                    parent: isParent ? null : cat.parent,
                }
            );

            if (res.data?.success) {
                Swal.fire("Updated!", res.data.message, "success");
                fetchCategories();
                fetchParents();
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                "Failed to update category",
                "error"
            );
        }
    };

    /* ==============================
       DELETE CATEGORY
    ============================== */
    const deleteCategory = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This category will be deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await api.delete(
                `/api/category/delete-category/${id}/`
            );

            if (res.data?.success) {
                Swal.fire("Deleted!", res.data.message, "success");
                fetchCategories();
                fetchParents();
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                "Failed to delete category",
                "error"
            );
        }
    };

    return (
        <DashboardShell>
            <div className="min-h-screen">
                {/* HEADER */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Category</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        <Link href="/" className="hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <span>Products</span>
                        <ChevronRight size={14} />
                        <span>Category</span>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex gap-6">
                    {/* ADD CATEGORY */}
                    <div className="bg-white shadow-sm p-6 rounded-md w-1/3 h-fit">
                        <h2 className="text-2xl font-bold mb-4">
                            Add Category
                        </h2>

                        {/* TYPE */}
                        <label className="block text-sm font-medium mb-2">
                            Category Type
                        </label>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={type === "parent"}
                                    onChange={() => setType("parent")}
                                />
                                Parent Category
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={type === "sub"}
                                    onChange={() => setType("sub")}
                                />
                                Sub Category
                            </label>
                        </div>

                        {/* NAME */}
                        <label className="block text-sm font-medium mb-2">
                            Category Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-black/10 rounded px-3 py-2 mb-4"
                        />

                        {/* PARENT SELECT */}
                        {type === "sub" && (
                            <>
                                <label className="block text-sm font-medium mb-2">
                                    Select Parent Category
                                </label>
                                <select
                                    value={parent}
                                    onChange={(e) =>
                                        setParent(e.target.value)
                                    }
                                    className="w-full border border-black/10 rounded px-3 py-2 mb-4"
                                >
                                    <option value="">Select parent</option>
                                    {parents.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        <button
                            onClick={addCategory}
                            disabled={loading}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded cursor-pointer"
                        >
                            <Plus size={16} />
                            {loading ? "Adding..." : "Add Category"}
                        </button>
                    </div>

                    {/* CATEGORY LIST */}
                    <div className="bg-white shadow-sm p-6 rounded-md flex-1  overflow-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            Category List
                        </h2>

                        <table className="w-full border-collapse border border-black/10">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                                    <th className="px-4 py-3 w-16 text-center border-r border-black/10">SL</th>
                                    <th className="px-4 py-3 border-r border-black/10">Category</th>
                                    <th className="px-4 py-3 border-r border-black/10">Parent</th>
                                    <th className="px-4 py-3 w-32 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6 text-gray-400">
                                            No categories found
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((cat, index) => (
                                        <React.Fragment key={cat.id}>
                                            {/* PARENT */}
                                            <tr className="border-b border-black/10 bg-slate-100">
                                                <td className="px-4 py-3 text-center font-bold border-r border-black/10">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 font-semibold border-r border-black/10">
                                                    {cat.name}
                                                </td>
                                                <td className="px-4 py-3 border-r border-black/10">Parent</td>
                                                <td className="px-4 py-3 flex justify-center gap-3">
                                                    <button
                                                        onClick={() => editCategory(cat, true)}
                                                        className="text-blue-500 cursor-pointer"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCategory(cat.id)}
                                                        className="text-red-500 cursor-pointer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* SUB CATEGORIES */}
                                            {cat.sub_categories.map((sub) => (
                                                <tr
                                                    key={sub.id}
                                                    className="border-b border-black/10 hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-3 text-center border-r border-black/10">-</td>
                                                    <td className="px-4 py-3 pl-8 border-r border-black/10">{sub.name}</td>
                                                    <td className="px-4 py-3 border-r border-black/10">{cat.name}</td>
                                                    <td className="px-4 py-3 flex justify-center gap-3">
                                                        <button
                                                            onClick={() => editCategory(sub, false)}
                                                            className="text-blue-500 cursor-pointer"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteCategory(sub.id)}
                                                            className="text-red-500 cursor-pointer"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
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

export default Category;

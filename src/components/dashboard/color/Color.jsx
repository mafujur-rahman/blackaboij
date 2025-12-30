"use client";

import React, { useEffect, useState } from "react";
import { Home, ChevronRight, Trash2, Plus, Edit } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import api from "@/lib/axios";

const Color = () => {
  const [colors, setColors] = useState([]);
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [editColor, setEditColor] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
     GET ALL COLORS
  =============================== */
  const fetchColors = async () => {
    try {
      const res = await api.get("/api/colors/get-all-colors/");
      if (res.data?.success) {
        setColors(res.data.data);
      }
    } catch {
      Swal.fire("Error", "Failed to load colors", "error");
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  /* ===============================
     CREATE COLOR
  =============================== */
  const addColor = async () => {
    if (!colorName.trim()) {
      Swal.fire("Warning", "Color name is required", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/color/create-color/", {
        name: colorName,
        hex_code: colorCode,
      });

      if (res.data?.success) {
        Swal.fire("Success", res.data.message, "success");
        setColorName("");
        setColorCode("#000000");
        fetchColors();
      }
    } catch (error) {
      Swal.fire(
        "Error",
         "Color exits, choose another color",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     UPDATE COLOR
  =============================== */
  const updateColor = async () => {
    if (!editColor) return;

    try {
      const res = await api.put(
        `/api/color/update-color/${editColor.id}/`,
        {
          name: colorName,
          hex_code: colorCode,
        }
      );

      if (res.data?.success) {
        Swal.fire("Updated!", res.data.message, "success");

        setColors((prev) =>
          prev.map((c) =>
            c.id === editColor.id
              ? { ...c, name: colorName, hex_code: colorCode }
              : c
          )
        );

        resetForm();
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to update color",
        "error"
      );
    }
  };

  /* ===============================
     DELETE COLOR
  =============================== */
  const deleteColor = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This color will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.delete(`/api/color/delete-color/${id}/`);

      if (res.data?.success) {
        Swal.fire("Deleted!", res.data.message, "success");
        setColors((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to delete color",
        "error"
      );
    }
  };

  /* ===============================
     HELPERS
  =============================== */
  const openEditModal = (color) => {
    setEditColor(color);
    setColorName(color.name);
    setColorCode(color.hex_code);
  };

  const resetForm = () => {
    setEditColor(null);
    setColorName("");
    setColorCode("#000000");
  };

  return (
    <DashboardShell>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Color</h1>
          <div className="flex items-center space-x-2 text-[16px]">
            <Home size={16} />
            <ChevronRight size={14} />
            <span>Products</span>
            <ChevronRight size={14} />
            <span>Color</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Add/Edit Color */}
          <div className="bg-white shadow-sm p-6 rounded-md w-1/3 h-fit">
            <h2 className="text-2xl font-bold mb-4">
              {editColor ? "Edit Color" : "Add New Color"}
            </h2>

            <label className="block text-sm font-medium mb-2">Color Name</label>
            <input
              type="text"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            <label className="block text-sm font-medium mb-2">Color Code</label>
            <div className="flex gap-2 mb-4">
              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-12 h-12 border rounded"
              />
              <input
                type="text"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
              <div
                className="w-12 h-12 border rounded"
                style={{ backgroundColor: colorCode }}
              />
            </div>

            <button
              onClick={editColor ? updateColor : addColor}
              disabled={loading}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded cursor-pointer"
            >
              <Plus size={16} />
              {loading
                ? editColor
                  ? "Updating..."
                  : "Adding..."
                : editColor
                  ? "Update Color"
                  : "Add Color"}
            </button>

          </div>

          {/* Color List */}
          <div className="bg-white shadow-sm p-6 rounded-md flex-1 overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Color List</h2>

            <table className="w-full border border-black/10 border-collapse">
              <thead>
                <tr className="bg-slate-50 uppercase text-[16px] font-bold">
                  <th className="px-4 py-3 text-center border border-black/10">SL</th>
                  <th className="px-4 py-3 text-center border border-black/10">Name</th>
                  <th className="px-4 py-3 text-center border border-black/10">Code</th>
                  <th className="px-4 py-3 text-center border border-black/10">Preview</th>
                  <th className="px-4 py-3 text-center border border-black/10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {colors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-400 border border-black/10">
                      No colors found
                    </td>
                  </tr>
                ) : (
                  colors.map((color, index) => (
                    <tr key={color.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-center font-bold border border-black/10">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-center border border-black/10">{color.name}</td>
                      <td className="px-4 py-4 text-center border border-black/10">{color.hex_code}</td>
                      <td className="px-4 py-4 border border-black/10">
                        <div className="flex justify-center items-center">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color.hex_code }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 flex justify-center gap-3 border-t border-black/10">
                        <button
                          onClick={() => openEditModal(color)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteColor(color.id)}
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

export default Color;

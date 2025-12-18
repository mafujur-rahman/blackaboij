"use client";

import React, { useState } from "react";
import { Home, ChevronRight, Trash2, Plus, Edit } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";

const Color = () => {
  const [colors, setColors] = useState([
    { id: Date.now() + 1, name: "Red", code: "#FF0000" },
    { id: Date.now() + 2, name: "Green", code: "#00FF00" },
    { id: Date.now() + 3, name: "Blue", code: "#0000FF" },
  ]);

  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [editColor, setEditColor] = useState(null);

  const addColor = () => {
    if (!colorName.trim() || !colorCode.trim()) return;
    const newColor = { id: Date.now(), name: colorName, code: colorCode };
    setColors([...colors, newColor]);
    setColorName("");
    setColorCode("#000000");
  };

  const deleteColor = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This color will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setColors(colors.filter((c) => c.id !== id));
        Swal.fire("Deleted!", "Color has been deleted.", "success");
      }
    });
  };

  const updateColor = () => {
    setColors(
      colors.map((c) =>
        c.id === editColor.id ? { ...c, name: colorName, code: colorCode } : c
      )
    );
    setEditColor(null);
    setColorName("");
    setColorCode("#000000");
  };

  const openEditModal = (color) => {
    setEditColor(color);
    setColorName(color.name);
    setColorCode(color.code);
  };

  return (
    <DashboardShell>
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Color Management</h1>
          <div className="flex items-center space-x-2 text-[16px]">
            <Home size={16} />
            <ChevronRight size={14} />
            <span>Products</span>
            <ChevronRight size={14} />
            <span>Color</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Left: Add/Edit Color */}
          <div className="bg-white shadow-sm p-6 rounded-md w-1/3 h-fit">
            <h2 className="text-2xl font-bold mb-4">
              {editColor ? "Edit Color" : "Add New Color"}
            </h2>

            <label className="block text-sm font-medium mb-2">Color Name</label>
            <input
              type="text"
              placeholder="Enter Color Name"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="w-full border border-black/20 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-black"
            />

            <label className="block text-sm font-medium mb-2">Color Code</label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-12 h-12 border border-black/20 rounded cursor-pointer"
              />
              <input
                type="text"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="flex-1 border border-black/20 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
              <div
                className="w-12 h-12 border rounded"
                style={{ backgroundColor: colorCode }}
              />
            </div>

            <button
              onClick={editColor ? updateColor : addColor}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded cursor-pointer"
            >
              <Plus size={16} />
              {editColor ? "Update Color" : "Add Color"}
            </button>
          </div>

          {/* Right: Color List */}
          <div className="bg-white shadow-sm p-6 rounded-md flex-1 max-h-[500px] overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Color List</h2>
            <table className="w-full text-left border-collapse border-l border-r border-black/10">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                  <th className="px-4 py-3 w-16 text-center text-black border-r border-black/10">SL</th>
                  <th className="px-4 py-3 border-r border-black/10">Name</th>
                  <th className="px-4 py-3 border-r border-black/10">Code</th>
                  <th className="px-4 py-3 border-r border-black/10">Preview</th>
                  <th className="px-4 py-3 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((color, index) => (
                  <tr key={color.id} className="border-b border-black/10 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 border-r border-black/10 text-center font-bold text-slate-700">{index + 1}</td>
                    <td className="px-4 py-4 border-r border-black/10 text-slate-700">{color.name}</td>
                    <td className="px-4 py-4 border-r border-black/10 text-slate-700">{color.code}</td>
                    <td className="px-4 py-4 border-r border-black/10">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: color.code }} />
                    </td>
                    <td className="px-4 py-4 text-center flex justify-center gap-2">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default Color;

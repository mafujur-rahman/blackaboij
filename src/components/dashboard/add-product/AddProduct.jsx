"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  Upload,
} from "lucide-react";
import DashboardShell from "../DashboardShell";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";
import api from "@/lib/axios";

const CLOUDINARY_URL = "https://res.cloudinary.com/dwsp8rft8/";

const AddProduct = () => {
  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState("");

  const [sizesList, setSizesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    mainCategoryId: "",
    mainCategoryName: "",
    subCategoryId: "",
    subCategoryName: "",
    price: "",
    qty: "",
    sizes: [],
    colors: [],
    metaTitle: "",
    metaDescription: "",
    thumbnail: null,
    galleryImages: [null, null, null],
  });

  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [parentRes, sizeRes, colorRes] = await Promise.all([
          api.get("/api/categories/get-all-parent-categories/"),
          api.get("/api/sizes/get-all-sizes/"),
          api.get("/api/colors/get-all-colors/"),
        ]);
        setParentCategories(parentRes.data.data || []);
        setSizesList(sizeRes.data.data || []);
        setColorsList(colorRes.data.data || []);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load initial data", "error");
      }
    };
    fetchAll();
  }, []);

  // Fetch subcategories when parent changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!parentCategoryId) return;
      try {
        const res = await api.get("/api/categories/get-category-grouped/");
        const parent = res.data.data.find(
          (p) => p.id === Number(parentCategoryId)
        );
        setSubCategories(parent?.sub_categories || []);
        setForm((prev) => ({
          ...prev,
          subCategoryId: "",
          subCategoryName: "",
        }));
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load sub-categories", "error");
      }
    };
    fetchSubCategories();
  }, [parentCategoryId]);

  // Toggle sizes/colors
  const toggleArray = (field, id) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((v) => v !== id)
        : [...prev[field], id],
    }));
  };

  // File upload
  const handleFileChange = (index, file) => {
    setForm((prev) => {
      const gallery = [...prev.galleryImages];
      gallery[index] = file;
      return { ...prev, galleryImages: gallery };
    });
  };
  const handleThumbnailUpload = (file) => {
    setForm((prev) => ({ ...prev, thumbnail: file }));
  };

  // Submit
  const handleSubmit = async () => {
    if (!form.name || !form.subCategoryId || !form.price || !form.qty) {
      Swal.fire("Warning", "Please fill required fields", "warning");
      return;
    }
    if (!form.colors.length) {
      Swal.fire("Warning", "Please select at least one color", "warning");
      return;
    }

    setLoading(true);
    try {
      // Build JSON payload
      const payload = {
        name: form.name,
        category_id: Number(form.subCategoryId),
        description: form.description || "",
        unit_price: form.price,
        quantity: form.qty,
        size_ids: form.sizes,
        color_ids: form.colors,
        thumbnail_image: form.thumbnail
          ? URL.createObjectURL(form.thumbnail)
          : CLOUDINARY_URL,
        gallery1: form.galleryImages[0]
          ? URL.createObjectURL(form.galleryImages[0])
          : CLOUDINARY_URL,
        gallery2: form.galleryImages[1]
          ? URL.createObjectURL(form.galleryImages[1])
          : CLOUDINARY_URL,
        gallery3: form.galleryImages[2]
          ? URL.createObjectURL(form.galleryImages[2])
          : CLOUDINARY_URL,
        meta_title: form.metaTitle || form.name,
        meta_description: form.metaDescription || form.name,
      };

      await api.post("/api/product/create-product/", payload, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.fire("Success", "Product created successfully", "success");

      setForm({
        name: "",
        description: "",
        mainCategoryId: "",
        mainCategoryName: "",
        subCategoryId: "",
        subCategoryName: "",
        price: "",
        qty: "",
        sizes: [],
        colors: [],
        metaTitle: "",
        metaDescription: "",
        thumbnail: null,
        galleryImages: [null, null, null],
      });
    } catch (err) {
      console.error(err.response?.data);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Product creation failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="min-h-screen space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Add Product</h1>
          <div className="flex items-center space-x-2 text-[16px]">
            <Link href="/" className="hover:text-purple-600 flex items-center">
              <Home size={16} />
            </Link>
            <ChevronRight size={14} />
            <span>Add Product</span>
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="bg-white p-6 rounded-md shadow-sm space-y-6">
          <h2 className="text-xl font-bold">Product Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium mb-1">
                Product Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-black/20 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-[16px] font-medium mb-1">
                Main Category
              </label>
              <select
                value={parentCategoryId}
                onChange={(e) => {
                  const selected = parentCategories.find(
                    (cat) => cat.id === Number(e.target.value)
                  );
                  setParentCategoryId(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    mainCategoryId: e.target.value,
                    mainCategoryName: selected?.name || "",
                  }));
                }}
                className="w-full border border-black/20 rounded px-3 py-2"
              >
                <option value="">Select Main Category</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[16px] font-medium mb-1">
                Sub Category
              </label>
              <select
                value={form.subCategoryId}
                onChange={(e) => {
                  const selected = subCategories.find(
                    (sub) => sub.id === Number(e.target.value)
                  );
                  setForm((prev) => ({
                    ...prev,
                    subCategoryId: e.target.value,
                    subCategoryName: selected?.name || "",
                  }));
                }}
                className="w-full border border-black/20 rounded px-3 py-2"
              >
                <option value="">Select Sub Category</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[16px] font-medium mb-1">Unit Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-black/20 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-[16px] font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                className="w-full border border-black/20 rounded px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[16px] font-medium mb-1">Description</label>
              <div className="border border-black/20 rounded">
                <div className="flex gap-2 border-b bg-gray-50 px-3 py-2 text-gray-600">
                  <Bold size={16} />
                  <Italic size={16} />
                  <Underline size={16} />
                  <Link2 size={16} />
                  <List size={16} />
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  className="w-full p-4 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SIZES */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <label className="block text-[16px] font-medium mb-2">Sizes</label>
          <div className="flex gap-3 flex-wrap">
            {sizesList.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => toggleArray("sizes", size.id)}
                className={`px-4 py-2 rounded border ${form.sizes.includes(size.id)
                    ? "bg-black text-white"
                    : "border-black/20"
                  }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>

        {/* COLORS */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <label className="block text-[16px] font-medium mb-2">Colors</label>
          <div className="flex gap-6 flex-wrap">
            {colorsList.map((c) => (
              <div
                key={c.id}
                onClick={() => toggleArray("colors", c.id)}
                className="cursor-pointer text-center"
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 mx-auto ${form.colors.includes(c.id) ? "border-black" : "border-black/20"
                    }`}
                  style={{ backgroundColor: c.hex_code }}
                />
                <span className="text-[16px] mt-1 block">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MEDIA UPLOAD */}
        <div className="bg-white p-6 rounded-md shadow-sm grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[16px] font-medium mb-2">Thumbnail Image</label>
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded w-fit">
              <Upload size={16} /> Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
            {form.thumbnail && (
              <div className="mt-4 w-24 h-24 relative">
                <Image
                  src={URL.createObjectURL(form.thumbnail)}
                  alt="Thumbnail"
                  width={96}
                  height={96}
                  className="object-cover rounded border"
                />
              </div>
            )}
          </div>

          {[0, 1, 2].map((i) => (
            <div key={i}>
              <label className="block text-[16px] font-medium mb-2">{`Gallery ${i + 1}`}</label>
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded w-fit">
                <Upload size={16} /> Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(i, e.target.files[0])}
                  className="hidden"
                />
              </label>
              {form.galleryImages[i] && (
                <div className="mt-4 w-20 h-20 relative">
                  <Image
                    src={URL.createObjectURL(form.galleryImages[i])}
                    alt={`Gallery ${i + 1}`}
                    width={80}
                    height={80}
                    className="object-cover rounded border"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SEO */}
        <div className="bg-white p-6 rounded-md shadow-sm grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[16px] font-medium mb-1">Meta Title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              className="w-full border border-black/20 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-[16px] font-medium mb-1">Meta Description</label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              rows={3}
              className="w-full border border-black/20 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </DashboardShell>
  );
};

export default AddProduct; 
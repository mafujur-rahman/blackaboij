"use client";

import React, { useEffect, useState } from "react";
import { Home, ChevronRight, Bold, Italic, Underline, Link2, List, Upload, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import DashboardShell from "../DashboardShell";
import Image from "next/image";
import AnimatedButton from "@/components/utils/AnimatedButton";

const EditProduct = () => {
  const { id } = useParams();
  const router = useRouter();

  const mockProduct = {
    id,
    name: "Blackaboij Men's T-Shirt - White Edition",
    mainCategory: "Men",
    subCategory: "Tees",
    price: 40,
    qty: 20,
    sizes: ["M", "XL"],
    colors: ["Black", "White"],
    description: "Premium quality cotton t-shirt.",
    metaTitle: "Men White T-shirt",
    metaDescription: "Buy premium white t-shirt for men",
    galleryImages: [],
    thumbnail: null,
  };

  const [form, setForm] = useState(mockProduct);

  useEffect(() => {
    setForm(mockProduct);
  }, [id]);

  const subCategories = {
    Men: ["Tees", "Hoodies & Sweaters", "Pants", "Outwear", "Shoes"],
    Women: ["Tees", "Hoodies & Sweaters", "Pants", "Outwear", "Shoes"],
    Accessories: ["Men Accessories", "Women Accessories"],
  };

  const colorList = [
    { name: "Black", code: "#000000" },
    { name: "White", code: "#FFFFFF" },
    { name: "Gray", code: "#9CA3AF" },
    { name: "Pink", code: "#EC4899" },
  ];

  const toggleArray = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  /* ---------- IMAGE HANDLERS ---------- */
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setForm((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...previews],
    }));
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      thumbnail: {
        file,
        url: URL.createObjectURL(file),
      },
    }));
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = () => {
    Swal.fire({
      title: "Update Product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "Update",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Updated!", "Product updated successfully.", "success");
        router.push("/dashboard/product-list");
      }
    });
  };

  return (
    <DashboardShell>
      <div className="min-h-screen">

        {/* HEADER */}
        <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Edit Product</h1>
          <div className="flex items-center space-x-2 text-[16px]">
            <Link href="/" className="flex items-center space-x-1 hover:text-purple-600"><Home size={16} /></Link>
            <ChevronRight size={14} />
            <span>Products</span>
            <ChevronRight size={14} />
            <span>Edit Product</span>
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Product Information</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium mb-1">Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-black/20 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-[16px] font-medium mb-1">Main Category</label>
              <select
                value={form.mainCategory}
                onChange={(e) => setForm({ ...form, mainCategory: e.target.value, subCategory: "" })}
                className="w-full border border-black/20 rounded px-3 py-2"
              >
                <option>Men</option>
                <option>Women</option>
                <option>Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-[16px] font-medium mb-1">Sub Category</label>
              <select
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                className="w-full border border-black/20 rounded px-3 py-2"
              >
                {subCategories[form.mainCategory]?.map((sub) => (
                  <option key={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <label className="block text-[16px] font-medium mb-1">Product Description</label>
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

        {/* PRICING */}
        <div className="bg-white p-6 rounded-md shadow-sm mb-6 grid grid-cols-2 gap-6">
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
        </div>

        {/* SIZES & COLORS */}
        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-4">Sizes & Colors</h2>

          {/* Sizes */}
          <label className="block text-[16px] font-medium mb-2">Sizes</label>
          <div className="flex gap-3 mb-6">
            {["XL", "M", "XXL"].map(s => (
              <button
                key={s}
                onClick={() => toggleArray("sizes", s)}
                className={`px-4 py-2 rounded border ${form.sizes.includes(s) ? "bg-black text-white" : "border-black/20"}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Colors */}
          <label className="block text-[16px] font-medium mb-2">Colors</label>
          <div className="flex gap-6">
            {colorList.map(c => (
              <div key={c.name} onClick={() => toggleArray("colors", c.name)} className="cursor-pointer text-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 mx-auto ${form.colors.includes(c.name) ? "border-black" : "border-black/20"}`}
                  style={{ backgroundColor: c.code }}
                />
                <span className="text-[16px] mt-1 block">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MEDIA */}
        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-4">Product Media</h2>

          <div className="grid grid-cols-2 gap-6">

            {/* GALLERY */}
            <div>
              <label className="block text-[16px] font-medium mb-2">Gallery Images (600x600)</label>
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded w-fit">
                <Upload size={16} /> Choose Images
                <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
              </label>

              {/* Gallery previews at bottom */}
              <div className="flex gap-3 mt-4 flex-wrap">
                {form.galleryImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <Image src={img.url} alt={`Gallery ${i+1}`} width={80} height={80} className="object-cover rounded border" />
                    <button onClick={() => removeGalleryImage(i)} className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* THUMBNAIL */}
            <div>
              <label className="block text-[16px] font-medium mb-2">Thumbnail Image (300x300)</label>
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded w-fit">
                <Upload size={16} /> Choose Image
                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
              </label>

              {form.thumbnail && (
                <div className="mt-4 w-24 h-24 relative">
                  <Image src={form.thumbnail.url} alt="Thumbnail" width={96} height={96} className="object-cover rounded border" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white p-6 rounded-md shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-4">Product SEO</h2>
          <div className="grid grid-cols-2 gap-6">
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
        </div>

        {/* UPDATE BUTTON */}
        <div className="flex justify-end">
          <AnimatedButton variant="black" onClick={handleUpdate}>Update Product</AnimatedButton>
        </div>

      </div>
    </DashboardShell>
  );
};

export default EditProduct;

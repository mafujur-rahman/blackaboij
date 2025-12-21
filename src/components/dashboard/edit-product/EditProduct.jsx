"use client";

import React, { useEffect, useState } from "react";
import { Home, ChevronRight, Bold, Italic, Underline, Link2, List, Upload, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import DashboardShell from "../DashboardShell";
import Image from "next/image";
import api from "@/lib/axios";

const EditProduct = () => {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    mainCategoryId: "",
    subCategoryId: "",
    price: 0,
    qty: 0,
    sizes: [],
    colors: [],
    description: "",
    metaTitle: "",
    metaDescription: "",
    galleryImages: [],
    thumbnail: null,
  });

  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------ FETCH INITIAL DATA ------------------ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        const [parentRes, sizeRes, colorRes] = await Promise.all([
          api.get("/api/categories/get-all-parent-categories/", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/api/sizes/get-all-sizes/", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/api/colors/get-all-colors/", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setParentCategories(parentRes.data.data || []);
        setSizesList(sizeRes.data.data || []);
        setColorsList(colorRes.data.data || []);

        // Fetch product details
        const prodRes = await api.get(`/api/products/get-all-products/`, { headers: { Authorization: `Bearer ${token}` } });
        const product = prodRes.data.data.find((p) => p.id === Number(id));
        if (!product) return;

        setForm({
          name: product.name,
          mainCategoryId: product.category.parent,
          subCategoryId: product.category.id,
          price: product.unit_price,
          qty: product.quantity,
          sizes: product.sizes.map((s) => s.id),
          colors: product.colors.map((c) => c.id),
          description: product.description,
          metaTitle: product.meta_title,
          metaDescription: product.meta_description,
          galleryImages: [],
          thumbnail: product.thumbnail_image ? { file: null, url: product.thumbnail_image } : null,
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ------------------ FETCH SUBCATEGORIES ON PARENT CHANGE ------------------ */
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!form.mainCategoryId) return;
      try {
        const res = await api.get("/api/categories/get-category-grouped/");
        const parent = res.data.data.find((p) => p.id === Number(form.mainCategoryId));
        setSubCategories(parent?.sub_categories || []);
        if (!parent?.sub_categories.find((s) => s.id === form.subCategoryId)) {
          setForm((prev) => ({ ...prev, subCategoryId: "" })); // reset if invalid
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load sub-categories", "error");
      }
    };

    fetchSubCategories();
  }, [form.mainCategoryId]);

  const toggleArray = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  /* ------------------ IMAGE HANDLERS ------------------ */
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setForm((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, ...previews] }));
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, thumbnail: { file, url: URL.createObjectURL(file) } }));
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  };

  /* ------------------ UPDATE PRODUCT ------------------ */
  const handleUpdate = async () => {
    Swal.fire({
      title: "Update Product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "Update",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const token = localStorage.getItem("auth_token");
        const formData = new FormData();

        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("unit_price", form.price);
        formData.append("quantity", form.qty);
        formData.append("category_id", form.subCategoryId);
        form.sizes.forEach((id) => formData.append("size_ids[]", id));
        form.colors.forEach((id) => formData.append("color_ids[]", id));
        formData.append("meta_title", form.metaTitle);
        formData.append("meta_description", form.metaDescription);

        if (form.thumbnail?.file) formData.append("thumbnail_image", form.thumbnail.file);
        form.galleryImages.forEach((img, i) => formData.append(`gallery${i + 1}`, img.file));

        const res = await api.put(`/api/product/update-product/${id}/`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          Swal.fire("Updated!", res.data.message, "success");
          router.push("/dashboard/product-list");
        } else {
          Swal.fire("Error", res.data.message, "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to update product", "error");
      }
    });
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

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
                value={form.mainCategoryId}
                onChange={(e) => setForm({ ...form, mainCategoryId: e.target.value })}
                className="w-full border border-black/20 rounded px-3 py-2"
              >
                <option value="">Select Main Category</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[16px] font-medium mb-1">Sub Category</label>
              <select
                value={form.subCategoryId}
                onChange={(e) => setForm({ ...form, subCategoryId: e.target.value })}
                className="w-full border border-black/20 rounded px-3 py-2"
              >
                <option value="">Select Sub Category</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
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

          {/* PRICING */}
          <div className="mt-6 grid grid-cols-2 gap-6">
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

          {/* SIZES */}
          <div className="mt-6">
            <label className="block text-[16px] font-medium mb-2">Sizes</label>
            <div className="flex gap-3 flex-wrap">
              {sizesList.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => toggleArray("sizes", size.id)}
                  className={`px-4 py-2 rounded border ${form.sizes.includes(size.id) ? "bg-black text-white" : "border-black/20"
                    }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* COLORS */}
          <div className="mt-6">
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
          <div className="mt-6 grid grid-cols-2 gap-6">
            {/* GALLERY */}
            <div>
              <label className="block text-[16px] font-medium mb-2">Gallery Images (600x600)</label>
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded w-fit">
                <Upload size={16} /> Choose Images
                <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
              </label>

              <div className="flex gap-3 mt-4 flex-wrap">
                {form.galleryImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <Image src={img.url} alt={`Gallery ${i + 1}`} width={80} height={80} className="object-cover rounded border" />
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

          {/* SEO */}
          <div className="mt-6 grid grid-cols-2 gap-6">
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

          {/* UPDATE BUTTON */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded cursor-pointer"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default EditProduct;

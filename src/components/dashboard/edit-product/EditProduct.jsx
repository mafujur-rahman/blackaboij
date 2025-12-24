"use client";

import React, { useEffect, useState } from "react";
import {
  Home,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import api from "@/lib/axios";
import DashboardShell from "../DashboardShell";
import { getImageUrl } from "@/components/utils/get-image-url";

const EditProduct = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [parentCategoryId, setParentCategoryId] = useState("");

  const [form, setForm] = useState({
    name: "",
    mainCategoryId: "",
    subCategoryId: "",
    price: "",
    qty: "",
    sizes: [],
    colors: [],
    description: "",
    metaTitle: "",
    metaDescription: "",
    thumbnail: null,
    galleryImages: [
      null,
      null,
      null,
    ],
  });



  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        const [parents, sizes, colors, products] = await Promise.all([
          api.get("/api/categories/get-all-parent-categories/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/sizes/get-all-sizes/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/colors/get-all-colors/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/products/get-all-products/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setParentCategories(parents.data.data || []);
        setSizesList(sizes.data.data || []);
        setColorsList(colors.data.data || []);

        const product = products.data.data.find(
          (p) => p.id === Number(id)
        );
        if (!product) return;

        setParentCategoryId(product.category.parent);

        setForm({
          name: product.name,
          mainCategoryId: product.category.parent,
          subCategoryId: product.category.id,
          price: product.unit_price,
          qty: product.quantity,
          sizes: product.sizes.map((s) => s.id),
          colors: product.colors.map((c) => c.id),
          description: product.description,
          metaTitle: product.meta_title || "",
          metaDescription: product.meta_description || "",
          thumbnail: product.thumbnail_image
            ? { file: null, url: product.thumbnail_image }
            : null,
          galleryImages: [],
        });
      } catch (err) {
        Swal.fire("Error", "Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  /* ---------------- SUB CATEGORIES ---------------- */
  useEffect(() => {
    if (!parentCategoryId) return;

    const fetchSubs = async () => {
      const res = await api.get("/api/categories/get-category-grouped/");
      const parent = res.data.data.find(
        (p) => p.id === Number(parentCategoryId)
      );
      setSubCategories(parent?.sub_categories || []);
    };

    fetchSubs();
  }, [parentCategoryId]);

  /* ---------------- HELPERS ---------------- */
  const toggleArray = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleThumbnailUpload = (file) => {
    if (!file) return;
    setForm((prev) => ({ ...prev, thumbnail: file }));
  };

  const handleGalleryChange = (index, file) => {
    if (!file) return;
    const updated = [...form.galleryImages];
    updated[index] = file;
    setForm((prev) => ({ ...prev, galleryImages: updated }));
  };

  const previewSrc = (img) => {
    if (!img) return null;
    if (img instanceof File) return URL.createObjectURL(img);
    if (img.url) return getImageUrl(img.url);
    return null;
  };

  /* ---------------- UPDATE ---------------- */
  const handleUpdate = async () => {
    const confirm = await Swal.fire({
      title: "Update Product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "Update",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("unit_price", form.price);
      formData.append("quantity", form.qty);
      formData.append("category_id", form.subCategoryId);
      formData.append("meta_title", form.metaTitle);
      formData.append("meta_description", form.metaDescription);

      form.sizes.forEach((id) => formData.append("size_ids[]", id));
      form.colors.forEach((id) => formData.append("color_ids[]", id));

      if (form.thumbnail?.file) {
        formData.append("thumbnail_image", form.thumbnail.file);
      }

      form.galleryImages.forEach((img, i) => {
        if (img.file) formData.append(`gallery${i + 1}`, img.file);
      });

      await api.put(`/api/product/update-product/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Updated!", "Product updated successfully", "success");
      router.push("/dashboard/product-list");
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  if (loading) return <div className="flex justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
  </div>;

  return (
    <DashboardShell>
      <div className="min-h-screen space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Edit Product</h1>
          <div className="flex items-center space-x-2 text-[16px]">
            <Link href="/" className="hover:text-purple-600 flex items-center">
              <Home size={16} />
            </Link>
            <ChevronRight size={14} />
            <span>Edit Product</span>
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="bg-white p-6 rounded-md shadow-sm space-y-6">
          <h2 className="text-xl font-bold">Product Information</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-[16px] font-medium mb-1">
                Product Name
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full border border-black/20 rounded px-3 py-2"
              />
            </div>

            {/* Main Category */}
            <div>
              <label className="block text-[16px] font-medium mb-1">
                Main Category
              </label>
              <select
                value={parentCategoryId}
                onChange={(e) => {
                  setParentCategoryId(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    mainCategoryId: e.target.value,
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

            {/* Sub Category */}
            <div>
              <label className="block text-[16px] font-medium mb-1">
                Sub Category
              </label>
              <select
                value={form.subCategoryId}
                onChange={(e) =>
                  setForm({ ...form, subCategoryId: e.target.value })
                }
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

            {/* Price */}
            <div>
              <label className="block text-[16px] font-medium mb-1">
                Unit Price
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                className="w-full border border-black/20 rounded px-3 py-2"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[16px] font-medium mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={form.qty}
                onChange={(e) =>
                  setForm({ ...form, qty: e.target.value })
                }
                className="w-full border border-black/20 rounded px-3 py-2"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-[16px] font-medium mb-1">
                Description
              </label>
              <div className="border border-black/20 rounded">
                <div className="flex gap-2 border-b bg-gray-50 px-3 py-2 text-gray-600">
                  <Bold size={16} />
                  <Italic size={16} />
                  <Underline size={16} />
                  <Link2 size={16} />
                  <List size={16} />
                </div>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
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
                  className={`w-10 h-10 rounded-full border-2 mx-auto ${form.colors.includes(c.id)
                    ? "border-black"
                    : "border-black/20"
                    }`}
                  style={{ backgroundColor: c.hex_code }}
                />
                <span className="text-[16px] mt-1 block">{c.name}</span>
              </div>
            ))}
          </div>
        </div>


        {/* MEDIA UPLOAD */}
        <div className="bg-white p-6 rounded-md shadow-sm space-y-6">
          <h2 className="text-xl font-bold">Media</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* THUMBNAIL */}
            <div>
              <label className="block text-[16px] font-medium mb-2">
                Thumbnail Image
              </label>

              <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded w-fit">
                <Upload size={16} />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>

              {form.thumbnail && (
                <div className="mt-4 w-24 h-24">
                  <Image
                    src={previewSrc(form.thumbnail)}
                    alt="Thumbnail"
                    width={96}
                    height={96}
                    className="object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* GALLERY SELECTORS */}
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <label className="block text-[16px] font-medium mb-2">
                    Gallery {i + 1}
                  </label>

                  <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded">
                    <Upload size={16} />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleGalleryChange(i, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* GALLERY PREVIEW  */}
          <div className="flex gap-4">
            {form.galleryImages.map(
              (img, i) =>
                img && (
                  <div key={i} className="w-20 h-20">
                    <Image
                      src={previewSrc(img)}
                      alt={`Gallery ${i + 1}`}
                      width={80}
                      height={80}
                      className="object-cover rounded border"
                    />
                  </div>
                )
            )}
          </div>
        </div>


        {/* SEO */}
        <div className="bg-white p-6 rounded-md shadow-sm grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[16px] font-medium mb-1">
              Meta Title
            </label>
            <input
              value={form.metaTitle}
              onChange={(e) =>
                setForm({ ...form, metaTitle: e.target.value })
              }
              className="w-full border border-black/20 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-[16px] font-medium mb-1">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={form.metaDescription}
              onChange={(e) =>
                setForm({
                  ...form,
                  metaDescription: e.target.value,
                })
              }
              className="w-full border border-black/20 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-black text-white rounded"
          >
            Update Product
          </button>
        </div>
      </div>
    </DashboardShell>
  );
};

export default EditProduct;

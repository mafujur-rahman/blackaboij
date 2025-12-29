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
  Loader2,
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
  const [updating, setUpdating] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    mainCategoryId: "",
    subCategoryId: "",
    price: "",
    qty: "",
    sizes: [],
    colors: [],
    metaTitle: "",
    metaDescription: "",
    thumbnail: null,
    galleryImages: [null, null, null],
    hotSale: false,
  });

  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);

  const [errors, setErrors] = useState({
    sizes: false,
    colors: false,
  });

  /* ---------------- SHOW LOADING STATE ---------------- */
  useEffect(() => {
    if (loading) {
      // Show a subtle loading indicator in the UI
      document.body.style.cursor = "wait";
    } else {
      document.body.style.cursor = "default";
    }

    return () => {
      document.body.style.cursor = "default";
    };
  }, [loading]);

  /* ---------------- FETCH PRODUCT DATA ---------------- */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [parents, sizes, colors, products] = await Promise.all([
          api.get("/api/categories/get-all-parent-categories/"),
          api.get("/api/sizes/get-all-sizes/"),
          api.get("/api/colors/get-all-colors/"),
          api.get("/api/products/get-all-products/"),
        ]);

        setParentCategories(parents.data.data || []);
        setSizesList(sizes.data.data || []);
        setColorsList(colors.data.data || []);

        const product = products.data.data.find(
          (p) => p.id === Number(id)
        );

        if (!product) {
          Swal.fire("Error", "Product not found", "error");
          router.push("/dashboard/product-list");
          return;
        }

        // Set parent category ID for subcategory fetching
        setParentCategoryId(product.category.parent);

        // Process gallery images from product data
        const galleryImages = [
          product.gallery1 ? { url: product.gallery1, file: null } : null,
          product.gallery2 ? { url: product.gallery2, file: null } : null,
          product.gallery3 ? { url: product.gallery3, file: null } : null,
        ];

        setForm({
          name: product.name,
          description: product.description || "",
          mainCategoryId: product.category.parent,
          subCategoryId: product.category.id,
          price: product.unit_price,
          qty: product.quantity,
          sizes: product.sizes?.map((s) => s.id) || [],
          colors: product.colors?.map((c) => c.id) || [],
          metaTitle: product.meta_title || "",
          metaDescription: product.meta_description || "",
          thumbnail: product.thumbnail_image
            ? { url: product.thumbnail_image, file: null }
            : null,
          galleryImages: galleryImages,
          hotSale: product.hot_sale || false,
        });

      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load product data", "error");
        router.push("/dashboard/product-list");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, router]);

  /* ---------------- FETCH SUB CATEGORIES ---------------- */
  useEffect(() => {
    if (!parentCategoryId) return;

    const fetchSubs = async () => {
      try {
        const res = await api.get("/api/categories/get-category-grouped/");
        const parent = res.data.data.find(
          (p) => p.id === Number(parentCategoryId)
        );
        setSubCategories(parent?.sub_categories || []);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load sub-categories", "error");
      }
    };

    fetchSubs();
  }, [parentCategoryId]);

  /* ---------------- HELPERS ---------------- */
  const toggleArray = (key, value) => {
    const newArray = form[key].includes(value)
      ? form[key].filter((v) => v !== value)
      : [...form[key], value];

    setForm((prev) => ({
      ...prev,
      [key]: newArray,
    }));

    // Clear error when selection is made
    if (newArray.length > 0) {
      setErrors((prev) => ({
        ...prev,
        [key === "sizes" ? "sizes" : "colors"]: false,
      }));
    }
  };

  const handleThumbnailUpload = (file) => {
    if (file && file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Image size must be less than 10MB", "error");
      return;
    }
    setForm((prev) => ({
      ...prev,
      thumbnail: file ? { file: file, url: URL.createObjectURL(file) } : null
    }));
  };

  const handleGalleryChange = (index, file) => {
    if (file && file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Image size must be less than 10MB", "error");
      return;
    }
    const updated = [...form.galleryImages];
    updated[index] = file ? { file: file, url: URL.createObjectURL(file) } : null;
    setForm((prev) => ({ ...prev, galleryImages: updated }));
  };

  const removeGalleryImage = (index) => {
    const updated = [...form.galleryImages];
    updated[index] = null;
    setForm((prev) => ({ ...prev, galleryImages: updated }));
  };

  const getImagePreview = (img) => {
    if (!img) return null;
    if (img.url && img.url.startsWith('blob:')) return img.url;
    if (img.url) return getImageUrl(img.url);
    return null;
  };

  // Handle hot sale toggle
  const handleHotSaleToggle = () => {
    setForm((prev) => ({ ...prev, hotSale: !prev.hotSale }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      sizes: form.sizes.length === 0,
      colors: form.colors.length === 0,
    };

    setErrors(newErrors);

    // Check for basic required fields
    if (!form.name || !form.subCategoryId || !form.price || !form.qty) {
      Swal.fire("Warning", "Please fill all required fields", "warning");
      return false;
    }

    // Check for size and color selections
    if (newErrors.sizes || newErrors.colors) {
      if (newErrors.sizes && newErrors.colors) {
        Swal.fire("Warning", "Please select at least one size and one color", "warning");
      } else if (newErrors.sizes) {
        Swal.fire("Warning", "Please select at least one size", "warning");
      } else if (newErrors.colors) {
        Swal.fire("Warning", "Please select at least one color", "warning");
      }
      return false;
    }

    return true;
  };

  /* ---------------- UPDATE PRODUCT ---------------- */
  const handleUpdate = async () => {
    // Validation
    if (!validateForm()) {
      return;
    }

    const confirm = await Swal.fire({
      title: "Update Product?",
      text: "Are you sure you want to update this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    setUpdating(true);

    try {
      // Create FormData with correct format
      const formData = new FormData();

      // Add text fields
      formData.append("name", form.name);
      formData.append("category_id", form.subCategoryId);
      formData.append("description", form.description || "");
      formData.append("unit_price", form.price);
      formData.append("quantity", form.qty);
      formData.append("meta_title", form.metaTitle || form.name);
      formData.append("meta_description", form.metaDescription || form.name);

      // Add hot sale if checked
      if (form.hotSale) {
        formData.append("hot_sale", "true");
      }

      // FIX: Add sizes as individual values (not as array indices)
      form.sizes.forEach((sizeId) => {
        formData.append("size_ids", sizeId);
      });

      // FIX: Add colors as individual values (not as array indices)
      form.colors.forEach((colorId) => {
        formData.append("color_ids", colorId);
      });

      // Add thumbnail if new file selected
      if (form.thumbnail?.file) {
        formData.append("thumbnail_image", form.thumbnail.file);
      }

      // Add gallery images if new files selected
      if (form.galleryImages[0]?.file) {
        formData.append("gallery1", form.galleryImages[0].file);
      }
      if (form.galleryImages[1]?.file) {
        formData.append("gallery2", form.galleryImages[1].file);
      }
      if (form.galleryImages[2]?.file) {
        formData.append("gallery3", form.galleryImages[2].file);
      }

      // Show loading alert
      Swal.fire({
        title: 'Updating Product...',
        text: 'Please wait while we update your product',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Send to backend API
      await api.put(`/api/product/update-product/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Close loading and show success
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Updated Successfully!",
        text: "Product has been updated",
        confirmButtonText: "OK",
        confirmButtonColor: "#000",
        timer: 3000
      }).then(() => {
        router.push("/dashboard/product-list");
      });

    } catch (err) {
      // Close loading alert
      Swal.close();

      // Show error with more details
      let errorMessage = "Update failed. Please try again.";
      let errorDetails = "";

      if (err.response?.data) {
        console.error("Backend error response:", err.response.data);

        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
        if (err.response.data.errors) {
          errorDetails = JSON.stringify(err.response.data.errors);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        html: errorDetails ?
          `<div>${errorMessage}</div><div class="text-sm mt-2">${errorDetails}</div>` :
          errorMessage,
        confirmButtonText: "OK",
        confirmButtonColor: "#000"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DashboardShell isLoading={loading}>
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
        </div>
      ) : (
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
              <div>
                <label className="block text-[16px] font-medium mb-1">
                  Product Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-black/20 rounded px-3 py-2"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-[16px] font-medium mb-1">
                  Main Category *
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
                  Sub Category *
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
                  disabled={!parentCategoryId}
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
                <label className="block text-[16px] font-medium mb-1">Unit Price *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-black/20 rounded px-3 py-2"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-[16px] font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  className="w-full border border-black/20 rounded px-3 py-2"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* HOT SALE CHECKBOX */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="hotSale"
                  checked={form.hotSale}
                  onChange={handleHotSaleToggle}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="hotSale" className="text-[16px] font-medium">
                  Hot Sale
                </label>
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
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SIZES */}
          <div className="bg-white p-6 rounded-md shadow-sm">
            <label className="block text-[16px] font-medium mb-2">
              Sizes *
              {errors.sizes && <span className="text-red-500 ml-2">(Please select at least one size)</span>}
            </label>
            <div className="flex gap-3 flex-wrap">
              {sizesList.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => toggleArray("sizes", size.id)}
                  className={`px-4 py-2 rounded border transition ${form.sizes.includes(size.id)
                    ? "bg-black text-white border-black"
                    : errors.sizes
                      ? "border-red-500 hover:border-red-600"
                      : "border-black/20 hover:border-black"
                    }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
            {errors.sizes && (
              <p className="text-sm text-red-500 mt-2">
                * Please select at least one size
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Selected sizes: {form.sizes.length > 0 ? form.sizes.map(id => {
                const size = sizesList.find(s => s.id === id);
                return size ? size.name : id;
              }).join(", ") : "None"}
            </p>
          </div>

          {/* COLORS */}
          <div className="bg-white p-6 rounded-md shadow-sm">
            <label className="block text-[16px] font-medium mb-2">
              Colors *
              {errors.colors && <span className="text-red-500 ml-2">(Please select at least one color)</span>}
            </label>
            <div className="flex gap-6 flex-wrap">
              {colorsList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleArray("colors", c.id)}
                  className="cursor-pointer text-center group"
                >
                  <div
                    className={`w-12 h-12 rounded-full border-2 mx-auto transition ${form.colors.includes(c.id)
                      ? "border-black scale-110 shadow"
                      : errors.colors
                        ? "border-red-500 group-hover:border-red-600"
                        : "border-black/20 group-hover:border-black/60"
                      }`}
                    style={{ backgroundColor: c.hex_code || c.code || '#cccccc' }}
                  />
                  <span className="text-[14px] mt-2 block font-medium">{c.name}</span>
                  {c.hex_code && (
                    <span className="text-[12px] text-gray-500 block">{c.hex_code}</span>
                  )}
                </div>
              ))}
            </div>
            {errors.colors && (
              <p className="text-sm text-red-500 mt-2">
                * Please select at least one color
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Selected colors: {form.colors.length > 0 ? form.colors.map(id => {
                const color = colorsList.find(c => c.id === id);
                return color ? color.name : id;
              }).join(", ") : "None"}
            </p>
          </div>

          {/* MEDIA UPLOAD */}
          <div className="bg-white p-6 rounded-md shadow-sm space-y-6">
            <h2 className="text-xl font-bold">Product Images</h2>

            <div className="grid grid-cols-2 gap-6">
              {/* THUMBNAIL */}
              <div>
                <label className="block text-[16px] font-medium mb-2">
                  Thumbnail Image
                </label>
                <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded w-fit hover:bg-gray-800 transition">
                  <Upload size={16} /> Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {form.thumbnail && (
                  <div className="mt-4">
                    <div className="w-32 h-32 relative border border-black/10 rounded overflow-hidden">
                      <Image
                        src={getImagePreview(form.thumbnail)}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {form.thumbnail.file ? "New image selected" : "Current image"}
                    </p>
                  </div>
                )}
              </div>

              {/* GALLERY IMAGES */}
              <div>
                <label className="block text-[16px] font-medium mb-2">
                  Gallery Images
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition">
                        <Upload size={14} /> Gallery {i + 1}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGalleryChange(i, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {form.galleryImages[i] && (
                        <div className="relative">
                          <div className="w-20 h-20 relative border border-black/10 rounded overflow-hidden">
                            <Image
                              src={getImagePreview(form.galleryImages[i])}
                              alt={`Gallery ${i + 1} preview`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeGalleryImage(i)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {form.galleryImages[i].file ? "New" : "Current"}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white p-6 rounded-md shadow-sm grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium mb-1">Meta Title</label>
              <input
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full border border-black/20 rounded px-3 py-2"
                placeholder="SEO title for search engines"
              />
            </div>
            <div>
              <label className="block text-[16px] font-medium mb-1">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                rows={3}
                className="w-full border border-black/20 rounded px-3 py-2"
                placeholder="SEO description for search engines"
              />
            </div>
          </div>

          {/* UPDATE BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={updating || loading}
              className={`px-8 py-3 rounded font-medium transition flex items-center gap-2 ${updating || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
                }`}
            >
              {updating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default EditProduct;
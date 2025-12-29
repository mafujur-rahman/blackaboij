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
    hotSale: false,
  });

  const [errors, setErrors] = useState({
    sizes: false,
    colors: false,
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

  // Toggle sizes/colors with validation
  const toggleArray = (field, id) => {
    const newArray = form[field].includes(id)
      ? form[field].filter((v) => v !== id)
      : [...form[field], id];
    
    setForm((prev) => ({
      ...prev,
      [field]: newArray,
    }));

    // Clear error when selection is made
    if (newArray.length > 0) {
      setErrors((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  // File upload handlers
  const handleFileChange = (index, file) => {
    if (file && file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Image size must be less than 10MB", "error");
      return;
    }
    setForm((prev) => {
      const gallery = [...prev.galleryImages];
      gallery[index] = file;
      return { ...prev, galleryImages: gallery };
    });
  };
  
  const handleThumbnailUpload = (file) => {
    if (file && file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Image size must be less than 10MB", "error");
      return;
    }
    setForm((prev) => ({ ...prev, thumbnail: file }));
  };

  // Handle hot sale toggle
  const handleHotSaleToggle = () => {
    setForm((prev) => ({ ...prev, hotSale: !prev.hotSale }));
  };

  // Create FormData for backend upload - FIXED VERSION
  const createFormData = () => {
    const formData = new FormData();
    
    // Add text fields - convert to appropriate types
    formData.append("name", form.name);
    formData.append("category_id", form.subCategoryId);
    formData.append("description", form.description || "");
    formData.append("unit_price", form.price);
    formData.append("quantity", form.qty);
    
    // Add meta fields
    formData.append("meta_title", form.metaTitle || form.name);
    formData.append("meta_description", form.metaDescription || form.name);
    
    // Add hot sale - only send if true
    if (form.hotSale) {
      formData.append("hot_sale", "true");
    }
    
    // FIX: Add each size individually - this creates an array in FormData
    form.sizes.forEach((sizeId) => {
      formData.append("size_ids", sizeId); // Just append, not as array
    });
    
    // FIX: Add each color individually - this creates an array in FormData
    form.colors.forEach((colorId) => {
      formData.append("color_ids", colorId); // Just append, not as array
    });
    
    // Add thumbnail
    if (form.thumbnail) {
      formData.append("thumbnail_image", form.thumbnail);
    }
    
    // Add gallery images
    if (form.galleryImages[0]) {
      formData.append("gallery1", form.galleryImages[0]);
    }
    if (form.galleryImages[1]) {
      formData.append("gallery2", form.galleryImages[1]);
    }
    if (form.galleryImages[2]) {
      formData.append("gallery3", form.galleryImages[2]);
    }
    
    return formData;
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
    
    // Check for thumbnail
    if (!form.thumbnail) {
      Swal.fire("Warning", "Please upload a thumbnail image", "warning");
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

  // Submit product
  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData
      const formData = createFormData();

      // Log what we're sending for debugging
      console.log("Submitting form data:");
      console.log("Sizes:", form.sizes);
      console.log("Colors:", form.colors);
      
      // Convert FormData to object for logging
      const formDataObj = {};
      for (let pair of formData.entries()) {
        const key = pair[0];
        const value = pair[1];
        
        // Group array values
        if (key === "size_ids" || key === "color_ids") {
          if (!formDataObj[key]) {
            formDataObj[key] = [];
          }
          formDataObj[key].push(value);
        } else {
          formDataObj[key] = value;
        }
      }
      console.log("FormData being sent:", formDataObj);

      // Show loading alert
      Swal.fire({
        title: 'Adding Product...',
        text: 'Please wait while we save your product',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Send to backend API
      const response = await api.post("/api/product/create-product/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Close loading alert and show success
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Product Added Successfully!",
        text: `${form.name} has been added to your store`,
        confirmButtonText: "OK",
        confirmButtonColor: "#000",
        timer: 3000
      });

      // Reset form
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
        hotSale: false,
      });
      setParentCategoryId("");
      setErrors({
        sizes: false,
        colors: false,
      });

    } catch (err) {
      // Close loading alert
      Swal.close();
      
      // Show error with more details
      let errorMessage = "Product creation failed. Please try again.";
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
                min="0"
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
        <div className="bg-white p-6 rounded-md shadow-sm grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[16px] font-medium mb-2">
              Thumbnail Image *
            </label>
            <label className="flex items-center justify-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded w-fit hover:bg-gray-800 transition">
              <Upload size={16} /> Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
            {form.thumbnail && (
              <div className="mt-4">
                <p className="text-sm text-green-600 mb-2">✓ Image selected</p>
                <div className="w-32 h-32 relative border border-black/10 rounded overflow-hidden">
                  <Image
                    src={URL.createObjectURL(form.thumbnail)}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {form.thumbnail.name} ({Math.round(form.thumbnail.size / 1024)}KB)
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              * Required - This will be the main product image
            </p>
          </div>

          {[0, 1, 2].map((i) => (
            <div key={i}>
              <label className="block text-[16px] font-medium mb-2">
                {`Gallery ${i + 1}`}
              </label>
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-800 text-white px-4 py-2 rounded w-fit hover:bg-gray-700 transition">
                <Upload size={16} /> Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(i, e.target.files[0])}
                  className="hidden"
                />
              </label>
              {form.galleryImages[i] && (
                <div className="mt-4">
                  <p className="text-sm text-green-600 mb-2">✓ Image selected</p>
                  <div className="w-24 h-24 relative border border-black/10 rounded overflow-hidden">
                    <Image
                      src={URL.createObjectURL(form.galleryImages[i])}
                      alt={`Gallery ${i + 1} preview`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.galleryImages[i].name} ({Math.round(form.galleryImages[i].size / 1024)}KB)
                  </p>
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

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-3 rounded font-medium transition flex items-center gap-2 ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
              }`}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </div>
    </DashboardShell>
  );
};

export default AddProduct;
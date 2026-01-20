"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Home,
  ChevronRight,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  Heading,
  Quote,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import api from "@/lib/axios";
import DashboardShell from "../DashboardShell";
import { getImageUrl } from "@/components/utils/get-image-url";

// Import TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';

const EditProduct = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState("");

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
    images: [],
    thumbnailIndex: 0,
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

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // TipTap Editor - Initialize only on client side
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
    ],
    content: descriptionContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm(prev => ({ ...prev, description: html }));
      setDescriptionContent(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4',
      },
    },
    immediatelyRender: false,
  }, [mounted]);

  // Update editor when descriptionContent changes
  useEffect(() => {
    if (editor && descriptionContent && editor.isEmpty) {
      editor.commands.setContent(descriptionContent);
    }
  }, [descriptionContent, editor]);

  // Handle link insertion
  const handleAddLink = useCallback(() => {
    if (showLinkInput) {
      if (linkUrl && editor) {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
      setLinkUrl("");
      setShowLinkInput(false);
    } else {
      setShowLinkInput(true);
    }
  }, [editor, linkUrl, showLinkInput]);

  // Remove link
  const handleRemoveLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      setLinkUrl("");
    }
  }, [editor]);

  /* ---------------- SHOW LOADING STATE ---------------- */
  useEffect(() => {
    if (loading) {
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



        const images = product.images.map((img) => ({
          url: img.image,
          file: null,
        }));

        const thumbnailIndex =
          product.images.findIndex((img) => img.is_thumbnail) || 0;

        setForm({
          name: product.name,
          description: product.description || "",
          mainCategoryId: product.category.parent,
          subCategoryId: product.category.id,
          price: product.unit_price,
          qty: product.quantity,
          sizes: product.sizes?.map(s => s.id) || [],
          colors: product.colors?.map(c => c.id) || [],
          metaTitle: product.meta_title || "",
          metaDescription: product.meta_description || "",
          images,
          thumbnailIndex,
          hotSale: product.hot_sale || false,
        });

        setDescriptionContent(product.description || "");

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

  const handleImagesUpload = (files) => {
    const fileArray = Array.from(files);

    const normalizedFiles = fileArray.map((file) => ({
      file,
      url: null,
    }));

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...normalizedFiles],
      thumbnailIndex:
        prev.images.length === 0 ? 0 : prev.thumbnailIndex,
    }));
  };


  const setThumbnail = (index) => {
    setForm((prev) => {
      if (!prev.images[index]) return prev;
      return { ...prev, thumbnailIndex: index };
    });
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);

      let newThumbnailIndex = prev.thumbnailIndex;

      // If removed image IS thumbnail → reset to 0
      if (index === prev.thumbnailIndex) {
        newThumbnailIndex = 0;
      }

      // If removed image is BEFORE thumbnail → shift index
      if (index < prev.thumbnailIndex) {
        newThumbnailIndex = prev.thumbnailIndex - 1;
      }

      // Safety check
      if (newThumbnailIndex >= updatedImages.length) {
        newThumbnailIndex = 0;
      }

      return {
        ...prev,
        images: updatedImages,
        thumbnailIndex: newThumbnailIndex,
      };
    });
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
    if (form.images.length === 0) {
      Swal.fire("Warning", "Please upload at least one image", "warning");
      return false;
    }

    if (!form.images[form.thumbnailIndex]) {
      Swal.fire("Warning", "Please select a thumbnail image", "warning");
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

      form.images.forEach((img, index) => {
        if (img.file) {
          formData.append("images", img.file);
          formData.append(
            "is_thumbnail",
            index === form.thumbnailIndex ? "true" : "false"
          );
        }
      });


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

  // Don't render editor until mounted (client-side)
  if (!mounted || (!editor && !loading)) {
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
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </DashboardShell>
    );
  }

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
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-2 border-b bg-gray-50 px-4 py-3">
                    {/* Headings */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Heading 1"
                      >
                        <Heading size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`p-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Heading 3"
                      >
                        H3
                      </button>
                    </div>

                    {/* Text formatting */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Bold"
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Italic"
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`p-1 rounded ${editor.isActive('underline') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Underline"
                      >
                        <Underline size={16} />
                      </button>
                    </div>

                    {/* Lists */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Bullet List"
                      >
                        <List size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Numbered List"
                      >
                        1.
                      </button>
                    </div>

                    {/* Blockquote */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1 rounded ${editor.isActive('blockquote') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Blockquote"
                      >
                        <Quote size={16} />
                      </button>
                    </div>

                    {/* Links */}
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={handleAddLink}
                        className={`p-1 rounded ${editor.isActive('link') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                        title="Add Link"
                      >
                        <Link size={16} />
                      </button>
                      {editor.isActive('link') && (
                        <button
                          onClick={handleRemoveLink}
                          className="p-1 rounded text-red-600 hover:text-red-800"
                          title="Remove Link"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* History */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className={`p-1 rounded ${!editor.can().undo() ? 'text-gray-400' : 'text-gray-600 hover:text-black'}`}
                        title="Undo"
                      >
                        <Undo size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className={`p-1 rounded ${!editor.can().redo() ? 'text-gray-400' : 'text-gray-600 hover:text-black'}`}
                        title="Redo"
                      >
                        <Redo size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Link Input */}
                  {showLinkInput && (
                    <div className="border-b bg-gray-50 px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="Enter URL"
                          className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddLink();
                            }
                            if (e.key === 'Escape') {
                              setShowLinkInput(false);
                              setLinkUrl("");
                            }
                          }}
                        />
                        <button
                          onClick={handleAddLink}
                          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            setShowLinkInput(false);
                            setLinkUrl("");
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Editor Content */}
                  <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
                    <EditorContent editor={editor} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Use the toolbar to format text. All formatting will be preserved when displayed.
                </p>
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
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-xl font-bold mb-4">Product Images</h2>

            <label className="inline-flex items-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              <Upload size={16} />
              Upload Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImagesUpload(e.target.files)}
                className="hidden"
              />
            </label>

            {Array.isArray(form.images) && form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {form.images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative border rounded ${index === form.thumbnailIndex
                      ? "border-black ring-2 ring-black"
                      : "border-black/20"
                      }`}
                  >
                    <div className="w-full h-32 relative">
                      <Image
                        src={img.file ? URL.createObjectURL(img.file) : getImageUrl(img.url)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex justify-between items-center p-2 text-xs">
                      {index === form.thumbnailIndex && (
                        <button
                          disabled
                          className="px-2 py-1 rounded bg-black text-white cursor-default"
                        >
                          Thumbnail
                        </button>
                      )}


                      <button
                        onClick={() => removeImage(index)}
                        className="text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  X,
  Plus,
} from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import api from "@/lib/axios";

// Import TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';

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
    images: [],
    thumbnailIndex: 0,
    hotSale: false,
    isDesign: false,
    designNames: [], 
  });

  const [errors, setErrors] = useState({
    sizes: false,
    colors: false,
  });

  const [loading, setLoading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use a ref to track form state in callbacks
  const formRef = useRef(form);

  // Update the ref whenever form changes
  useEffect(() => {
    formRef.current = form;
  }, [form]);

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
    content: form.description,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm(prev => ({ ...prev, description: html }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4',
      },
    },
    immediatelyRender: false,
  }, [mounted]);

  // Update editor content when form.description changes
  useEffect(() => {
    if (editor && form.description === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
    }
  }, [form.description, editor]);

  // Handle link insertion
  const handleAddLink = useCallback(() => {
    if (showLinkInput) {
      if (linkUrl) {
        editor?.chain().focus().setLink({ href: linkUrl }).run();
      }
      setLinkUrl("");
      setShowLinkInput(false);
    } else {
      setShowLinkInput(true);
    }
  }, [editor, linkUrl, showLinkInput]);

  // Remove link
  const handleRemoveLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor]);

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

  // Handle design toggle
  const handleDesignToggle = () => {
    const newIsDesign = !form.isDesign;

    setForm((prev) => ({
      ...prev,
      isDesign: newIsDesign,
      colors: newIsDesign ? [] : prev.colors,
      designNames: newIsDesign ? [] : [], // Reset design names when toggling
    }));
  };

  // Add a new design name
  const addDesignName = () => {
    setForm(prev => ({
      ...prev,
      designNames: [...prev.designNames, ""]
    }));
  };

  // Update design name
  const updateDesignName = (index, name) => {
    setForm(prev => {
      const updated = [...prev.designNames];
      updated[index] = name;
      return { ...prev, designNames: updated };
    });
  };

  // Remove a design name
  const removeDesignName = (index) => {
    Swal.fire({
      title: "Remove Design?",
      text: "This design name will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setForm(prev => ({
          ...prev,
          designNames: prev.designNames.filter((_, i) => i !== index)
        }));
      }
    });
  };

  // Handle image upload for regular products - FIXED for high quality
  const handleImagesUpload = (files) => {
    const fileArray = Array.from(files);

    // REMOVED size restriction - allow any size
    const validFiles = fileArray.filter((file) => {
      // Optional: Add warning for very large files but don't block
      if (file.size > 50 * 1024 * 1024) { // 50MB warning
        Swal.fire({
          icon: "warning",
          title: "Large File",
          text: `${file.name} is larger than 50MB. Upload may take longer.`,
          showConfirmButton: true,
        });
      }
      return true; // Accept all files
    });

    const normalizedFiles = validFiles.map((file) => ({
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

  const removeImage = (index) => {
    setForm((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        thumbnailIndex: index === prev.thumbnailIndex ? 0 : prev.thumbnailIndex,
      };
    });
  };

  const setThumbnail = (index) => {
    setForm((prev) => ({
      ...prev,
      thumbnailIndex: index,
    }));
  };

  // Handle hot sale toggle
  const handleHotSaleToggle = () => {
    setForm((prev) => ({ ...prev, hotSale: !prev.hotSale }));
  };

  // Create JSON payload for design products
  const createJsonPayload = () => {
    const payload = {
      name: form.name,
      description: form.description || "",
      category_id: Number(form.subCategoryId),
      unit_price: Number(form.price),
      quantity: Number(form.qty),
      meta_title: form.metaTitle || form.name,
      meta_description: form.metaDescription || form.description,
      hot_sale: form.hotSale,
      size_ids: form.sizes.map(id => Number(id)),
    };

    // Only add is_design if it's true
    if (form.isDesign) {
      payload.is_design = true;
    }

    // Only add colors for non-design products
    if (!form.isDesign && form.colors.length > 0) {
      payload.color_ids = form.colors.map(id => Number(id));
    }

    // For design products, add design_names
    if (form.isDesign) {
      if (form.designNames.length > 0) {
        payload.design_names = form.designNames
          .filter(name => name && name.trim() !== "")
          .map(name => name.trim());
      } else {
        // If design mode but no names, send empty array
        payload.design_names = [];
      }
    }
    // IMPORTANT: For non-design products, we DO NOT add is_design or design_names at all

    console.log("JSON Payload:", payload);
    return payload;
  };

  // Create FormData payload for regular products with images
  const createFormDataPayload = () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description || "");
    formData.append("category_id", Number(form.subCategoryId));
    formData.append("unit_price", Number(form.price));
    formData.append("quantity", Number(form.qty));
    formData.append("meta_title", form.metaTitle || form.name);
    formData.append("meta_description", form.metaDescription || form.description);
    formData.append("hot_sale", form.hotSale ? "True" : "False");

    // Only add is_design if it's true
    if (form.isDesign) {
      formData.append("is_design", "True");
    }

    form.sizes.forEach((id) => {
      formData.append("size_ids", id.toString());
    });
    
    if (!form.isDesign && form.colors.length > 0) {
      form.colors.forEach((id) => {
        formData.append("color_ids", id.toString());
      });
    }

    // For design products only, add design_names
    if (form.isDesign && form.designNames.length > 0) {
      form.designNames.forEach((name) => {
        if (name && name.trim() !== "") {
          formData.append("design_names", name.trim());
        }
      });
    }
    // For non-design products, we DO NOT add is_design or design_names at all

    // Add images for regular products - maintain original quality
    if (!form.isDesign && form.images.length > 0) {
      form.images.forEach((img, index) => {
        if (img.file) {
          // Append with original file (maintains quality)
          formData.append("images", img.file);
          formData.append(
            "is_thumbnail",
            (index === form.thumbnailIndex) ? "True" : "False"
          );
        }
      });
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

    if (!form.name || !form.subCategoryId || !form.price || !form.qty) {
      Swal.fire("Warning", "Please fill all required fields", "warning");
      return false;
    }

    // Regular images are required only if not in design mode
    if (!form.isDesign && form.images.length === 0) {
      Swal.fire("Warning", "Please upload at least one image for regular products", "warning");
      return false;
    }

    // Thumbnail check only for non-design mode
    if (!form.isDesign && !form.images[form.thumbnailIndex]) {
      Swal.fire("Warning", "Please select a thumbnail image", "warning");
      return false;
    }

    // Size validation
    if (newErrors.sizes) {
      Swal.fire("Warning", "Please select at least one size", "warning");
      return false;
    }

    // Color validation only for non-design mode
    if (!form.isDesign && newErrors.colors) {
      Swal.fire("Warning", "Please select at least one color", "warning");
      return false;
    }

    // Validate design names if isDesign is true
    if (form.isDesign) {
      if (form.designNames.length === 0) {
        Swal.fire("Warning", "Please add at least one design name", "warning");
        return false;
      }

      // Check if all design names are filled
      const emptyNames = form.designNames.filter(name => !name || name.trim() === "");
      if (emptyNames.length > 0) {
        Swal.fire("Warning", "Please enter names for all designs", "warning");
        return false;
      }
    }

    return true;
  };

  // Submit product
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let payload;
      let headers = {};
      let endpoint = "/api/product/create-product/";

      // DECISION: Use JSON for design products, FormData for regular products
      if (form.isDesign) {
        // Design product - send as JSON
        payload = createJsonPayload();
        headers['Content-Type'] = 'application/json';
      } else {
        // Regular product with images - send as FormData
        payload = createFormDataPayload();
        // Don't set Content-Type header for FormData - browser will set it with boundary
      }

      Swal.fire({
        title: "Adding Product...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      console.log("=== SENDING PRODUCT ===");
      console.log("Is Design:", form.isDesign);
      console.log("Using:", form.isDesign ? "JSON" : "FormData");

      // Log the payload for debugging
      if (!form.isDesign) {
        console.log("FormData contents:");
        for (let pair of payload.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
      } else {
        console.log("JSON Payload:", payload);
      }

      let response;
      if (form.isDesign) {
        // Send JSON for design products
        response = await api.post(endpoint, payload, { headers });
      } else {
        // Send FormData for regular products
        response = await api.post(endpoint, payload);
      }

      console.log("Product creation response:", response);

      Swal.fire("Success", "Product added successfully!", "success");

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
        images: [],
        thumbnailIndex: 0,
        hotSale: false,
        isDesign: false,
        designNames: [],
      });

      // Clear editor
      if (editor) {
        editor.commands.clearContent();
      }

      setParentCategoryId("");
      setErrors({ sizes: false, colors: false });

    } catch (err) {
      console.error("Error creating product:", err);
      console.error("Error response:", err.response?.data);
      
      // Check if error is about design_names
      if (err.response?.data?.error === "design_names is required") {
        Swal.fire({
          icon: "error",
          title: "Server Configuration Error",
          text: "The server is incorrectly requiring design_names for non-design products. Please check the backend validation.",
        });
      } else {
        Swal.fire("Error", err.response?.data?.message || "Product creation failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render editor until mounted (client-side)
  if (!mounted || !editor) {
    return (
      <DashboardShell>
        <div className="min-h-screen space-y-6">
          {/* HEADER */}
          <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm">
            <h1 className="text-xl font-bold">Add Product</h1>
            <div className="flex items-center space-x-2 text-[16px]">
              <a href="/" className="hover:text-purple-600 flex items-center">
                <Home size={16} />
              </a>
              <ChevronRight size={14} />
              <span>Add Product</span>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="min-h-screen space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Add Product</h1>
          <div className="flex items-center space-x-2 text-[16px]">
            <a href="/" className="hover:text-purple-600 flex items-center">
              <Home size={16} />
            </a>
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

            {/* hot sale and design fields */}
            <div className="flex items-center gap-10">
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

              {/* Design Field */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isDesign"
                  checked={form.isDesign}
                  onChange={handleDesignToggle}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="isDesign" className="text-[16px] font-medium">
                  Design
                </label>
              </div>
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

        {/* COLORS - Only show when NOT in design mode */}
        {!form.isDesign && (
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
        )}

        {/* REGULAR MEDIA UPLOAD - Only show when NOT in design mode */}
        {!form.isDesign && (
          <div className="bg-white p-6 rounded-md shadow-sm">
            <label className="block text-[16px] font-medium mb-3">
              Product Images *
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
              <Upload size={16} />
              Upload Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImagesUpload(e.target.files)}
                className="hidden"
              />
            </label>

            <p className="text-sm text-gray-500 mt-2">
              Upload multiple images. Select one as thumbnail. (Original quality preserved)
            </p>

            {/* Preview Grid */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {form.images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative border rounded overflow-hidden ${index === form.thumbnailIndex
                      ? "border-black ring-2 ring-black"
                      : "border-black/20"
                      }`}
                  >
                    <div className="w-full h-32 relative">
                      <img
                        src={img.file ? URL.createObjectURL(img.file) : ""}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex justify-between items-center p-2 text-xs">
                      {index === form.thumbnailIndex && (
                        <button
                          disabled
                          className="px-2 py-1 rounded bg-black text-white cursor-default"
                        >
                          Thumbnail
                        </button>
                      )}

                      {index !== form.thumbnailIndex && (
                        <button
                          onClick={() => setThumbnail(index)}
                          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        >
                          Set Thumbnail
                        </button>
                      )}

                      <button
                        onClick={() => removeImage(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DESIGN NAMES SECTION - Only show when isDesign is true */}
        {form.isDesign && (
          <div className="bg-white p-6 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Design Names</h2>
              <button
                onClick={addDesignName}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                <Plus size={16} />
                Add Design Name
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Enter names for your designs. These names will be used to identify different design variations.
            </p>

            {form.designNames.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500">No design names added yet. Click "Add Design Name" to start.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {form.designNames.map((name, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Design {index + 1} Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => updateDesignName(index, e.target.value)}
                        className="w-full border border-black/20 rounded px-3 py-2"
                        placeholder={`Enter design name ${index + 1}`}
                      />
                    </div>
                    <button
                      onClick={() => removeDesignName(index)}
                      className="text-red-600 hover:text-red-800 mt-6"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              placeholder="SEO description for search engineers"
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
              : "bg-black text-white hover:bg-gray-800 cursor-pointer"
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
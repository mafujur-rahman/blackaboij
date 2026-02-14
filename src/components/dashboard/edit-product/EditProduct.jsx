"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Trash2,
  Check,
  Plus,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import api from "@/lib/axios";
import DashboardShell from "../DashboardShell";
import { getImageUrl } from "@/components/utils/get-image-url";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';

const EditProduct = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  const [settingThumbnail, setSettingThumbnail] = useState(null);
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
    isDesign: false,
    designs: [], // Changed from designNames to designs array of objects
  });

  // Use a ref to track form state in callbacks
  const formRef = useRef(form);

  // Update the ref whenever form changes
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);

  const [errors, setErrors] = useState({
    sizes: false,
    colors: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit, UnderlineExtension],
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

  useEffect(() => {
    if (editor && descriptionContent && editor.isEmpty) {
      editor.commands.setContent(descriptionContent);
    }
  }, [descriptionContent, editor]);

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

  const handleRemoveLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      setLinkUrl("");
    }
  }, [editor]);

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

        const product = products.data.data.find((p) => p.id === Number(id));

        if (!product) {
          Swal.fire("Error", "Product not found", "error");
          router.push("/dashboard/product-list");
          return;
        }

        setParentCategoryId(product.category.parent);

        const images = product.images.map((img) => ({
          id: img.id,
          url: img.image,
          file: null,
          is_thumbnail: img.is_thumbnail,
        }));

        const thumbnailIndex = images.findIndex(img => img.is_thumbnail) || 0;

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
          isDesign: product.is_design || false,
          designs: product.designs || [], // Store the designs array as is
        });

        setDescriptionContent(product.description || "");
      } catch {
        Swal.fire("Error", "Failed to load product data", "error");
        router.push("/dashboard/product-list");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, router]);

  useEffect(() => {
    if (!parentCategoryId) return;

    const fetchSubs = async () => {
      try {
        const res = await api.get("/api/categories/get-category-grouped/");
        const parent = res.data.data.find((p) => p.id === Number(parentCategoryId));
        setSubCategories(parent?.sub_categories || []);

      } catch {
        Swal.fire("Error", "Failed to load sub-categories", "error");
      }
    };

    fetchSubs();
  }, [parentCategoryId]);

  const toggleArray = (key, value) => {
    const newArray = form[key].includes(value)
      ? form[key].filter((v) => v !== value)
      : [...form[key], value];

    setForm((prev) => ({
      ...prev,
      [key]: newArray,
    }));

    if (newArray.length > 0) {
      setErrors((prev) => ({
        ...prev,
        [key === "sizes" ? "sizes" : "colors"]: false,
      }));
    }
  };

  // Handle hot sale toggle
  const handleHotSaleToggle = () => {
    setForm((prev) => ({ ...prev, hotSale: !prev.hotSale }));
  };

  // Handle design toggle - matches AddProduct behavior
  const handleDesignToggle = () => {
    const newIsDesign = !form.isDesign;

    setForm((prev) => ({
      ...prev,
      isDesign: newIsDesign,
      colors: newIsDesign ? [] : prev.colors, // Clear colors when toggling to design
      designs: newIsDesign ? prev.designs : [], // Keep designs when toggling to design, clear when toggling off
    }));
  };

  // Add a new design
  const addDesign = () => {
    setForm(prev => ({
      ...prev,
      designs: [...prev.designs, { 
        id: null, // New designs won't have an ID yet
        name: "", 
        is_default: prev.designs.length === 0 // First design is default
      }]
    }));
  };

  // Update design name
  const updateDesignName = (index, name) => {
    setForm(prev => {
      const updated = [...prev.designs];
      updated[index] = { ...updated[index], name };
      return { ...prev, designs: updated };
    });
  };

  // Set design as default
  const setDefaultDesign = (index) => {
    setForm(prev => {
      const updated = prev.designs.map((design, i) => ({
        ...design,
        is_default: i === index
      }));
      return { ...prev, designs: updated };
    });
  };

  // Remove a design with confirmation
  const removeDesign = (index) => {
    const design = form.designs[index];
    
    // Don't allow removing the default design
    if (design.is_default) {
      Swal.fire("Warning", "Cannot remove the default design. Set another design as default first.", "warning");
      return;
    }

    Swal.fire({
      title: "Remove Design?",
      text: "This design will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setForm(prev => ({
          ...prev,
          designs: prev.designs.filter((_, i) => i !== index)
        }));
      }
    });
  };

  const handleImagesUpload = (files) => {
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("Error", `${file.name} exceeds 10MB`, "error");
        return false;
      }
      return true;
    });

    const normalizedFiles = validFiles.map((file) => ({
      id: null,
      file,
      url: URL.createObjectURL(file),
      is_thumbnail: false,
    }));

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...normalizedFiles],
    }));
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);

      let newThumbnailIndex = prev.thumbnailIndex;

      if (index === prev.thumbnailIndex) {
        newThumbnailIndex = 0;
      }

      if (index < prev.thumbnailIndex) {
        newThumbnailIndex = prev.thumbnailIndex - 1;
      }

      if (newThumbnailIndex >= updatedImages.length && updatedImages.length > 0) {
        newThumbnailIndex = updatedImages.length - 1;
      }

      if (updatedImages.length === 0) {
        newThumbnailIndex = 0;
      }

      return {
        ...prev,
        images: updatedImages,
        thumbnailIndex: newThumbnailIndex,
      };
    });
  };

  const handleDeleteImage = async (imageId, index) => {
    const image = form.images[index];

    // If it's a new image (has no ID), just remove it from the UI immediately
    if (!image.id) {
      removeImage(index);
      return;
    }

    // For existing images with ID, show confirmation and call API
    const confirm = await Swal.fire({
      title: "Delete Image?",
      text: "Are you sure you want to delete this image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    setDeletingImage(imageId);

    try {
      await api.delete(`/api/product/delete-product-image/${imageId}/`);
      removeImage(index);

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Image has been deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete image",
        confirmButtonColor: "#000",
      });
    } finally {
      setDeletingImage(null);
    }
  };

  const handleSetThumbnail = async (index) => {
    const image = form.images[index];

    // If it's a new image (has no ID), just update the UI state
    if (!image.id) {
      // New images can't be set as thumbnail until saved
      return;
    }

    // For existing images, call API to set thumbnail
    setSettingThumbnail(image.id);

    try {
      await api.patch(`/api/product/${id}/set-product-thumbnail/${image.id}/`);

      setForm(prev => {
        const updatedImages = prev.images.map((img, i) => ({
          ...img,
          is_thumbnail: i === index
        }));

        return {
          ...prev,
          images: updatedImages,
          thumbnailIndex: index
        };
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Thumbnail has been set successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to set thumbnail",
        confirmButtonColor: "#000",
      });
    } finally {
      setSettingThumbnail(null);
    }
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
      is_design: form.isDesign,
      size_ids: form.sizes.map(id => Number(id)),
    };

    // Only add colors for non-design products
    if (!form.isDesign && form.colors.length > 0) {
      payload.color_ids = form.colors.map(id => Number(id));
    }

    // Add designs for design products
    if (form.isDesign && form.designs.length > 0) {
      // Send design names for new designs (without IDs)
      // Existing designs will be handled separately by the backend
      payload.design_names = form.designs
        .filter(design => !design.id) // Only new designs without IDs
        .map(design => design.name.trim())
        .filter(name => name !== "");
      
      // If there are existing designs, we might need to send their IDs
      // This depends on your API design
      const existingDesignIds = form.designs
        .filter(design => design.id)
        .map(design => design.id);
      
      if (existingDesignIds.length > 0) {
        payload.design_ids = existingDesignIds;
      }
    }

    return payload;
  };

  // Create FormData payload for regular products with images
  const createFormDataPayload = () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("category_id", Number(form.subCategoryId));
    formData.append("description", form.description || "");
    formData.append("unit_price", Number(form.price));
    formData.append("quantity", Number(form.qty));
    formData.append("meta_title", form.metaTitle || form.name);
    formData.append("meta_description", form.metaDescription || form.name);
    
    if (form.hotSale) {
      formData.append("hot_sale", "true");
    }

    if (form.isDesign) {
      formData.append("is_design", "true");
    }

    form.sizes.forEach((sizeId) => {
      formData.append("size_ids", sizeId);
    });

    if (!form.isDesign && form.colors.length > 0) {
      form.colors.forEach((colorId) => {
        formData.append("color_ids", colorId);
      });
    }

    // Add designs for design products
    if (form.isDesign && form.designs.length > 0) {
      // Add new design names
      form.designs
        .filter(design => !design.id) // Only new designs without IDs
        .forEach((design) => {
          if (design.name && design.name.trim() !== "") {
            formData.append("design_names", design.name.trim());
          }
        });
      
      // Add existing design IDs
      const existingDesignIds = form.designs
        .filter(design => design.id)
        .map(design => design.id);
      
      existingDesignIds.forEach(id => {
        formData.append("design_ids", id);
      });

      // Add default design info
      const defaultDesign = form.designs.find(d => d.is_default);
      if (defaultDesign) {
        formData.append("default_design_id", defaultDesign.id || "");
      }
    }

    // Add new images only (those with file but no id)
    const newImages = form.images.filter(img => img.file && !img.id);
    newImages.forEach((img) => {
      formData.append("images", img.file);
    });

    // Set thumbnail for new images
    const thumbnailImage = form.images[form.thumbnailIndex];
    if (thumbnailImage && thumbnailImage.file && !thumbnailImage.id) {
      const newImageIndex = newImages.findIndex(img =>
        img.file === thumbnailImage.file
      );
      formData.append("thumbnail_index", newImageIndex);
    } else if (thumbnailImage && thumbnailImage.id) {
      formData.append("thumbnail_image_id", thumbnailImage.id);
    }

    return formData;
  };

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

    // Check if thumbnail is a new image (can't be thumbnail until saved) - only for non-design
    if (!form.isDesign && !form.images[form.thumbnailIndex]?.id) {
      Swal.fire("Warning", "Thumbnail must be an existing saved image. Please save the product first or select an existing image as thumbnail.", "warning");
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

    // Validate designs if isDesign is true
    if (form.isDesign) {
      if (form.designs.length === 0) {
        Swal.fire("Warning", "Please add at least one design", "warning");
        return false;
      }

      // Check if all design names are filled
      const emptyNames = form.designs.filter(design => !design.name || design.name.trim() === "");
      if (emptyNames.length > 0) {
        Swal.fire("Warning", "Please enter names for all designs", "warning");
        return false;
      }

      // Check if there's a default design
      const hasDefault = form.designs.some(design => design.is_default);
      if (!hasDefault) {
        Swal.fire("Warning", "Please select a default design", "warning");
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
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
      let payload;
      let headers = {};
      let endpoint = `/api/product/update-product/${id}/`;

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
        title: 'Updating Product...',
        text: 'Please wait while we update your product',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      console.log("=== UPDATING PRODUCT ===");
      console.log("Is Design:", form.isDesign);
      console.log("Using:", form.isDesign ? "JSON" : "FormData");
      console.log("Payload:", payload);

      let response;
      if (form.isDesign) {
        // Send JSON for design products
        response = await api.put(endpoint, payload, { headers });
      } else {
        // Send FormData for regular products
        response = await api.put(endpoint, payload);
      }

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
    } catch (error) {
      Swal.close();
      console.error("Update error:", error);
      console.error("Error response:", error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Update failed. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#000"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!mounted || (!editor && !loading)) {
    return (
      <DashboardShell isLoading={loading}>
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
          </div>
        ) : (
          <div className="min-h-screen space-y-6">
            <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm">
              <h1 className="text-xl font-bold">Edit Product</h1>
              <div className="flex items-center space-x-2 text-[16px]">
                <a href="/" className="hover:text-purple-600 flex items-center">
                  <Home size={16} />
                </a>
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
          <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm">
            <h1 className="text-xl font-bold">Edit Product</h1>
            <div className="flex items-center space-x-2 text-[16px]">
              <a href="/" className="hover:text-purple-600 flex items-center">
                <Home size={16} />
              </a>
              <ChevronRight size={14} />
              <span>Edit Product</span>
            </div>
          </div>

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
                    setForm((prev) => ({
                      ...prev,
                      subCategoryId: e.target.value,
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

              {/* hot sale and design field */}
              <div className="flex items-center gap-10">
                {/* Hot Sale Field */}
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
                  <div className="flex flex-wrap gap-2 border-b bg-gray-50 px-4 py-3">
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        <Heading size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        H2
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`p-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        H3
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`p-1 rounded ${editor.isActive('underline') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        <Underline size={16} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        <List size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        1.
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1 rounded ${editor.isActive('blockquote') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        <Quote size={16} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={handleAddLink}
                        className={`p-1 rounded ${editor.isActive('link') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                      >
                        <Link size={16} />
                      </button>
                      {editor.isActive('link') && (
                        <button
                          onClick={handleRemoveLink}
                          className="p-1 rounded text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className={`p-1 rounded ${!editor.can().undo() ? 'text-gray-400' : 'text-gray-600 hover:text-black'}`}
                      >
                        <Undo size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className={`p-1 rounded ${!editor.can().redo() ? 'text-gray-400' : 'text-gray-600 hover:text-black'}`}
                      >
                        <Redo size={16} />
                      </button>
                    </div>
                  </div>

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
            </div>
          )}

          {/* REGULAR MEDIA UPLOAD - Only show when NOT in design mode */}
          {!form.isDesign && (
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

              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {form.images.map((img, index) => {
                    const isNewImage = img.file && !img.id;
                    const isExistingImage = img.id;
                    const isThumbnail = index === form.thumbnailIndex;
                    const isSettingThumbnailExisting = isExistingImage && settingThumbnail === img.id;
                    const isDeletingExisting = isExistingImage && deletingImage === img.id;

                    return (
                      <div
                        key={img.id ? `existing-${img.id}` : `new-${index}-${img.file?.name}`}
                        className={`relative border rounded ${isThumbnail
                          ? "border-black ring-2 ring-black"
                          : "border-black/20"
                          }`}
                      >
                        <div className="w-full h-32 relative">
                          <Image
                            src={img.file ? img.url : getImageUrl(img.url)}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="flex justify-between items-center p-2 text-xs">
                          {/* Thumbnail Button */}
                          {isThumbnail ? (
                            <button
                              disabled
                              className="px-2 py-1 rounded bg-black text-white cursor-default flex items-center gap-1"
                            >
                              <Check size={12} />
                              Thumbnail
                            </button>
                          ) : (
                            <button
                              onClick={() => isExistingImage && handleSetThumbnail(index)}
                              disabled={isSettingThumbnailExisting || isDeletingExisting || isNewImage}
                              className={`px-2 py-1 rounded flex items-center gap-1 ${isNewImage
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : isSettingThumbnailExisting
                                  ? "bg-gray-400 text-white cursor-not-allowed"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              title={isNewImage ? "Save product first to set as thumbnail" : "Set as thumbnail"}
                            >
                              {isSettingThumbnailExisting && (
                                <div className="h-3 w-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                              )}
                              Set Thumbnail
                            </button>
                          )}

                          {/* Remove Button */}
                          <button
                            onClick={() => handleDeleteImage(img.id, index)}
                            disabled={isDeletingExisting || isSettingThumbnailExisting}
                            className={`flex items-center gap-1 ${isDeletingExisting
                              ? "text-red-400 cursor-not-allowed"
                              : "text-red-600 hover:text-red-800"
                              }`}
                          >
                            {isDeletingExisting ? (
                              <div className="h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Remove
                          </button>
                        </div>

                        {/* New Image Badge */}
                        {isNewImage && (
                          <div className="absolute top-1 right-1 bg-black text-white text-xs px-1.5 py-0.5 rounded">
                            New
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-sm text-gray-500 mt-4">
                Note: New uploaded images (marked with New badge) can be removed immediately.
                To set a new image as thumbnail, you need to save the product first.
              </p>
            </div>
          )}

          {/* DESIGN NAMES SECTION - Only show when isDesign is true */}
          {form.isDesign && (
            <div className="bg-white p-6 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Designs</h2>
                <button
                  onClick={addDesign}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                  <Plus size={16} />
                  Add Design
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Enter names for your designs. The first design is default by default. Click the star to set a design as default.
              </p>

              {form.designs.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                  <p className="text-gray-500">No designs added yet. Click Add Design to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.designs.map((design, index) => (
                    <div key={design.id || `new-${index}`} className="flex items-center gap-4 p-4 border rounded-lg">
                      

                      {/* Design Name Input */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Design {index + 1} Name *
                        </label>
                        <input
                          type="text"
                          value={design.name}
                          onChange={(e) => updateDesignName(index, e.target.value)}
                          className="w-full border border-black/20 rounded px-3 py-2"
                          placeholder={`Enter design name ${index + 1}`}
                        />
                      </div>

                      {/* Design ID (for existing designs) */}
                      {design.id && (
                        <div className="text-xs text-gray-500">
                          ID: {design.id}
                        </div>
                      )}

                      {/* Remove Button - Can't remove default design */}
                      <button
                        onClick={() => removeDesign(index)}
                        disabled={design.is_default}
                        className={`mt-6 ${design.is_default 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-800'
                        }`}
                        title={design.is_default ? "Cannot remove default design" : "Remove design"}
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
                placeholder="SEO description for search engines"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={updating || loading}
              className={`px-8 py-3 rounded font-medium transition flex items-center gap-2 cursor-pointer ${updating || loading
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
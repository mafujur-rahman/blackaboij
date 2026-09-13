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
  Star,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import api from "@/lib/axios";
import DashboardShell from "../DashboardShell";
import { getImageUrl } from "@/components/utils/get-image-url";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";

const EditProduct = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  const [settingThumbnail, setSettingThumbnail] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState("");

  // Multi-category state
  const [selectedParentIds, setSelectedParentIds] = useState([]);
  const [subCategoriesByParent, setSubCategoriesByParent] = useState({});

  const [parentCategories, setParentCategories] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryIds: [],          // flat list of all assigned category IDs (main + sub)
    primaryCategoryId: "",    // must be inside categoryIds
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

  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const [errors, setErrors] = useState({
    sizes: false,
    colors: false,
    categories: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor(
    {
      extensions: [StarterKit, UnderlineExtension],
      content: descriptionContent,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        setForm((prev) => ({ ...prev, description: html }));
        setDescriptionContent(html);
      },
      editorProps: {
        attributes: {
          class:
            "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4",
        },
      },
      immediatelyRender: false,
    },
    [mounted]
  );

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

  // Fetch initial data + product
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [parents, sizes, colors, products, grouped] = await Promise.all([
          api.get("/api/categories/get-all-parent-categories/"),
          api.get("/api/sizes/get-all-sizes/"),
          api.get("/api/colors/get-all-colors/"),
          api.get("/api/products/get-all-products/"),
          api.get("/api/categories/get-category-grouped/"),
        ]);

        setParentCategories(parents.data.data || []);
        setSizesList(sizes.data.data || []);
        setColorsList(colors.data.data || []);

        // Build map of parentId -> sub_categories
        const subMap = {};
        (grouped.data.data || []).forEach((parent) => {
          subMap[parent.id] = parent.sub_categories || [];
        });
        setSubCategoriesByParent(subMap);

        const product = products.data.data.find((p) => p.id === Number(id));

        if (!product) {
          Swal.fire("Error", "Product not found", "error");
          router.push("/dashboard/product-list");
          return;
        }

        // ---- MULTI-CATEGORY INITIALIZATION ----
        // Prefer `product.categories` (new array), fall back to `product.category`
        const selectedCategoryIds =
          product.categories?.map((c) => c.id) ??
          (product.category ? [product.category.id] : []);

        const primaryCategoryId = product.category?.id ?? null;

        // Determine which MAIN (parent) categories should be pre-selected:
        // 1. Any category in selectedCategoryIds that IS a top-level parent → select it
        // 2. Any category whose ancestor (via subMap) is a parent → select that parent
        const parentIds = new Set();

        (parents.data.data || []).forEach((parent) => {
          // If the parent itself is assigned
          if (selectedCategoryIds.includes(parent.id)) {
            parentIds.add(parent.id);
          }
          // If any of its subs are assigned
          const subs = subMap[parent.id] || [];
          if (subs.some((s) => selectedCategoryIds.includes(s.id))) {
            parentIds.add(parent.id);
          }
        });

        setSelectedParentIds(Array.from(parentIds));

        const images = (product.images || []).map((img) => ({
          id: img.id,
          url: img.image,
          file: null,
          is_thumbnail: img.is_thumbnail,
        }));

        const thumbnailIndex =
          images.findIndex((img) => img.is_thumbnail) >= 0
            ? images.findIndex((img) => img.is_thumbnail)
            : 0;

        setForm({
          name: product.name,
          description: product.description || "",
          categoryIds: selectedCategoryIds,
          primaryCategoryId: primaryCategoryId ?? "",
          price: product.unit_price,
          qty: product.quantity,
          sizes: product.sizes?.map((s) => s.id) || [],
          colors: product.colors?.map((c) => c.id) || [],
          metaTitle: product.meta_title || "",
          metaDescription: product.meta_description || "",
          images,
          thumbnailIndex,
          hotSale: product.hot_sale || false,
          isDesign: product.is_design || false,
          designNames: product.designs?.map((d) => d.name) || [],
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

  const toggleArray = (key, value) => {
    const newArray = form[key].includes(value)
      ? form[key].filter((v) => v !== value)
      : [...form[key], value];

    setForm((prev) => ({ ...prev, [key]: newArray }));

    if (newArray.length > 0) {
      setErrors((prev) => ({
        ...prev,
        [key === "sizes" ? "sizes" : "colors"]: false,
      }));
    }
  };

  // --- MULTI-CATEGORY HANDLERS ---

  // Toggle a MAIN category (multi-select). Selecting it also auto-assigns the parent ID.
  // Removing it also removes all its sub-categories from categoryIds.
  const toggleParentCategory = (parentId) => {
    setSelectedParentIds((prevSelected) => {
      const isRemoving = prevSelected.includes(parentId);
      let newSelected;
      let newCategoryIds = [...formRef.current.categoryIds];
      let newPrimary = formRef.current.primaryCategoryId;

      if (isRemoving) {
        newSelected = prevSelected.filter((id) => id !== parentId);

        // Remove this parent AND all its sub-categories
        const subsOfParent = (subCategoriesByParent[parentId] || []).map(
          (s) => s.id
        );
        newCategoryIds = newCategoryIds.filter(
          (id) => id !== parentId && !subsOfParent.includes(id)
        );

        if (!newCategoryIds.includes(Number(newPrimary))) {
          newPrimary = newCategoryIds.length > 0 ? newCategoryIds[0] : "";
        }
      } else {
        newSelected = [...prevSelected, parentId];
        // Auto-add parent as an assigned category
        if (!newCategoryIds.includes(parentId)) {
          newCategoryIds.push(parentId);
        }
        if (!newPrimary) newPrimary = parentId;
      }

      setForm((f) => ({
        ...f,
        categoryIds: newCategoryIds,
        primaryCategoryId: newPrimary,
      }));

      return newSelected;
    });

    setErrors((prev) => ({ ...prev, categories: false }));
  };

  // Toggle any individual category (main or sub) in the flat categoryIds list
  const toggleCategory = (id) => {
    setForm((prev) => {
      const isSelected = prev.categoryIds.includes(id);
      const newIds = isSelected
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id];

      let newPrimary = prev.primaryCategoryId;
      if (isSelected && Number(prev.primaryCategoryId) === id) {
        newPrimary = newIds.length > 0 ? newIds[0] : "";
      }
      if (!newPrimary && newIds.length > 0) {
        newPrimary = newIds[0];
      }
      if (newIds.length === 0) newPrimary = "";

      return { ...prev, categoryIds: newIds, primaryCategoryId: newPrimary };
    });

    setErrors((prev) => ({ ...prev, categories: false }));
  };

  const setPrimaryCategory = (id) => {
    if (!form.categoryIds.includes(id)) return;
    setForm((prev) => ({ ...prev, primaryCategoryId: id }));
  };

  // Lookup a category's display name (searches parents + subs)
  const getCategoryName = (id) => {
    const parent = parentCategories.find((p) => p.id === id);
    if (parent) return parent.name;
    for (const pid of Object.keys(subCategoriesByParent)) {
      const sub = (subCategoriesByParent[pid] || []).find((s) => s.id === id);
      if (sub) return sub.name;
    }
    return String(id);
  };

  // --- END MULTI-CATEGORY HANDLERS ---

  const handleHotSaleToggle = () => {
    setForm((prev) => ({ ...prev, hotSale: !prev.hotSale }));
  };

  const handleDesignToggle = () => {
    const newIsDesign = !form.isDesign;
    setForm((prev) => ({
      ...prev,
      isDesign: newIsDesign,
      colors: newIsDesign ? [] : prev.colors,
      designNames: newIsDesign ? prev.designNames : [],
    }));
  };

  const addDesignName = () => {
    setForm((prev) => ({
      ...prev,
      designNames: [...prev.designNames, ""],
    }));
  };

  const updateDesignName = (index, name) => {
    setForm((prev) => {
      const updated = [...prev.designNames];
      updated[index] = name;
      return { ...prev, designNames: updated };
    });
  };

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
        setForm((prev) => ({
          ...prev,
          designNames: prev.designNames.filter((_, i) => i !== index),
        }));
      }
    });
  };

  const handleImagesUpload = (files) => {
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter((file) => {
      if (file.size > 50 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "Large File",
          text: `${file.name} is larger than 50MB. Upload may take longer.`,
          showConfirmButton: true,
        });
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
      if (index === prev.thumbnailIndex) newThumbnailIndex = 0;
      if (index < prev.thumbnailIndex) newThumbnailIndex = prev.thumbnailIndex - 1;
      if (newThumbnailIndex >= updatedImages.length && updatedImages.length > 0) {
        newThumbnailIndex = updatedImages.length - 1;
      }
      if (updatedImages.length === 0) newThumbnailIndex = 0;

      return {
        ...prev,
        images: updatedImages,
        thumbnailIndex: newThumbnailIndex,
      };
    });
  };

  const handleDeleteImage = async (imageId, index) => {
    const image = form.images[index];

    if (!image.id) {
      removeImage(index);
      return;
    }

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

    if (!image.id) return;

    setSettingThumbnail(image.id);

    try {
      await api.patch(`/api/product/${id}/set-product-thumbnail/${image.id}/`);

      setForm((prev) => {
        const updatedImages = prev.images.map((img, i) => ({
          ...img,
          is_thumbnail: i === index,
        }));

        return {
          ...prev,
          images: updatedImages,
          thumbnailIndex: index,
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

  // JSON payload (design products)
  const createJsonPayload = () => {
    const payload = {
      name: form.name,
      description: form.description || "",
      category_ids: form.categoryIds.map((id) => Number(id)), // full replace
      category_id: Number(form.primaryCategoryId),
      unit_price: Number(form.price),
      quantity: Number(form.qty),
      meta_title: form.metaTitle || form.name,
      meta_description: form.metaDescription || form.description,
      hot_sale: form.hotSale,
      size_ids: form.sizes.map((id) => Number(id)),
    };

    if (form.isDesign) {
      payload.is_design = true;
    }

    if (!form.isDesign && form.colors.length > 0) {
      payload.color_ids = form.colors.map((id) => Number(id));
    }

    if (form.isDesign) {
      payload.design_names =
        form.designNames.length > 0
          ? form.designNames
              .filter((name) => name && name.trim() !== "")
              .map((name) => name.trim())
          : [];
    }

    return payload;
  };

  // FormData payload (regular products with images)
  const createFormDataPayload = () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description || "");

    // Multi-category — append each ID separately (per backend spec)
    form.categoryIds.forEach((id) => {
      formData.append("category_ids", String(id));
    });

    // Primary category (must be inside category_ids)
    if (form.primaryCategoryId != null && form.primaryCategoryId !== "") {
      formData.append("category_id", String(form.primaryCategoryId));
    }

    formData.append("unit_price", Number(form.price));
    formData.append("quantity", Number(form.qty));
    formData.append("meta_title", form.metaTitle || form.name);
    formData.append(
      "meta_description",
      form.metaDescription || form.description
    );
    formData.append("hot_sale", form.hotSale ? "True" : "False");

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

    if (form.isDesign && form.designNames.length > 0) {
      form.designNames.forEach((name) => {
        if (name && name.trim() !== "") {
          formData.append("design_names", name.trim());
        }
      });
    }

    // New images only (file present, no id)
    const newImages = form.images.filter((img) => img.file && !img.id);
    newImages.forEach((img) => {
      formData.append("images", img.file);
    });

    // Thumbnail handling
    const thumbnailImage = form.images[form.thumbnailIndex];
    if (thumbnailImage && thumbnailImage.file && !thumbnailImage.id) {
      const newImageIndex = newImages.findIndex(
        (img) => img.file === thumbnailImage.file
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
      colors: !form.isDesign && form.colors.length === 0,
      categories: form.categoryIds.length === 0 || !form.primaryCategoryId,
    };

    setErrors(newErrors);

    if (!form.name || !form.price || !form.qty) {
      Swal.fire("Warning", "Please fill all required fields", "warning");
      return false;
    }

    if (form.categoryIds.length === 0) {
      Swal.fire("Warning", "Please select at least one category", "warning");
      return false;
    }

    if (!form.primaryCategoryId) {
      Swal.fire("Warning", "Please set a primary category", "warning");
      return false;
    }

    if (!form.categoryIds.includes(Number(form.primaryCategoryId))) {
      Swal.fire(
        "Warning",
        "Primary category must be one of the selected categories",
        "warning"
      );
      return false;
    }

    if (!form.isDesign && form.images.length === 0) {
      Swal.fire(
        "Warning",
        "Please upload at least one image for regular products",
        "warning"
      );
      return false;
    }

    if (!form.isDesign && !form.images[form.thumbnailIndex]) {
      Swal.fire("Warning", "Please select a thumbnail image", "warning");
      return false;
    }

    if (!form.isDesign && !form.images[form.thumbnailIndex]?.id) {
      Swal.fire(
        "Warning",
        "Thumbnail must be an existing saved image. Please save the product first or select an existing image as thumbnail.",
        "warning"
      );
      return false;
    }

    if (newErrors.sizes) {
      Swal.fire("Warning", "Please select at least one size", "warning");
      return false;
    }

    if (!form.isDesign && newErrors.colors) {
      Swal.fire("Warning", "Please select at least one color", "warning");
      return false;
    }

    if (form.isDesign) {
      if (form.designNames.length === 0) {
        Swal.fire(
          "Warning",
          "Please add at least one design name",
          "warning"
        );
        return false;
      }
      const emptyNames = form.designNames.filter(
        (name) => !name || name.trim() === ""
      );
      if (emptyNames.length > 0) {
        Swal.fire("Warning", "Please enter names for all designs", "warning");
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

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
      const headers = {};
      const endpoint = `/api/product/update-product/${id}/`;

      if (form.isDesign) {
        payload = createJsonPayload();
        headers["Content-Type"] = "application/json";
      } else {
        payload = createFormDataPayload();
      }

      Swal.fire({
        title: "Updating Product...",
        text: "Please wait while we update your product",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      if (form.isDesign) {
        await api.put(endpoint, payload, { headers });
      } else {
        await api.put(endpoint, payload);
      }

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Updated Successfully!",
        text: "Product has been updated",
        confirmButtonText: "OK",
        confirmButtonColor: "#000",
        timer: 3000,
      }).then(() => {
        router.push("/dashboard/product-list");
      });
    } catch (error) {
      Swal.close();
      console.error("Update error:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.data?.error === "design_names is required") {
        Swal.fire({
          icon: "error",
          title: "Server Configuration Error",
          text: "The server is incorrectly requiring design_names for non-design products. Please check the backend validation.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            "Update failed. Please try again.",
          confirmButtonText: "OK",
          confirmButtonColor: "#000",
        });
      }
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
                  Unit Price *
                </label>
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
                <label className="block text-[16px] font-medium mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  className="w-full border border-black/20 rounded px-3 py-2"
                  placeholder="0"
                  min="0"
                />
              </div>

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

              {/* ===== MULTI MAIN CATEGORY + SUBCATEGORIES ===== */}
              <div className="col-span-2">
                <label className="block text-[16px] font-medium mb-2">
                  Main Categories *
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (select one or more — sub-categories will appear below)
                  </span>
                  {errors.categories && (
                    <span className="text-red-500 ml-2 text-sm">
                      (Select at least one category and pick a primary)
                    </span>
                  )}
                </label>

                {/* Main category chips (multi-select) */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {parentCategories.map((cat) => {
                    const selected = selectedParentIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleParentCategory(cat.id)}
                        className={`px-4 py-2 rounded border transition text-sm font-medium ${
                          selected
                            ? "bg-black text-white border-black"
                            : errors.categories
                            ? "border-red-500 hover:border-red-600"
                            : "border-black/20 hover:border-black"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-categories grouped per selected main category */}
                {selectedParentIds.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Select one or more Main Categories above to load their
                    sub-categories.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedParentIds.map((pid) => {
                      const parent = parentCategories.find((p) => p.id === pid);
                      const subs = subCategoriesByParent[pid] || [];
                      return (
                        <div
                          key={pid}
                          className="border border-black/10 rounded p-3 bg-gray-50"
                        >
                          <p className="text-sm font-semibold mb-2">
                            {parent?.name} — sub-categories
                          </p>
                          {subs.length === 0 ? (
                            <p className="text-xs text-gray-500">
                              No sub-categories under this main category. The
                              main category itself is already assigned.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {subs.map((sub) => {
                                const selected = form.categoryIds.includes(
                                  sub.id
                                );
                                const isPrimary =
                                  Number(form.primaryCategoryId) === sub.id;
                                return (
                                  <div
                                    key={sub.id}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded border transition text-sm ${
                                      selected
                                        ? "bg-black text-white border-black"
                                        : "border-black/20 bg-white hover:border-black"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleCategory(sub.id)}
                                      className="font-medium"
                                    >
                                      {sub.name}
                                    </button>
                                    {selected && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPrimaryCategory(sub.id)
                                        }
                                        title="Set as primary category"
                                        className={`ml-1 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition ${
                                          isPrimary
                                            ? "bg-yellow-400 text-black"
                                            : "bg-white/20 text-white hover:bg-white/30"
                                        }`}
                                      >
                                        <Star
                                          size={10}
                                          fill={
                                            isPrimary ? "currentColor" : "none"
                                          }
                                        />
                                        {isPrimary ? "Primary" : "Set Primary"}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary of all selected categories */}
                {form.categoryIds.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded border border-black/10">
                    <p className="text-sm font-medium mb-2">
                      Selected categories:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {form.categoryIds.map((cid) => {
                        const isPrimary =
                          Number(form.primaryCategoryId) === Number(cid);
                        return (
                          <span
                            key={cid}
                            className={`text-xs px-2 py-1 rounded border ${
                              isPrimary
                                ? "bg-yellow-100 border-yellow-400 font-semibold"
                                : "bg-white border-black/20"
                            }`}
                          >
                            {getCategoryName(cid)}
                            {isPrimary && " ★"}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-[16px] font-medium mb-1">
                  Description
                </label>
                <div className="border border-black/20 rounded">
                  <div className="flex flex-wrap gap-2 border-b bg-gray-50 px-4 py-3">
                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                        className={`p-1 rounded ${
                          editor.isActive("heading", { level: 1 })
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <Heading size={16} />
                      </button>
                      <button
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                        className={`p-1 rounded ${
                          editor.isActive("heading", { level: 2 })
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        H2
                      </button>
                      <button
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                        }
                        className={`p-1 rounded ${
                          editor.isActive("heading", { level: 3 })
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        H3
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1 rounded ${
                          editor.isActive("bold")
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleItalic().run()
                        }
                        className={`p-1 rounded ${
                          editor.isActive("italic")
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleUnderline().run()
                        }
                        className={`p-1 rounded ${
                          editor.isActive("underline")
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <Underline size={16} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleBulletList().run()
                        }
                        className={`p-1 rounded ${
                          editor.isActive("bulletList")
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <List size={16} />
                      </button>
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleOrderedList().run()
                        }
                        className={`p-1 rounded ${
                          editor.isActive("orderedList")
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        1.
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleBlockquote().run()
                        }
                        className={`p-1 rounded ${
                          editor.isActive("blockquote")
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <Quote size={16} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                      <button
                        onClick={handleAddLink}
                        className={`p-1 rounded ${
                          editor.isActive("link")
                            ? "bg-gray-200 text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <Link size={16} />
                      </button>
                      {editor.isActive("link") && (
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
                        className={`p-1 rounded ${
                          !editor.can().undo()
                            ? "text-gray-400"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <Undo size={16} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className={`p-1 rounded ${
                          !editor.can().redo()
                            ? "text-gray-400"
                            : "text-gray-600 hover:text-black"
                        }`}
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
                            if (e.key === "Enter") handleAddLink();
                            if (e.key === "Escape") {
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
                  Use the toolbar to format text. All formatting will be
                  preserved when displayed.
                </p>
              </div>
            </div>
          </div>

          {/* SIZES */}
          <div className="bg-white p-6 rounded-md shadow-sm">
            <label className="block text-[16px] font-medium mb-2">
              Sizes *
              {errors.sizes && (
                <span className="text-red-500 ml-2">
                  (Please select at least one size)
                </span>
              )}
            </label>
            <div className="flex gap-3 flex-wrap">
              {sizesList.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => toggleArray("sizes", size.id)}
                  className={`px-4 py-2 rounded border transition ${
                    form.sizes.includes(size.id)
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

          {/* COLORS */}
          {!form.isDesign && (
            <div className="bg-white p-6 rounded-md shadow-sm">
              <label className="block text-[16px] font-medium mb-2">
                Colors *
                {errors.colors && (
                  <span className="text-red-500 ml-2">
                    (Please select at least one color)
                  </span>
                )}
              </label>
              <div className="flex gap-6 flex-wrap">
                {colorsList.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => toggleArray("colors", c.id)}
                    className="cursor-pointer text-center group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full border-2 mx-auto transition ${
                        form.colors.includes(c.id)
                          ? "border-black scale-110 shadow"
                          : errors.colors
                          ? "border-red-500 group-hover:border-red-600"
                          : "border-black/20 group-hover:border-black/60"
                      }`}
                      style={{
                        backgroundColor: c.hex_code || c.code || "#cccccc",
                      }}
                    />
                    <span className="text-[14px] mt-2 block font-medium">
                      {c.name}
                    </span>
                    {c.hex_code && (
                      <span className="text-[12px] text-gray-500 block">
                        {c.hex_code}
                      </span>
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

          {/* IMAGES */}
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
                    const isSettingThumbnailExisting =
                      isExistingImage && settingThumbnail === img.id;
                    const isDeletingExisting =
                      isExistingImage && deletingImage === img.id;

                    return (
                      <div
                        key={
                          img.id
                            ? `existing-${img.id}`
                            : `new-${index}-${img.file?.name}`
                        }
                        className={`relative border rounded ${
                          isThumbnail
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
                              onClick={() =>
                                isExistingImage && handleSetThumbnail(index)
                              }
                              disabled={
                                isSettingThumbnailExisting ||
                                isDeletingExisting ||
                                isNewImage
                              }
                              className={`px-2 py-1 rounded flex items-center gap-1 ${
                                isNewImage
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : isSettingThumbnailExisting
                                  ? "bg-gray-400 text-white cursor-not-allowed"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}
                              title={
                                isNewImage
                                  ? "Save product first to set as thumbnail"
                                  : "Set as thumbnail"
                              }
                            >
                              {isSettingThumbnailExisting && (
                                <div className="h-3 w-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                              )}
                              Set Thumbnail
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteImage(img.id, index)}
                            disabled={
                              isDeletingExisting || isSettingThumbnailExisting
                            }
                            className={`flex items-center gap-1 ${
                              isDeletingExisting
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
                Note: New uploaded images (marked with New badge) can be removed
                immediately. To set a new image as thumbnail, you need to save
                the product first.
              </p>
            </div>
          )}

          {/* DESIGN NAMES */}
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
                Enter names for your designs. These names will be used to
                identify different design variations.
              </p>

              {form.designNames.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                  <p className="text-gray-500">
                    No design names added yet. Click "Add Design Name" to start.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.designNames.map((name, index) => (
                    <div
                      key={`design-${index}`}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Design {index + 1} Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) =>
                            updateDesignName(index, e.target.value)
                          }
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
              <label className="block text-[16px] font-medium mb-1">
                Meta Title
              </label>
              <input
                value={form.metaTitle}
                onChange={(e) =>
                  setForm({ ...form, metaTitle: e.target.value })
                }
                className="w-full border border-black/20 rounded px-3 py-2"
                placeholder="SEO title for search engines"
              />
            </div>
            <div>
              <label className="block text-[16px] font-medium mb-1">
                Meta Description
              </label>
              <textarea
                value={form.metaDescription}
                onChange={(e) =>
                  setForm({ ...form, metaDescription: e.target.value })
                }
                rows={3}
                className="w-full border border-black/20 rounded px-3 py-2"
                placeholder="SEO description for search engines"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={updating || loading}
              className={`px-8 py-3 rounded font-medium transition flex items-center gap-2 cursor-pointer ${
                updating || loading
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
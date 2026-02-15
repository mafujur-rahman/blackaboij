"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  Upload,
  Trash2,
  Palette,
  Camera,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Layout,
  Eye,
  AlertCircle,
  Save,
  Edit,
} from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import Image from "next/image";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import ColorSelector from "./ColorSelector";
import DesignSelector from "./DesignSelector";
import DesignImageUploader from "./DesignImageUploader";

const AddDesign = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState(null);

  // Store ALL colors from the colors API
  const [allColors, setAllColors] = useState([]);
  // Store ALL designs from the product
  const [allDesigns, setAllDesigns] = useState([]);

  // ===== EDITABLE PRODUCT FIELDS =====
  const [editableFields, setEditableFields] = useState({
    name: "",
    category_id: "",
    description: "",
    unit_price: "",
    quantity: "",
    meta_title: "",
    meta_description: "",
  });

  // Store SELECTED colors and designs
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedDesigns, setSelectedDesigns] = useState([]);

  // Store design images organized by color and design (SINGLE image per design)
  const [designImages, setDesignImages] = useState({});

  // Track which images are new/modified (pending changes)
  const [pendingChanges, setPendingChanges] = useState({
    fields: false,
    images: false
  });

  // Store existing product data for preview
  const [existingProductData, setExistingProductData] = useState(null);

  // Track if preview is expanded
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all colors from colors API
      const colorsRes = await api.get("/api/colors/get-all-colors/");
      const allColorsData = colorsRes.data.data || [];
      setAllColors(allColorsData);

      // Fetch product details
      const productRes = await api.get(`/api/products/get-all-products/`);

      const foundProduct = productRes.data.data.find((p) => p.id === Number(id));
      if (!foundProduct) {
        Swal.fire("Error", "Product not found", "error");
        router.push("/dashboard/product-list");
        return;
      }

      if (!foundProduct.is_design) {
        Swal.fire("Error", "This product is not marked as a design product", "error");
        router.push("/dashboard/product-list");
        return;
      }

      setProduct(foundProduct);
      setExistingProductData(foundProduct); // Store for preview

      // Set editable fields with current product data
      setEditableFields({
        name: foundProduct.name || "",
        category_id: foundProduct.category?.id || "",
        description: stripHtml(foundProduct.description || ""),
        unit_price: foundProduct.unit_price || "",
        quantity: foundProduct.quantity || "",
        meta_title: foundProduct.meta_title || "",
        meta_description: foundProduct.meta_description || "",
      });

      const productDesigns = foundProduct.designs || [];
      setAllDesigns(productDesigns);

      // Initialize selected designs - select ALL by default
      setSelectedDesigns(productDesigns.map((d) => d.id));

      // Initialize selected colors from product colors if they exist
      const productColorIds = foundProduct.colors?.map((c) => c.id) || [];
      setSelectedColors(productColorIds);

      

      // Initialize designImages structure for selected colors and designs
      const initialImages = {};
      allColorsData.forEach((color) => {
        if (productColorIds.includes(color.id)) {
          initialImages[color.id] = {
            front_image: null,
            back_images: {}, // Will store SINGLE image per design
          };
        }
      });
      setDesignImages(initialImages);


      // If product already has uploaded images, populate them
      if (foundProduct.product_colors) {
        const updatedImages = { ...initialImages };

        foundProduct.product_colors.forEach((productColor) => {
          const colorId = productColor.color;

          if (!updatedImages[colorId]) {
            updatedImages[colorId] = {
              front_image: null,
              back_images: {},
            };
          }

          // Front image
          if (productColor.front_image?.image) {
            updatedImages[colorId] = {
              ...updatedImages[colorId],
              front_image: {
                existing: true,
                url: getImageUrl(productColor.front_image.image),
                name: productColor.front_image.image.split("/").pop(),
                id: productColor.front_image.id,
              },
            };
          }

          // Back images (ONE per design)
          productColor.back_designs.forEach((backDesign) => {
            const designId = backDesign.design;

            if (!updatedImages[colorId].back_images[designId]) {
              updatedImages[colorId].back_images[designId] = {
                existing: true,
                url: getImageUrl(backDesign.image),
                name: backDesign.image.split("/").pop(),
                back_design_id: backDesign.id,
                design_name: backDesign.design_name,
                design_id: designId,
                color_id: colorId,
              };
            }
          });
        });

        setDesignImages(updatedImages);
      }

      // Reset pending changes
      setPendingChanges({ fields: false, images: false });
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Failed to load data", "error");
      router.push("/dashboard/product-list");
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
    setPendingChanges(prev => ({ ...prev, fields: true }));
  };

  // Check if color already has designs in the API
  const colorHasExistingDesigns = (colorId) => {
    if (!existingProductData?.product_colors) return false;

    const productColor = existingProductData.product_colors.find(
      (pc) => pc.color === parseInt(colorId)
    );

    return productColor && productColor.back_designs && productColor.back_designs.length > 0;
  };

  // Toggle color selection with duplicate check
  const toggleColorSelection = (colorId) => {
    // Check if trying to add a color that already has designs
    if (!selectedColors.includes(colorId) && colorHasExistingDesigns(colorId)) {
      Swal.fire({
        title: "Color Already Has Designs!",
        html: `
          <div class="text-left">
            <p class="mb-3">This color already has existing designs in the system.</p>
            <p class="text-sm text-gray-600 mb-2">You can:</p>
            <ul class="list-disc pl-5 text-sm text-gray-600">
              <li>Update existing designs using the update button in preview</li>
              <li>Delete existing designs first</li>
            </ul>
          </div>
        `,
        icon: "warning",
        confirmButtonColor: "#000000",
        confirmButtonText: "OK",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        cancelButtonText: "View Existing",
      }).then((result) => {
        if (result.isDismissed) {
          document.getElementById("existing-data-preview")?.scrollIntoView({
            behavior: "smooth"
          });
        }
      });
      return;
    }

    // Normal toggle behavior
    setSelectedColors((prev) => {
      if (prev.includes(colorId)) {
        setDesignImages((prevImages) => {
          const updated = { ...prevImages };
          if (updated[colorId]) {
            if (updated[colorId]?.front_image?.preview) {
              URL.revokeObjectURL(updated[colorId].front_image.preview);
            }

            Object.values(updated[colorId]?.back_images || {}).forEach((img) => {
              if (img?.preview) {
                URL.revokeObjectURL(img.preview);
              }
            });

            delete updated[colorId];
          }
          return updated;
        });
        return prev.filter((id) => id !== colorId);
      } else {
        setDesignImages((prev) => ({
          ...prev,
          [colorId]: {
            front_image: null,
            back_images: {},
          },
        }));
        return [...prev, colorId];
      }
    });
    setPendingChanges(prev => ({ ...prev, images: true }));
  };

  // Toggle design selection
  const toggleDesignSelection = (designId) => {
    setSelectedDesigns((prev) => {
      if (prev.includes(designId)) {
        setDesignImages((prevImages) => {
          const updated = { ...prevImages };
          Object.keys(updated).forEach((colorId) => {
            const designImage = updated[colorId]?.back_images?.[designId];
            if (designImage?.preview) {
              URL.revokeObjectURL(designImage.preview);
            }

            if (updated[colorId]?.back_images?.[designId]) {
              delete updated[colorId].back_images[designId];
            }
          });
          return updated;
        });
        return prev.filter((id) => id !== designId);
      } else {
        return [...prev, designId];
      }
    });
    setPendingChanges(prev => ({ ...prev, images: true }));
  };

  // Select all designs
  const selectAllDesigns = () => {
    const allDesignIds = allDesigns.map((d) => d.id);
    setSelectedDesigns(allDesignIds);
    setPendingChanges(prev => ({ ...prev, images: true }));
  };

  // Deselect all designs
  const deselectAllDesigns = () => {
    setDesignImages((prevImages) => {
      const updated = { ...prevImages };
      Object.keys(updated).forEach((colorId) => {
        Object.keys(updated[colorId]?.back_images || {}).forEach((designId) => {
          const image = updated[colorId].back_images[designId];
          if (image?.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
        updated[colorId].back_images = {};
      });
      return updated;
    });
    setSelectedDesigns([]);
    setPendingChanges(prev => ({ ...prev, images: true }));
  };

  // Handle front image upload
  const handleFrontImageUpload = (colorId, file) => {
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Image exceeds 10MB limit", "error");
      return;
    }

    const existingFrontImage = designImages[colorId]?.front_image;
    if (existingFrontImage?.preview && !existingFrontImage.existing) {
      URL.revokeObjectURL(existingFrontImage.preview);
    }

    setDesignImages((prev) => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        front_image: {
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          isNew: true, // Mark as new image
        },
      },
    }));
    setPendingChanges(prev => ({ ...prev, images: true }));
  };

  // Handle back image upload for a specific design (SINGLE image)
  const handleBackImageUpload = (colorId, designId, file) => {
    if (!selectedDesigns.includes(parseInt(designId))) {
      Swal.fire("Error", "This design is not selected", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Image exceeds 10MB limit", "error");
      return;
    }

    // Check if there's an existing image and revoke its preview
    const existingImage = designImages[colorId]?.back_images?.[designId];
    if (existingImage?.preview && !existingImage.existing) {
      URL.revokeObjectURL(existingImage.preview);
    }

    setDesignImages((prev) => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        back_images: {
          ...prev[colorId]?.back_images,
          [designId]: {
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            isNew: true, // Mark as new image
          },
        },
      },
    }));
    setPendingChanges(prev => ({ ...prev, images: true }));
  };

  // Remove front image
  const removeFrontImage = (colorId) => {
    Swal.fire({
      title: "Remove Front Image?",
      text: "Are you sure you want to remove this front image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDesignImages((prev) => {
          const updated = { ...prev };
          if (updated[colorId]?.front_image?.preview && !updated[colorId].front_image.existing) {
            URL.revokeObjectURL(updated[colorId].front_image.preview);
          }
          updated[colorId] = {
            ...updated[colorId],
            front_image: null,
          };
          return updated;
        });
        setPendingChanges(prev => ({ ...prev, images: true }));
      }
    });
  };

  // Remove back image
  const removeBackImage = (colorId, designId) => {
    Swal.fire({
      title: "Remove Back Image?",
      text: "Are you sure you want to remove this back image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDesignImages((prev) => {
          const updated = { ...prev };
          const image = updated[colorId]?.back_images?.[designId];

          if (image?.preview && !image.existing) {
            URL.revokeObjectURL(image.preview);
          }

          if (updated[colorId]?.back_images?.[designId]) {
            delete updated[colorId].back_images[designId];
          }

          return updated;
        });
        setPendingChanges(prev => ({ ...prev, images: true }));
      }
    });
  };

  // Clear all images for a color
  const clearColorImages = (colorId) => {
    Swal.fire({
      title: "Clear all images?",
      text: "This will remove all front and back images for this color.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clear all!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDesignImages((prev) => {
          const updated = { ...prev };

          if (updated[colorId]?.front_image?.preview && !updated[colorId].front_image.existing) {
            URL.revokeObjectURL(updated[colorId].front_image.preview);
          }

          Object.values(updated[colorId]?.back_images || {}).forEach((img) => {
            if (img?.preview && !img.existing) {
              URL.revokeObjectURL(img.preview);
            }
          });

          updated[colorId] = {
            front_image: null,
            back_images: {},
          };

          return updated;
        });
        setPendingChanges(prev => ({ ...prev, images: true }));
      }
    });
  };

  const stripHtml = (html) => {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};


  // ============== MAIN UPDATE FUNCTION - SUBMIT EVERYTHING TOGETHER ==============
  const handleUpdateAll = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

      if (!token) {
        Swal.fire('Error', 'Authentication token not found', 'error');
        return;
      }

      const productIdToUse = product?.id || id;
      const parsedProductId = parseInt(productIdToUse);

      if (isNaN(parsedProductId)) {
        Swal.fire('Error', 'Invalid product ID', 'error');
        return;
      }

      // Create FormData with ALL data
      const formData = new FormData();

      // 1. Add basic product fields
      formData.append("name", editableFields.name);
      formData.append("category_id", editableFields.category_id);
      formData.append("description", editableFields.description || "");
      formData.append("unit_price", editableFields.unit_price);
      formData.append("quantity", editableFields.quantity);

      // 2. Add size_ids (from original product - assuming these don't change)
      if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(size => {
          formData.append("size_ids", size.id);
        });
      }

      // 3. Add selected color_ids
      if (selectedColors.length > 0) {
        selectedColors.forEach(cId => {
          formData.append("color_ids", cId);
        });
      }

      // 4. Add meta fields
      formData.append("meta_title", editableFields.meta_title || "");
      formData.append("meta_description", editableFields.meta_description || "");

      // 5. Add ALL new/modified front images
      selectedColors.forEach(colorId => {
        const colorData = designImages[colorId];
        if (colorData?.front_image?.isNew) {
          // For front image: front_image_{colorId}
          formData.append(`front_image_${colorId}`, colorData.front_image.file);
          console.log(`Adding front image for color ${colorId}`);
        }
      });

      // 6. Add ALL new/modified back images
      selectedColors.forEach(colorId => {
        const colorData = designImages[colorId];
        if (colorData?.back_images) {
          Object.entries(colorData.back_images).forEach(([designId, imageData]) => {
            if (imageData?.isNew) {
              // For back image: back_image_{colorId}_{designId}
              formData.append(`back_image_${colorId}_${designId}`, imageData.file);
              console.log(`Adding back image for color ${colorId} and design ${designId}`);
            }
          });
        }
      });

      // Log what we're sending
      console.log("Sending PUT request with all data:");
      console.log("- Product fields:", editableFields);
      console.log("- Selected colors:", selectedColors);
      console.log("- Selected designs:", selectedDesigns);
      console.log("- New front images:", selectedColors.filter(c => designImages[c]?.front_image?.isNew).length);
      console.log("- New back images:", selectedColors.reduce((count, c) =>
        count + Object.values(designImages[c]?.back_images || {}).filter(img => img?.isNew).length, 0));

      Swal.fire({
        title: "Updating Product...",
        text: "Please wait while we update all product data and images",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await api.put(
        `/api/product/update-product/${parsedProductId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.close();

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Product updated successfully with all changes",
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "OK"
        });

        // Reset pending changes
        setPendingChanges({ fields: false, images: false });

        // Refresh data
        await fetchAllData();
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to update product",
          icon: "error",
          confirmButtonColor: "#000000",
          confirmButtonText: "OK"
        });
      }

    } catch (error) {
      console.error("Update error:", error);
      Swal.close();

      let errorMessage = "Failed to update product";
      if (error.response?.data) {
        console.error("Error response data:", error.response.data);
        errorMessage = error.response.data.message ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#000000",
        confirmButtonText: "OK"
      });
    }
  };

  // Validate before update
  const validateBeforeUpdate = () => {
    if (selectedColors.length === 0) {
      Swal.fire("Warning", "Please select at least one color", "warning");
      return false;
    }

    if (selectedDesigns.length === 0) {
      Swal.fire("Warning", "Please select at least one design", "warning");
      return false;
    }

    // Check required fields
    if (!editableFields.name) {
      Swal.fire("Warning", "Product name is required", "warning");
      return false;
    }

    if (!editableFields.category_id) {
      Swal.fire("Warning", "Category is required", "warning");
      return false;
    }

    if (!editableFields.unit_price || editableFields.unit_price <= 0) {
      Swal.fire("Warning", "Valid unit price is required", "warning");
      return false;
    }

    if (!editableFields.quantity || editableFields.quantity < 0) {
      Swal.fire("Warning", "Valid quantity is required", "warning");
      return false;
    }

    return true;
  };

  // Get color by ID from allColors
  const getColorById = (colorId) => {
    return allColors.find((color) => color.id === parseInt(colorId));
  };

  // Get design by ID from allDesigns
  const getDesignById = (designId) => {
    return allDesigns.find((design) => design.id === parseInt(designId));
  };

  // Check if a color is ready (has all required images for SELECTED designs)
  const isColorReady = (colorId) => {
    const colorData = designImages[colorId];
    if (!colorData) return false;

    if (!colorData.front_image) return false;

    const missingDesigns = selectedDesigns.filter((designId) => {
      const backImage = colorData?.back_images?.[designId];
      return !backImage;
    });

    return missingDesigns.length === 0;
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="min-h-screen flex justify-center items-center">
          <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="min-h-screen space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm border border-gray-200">
          <h1 className="text-xl font-bold text-black">Edit Design Product - {product?.name}</h1>
          <div className="flex items-center space-x-2 text-[16px] text-gray-700">
            <button onClick={() => router.push("/")} className="hover:text-black flex items-center">
              <Home size={16} />
            </button>
            <ChevronRight size={14} />
            <button
              onClick={() => router.push("/dashboard/product-list")}
              className="hover:text-black"
            >
              Products
            </button>
            <ChevronRight size={14} />
            <span className="text-black font-medium">Edit Design</span>
          </div>
        </div>

        {/* PRODUCT INFORMATION FORM - EDITABLE FIELDS */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Product Information</h2>
            {pendingChanges.fields && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Unsaved changes</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editableFields.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

           

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editableFields.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={editableFields.unit_price}
                onChange={(e) => handleFieldChange("unit_price", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={editableFields.quantity}
                onChange={(e) => handleFieldChange("quantity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={editableFields.meta_title}
                onChange={(e) => handleFieldChange("meta_title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <input
                type="text"
                value={editableFields.meta_description}
                onChange={(e) => handleFieldChange("meta_description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* COLOR SELECTION */}
        <ColorSelector
          allColors={allColors}
          selectedColors={selectedColors}
          designImages={designImages}
          isColorReadyForUpload={isColorReady}
          toggleColorSelection={toggleColorSelection}
          setSelectedColors={setSelectedColors}
          colorHasExistingDesigns={colorHasExistingDesigns}
        />

        {/* DESIGN SELECTION */}
        <DesignSelector
          allDesigns={allDesigns}
          selectedDesigns={selectedDesigns}
          selectedColors={selectedColors}
          designImages={designImages}
          toggleDesignSelection={toggleDesignSelection}
          selectAllDesigns={selectAllDesigns}
          deselectAllDesigns={deselectAllDesigns}
        />

        {/* DESIGN IMAGES UPLOAD */}
        {selectedColors.length > 0 && selectedDesigns.length > 0 ? (
          <DesignImageUploader
            selectedColors={selectedColors}
            selectedDesigns={selectedDesigns}
            designImages={designImages}
            allColors={allColors}
            allDesigns={allDesigns}
            isColorReadyForUpload={isColorReady}
            hasExistingImages={(colorId) => {
              const colorData = designImages[colorId];
              if (!colorData) return false;
              if (colorData.front_image?.existing) return true;
              return Object.values(colorData.back_images || {}).some((img) => img?.existing);
            }}
            onFrontImageUpload={handleFrontImageUpload}
            onBackImageUpload={handleBackImageUpload}
            onRemoveFrontImage={removeFrontImage}
            onRemoveBackImage={removeBackImage}
            onClearColorImages={clearColorImages}
            onToggleColor={toggleColorSelection}
            colorHasExistingDesigns={colorHasExistingDesigns}
          // Removed onUpdateDesign and onDeleteDesign
          />
        ) : (
          <div className="bg-white p-6 rounded-md shadow-sm text-center py-12 border border-gray-200">
            {selectedColors.length === 0 && selectedDesigns.length === 0 ? (
              <>
                <Palette className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-bold mb-2 text-black">No Colors or Designs Selected</h3>
                <p className="text-gray-600 mb-4">
                  Select colors and designs to start uploading images.
                </p>
              </>
            ) : selectedColors.length === 0 ? (
              <>
                <Palette className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-bold mb-2 text-black">No Colors Selected</h3>
                <p className="text-gray-600 mb-4">Select colors to start uploading images.</p>
              </>
            ) : (
              <>
                <Layout className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-bold mb-2 text-black">No Designs Selected</h3>
                <p className="text-gray-600 mb-4">Select designs to start uploading images.</p>
              </>
            )}
          </div>
        )}

        {/* ACTION BUTTONS - SINGLE UPDATE BUTTON */}
        {selectedColors.length > 0 && selectedDesigns.length > 0 && (
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200  bottom-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold mb-1 text-black">Review Changes</h3>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">
                    {selectedColors.filter((id) => isColorReady(id)).length} of {selectedColors.length} colors ready
                  </p>
                  {pendingChanges.fields && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Product fields modified
                    </span>
                  )}
                  {pendingChanges.images && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      New images added
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
               

                <button
                  onClick={() => router.push("/dashboard/product-list")}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-black"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateAll}
                  disabled={uploading || (!pendingChanges.fields && !pendingChanges.images)}
                  className={`px-6 py-2 rounded font-medium flex items-center gap-2 ${uploading || (!pendingChanges.fields && !pendingChanges.images)
                      ? "bg-gray-400 cursor-not-allowed text-gray-600"
                      : "bg-black text-white hover:bg-gray-800"
                    }`}
                >
                  {uploading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update All Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

export default AddDesign;
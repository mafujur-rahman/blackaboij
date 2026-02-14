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
} from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import Image from "next/image";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import ColorSelector from "./ColorSelector";
import DesignSelector from "./DesignSelector";
import DesignImageUploader from "./DesignImageUploader";
import ExistingDataPreview from "./ExistingDataPreview";

// Import child components


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

  // Store SELECTED colors
  const [selectedColors, setSelectedColors] = useState([]);

  // Store SELECTED designs
  const [selectedDesigns, setSelectedDesigns] = useState([]);

  // Store design images organized by color and design (SINGLE image per design)
  const [designImages, setDesignImages] = useState({});

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

            // Only store the first image for each design
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
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Failed to load data", "error");
      router.push("/dashboard/product-list");
    } finally {
      setLoading(false);
    }
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
          // Scroll to preview
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

            // Revoke back image previews
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
  };

  // Select all designs
  const selectAllDesigns = () => {
    const allDesignIds = allDesigns.map((d) => d.id);
    setSelectedDesigns(allDesignIds);
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
        },
      },
    }));
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

    // Check if this color already has this design in the API
    const hasExistingDesign = existingProductData?.product_colors?.some(
      (pc) => pc.color === parseInt(colorId) &&
        pc.back_designs?.some(bd => bd.design === parseInt(designId))
    );

    if (hasExistingDesign) {
      Swal.fire({
        title: "Design Already Exists!",
        text: "This design already exists for this color. Please use the update button to modify it.",
        icon: "warning",
        confirmButtonColor: "#000000",
        confirmButtonText: "OK",
      });
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
          },
        },
      },
    }));
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
      }
    });
  };

  // ============== HELPER FUNCTION FOR API RESPONSES ==============

  // Helper function to handle API responses
  const handleApiResponse = async (response) => {
    // Check if response is ok
    if (!response.ok) {
      // Try to get the response text
      const text = await response.text();
      console.error('API Error Response:', text);
      
      // Check if it's HTML (server error page)
      if (text.trim().startsWith('<!DOCTYPE')) {
        // Try to extract the error message from HTML
        const errorMatch = text.match(/<title>([^<]+)<\/title>/);
        const errorTitle = errorMatch ? errorMatch[1] : 'Unknown error';
        throw new Error(`Server error (${response.status}): ${errorTitle}`);
      }
      
      // Try to parse as JSON
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || errorData.error || errorData.detail || `Server error: ${response.status}`);
      } catch (e) {
        if (e instanceof SyntaxError) {
          // If it's not JSON, show the first 500 characters of HTML
          throw new Error(`Server error (${response.status}): ${text.substring(0, 500)}`);
        }
        throw e;
      }
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  };

  // ============== UPDATE FUNCTIONS ==============

  // Update function for front image
  const handleUpdateFrontImage = async (colorId, file) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        Swal.fire('Error', 'Authentication token not found', 'error');
        return;
      }
      
      const productIdToUse = product?.id || id;
      
      // Ensure product ID is valid
      const parsedProductId = parseInt(productIdToUse);
      const parsedColorId = parseInt(colorId);
      
      if (isNaN(parsedProductId)) {
        Swal.fire('Error', 'Invalid product ID', 'error');
        return;
      }
      
      console.log('Updating front image for:', { productId: parsedProductId, colorId: parsedColorId });
      
      // Create FormData with all required product fields
      const formData = new FormData();
      
      // Add basic product info
      formData.append("name", product.name);
      formData.append("category_id", product.category.id);
      formData.append("description", product.description || "");
      formData.append("unit_price", product.unit_price);
      formData.append("quantity", product.quantity);
      
      // Add size_ids
      if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(size => {
          formData.append("size_ids", size.id);
        });
      }
      
      // Add color_ids (include all selected colors)
      if (selectedColors.length > 0) {
        selectedColors.forEach(cId => {
          formData.append("color_ids", cId);
        });
      }
      
      // Add meta fields
      formData.append("meta_title", product.meta_title || "");
      formData.append("meta_description", product.meta_description || "");
      
      // Add the front image
      formData.append("front_image_1", file);
      
      Swal.fire({
        title: "Updating...",
        text: "Please wait while we update the front image",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch(`https://api.blackaboij.com/api/product/update-product/${parsedProductId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await handleApiResponse(response);
      
      Swal.close();
      
      if (data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Front image updated successfully',
          icon: 'success',
          confirmButtonColor: "#000000",
          confirmButtonText: 'OK'
        });
        await fetchAllData();
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to update front image',
          icon: 'error',
          confirmButtonColor: "#000000",
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      Swal.close();
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update front image',
        icon: 'error',
        confirmButtonColor: "#000000",
        confirmButtonText: 'OK'
      });
    }
  };

  // Update function for back design image using api instance
  const handleUpdateBackImageWithApi = async (colorId, designId, file) => {
    try {
      const productIdToUse = product?.id || id;
      
      const parsedProductId = parseInt(productIdToUse);
      const parsedColorId = parseInt(colorId);
      const parsedDesignId = parseInt(designId);
      
      if (isNaN(parsedProductId) || isNaN(parsedColorId) || isNaN(parsedDesignId)) {
        Swal.fire('Error', 'Invalid product ID, color ID, or design ID', 'error');
        return;
      }
      
      console.log('Updating back image with API instance:', { 
        productId: parsedProductId, 
        colorId: parsedColorId, 
        designId: parsedDesignId 
      });
      
      const formData = new FormData();
      
      // Add all required fields
      formData.append("name", product.name);
      formData.append("category_id", product.category.id);
      formData.append("description", product.description || "");
      formData.append("unit_price", product.unit_price);
      formData.append("quantity", product.quantity);
      
      if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(size => {
          formData.append("size_ids", size.id);
        });
      }
      
      if (selectedColors.length > 0) {
        selectedColors.forEach(cId => {
          formData.append("color_ids", cId);
        });
      }
      
      formData.append("meta_title", product.meta_title || "");
      formData.append("meta_description", product.meta_description || "");
      
      const fieldName = `back_image_${parsedColorId}_${parsedDesignId}`;
      console.log('Using field name:', fieldName);
      formData.append(fieldName, file);
      
      Swal.fire({
        title: "Updating...",
        text: "Please wait while we update the back design image",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      console.log('Sending PUT request to:', `https://api.blackaboij.com/api/product/update-product/${parsedProductId}/`);
      
      const response = await api.put(`/api/product/update-product/${parsedProductId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);
      
      Swal.close();
      
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Back design image updated successfully',
          icon: 'success',
          confirmButtonColor: "#000000",
          confirmButtonText: 'OK'
        });
        await fetchAllData();
      } else {
        Swal.fire({
          title: 'Error!',
          text: response.data.message || 'Failed to update back design image',
          icon: 'error',
          confirmButtonColor: "#000000",
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      Swal.close();
      
      let errorMessage = 'Failed to update back design image';
      if (error.response?.data) {
        console.error('Error response data:', error.response.data);
        errorMessage = error.response.data.message || 
                      error.response.data.error || 
                      JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: "#000000",
        confirmButtonText: 'OK'
      });
    }
  };

  // ============== DELETE FUNCTIONS ==============

  // Delete function for front image
  const handleDeleteFrontImage = async (colorId) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        Swal.fire('Error', 'Authentication token not found', 'error');
        return;
      }
      
      const productIdToUse = product?.id || id;
      
      const parsedProductId = parseInt(productIdToUse);
      const parsedColorId = parseInt(colorId);
      
      if (isNaN(parsedProductId) || isNaN(parsedColorId)) {
        Swal.fire('Error', 'Invalid product ID or color ID', 'error');
        return;
      }
      
      const deleteData = {
        product_id: parsedProductId,
        color_id: parsedColorId,
        image_type: "front"
      };
      
      console.log('Deleting front image with data:', deleteData);
      
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we delete the front image",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch('/api/product/delete-product-image/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData)
      });

      const data = await handleApiResponse(response);
      
      Swal.close();
      
      if (data.success) {
        Swal.fire({
          title: 'Deleted!',
          text: data.message || 'Front image deleted successfully',
          icon: 'success',
          confirmButtonColor: "#000000",
          confirmButtonText: 'OK'
        });
        await fetchAllData();
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to delete front image',
          icon: 'error',
          confirmButtonColor: "#000000",
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      Swal.close();
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to delete front image',
        icon: 'error',
        confirmButtonColor: "#000000",
        confirmButtonText: 'OK'
      });
    }
  };

  // Delete function for back design image
  const handleDeleteBackImage = async (colorId, designId) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        Swal.fire('Error', 'Authentication token not found', 'error');
        return;
      }
      
      const productIdToUse = product?.id || id;
      
      const parsedProductId = parseInt(productIdToUse);
      const parsedColorId = parseInt(colorId);
      const parsedDesignId = parseInt(designId);
      
      if (isNaN(parsedProductId) || isNaN(parsedColorId) || isNaN(parsedDesignId)) {
        Swal.fire('Error', 'Invalid product ID, color ID, or design ID', 'error');
        return;
      }
      
      const deleteData = {
        product_id: parsedProductId,
        color_id: parsedColorId,
        design_id: parsedDesignId,
        image_type: "back"
      };
      
      console.log('Deleting back image with data:', deleteData);
      
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we delete the back design image",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch('/api/product/delete-product-image/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData)
      });

      const data = await handleApiResponse(response);
      
      Swal.close();
      
      if (data.success) {
        Swal.fire({
          title: 'Deleted!',
          text: data.message || 'Back design image deleted successfully',
          icon: 'success',
          confirmButtonColor: "#000000",
          confirmButtonText: 'OK'
        });
        await fetchAllData();
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to delete back design image',
          icon: 'error',
          confirmButtonColor: "#000000",
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      Swal.close();
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to delete back design image',
        icon: 'error',
        confirmButtonColor: "#000000",
        confirmButtonText: 'OK'
      });
    }
  };

  // ============== MAIN UPDATE/DELETE FUNCTIONS ==============

  // Update existing design image
  const updateDesignImage = async (colorId, designId, imageData, imageType = "back") => {
    console.log('updateDesignImage called with:', { 
      colorId, 
      designId, 
      imageType, 
      hasFile: !!imageData?.file,
      fileName: imageData?.file?.name
    });
    
    const parsedColorId = parseInt(colorId);
    const parsedDesignId = designId ? parseInt(designId) : null;
    
    if (isNaN(parsedColorId)) {
      console.error('Invalid colorId:', colorId);
      Swal.fire('Error', 'Invalid color ID', 'error');
      return;
    }
    
    if (imageType === "back" && (parsedDesignId === null || isNaN(parsedDesignId))) {
      console.error('Invalid designId for back image:', designId);
      Swal.fire('Error', 'Invalid design ID', 'error');
      return;
    }
    
    if (!imageData?.file) {
      console.error('No file in imageData:', imageData);
      Swal.fire('Error', 'No image file provided', 'error');
      return;
    }
    
    if (imageType === "front") {
      await handleUpdateFrontImage(parsedColorId, imageData.file);
    } else {
      // Use the API instance version for better error handling
      await handleUpdateBackImageWithApi(parsedColorId, parsedDesignId, imageData.file);
    }
  };

  // Delete design image
  const deleteDesignImage = async (colorId, designId, imageType = "back") => {
    console.log('deleteDesignImage called with:', { colorId, designId, imageType });
    
    const parsedColorId = parseInt(colorId);
    const parsedDesignId = designId ? parseInt(designId) : null;
    
    if (isNaN(parsedColorId)) {
      console.error('Invalid colorId:', colorId);
      Swal.fire('Error', 'Invalid color ID', 'error');
      return;
    }
    
    if (imageType === "back" && (parsedDesignId === null || isNaN(parsedDesignId))) {
      console.error('Invalid designId for back image:', designId);
      Swal.fire('Error', 'Invalid design ID', 'error');
      return;
    }
    
    if (imageType === "front") {
      await handleDeleteFrontImage(parsedColorId);
    } else {
      await handleDeleteBackImage(parsedColorId, parsedDesignId);
    }
  };

  // Validate before upload
  const validateUpload = () => {
    if (selectedColors.length === 0) {
      Swal.fire("Warning", "Please select at least one color", "warning");
      return false;
    }

    if (selectedDesigns.length === 0) {
      Swal.fire("Warning", "Please select at least one design", "warning");
      return false;
    }

    // Check for colors that already have designs in the API
    const colorsWithExistingDesigns = selectedColors.filter(colorId =>
      colorHasExistingDesigns(colorId)
    );

    if (colorsWithExistingDesigns.length > 0) {
      const colorNames = colorsWithExistingDesigns
        .map(id => getColorById(id)?.name)
        .join(", ");

      Swal.fire({
        title: "Warning: Colors Already Have Designs",
        html: `
          <div class="text-left">
            <p class="mb-2">These colors already have designs in the system:</p>
            <p class="font-bold mb-3">${colorNames}</p>
            <p class="text-sm text-gray-600">You can:</p>
            <ul class="list-disc pl-5 text-sm text-gray-600">
              <li>Update existing designs using the update button in preview</li>
              <li>Delete existing designs first</li>
            </ul>
          </div>
        `,
        icon: "warning",
        confirmButtonColor: "#000000",
        confirmButtonText: "I Understand",
      });
      return false;
    }

    for (const colorId of selectedColors) {
      const colorData = designImages[colorId];

      if (
        !colorData?.front_image &&
        Object.values(colorData?.back_images || {}).every((img) => !img)
      ) {
        continue;
      }

      if (!colorData?.front_image) {
        const color = getColorById(colorId);
        Swal.fire("Warning", `Color "${color?.name}" must have a front image`, "warning");
        return false;
      }

      const missingDesigns = selectedDesigns.filter((designId) => {
        const backImage = colorData?.back_images?.[designId];
        return !backImage;
      });

      if (missingDesigns.length > 0) {
        const color = getColorById(colorId);
        const designNames = missingDesigns
          .map((designId) => {
            const design = getDesignById(designId);
            return design?.name;
          })
          .join(", ");

        Swal.fire({
          title: "Missing Back Images",
          html: `For color "<strong>${color?.name}</strong>", upload a back image for:<br/><strong>${designNames}</strong>`,
          icon: "warning",
          confirmButtonText: "OK",
        });
        return false;
      }
    }

    return true;
  };

  // Upload all design images
  const uploadAllImages = async () => {
    if (!validateUpload()) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("product_id", id);

      const colorIdsWithImages = [];
      selectedColors.forEach((colorId) => {
        const colorData = designImages[colorId];
        if (
          colorData?.front_image ||
          Object.values(colorData?.back_images || {}).some((img) => img)
        ) {
          colorIdsWithImages.push(parseInt(colorId));
        }
      });

      colorIdsWithImages.forEach((colorId) => {
        formData.append("color_ids", colorId);
      });

      colorIdsWithImages.forEach((colorId) => {
        const frontImage = designImages[colorId]?.front_image;
        if (frontImage?.file) {
          formData.append(`front_image_${colorId}`, frontImage.file);
        }
      });

      colorIdsWithImages.forEach((colorId) => {
        const backImages = designImages[colorId]?.back_images || {};

        selectedDesigns.forEach((designId) => {
          const backImage = backImages[designId];

          if (backImage?.file) {
            formData.append(`back_image_${colorId}_${designId}`, backImage.file);
          }
        });
      });

      Swal.fire({
        title: "Uploading Images...",
        text: "Please wait while we upload your design images",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await api.post("/api/product/upload-design-images/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "Success!",
        text: "Design images uploaded successfully",
        icon: "success",
        confirmButtonColor: "#000000",
        confirmButtonText: "Great!",
      });

      fetchAllData();
    } catch (error) {
      console.error("Error uploading design images:", error);

      let errorMessage = "Failed to upload design images";
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      Swal.fire({
        title: "Upload Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#000000",
        confirmButtonText: "OK",
      });
    } finally {
      Swal.close();
      setUploading(false);
    }
  };

  // Get color by ID from allColors
  const getColorById = (colorId) => {
    return allColors.find((color) => color.id === parseInt(colorId));
  };

  // Get design by ID from allDesigns
  const getDesignById = (designId) => {
    return allDesigns.find((design) => design.id === parseInt(designId));
  };

  // Check if a color is ready for upload (has all required images for SELECTED designs)
  const isColorReadyForUpload = (colorId) => {
    const colorData = designImages[colorId];
    if (!colorData) return false;

    if (!colorData.front_image) return false;

    const missingDesigns = selectedDesigns.filter((designId) => {
      const backImage = colorData?.back_images?.[designId];
      return !backImage;
    });

    return missingDesigns.length === 0;
  };

  // Check if a color has any existing images
  const hasExistingImages = (colorId) => {
    const colorData = designImages[colorId];
    if (!colorData) return false;

    if (colorData.front_image?.existing) return true;

    return Object.values(colorData.back_images || {}).some((img) => img?.existing);
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
          <h1 className="text-xl font-bold text-black">Upload Design Images - {product?.name}</h1>
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
            <span className="text-black font-medium">Design Images</span>
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-black">Product Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Product Name:</p>
              <p className="font-medium text-black">{product?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Selected Colors:</p>
              <p className="font-medium text-black">{selectedColors.length} colors</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Selected Designs:</p>
              <p className="font-medium text-black">
                {selectedDesigns.length} of {allDesigns.length} designs
              </p>
            </div>
          </div>
        </div>

        {/* COLOR SELECTION */}
        <ColorSelector
          allColors={allColors}
          selectedColors={selectedColors}
          designImages={designImages}
          isColorReadyForUpload={isColorReadyForUpload}
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
            isColorReadyForUpload={isColorReadyForUpload}
            hasExistingImages={hasExistingImages}
            onFrontImageUpload={handleFrontImageUpload}
            onBackImageUpload={handleBackImageUpload}
            onRemoveFrontImage={removeFrontImage}
            onRemoveBackImage={removeBackImage}
            onClearColorImages={clearColorImages}
            onToggleColor={toggleColorSelection}
            onUpdateDesign={updateDesignImage}
            onDeleteDesign={deleteDesignImage}
            colorHasExistingDesigns={colorHasExistingDesigns}
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

        {/* ACTION BUTTONS */}
        {selectedColors.length > 0 && selectedDesigns.length > 0 && (
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold mb-1 text-black">Ready to Upload</h3>
                <p className="text-sm text-gray-600">
                  {selectedColors.filter((id) => isColorReadyForUpload(id)).length} of{" "}
                  {selectedColors.length} colors ready
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                    <span className="text-xs text-gray-600">
                      Ready: {selectedColors.filter((id) => isColorReadyForUpload(id)).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-xs text-gray-600">
                      Incomplete: {selectedColors.filter((id) => !isColorReadyForUpload(id)).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    document.getElementById("existing-data-preview")?.scrollIntoView({
                      behavior: "smooth"
                    });
                    setIsPreviewExpanded(true);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-black flex items-center gap-2"
                >
                  <Eye size={16} />
                  View Existing Data
                </button>

                <button
                  onClick={() => router.push("/dashboard/product-list")}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-black"
                >
                  Cancel
                </button>

                <button
                  onClick={uploadAllImages}
                  disabled={uploading || selectedColors.filter((id) => isColorReadyForUpload(id)).length === 0}
                  className={`px-6 py-2 rounded font-medium flex items-center gap-2 ${
                    uploading || selectedColors.filter((id) => isColorReadyForUpload(id)).length === 0
                      ? "bg-gray-400 cursor-not-allowed text-gray-600"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    `Upload (${selectedColors.filter((id) => isColorReadyForUpload(id)).length} ready)`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXISTING DATA PREVIEW SECTION - SHOW AT BOTTOM */}
        <div id="existing-data-preview">
          <ExistingDataPreview
            productData={existingProductData}
            allColors={allColors}
            allDesigns={allDesigns}
            isExpanded={isPreviewExpanded}
            onToggleExpand={() => setIsPreviewExpanded(!isPreviewExpanded)}
            onUpdate={updateDesignImage}
            onDelete={deleteDesignImage}
            productId={product?.id || id}
          />
        </div>
      </div>
    </DashboardShell>
  );
};

export default AddDesign;
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  Upload,
  Trash2,
  X,
  Palette,
  Plus,
  Camera,
  Image as ImageIcon,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import DashboardShell from "../DashboardShell";
import Swal from "sweetalert2";
import Image from "next/image";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";

const AddDesign = () => {
  const { id } = useParams(); 
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState(null);
  
  // Store ALL colors from the colors API
  const [allColors, setAllColors] = useState([]);
  
  // Store SELECTED colors
  const [selectedColors, setSelectedColors] = useState([]);
  
  // Store design images organized by color
  const [designImages, setDesignImages] = useState({});
  
  // Store available designs (for back images)
  const [designs, setDesigns] = useState([]);

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
      
      const foundProduct = productRes.data.data.find(p => p.id === Number(id));
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
      setDesigns(foundProduct.designs || []);

      // Initialize selected colors from product colors if they exist
      const productColorIds = foundProduct.colors?.map(c => c.id) || [];
      setSelectedColors(productColorIds);

      // Initialize designImages structure for selected colors
      const initialImages = {};
      allColorsData.forEach(color => {
        if (productColorIds.includes(color.id)) {
          initialImages[color.id] = {
            front_image: null,
            back_images: {} // Will store {design_id: [array of images]}
          };
        }
      });
      setDesignImages(initialImages);

      // If product already has uploaded images, populate them
      if (foundProduct.product_colors) {
        const updatedImages = { ...initialImages };
        
        foundProduct.product_colors.forEach(productColor => {
          const colorId = productColor.color;
          
          // Check if colorId exists in updatedImages before accessing it
          if (!updatedImages[colorId]) {
            // If color doesn't exist in initial images, create entry for it
            updatedImages[colorId] = {
              front_image: null,
              back_images: {}
            };
          }
          
          // Front image
          if (productColor.front_image?.image) {
            updatedImages[colorId] = {
              ...updatedImages[colorId],
              front_image: {
                existing: true,
                url: getImageUrl(productColor.front_image.image),
                name: productColor.front_image.image.split('/').pop()
              }
            };
          }
          
          // Back images (multiple per design)
          productColor.back_designs.forEach(backDesign => {
            const designId = backDesign.design;
            
            // Initialize back_images array for this design if not exists
            if (!updatedImages[colorId].back_images[designId]) {
              updatedImages[colorId].back_images[designId] = [];
            }
            
            // Add the back image to the array
            updatedImages[colorId].back_images[designId].push({
              existing: true,
              url: getImageUrl(backDesign.image),
              name: backDesign.image.split('/').pop(),
              design_name: backDesign.design_name,
              back_design_id: backDesign.id
            });
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

  // Toggle color selection
  const toggleColorSelection = (colorId) => {
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        // Remove color and its images
        setDesignImages(prevImages => {
          const updated = { ...prevImages };
          if (updated[colorId]) {
            // Clean up object URLs
            if (updated[colorId]?.front_image?.preview) {
              URL.revokeObjectURL(updated[colorId].front_image.preview);
            }
            
            Object.values(updated[colorId]?.back_images || {}).forEach(designImages => {
              designImages.forEach(img => {
                if (img.preview) {
                  URL.revokeObjectURL(img.preview);
                }
              });
            });
            
            delete updated[colorId];
          }
          return updated;
        });
        return prev.filter(id => id !== colorId);
      } else {
        // Add color
        setDesignImages(prev => ({
          ...prev,
          [colorId]: {
            front_image: null,
            back_images: {}
          }
        }));
        return [...prev, colorId];
      }
    });
  };

  // Handle front image upload
  const handleFrontImageUpload = (colorId, file) => {
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Image exceeds 10MB limit", "error");
      return;
    }

    // Clean up old preview if exists
    const existingFrontImage = designImages[colorId]?.front_image;
    if (existingFrontImage?.preview && !existingFrontImage.existing) {
      URL.revokeObjectURL(existingFrontImage.preview);
    }

    setDesignImages(prev => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        front_image: {
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        }
      }
    }));
  };

  // Handle back image upload for a specific design (multiple images)
  const handleBackImageUpload = (colorId, designId, files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("Error", `${file.name} exceeds 10MB limit`, "error");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newBackImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setDesignImages(prev => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        back_images: {
          ...prev[colorId]?.back_images,
          [designId]: [
            ...(prev[colorId]?.back_images?.[designId] || []),
            ...newBackImages
          ]
        }
      }
    }));
  };

  // Remove front image
  const removeFrontImage = (colorId) => {
    Swal.fire({
      title: "Remove Front Image?",
      text: "Are you sure you want to remove this front image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDesignImages(prev => {
          const updated = { ...prev };
          if (updated[colorId]?.front_image?.preview && !updated[colorId].front_image.existing) {
            URL.revokeObjectURL(updated[colorId].front_image.preview);
          }
          updated[colorId] = {
            ...updated[colorId],
            front_image: null
          };
          return updated;
        });
      }
    });
  };

  // Remove back image
  const removeBackImage = (colorId, designId, imageIndex) => {
    Swal.fire({
      title: "Remove Back Image?",
      text: "Are you sure you want to remove this back image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDesignImages(prev => {
          const updated = { ...prev };
          const images = [...(updated[colorId]?.back_images?.[designId] || [])];
          
          // Clean up object URL
          if (images[imageIndex]?.preview && !images[imageIndex].existing) {
            URL.revokeObjectURL(images[imageIndex].preview);
          }
          
          // Remove the image
          images.splice(imageIndex, 1);
          
          updated[colorId] = {
            ...updated[colorId],
            back_images: {
              ...updated[colorId]?.back_images,
              [designId]: images
            }
          };
          
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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear all!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDesignImages(prev => {
          const updated = { ...prev };
          
          // Clean up object URLs
          if (updated[colorId]?.front_image?.preview && !updated[colorId].front_image.existing) {
            URL.revokeObjectURL(updated[colorId].front_image.preview);
          }
          
          Object.values(updated[colorId]?.back_images || {}).forEach(designImages => {
            designImages.forEach(img => {
              if (img.preview && !img.existing) {
                URL.revokeObjectURL(img.preview);
              }
            });
          });
          
          updated[colorId] = {
            front_image: null,
            back_images: {}
          };
          
          return updated;
        });
      }
    });
  };

  // Validate before upload
  const validateUpload = () => {
    if (selectedColors.length === 0) {
      Swal.fire("Warning", "Please select at least one color", "warning");
      return false;
    }
    
    // Check each selected color
    for (const colorId of selectedColors) {
      const colorData = designImages[colorId];
      
      // Skip colors with no images at all
      if (!colorData?.front_image && 
          Object.values(colorData?.back_images || {}).every(images => images.length === 0)) {
        continue;
      }
      
      // If a color has ANY images, it must have:
      // 1. A front image
      // 2. At least one back image for EACH design
      
      // Check front image
      if (!colorData?.front_image) {
        const color = getColorById(colorId);
        Swal.fire("Warning", `Color "${color?.name}" must have a front image`, "warning");
        return false;
      }
      
      // Check back images for all designs
      const missingDesigns = designs.filter(design => {
        const backImages = colorData?.back_images?.[design.id] || [];
        return backImages.length === 0;
      });
      
      if (missingDesigns.length > 0) {
        const color = getColorById(colorId);
        const designNames = missingDesigns.map(d => d.name).join(", ");
        Swal.fire({
          title: "Missing Back Images",
          html: `For color "<strong>${color?.name}</strong>", you need to upload at least one back image for each of these designs:<br/><strong>${designNames}</strong>`,
          icon: "warning",
          confirmButtonText: "OK"
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
      
      // Add product_id
      formData.append("product_id", id);
      
      // Collect color IDs that have images
      const colorIdsWithImages = [];
      selectedColors.forEach(colorId => {
        const colorData = designImages[colorId];
        if (colorData?.front_image || 
            Object.values(colorData?.back_images || {}).some(images => images.length > 0)) {
          colorIdsWithImages.push(parseInt(colorId));
        }
      });
      
      // Add color_ids as multiple parameters
      colorIdsWithImages.forEach(colorId => {
        formData.append("color_ids", colorId);
      });
      
      // Add front images
      colorIdsWithImages.forEach(colorId => {
        const frontImage = designImages[colorId]?.front_image;
        if (frontImage?.file) {
          formData.append(`front_image_${colorId}`, frontImage.file);
        }
      });
      
      // Add back images - using design IDs in field names
      colorIdsWithImages.forEach(colorId => {
        const backImages = designImages[colorId]?.back_images || {};
        
        designs.forEach(design => {
          const designImagesArray = backImages[design.id] || [];
          
          if (designImagesArray.length > 0) {
            // Use design ID in field name as per API documentation
            // Format: back_image_{color_id}_{design_id}
            
            // Send only the FIRST image for each design
            const firstImage = designImagesArray[0];
            if (firstImage?.file) {
              formData.append(`back_image_${colorId}_${design.id}`, firstImage.file);
            }
          }
        });
      });
      
      // Show loading
      Swal.fire({
        title: "Uploading Images...",
        text: "Please wait while we upload your design images",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      // Upload to API
      const response = await api.post(
        "/api/product/upload-design-images/",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "Design images uploaded successfully",
        icon: "success",
        confirmButtonText: "OK"
      });

      // Refresh data
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
        confirmButtonText: "OK"
      });
    } finally {
      Swal.close();
      setUploading(false);
    }
  };

  // Get color by ID from allColors
  const getColorById = (colorId) => {
    return allColors.find(color => color.id === parseInt(colorId));
  };

  // Check if a color is ready for upload (has all required images)
  const isColorReadyForUpload = (colorId) => {
    const colorData = designImages[colorId];
    if (!colorData) return false;
    
    // Must have front image
    if (!colorData.front_image) return false;
    
    // Must have at least one back image for EVERY design
    const missingDesigns = designs.filter(design => {
      const backImages = colorData?.back_images?.[design.id] || [];
      return backImages.length === 0;
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
        <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">Upload Design Images - {product?.name}</h1>
          <div className="flex items-center space-x-2 text-[16px]">
            <button onClick={() => router.push("/")} className="hover:text-purple-600 flex items-center">
              <Home size={16} />
            </button>
            <ChevronRight size={14} />
            <button onClick={() => router.push("/dashboard/product-list")} className="hover:text-purple-600">
              Products
            </button>
            <ChevronRight size={14} />
            <span>Design Images</span>
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-xl font-bold mb-4">Product Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Product Name:</p>
              <p className="font-medium">{product?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Product ID:</p>
              <p className="font-medium">{product?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Selected Colors:</p>
              <p className="font-medium">{selectedColors.length} colors</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Designs Required:</p>
              <p className="font-medium">{designs.length} designs</p>
            </div>
          </div>
          
          {/* IMPORTANT NOTE */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm font-medium text-yellow-800">Important Requirement</p>
                <p className="text-xs text-yellow-700">
                  For each color you upload, you must provide:
                  <ul className="list-disc ml-4 mt-1">
                    <li>One front image</li>
                    <li>At least one back image for <strong>EVERY</strong> design
                    </li>
                  </ul>
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Field format: <code>back_image_{`{color_id}_{design_id}`}</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLOR SELECTION */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-xl font-bold mb-4">Select Colors</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select colors for which you want to upload design images. Only selected colors will be shown.
          </p>
          
          <div className="flex flex-wrap gap-3">
            {allColors.map((color) => {
              const isSelected = selectedColors.includes(color.id);
              const isReady = isColorReadyForUpload(color.id);
              const colorImages = designImages[color.id] || {};
              const hasImages = colorImages.front_image || 
                Object.values(colorImages.back_images || {}).some(images => images.length > 0);
              
              return (
                <button
                  key={color.id}
                  onClick={() => toggleColorSelection(color.id)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all ${
                    isSelected 
                      ? isReady
                        ? 'bg-green-100 border-green-300 ring-2 ring-green-300'
                        : hasImages
                          ? 'bg-yellow-100 border-yellow-300 ring-1 ring-yellow-300'
                          : 'bg-blue-100 border-blue-300 ring-1 ring-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare size={16} className={isReady ? "text-green-600" : "text-blue-600"} />
                  ) : (
                    <Square size={16} className="text-gray-400" />
                  )}
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex_code || '#cccccc' }}
                    title={color.hex_code || 'No color code'}
                  />
                  <div className="text-left">
                    <p className="font-medium text-sm">{color.name}</p>
                    <p className="text-xs text-gray-500">ID: {color.id}</p>
                  </div>
                  {isSelected && isReady && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      ✓ Ready
                    </span>
                  )}
                  {isSelected && hasImages && !isReady && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      Needs more
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DESIGN IMAGES UPLOAD FOR SELECTED COLORS */}
        {selectedColors.length > 0 ? (
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-xl font-bold mb-6">Upload Images for Selected Colors</h2>
            
            <div className="space-y-8">
              {selectedColors.map((colorId) => {
                const color = getColorById(colorId);
                if (!color) return null;
                
                const colorData = designImages[colorId] || { front_image: null, back_images: {} };
                const isReady = isColorReadyForUpload(colorId);
                
                return (
                  <div key={colorId} className={`border rounded-lg p-6 ${isReady ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-black"
                          style={{ backgroundColor: color.hex_code || '#cccccc' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold">{color.name}</h3>
                            {isReady && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                Ready to upload
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Color ID: {color.id} • Hex: {color.hex_code || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleColorSelection(colorId)}
                          className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                        >
                          <Square size={14} />
                          Deselect
                        </button>
                        <button
                          onClick={() => clearColorImages(colorId)}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* FRONT IMAGE SECTION */}
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold flex items-center gap-2">
                            <Camera size={16} />
                            Front Image
                          </h4>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            front_image_{color.id}
                          </span>
                        </div>
                        
                        {colorData.front_image ? (
                          <div className="space-y-3">
                            <div className="relative w-full h-48 border rounded overflow-hidden">
                              {colorData.front_image.existing ? (
                                <Image
                                  src={colorData.front_image.url}
                                  alt={`Front image for ${color.name}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <Image
                                  src={colorData.front_image.preview}
                                  alt={`Front image preview for ${color.name}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              )}
                              <button
                                onClick={() => removeFrontImage(color.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium truncate">
                                {colorData.front_image.name}
                              </p>
                              {!colorData.front_image.existing && (
                                <p className="text-xs text-gray-500">
                                  {(colorData.front_image.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-red-50">
                            <Camera className="mx-auto h-8 w-8 text-red-400 mb-2" />
                            <p className="text-red-600 font-medium mb-2">Required: Front Image</p>
                            <label className="inline-flex items-center gap-2 cursor-pointer bg-black text-white px-3 py-1.5 text-sm rounded hover:bg-gray-800 transition">
                              <Upload size={14} />
                              Upload Front Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    handleFrontImageUpload(color.id, e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* BACK IMAGES SECTION */}
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold flex items-center gap-2">
                            <ImageIcon size={16} />
                            Back Images by Design
                          </h4>
                          <span className="text-xs text-gray-500">
                            {designs.length} designs required
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {designs.map((design) => {
                            const backImages = colorData.back_images?.[design.id] || [];
                            const totalImages = backImages.length;
                            const hasImages = totalImages > 0;
                            
                            return (
                              <div key={design.id} className={`border rounded p-3 ${hasImages ? 'bg-green-50' : 'bg-red-50'}`}>
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <p className={`font-medium ${hasImages ? 'text-green-800' : 'text-red-800'}`}>
                                      {design.name} (ID: {design.id})
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs px-2 py-1 rounded ${hasImages ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {hasImages ? `${totalImages} image${totalImages !== 1 ? 's' : ''}` : 'Required'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Multiple Images Display */}
                                {hasImages ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                      {backImages.map((image, index) => (
                                        <div key={index} className={`border rounded p-2 bg-white ${index === 0 ? 'ring-1 ring-green-300' : ''}`}>
                                          <div className="relative w-full h-24 mb-1">
                                            {image.existing ? (
                                              <Image
                                                src={image.url}
                                                alt={`Back image ${index + 1} for ${color.name} - ${design.name}`}
                                                fill
                                                className="object-cover rounded"
                                                unoptimized
                                              />
                                            ) : (
                                              <Image
                                                src={image.preview}
                                                alt={`Back image preview ${index + 1} for ${color.name} - ${design.name}`}
                                                fill
                                                className="object-cover rounded"
                                                unoptimized
                                              />
                                            )}
                                            <button
                                              onClick={() => removeBackImage(color.id, design.id, index)}
                                              className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                          <p className="text-xs truncate">{image.name}</p>
                                          {!image.existing && (
                                            <p className="text-xs text-gray-500">
                                              {(image.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                          )}
                                          {index === 0 && (
                                            <p className="text-xs text-green-600 mt-1">✓ Will be uploaded</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {/* Add more images button */}
                                    <label className="block text-center py-2 border border-gray-300 rounded cursor-pointer hover:border-gray-400 hover:bg-gray-50">
                                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                        <Plus size={14} />
                                        Add More Images
                                        <input
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          onChange={(e) => {
                                            if (e.target.files.length > 0) {
                                              handleBackImageUpload(color.id, design.id, e.target.files);
                                            }
                                          }}
                                          className="hidden"
                                        />
                                      </div>
                                    </label>
                                  </div>
                                ) : (
                                  <div className="text-center py-4 border-2 border-dashed border-red-300 rounded">
                                    <label className="inline-flex items-center gap-1 cursor-pointer text-sm text-red-600 hover:text-red-800">
                                      <Upload size={12} />
                                      Upload back images
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                          if (e.target.files.length > 0) {
                                            handleBackImageUpload(color.id, design.id, e.target.files);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                    <p className="text-xs text-red-500 mt-1">
                                      At least one image required
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-md shadow-sm text-center py-12">
            <Palette className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">No Colors Selected</h3>
            <p className="text-gray-600 mb-4">Select colors from the color selection panel above to start uploading images.</p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        {selectedColors.length > 0 && (
          <div className="bg-white p-6 rounded-md shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold mb-1">Ready to Upload</h3>
                <p className="text-sm text-gray-600">
                  Upload all design images to the server for {selectedColors.length} selected color{selectedColors.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">Ready colors: {selectedColors.filter(id => isColorReadyForUpload(id)).length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600">Incomplete colors: {selectedColors.filter(id => !isColorReadyForUpload(id)).length}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/dashboard/product-list")}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={uploadAllImages}
                  disabled={uploading || selectedColors.filter(id => isColorReadyForUpload(id)).length === 0}
                  className={`px-6 py-2 rounded font-medium flex items-center gap-2 ${
                    uploading || selectedColors.filter(id => isColorReadyForUpload(id)).length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    `Upload (${selectedColors.filter(id => isColorReadyForUpload(id)).length} ready)`
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
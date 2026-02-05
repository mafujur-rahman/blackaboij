"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  Upload,
  Trash2,
  Palette,
  Plus,
  Camera,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Layout,
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
  
  // Store ALL designs from the product
  const [allDesigns, setAllDesigns] = useState([]);
  
  // Store SELECTED colors
  const [selectedColors, setSelectedColors] = useState([]);
  
  // Store SELECTED designs
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  
  // Store design images organized by color and design
  const [designImages, setDesignImages] = useState({});

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
      const productDesigns = foundProduct.designs || [];
      setAllDesigns(productDesigns);
      
      // Initialize selected designs - select ALL by default
      setSelectedDesigns(productDesigns.map(d => d.id));

      // Initialize selected colors from product colors if they exist
      const productColorIds = foundProduct.colors?.map(c => c.id) || [];
      setSelectedColors(productColorIds);

      // Initialize designImages structure for selected colors and designs
      const initialImages = {};
      allColorsData.forEach(color => {
        if (productColorIds.includes(color.id)) {
          initialImages[color.id] = {
            front_image: null,
            back_images: {}
          };
        }
      });
      setDesignImages(initialImages);

      // If product already has uploaded images, populate them
      if (foundProduct.product_colors) {
        const updatedImages = { ...initialImages };
        
        foundProduct.product_colors.forEach(productColor => {
          const colorId = productColor.color;
          
          if (!updatedImages[colorId]) {
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
            
            if (!updatedImages[colorId].back_images[designId]) {
              updatedImages[colorId].back_images[designId] = [];
            }
            
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
        setDesignImages(prevImages => {
          const updated = { ...prevImages };
          if (updated[colorId]) {
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

  // Toggle design selection
  const toggleDesignSelection = (designId) => {
    setSelectedDesigns(prev => {
      if (prev.includes(designId)) {
        setDesignImages(prevImages => {
          const updated = { ...prevImages };
          Object.keys(updated).forEach(colorId => {
            const designImages = updated[colorId]?.back_images?.[designId] || [];
            designImages.forEach(img => {
              if (img.preview) {
                URL.revokeObjectURL(img.preview);
              }
            });
            
            if (updated[colorId]?.back_images?.[designId]) {
              delete updated[colorId].back_images[designId];
            }
          });
          return updated;
        });
        return prev.filter(id => id !== designId);
      } else {
        return [...prev, designId];
      }
    });
  };

  // Select all designs
  const selectAllDesigns = () => {
    const allDesignIds = allDesigns.map(d => d.id);
    setSelectedDesigns(allDesignIds);
  };

  // Deselect all designs
  const deselectAllDesigns = () => {
    setDesignImages(prevImages => {
      const updated = { ...prevImages };
      Object.keys(updated).forEach(colorId => {
        Object.keys(updated[colorId]?.back_images || {}).forEach(designId => {
          const images = updated[colorId].back_images[designId] || [];
          images.forEach(img => {
            if (img.preview) {
              URL.revokeObjectURL(img.preview);
            }
          });
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
    if (!selectedDesigns.includes(parseInt(designId))) {
      Swal.fire("Error", "This design is not selected", "error");
      return;
    }

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
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6b7280",
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
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDesignImages(prev => {
          const updated = { ...prev };
          const images = [...(updated[colorId]?.back_images?.[designId] || [])];
          
          if (images[imageIndex]?.preview && !images[imageIndex].existing) {
            URL.revokeObjectURL(images[imageIndex].preview);
          }
          
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
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clear all!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDesignImages(prev => {
          const updated = { ...prev };
          
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

    if (selectedDesigns.length === 0) {
      Swal.fire("Warning", "Please select at least one design", "warning");
      return false;
    }
    
    for (const colorId of selectedColors) {
      const colorData = designImages[colorId];
      
      if (!colorData?.front_image && 
          Object.values(colorData?.back_images || {}).every(images => images.length === 0)) {
        continue;
      }
      
      if (!colorData?.front_image) {
        const color = getColorById(colorId);
        Swal.fire("Warning", `Color "${color?.name}" must have a front image`, "warning");
        return false;
      }
      
      const missingDesigns = selectedDesigns.filter(designId => {
        const backImages = colorData?.back_images?.[designId] || [];
        return backImages.length === 0;
      });
      
      if (missingDesigns.length > 0) {
        const color = getColorById(colorId);
        const designNames = missingDesigns.map(designId => {
          const design = getDesignById(designId);
          return design?.name;
        }).join(", ");
        
        Swal.fire({
          title: "Missing Back Images",
          html: `For color "<strong>${color?.name}</strong>", upload at least one back image for:<br/><strong>${designNames}</strong>`,
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
      
      formData.append("product_id", id);
      
      const colorIdsWithImages = [];
      selectedColors.forEach(colorId => {
        const colorData = designImages[colorId];
        if (colorData?.front_image || 
            Object.values(colorData?.back_images || {}).some(images => images.length > 0)) {
          colorIdsWithImages.push(parseInt(colorId));
        }
      });
      
      colorIdsWithImages.forEach(colorId => {
        formData.append("color_ids", colorId);
      });
      
      colorIdsWithImages.forEach(colorId => {
        const frontImage = designImages[colorId]?.front_image;
        if (frontImage?.file) {
          formData.append(`front_image_${colorId}`, frontImage.file);
        }
      });
      
      colorIdsWithImages.forEach(colorId => {
        const backImages = designImages[colorId]?.back_images || {};
        
        selectedDesigns.forEach(designId => {
          const designImagesArray = backImages[designId] || [];
          
          if (designImagesArray.length > 0) {
            const firstImage = designImagesArray[0];
            if (firstImage?.file) {
              formData.append(`back_image_${colorId}_${designId}`, firstImage.file);
            }
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

      const response = await api.post(
        "/api/product/upload-design-images/",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Sweet success alert
      Swal.fire({
        title: "Success!",
        text: "Design images uploaded successfully",
        icon: "success",
        confirmButtonColor: "#000000",
        confirmButtonText: "Great!",
        background: "#ffffff",
        color: "#000000",
        iconColor: "#10b981",
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

  // Get design by ID from allDesigns
  const getDesignById = (designId) => {
    return allDesigns.find(design => design.id === parseInt(designId));
  };

  // Check if a color is ready for upload (has all required images for SELECTED designs)
  const isColorReadyForUpload = (colorId) => {
    const colorData = designImages[colorId];
    if (!colorData) return false;
    
    if (!colorData.front_image) return false;
    
    const missingDesigns = selectedDesigns.filter(designId => {
      const backImages = colorData?.back_images?.[designId] || [];
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
        <div className="bg-white rounded-md px-6 py-4 flex justify-between items-center shadow-sm border border-gray-200">
          <h1 className="text-xl font-bold text-black">Upload Design Images - {product?.name}</h1>
          <div className="flex items-center space-x-2 text-[16px] text-gray-700">
            <button onClick={() => router.push("/")} className="hover:text-black flex items-center">
              <Home size={16} />
            </button>
            <ChevronRight size={14} />
            <button onClick={() => router.push("/dashboard/product-list")} className="hover:text-black">
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
              <p className="font-medium text-black">{selectedDesigns.length} of {allDesigns.length} designs</p>
            </div>
          </div>
        </div>

        {/* COLOR SELECTION */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Select Colors</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedColors(allColors.map(c => c.id))}
                className="text-sm text-black hover:text-gray-700 font-medium"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedColors([])}
                className="text-sm text-black hover:text-gray-700 font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>
          
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
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                    isSelected 
                      ? isReady
                        ? 'bg-gray-100 border-black ring-2 ring-gray-300'
                        : hasImages
                          ? 'bg-gray-50 border-gray-400 ring-1 ring-gray-300'
                          : 'bg-white border-black ring-1 ring-gray-200'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare size={18} className={isReady ? "text-black" : "text-gray-600"} />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                  <div
                    className="w-7 h-7 rounded-full border border-gray-400"
                    style={{ backgroundColor: color.hex_code || '#cccccc' }}
                    title={color.hex_code || 'No color code'}
                  />
                  <div className="text-left">
                    <p className="font-medium text-sm text-black">{color.name}</p>
                  </div>
                  {isSelected && isReady && (
                    <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded">
                      Ready
                    </span>
                  )}
                  {isSelected && hasImages && !isReady && (
                    <span className="ml-2 text-xs bg-gray-300 text-black px-2 py-0.5 rounded">
                      Incomplete
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DESIGN SELECTION */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <Layout size={18} />
              Select Designs
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAllDesigns}
                className="text-sm text-black hover:text-gray-700 font-medium"
              >
                Select All
              </button>
              <button
                onClick={deselectAllDesigns}
                className="text-sm text-black hover:text-gray-700 font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {allDesigns.map((design) => {
              const isSelected = selectedDesigns.includes(design.id);
              
              const colorsWithImages = selectedColors.filter(colorId => {
                const images = designImages[colorId]?.back_images?.[design.id] || [];
                return images.length > 0;
              }).length;
              
              return (
                <button
                  key={design.id}
                  onClick={() => toggleDesignSelection(design.id)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-gray-100 border-black ring-1 ring-gray-300'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare size={18} className="text-black" />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-sm text-black">{design.name}</p>
                    {isSelected && (
                      <p className="text-xs text-gray-600">
                        {colorsWithImages} of {selectedColors.length} colors
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DESIGN IMAGES UPLOAD FOR SELECTED COLORS */}
        {selectedColors.length > 0 && selectedDesigns.length > 0 ? (
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-black">Upload Images for Selected Colors & Designs</h2>
            
            <div className="space-y-8">
              {selectedColors.map((colorId) => {
                const color = getColorById(colorId);
                if (!color) return null;
                
                const colorData = designImages[colorId] || { front_image: null, back_images: {} };
                const isReady = isColorReadyForUpload(colorId);
                
                return (
                  <div key={colorId} className={`border rounded-lg p-6 ${isReady ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-300'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-black"
                          style={{ backgroundColor: color.hex_code || '#cccccc' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-black">{color.name}</h3>
                            {isReady && (
                              <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
                                Ready
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Required for {selectedDesigns.length} design{selectedDesigns.length !== 1 ? 's' : ''}
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
                          className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* FRONT IMAGE SECTION */}
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-black flex items-center gap-2">
                            <Camera size={16} />
                            Front Image
                          </h4>
                        </div>
                        
                        {colorData.front_image ? (
                          <div className="space-y-3">
                            <div className="relative w-full h-48 border border-gray-300 rounded overflow-hidden">
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
                                className="absolute top-2 right-2 bg-black text-white p-1 rounded-full hover:bg-gray-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-black truncate">
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
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-gray-700 font-medium mb-2">Front Image Required</p>
                            <label className="inline-flex items-center gap-2 cursor-pointer bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition">
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

                      {/* BACK IMAGES SECTION - ONLY FOR SELECTED DESIGNS */}
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-black flex items-center gap-2">
                            <ImageIcon size={16} />
                            Back Images by Design
                          </h4>
                          <span className="text-xs text-gray-600">
                            {selectedDesigns.length} design{selectedDesigns.length !== 1 ? 's' : ''} selected
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {selectedDesigns.map((designId) => {
                            const design = getDesignById(designId);
                            if (!design) return null;
                            
                            const backImages = colorData.back_images?.[designId] || [];
                            const totalImages = backImages.length;
                            const hasImages = totalImages > 0;
                            
                            return (
                              <div key={designId} className={`border rounded p-3 ${hasImages ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-300'}`}>
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <p className={`font-medium ${hasImages ? 'text-black' : 'text-gray-700'}`}>
                                      {design.name}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs px-2 py-1 rounded ${hasImages ? 'bg-gray-200 text-black' : 'bg-gray-100 text-gray-700'}`}>
                                      {hasImages ? `${totalImages} image${totalImages !== 1 ? 's' : ''}` : 'Required'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Multiple Images Display */}
                                {hasImages ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                      {backImages.map((image, index) => (
                                        <div key={index} className={`border border-gray-300 rounded p-2 bg-white ${index === 0 ? 'ring-1 ring-gray-400' : ''}`}>
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
                                              className="absolute top-1 right-1 bg-black text-white p-0.5 rounded-full hover:bg-gray-800"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                          <p className="text-xs text-black truncate">{image.name}</p>
                                          {!image.existing && (
                                            <p className="text-xs text-gray-500">
                                              {(image.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                          )}
                                          {index === 0 && (
                                            <p className="text-xs text-gray-600 mt-1">Main image</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {/* Add more images button */}
                                    <label className="block text-center py-2 border border-gray-300 rounded cursor-pointer hover:border-black hover:bg-gray-50">
                                      <div className="flex items-center justify-center gap-1 text-sm text-gray-700">
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
                                  <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded">
                                    <label className="inline-flex items-center gap-1 cursor-pointer text-sm text-black hover:text-gray-800">
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
          <div className="bg-white p-6 rounded-md shadow-sm text-center py-12 border border-gray-200">
            {selectedColors.length === 0 && selectedDesigns.length === 0 ? (
              <>
                <Palette className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-bold mb-2 text-black">No Colors or Designs Selected</h3>
                <p className="text-gray-600 mb-4">Select colors and designs to start uploading images.</p>
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
                  {selectedColors.filter(id => isColorReadyForUpload(id)).length} of {selectedColors.length} colors ready
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                    <span className="text-xs text-gray-600">Ready: {selectedColors.filter(id => isColorReadyForUpload(id)).length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-xs text-gray-600">Incomplete: {selectedColors.filter(id => !isColorReadyForUpload(id)).length}</span>
                  </div>
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
                  onClick={uploadAllImages}
                  disabled={uploading || selectedColors.filter(id => isColorReadyForUpload(id)).length === 0}
                  className={`px-6 py-2 rounded font-medium flex items-center gap-2 ${
                    uploading || selectedColors.filter(id => isColorReadyForUpload(id)).length === 0
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
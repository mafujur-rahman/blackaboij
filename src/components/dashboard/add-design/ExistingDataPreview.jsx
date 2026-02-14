import React from "react";
import { ChevronDown, ChevronUp, Edit, Trash2, Download, Eye } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
import { getImageUrl } from "@/components/utils/get-image-url";


const ExistingDataPreview = ({
  productData,
  allColors,
  allDesigns,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  productId,
}) => {

  
  if (!productData) {
    return (
      <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-bold mb-2 text-black">No Data</h3>
          <p className="text-gray-600">Product data is not available.</p>
        </div>
      </div>
    );
  }

  // Check if it's a design product or regular product
  const isDesignProduct = productData?.is_design === true;

  // Handle regular product images
  if (!isDesignProduct && productData?.images && productData.images.length > 0) {
    return (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-black">Product Images</h2>
            <span className="bg-black text-white text-xs px-2 py-1 rounded">
              {productData.images.length} Images
            </span>
          </div>
          <button className="p-1 hover:bg-gray-200 rounded">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {isExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productData.images.map((image, index) => (
                <div key={image.id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                    <span className="font-medium text-black">
                      {image.is_thumbnail ? 'Thumbnail' : `Image ${index + 1}`}
                    </span>
                    <button
                      onClick={() => handleDownload(getImageUrl(image.image), `product-image-${index + 1}.jpg`)}
                      className="text-gray-600 hover:text-black"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="relative w-full h-40 bg-gray-100">
                      <Image
                        src={getImageUrl(image.image)}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle design product with product_colors
  if (!productData.product_colors || productData.product_colors.length === 0) {
    return (
      <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-bold mb-2 text-black">No Existing Data</h3>
          <p className="text-gray-600">
            {isDesignProduct 
              ? "No design images have been uploaded yet." 
              : "No images available for this product."}
          </p>
        </div>
      </div>
    );
  }

  const getColorById = (colorId) => {
    return allColors.find((color) => color.id === parseInt(colorId));
  };

  const getDesignById = (designId) => {
    return allDesigns.find((design) => design.id === parseInt(designId));
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateClick = (colorId, designId, imageData, imageType) => {
    Swal.fire({
      title: `Update ${imageType === 'front' ? 'Front' : 'Back'} Image`,
      html: `
        <div class="text-left">
          <p class="mb-2">Choose a new image for this ${imageType === 'front' ? 'front' : 'back'} design:</p>
          <input type="file" id="update-image" accept="image/*" class="w-full p-2 border rounded" />
          <p class="text-xs text-gray-500 mt-2">Max file size: 10MB</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const fileInput = document.getElementById("update-image");
        if (!fileInput.files || fileInput.files.length === 0) {
          Swal.showValidationMessage("Please select an image");
          return false;
        }
        const file = fileInput.files[0];
        if (file.size > 10 * 1024 * 1024) {
          Swal.showValidationMessage("Image exceeds 10MB limit");
          return false;
        }
        return file;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const file = result.value;
        
        // Pass the file directly to the parent component
        // The parent component (AddDesign) will handle creating the FormData
        onUpdate(colorId, designId, { file }, imageType);
      }
    });
  };

  const handleDeleteClick = (colorId, designId, imageType) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete this ${imageType} image. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Pass the IDs directly to the parent component
        // The parent component (AddDesign) will handle creating the delete data
        onDelete(colorId, designId, imageType);
      }
    });
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-black">Existing Designs Preview</h2>
          <span className="bg-black text-white text-xs px-2 py-1 rounded">
            {productData.product_colors.length} Colors
          </span>
        </div>
        <button className="p-1 hover:bg-gray-200 rounded">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-8 max-h-[600px] overflow-y-auto">
          {productData.product_colors.map((productColor) => {
            const color = getColorById(productColor.color) || {
              id: productColor.color,
              name: productColor.color_name || `Color ${productColor.color}`,
              hex_code: productColor.hex_code || "#cccccc"
            };

            return (
              <div key={productColor.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex_code }}
                  />
                  <h3 className="text-lg font-bold text-black">{color.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Front Image */}
                  {productColor.front_image && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-medium text-black">Front Image</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(getImageUrl(productColor.front_image.image), "front.jpg")}
                            className="text-gray-600 hover:text-black"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateClick(productColor.color, null, productColor.front_image, 'front')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Update"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(productColor.color, null, 'front')}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="relative w-full h-40 bg-gray-100">
                          <Image
                            src={getImageUrl(productColor.front_image.image)}
                            alt={`Front image for ${color.name}`}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Back Designs */}
                  {productColor.back_designs && productColor.back_designs.map((backDesign) => {
                    const design = getDesignById(backDesign.design) || {
                      id: backDesign.design,
                      name: backDesign.design_name || `Design ${backDesign.design}`
                    };
                    
                    return (
                      <div key={backDesign.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                          <span className="font-medium text-black">
                            {design.name}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(getImageUrl(backDesign.image), `back-${backDesign.design}.jpg`)}
                              className="text-gray-600 hover:text-black"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => handleUpdateClick(productColor.color, backDesign.design, backDesign, 'back')}
                              className="text-blue-600 hover:text-blue-800"
                              title="Update"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(productColor.color, backDesign.design, 'back')}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="relative w-full h-40 bg-gray-100">
                            <Image
                              src={getImageUrl(backDesign.image)}
                              alt={`Back design for ${color.name}`}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExistingDataPreview;
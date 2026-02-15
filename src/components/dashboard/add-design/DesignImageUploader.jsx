// DesignImageUploader.jsx
import React from "react";
import Image from "next/image";
import { Camera, Trash2, X, AlertCircle } from "lucide-react";
import { getImageUrl } from "@/components/utils/get-image-url";

const DesignImageUploader = ({
  selectedColors,
  selectedDesigns,
  designImages,
  allColors,
  allDesigns,
  isColorReadyForUpload,
  hasExistingImages,
  onFrontImageUpload,
  onBackImageUpload,
  onRemoveFrontImage,
  onRemoveBackImage,
  onClearColorImages,
  onToggleColor,
  colorHasExistingDesigns,
  // Remove onUpdateDesign and onDeleteDesign from props
}) => {
  const getColorById = (colorId) => {
    return allColors.find((color) => color.id === parseInt(colorId));
  };

  const getDesignById = (designId) => {
    return allDesigns.find((design) => design.id === parseInt(designId));
  };

  // Handle front image selection
  const handleFrontImageChange = (colorId, e) => {
    const file = e.target.files[0];
    if (file) {
      onFrontImageUpload(colorId, file);
    }
    e.target.value = ''; // Reset input
  };

  // Handle back image selection
  const handleBackImageChange = (colorId, designId, e) => {
    const file = e.target.files[0];
    if (file) {
      onBackImageUpload(colorId, designId, file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6">
      {selectedColors.map((colorId) => {
        const color = getColorById(colorId);
        const colorData = designImages[colorId] || { front_image: null, back_images: {} };
        const isColorReady = isColorReadyForUpload(colorId);
        const hasExisting = hasExistingImages(colorId);
        const hasExistingDesignsForColor = colorHasExistingDesigns(colorId);

        return (
          <div
            key={colorId}
            className={`bg-white p-6 rounded-md shadow-sm border ${
              isColorReady ? "border-green-500" : "border-gray-200"
            }`}
          >
            {/* Color Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color?.code || "#ccc" }}
                ></div>
                <h3 className="text-lg font-bold text-black">
                  {color?.name || `Color ID: ${colorId}`}
                </h3>
                {hasExistingDesignsForColor && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle size={12} />
                    Has existing designs
                  </span>
                )}
                {isColorReady && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Ready
                  </span>
                )}
                {hasExisting && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Has existing images
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onClearColorImages(colorId)}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                  title="Clear all images for this color"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
                <button
                  onClick={() => onToggleColor(colorId)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Images Grid */}
            <div className="space-y-6">
              {/* Front Image */}
              <div>
                <h4 className="font-medium mb-2 text-sm text-gray-700">Front Image</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {colorData.front_image ? (
                    <div className="relative w-40 h-40 mx-auto">
                      <Image
                        src={colorData.front_image.preview || colorData.front_image.url}
                        alt="Front"
                        fill
                        className="object-cover rounded"
                      />
                      <button
                        onClick={() => onRemoveFrontImage(colorId)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                      {colorData.front_image.isNew && (
                        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                          New
                        </span>
                      )}
                      {colorData.front_image.existing && (
                        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                          Existing
                        </span>
                      )}
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFrontImageChange(colorId, e)}
                      />
                      <div className="flex flex-col items-center justify-center h-40">
                        <Camera size={24} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload front image</span>
                        <span className="text-xs text-gray-400 mt-1">Max 10MB</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Back Images for each selected design */}
              <div>
                <h4 className="font-medium mb-2 text-sm text-gray-700">Back Images (per design)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedDesigns.map((designId) => {
                    const design = getDesignById(designId);
                    const backImage = colorData.back_images?.[designId];

                    return (
                      <div key={designId} className="border rounded-lg p-3">
                        <p className="text-sm font-medium mb-2 truncate" title={design?.name}>
                          {design?.name || `Design ${designId}`}
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                          {backImage ? (
                            <div className="relative w-full aspect-square">
                              <Image
                                src={backImage.preview || backImage.url}
                                alt={design?.name || "Back"}
                                fill
                                className="object-cover rounded"
                              />
                              <button
                                onClick={() => onRemoveBackImage(colorId, designId)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                title="Remove image"
                              >
                                <X size={14} />
                              </button>
                              {backImage.isNew && (
                                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                                  New
                                </span>
                              )}
                              {backImage.existing && (
                                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Existing
                                </span>
                              )}
                            </div>
                          ) : (
                            <label className="block cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleBackImageChange(colorId, designId, e)}
                              />
                              <div className="flex flex-col items-center justify-center aspect-square">
                                <Camera size={20} className="text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500 text-center">
                                  Upload
                                </span>
                              </div>
                            </label>
                          )}
                        </div>
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
  );
};

export default DesignImageUploader;
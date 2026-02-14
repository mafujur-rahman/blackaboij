import React from "react";
import {
  Upload,
  Trash2,
  Camera,
  Image as ImageIcon,
  Plus,
  Edit,
  X,
  Check,
} from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

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
  onUpdateDesign,
  onDeleteDesign,
  setUpdatingDesign,
  updatingDesign,
}) => {
  const getColorById = (colorId) => {
    return allColors.find((color) => color.id === parseInt(colorId));
  };

  const getDesignById = (designId) => {
    return allDesigns.find((design) => design.id === parseInt(designId));
  };

  const handleUpdateClick = (colorId, designId, imageData) => {
    Swal.fire({
      title: "Update Design Image",
      html: `
        <div class="text-left">
          <p class="mb-2">Choose a new image for this design:</p>
          <input type="file" id="update-image" accept="image/*" class="w-full p-2 border rounded" />
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
        return fileInput.files[0];
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const file = result.value;
        if (file.size > 10 * 1024 * 1024) {
          Swal.fire("Error", "Image exceeds 10MB limit", "error");
          return;
        }

        // Create temporary object for preview
        const tempImageData = {
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        };

        setUpdatingDesign({ colorId, designId });
        onUpdateDesign(colorId, designId, tempImageData, "back");
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-black">
        Upload Images for Selected Colors & Designs
      </h2>

      <div className="space-y-8">
        {selectedColors.map((colorId) => {
          const color = getColorById(colorId);
          if (!color) return null;

          const colorData = designImages[colorId] || { front_image: null, back_images: {} };
          const isReady = isColorReadyForUpload(colorId);
          const hasExisting = hasExistingImages(colorId);

          return (
            <div
              key={colorId}
              className={`border rounded-lg p-6 ${
                isReady ? "bg-gray-50 border-gray-300" : "bg-white border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-black"
                    style={{ backgroundColor: color.hex_code || "#cccccc" }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-black">{color.name}</h3>
                      {isReady && (
                        <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
                          Ready
                        </span>
                      )}
                      {hasExisting && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Has Existing
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Required for {selectedDesigns.length} design
                      {selectedDesigns.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleColor(colorId)}
                    className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    <X size={14} />
                    Deselect
                  </button>
                  <button
                    onClick={() => onClearColorImages(colorId)}
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
                    {colorData.front_image?.existing && (
                      <button
                        onClick={() => onDeleteDesign(colorId, null, "front")}
                        className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    )}
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
                          onClick={() => onRemoveFrontImage(color.id)}
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
                              onFrontImageUpload(color.id, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* BACK IMAGES SECTION - ONE PER DESIGN */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-black flex items-center gap-2">
                      <ImageIcon size={16} />
                      Back Images by Design
                    </h4>
                    <span className="text-xs text-gray-600">
                      {selectedDesigns.length} design{selectedDesigns.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>

                  <div className="space-y-4">
                    {selectedDesigns.map((designId) => {
                      const design = getDesignById(designId);
                      if (!design) return null;

                      const backImage = colorData.back_images?.[designId];
                      const hasImage = !!backImage;
                      const isUpdating =
                        updatingDesign?.colorId === color.id && updatingDesign?.designId === designId;

                      return (
                        <div
                          key={designId}
                          className={`border rounded p-3 ${
                            hasImage
                              ? "bg-gray-50 border-gray-300"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p className={`font-medium ${hasImage ? "text-black" : "text-gray-700"}`}>
                                {design.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasImage && backImage.existing && (
                                <>
                                  <button
                                    onClick={() => handleUpdateClick(color.id, designId, backImage)}
                                    disabled={isUpdating}
                                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                                  >
                                    <Edit size={12} />
                                    Update
                                  </button>
                                  <button
                                    onClick={() => onDeleteDesign(color.id, designId, "back")}
                                    className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                                  >
                                    <Trash2 size={12} />
                                    Delete
                                  </button>
                                </>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  hasImage
                                    ? "bg-gray-200 text-black"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {hasImage ? "Image uploaded" : "Required"}
                              </span>
                            </div>
                          </div>

                          {isUpdating && (
                            <div className="mb-2 text-xs text-blue-600 flex items-center gap-1">
                              <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </div>
                          )}

                          {/* SINGLE Image Display */}
                          {hasImage ? (
                            <div className="space-y-3">
                              <div className="border border-gray-300 rounded p-2 bg-white">
                                <div className="relative w-full h-32 mb-1">
                                  {backImage.existing ? (
                                    <Image
                                      src={backImage.url}
                                      alt={`Back image for ${color.name} - ${design.name}`}
                                      fill
                                      className="object-cover rounded"
                                      unoptimized
                                    />
                                  ) : (
                                    <Image
                                      src={backImage.preview}
                                      alt={`Back image preview for ${color.name} - ${design.name}`}
                                      fill
                                      className="object-cover rounded"
                                      unoptimized
                                    />
                                  )}
                                  {!backImage.existing && (
                                    <button
                                      onClick={() => onRemoveBackImage(color.id, design.id)}
                                      className="absolute top-2 right-2 bg-black text-white p-1 rounded-full hover:bg-gray-800"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-black truncate">{backImage.name}</p>
                                {!backImage.existing && (
                                  <p className="text-xs text-gray-500">
                                    {(backImage.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded">
                              <label className="inline-flex items-center gap-1 cursor-pointer text-sm text-black hover:text-gray-800">
                                <Upload size={12} />
                                Upload back image
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      onBackImageUpload(color.id, design.id, e.target.files[0]);
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
  );
};

export default DesignImageUploader;
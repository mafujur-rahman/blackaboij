import React from "react";
import { CheckSquare, Square } from "lucide-react";

const ColorSelector = ({
  allColors,
  selectedColors,
  designImages,
  isColorReadyForUpload,
  toggleColorSelection,
  setSelectedColors,
}) => {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black">Select Colors</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedColors(allColors.map((c) => c.id))}
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
          const hasImages =
            colorImages.front_image ||
            Object.values(colorImages.back_images || {}).some((img) => img);

          return (
            <button
              key={color.id}
              onClick={() => toggleColorSelection(color.id)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                isSelected
                  ? isReady
                    ? "bg-gray-100 border-black ring-2 ring-gray-300"
                    : hasImages
                    ? "bg-gray-50 border-gray-400 ring-1 ring-gray-300"
                    : "bg-white border-black ring-1 ring-gray-200"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              {isSelected ? (
                <CheckSquare size={18} className={isReady ? "text-black" : "text-gray-600"} />
              ) : (
                <Square size={18} className="text-gray-400" />
              )}
              <div
                className="w-7 h-7 rounded-full border border-gray-400"
                style={{ backgroundColor: color.hex_code || "#cccccc" }}
                title={color.hex_code || "No color code"}
              />
              <div className="text-left">
                <p className="font-medium text-sm text-black">{color.name}</p>
              </div>
              {isSelected && isReady && (
                <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded">Ready</span>
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
  );
};

export default ColorSelector;
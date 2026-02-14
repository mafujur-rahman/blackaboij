import React from "react";
import { CheckSquare, Square, Layout } from "lucide-react";

const DesignSelector = ({
  allDesigns,
  selectedDesigns,
  selectedColors,
  designImages,
  toggleDesignSelection,
  selectAllDesigns,
  deselectAllDesigns,
}) => {
  return (
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

          const colorsWithImages = selectedColors.filter((colorId) => {
            const image = designImages[colorId]?.back_images?.[design.id];
            return image;
          }).length;

          return (
            <button
              key={design.id}
              onClick={() => toggleDesignSelection(design.id)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                isSelected
                  ? "bg-gray-100 border-black ring-1 ring-gray-300"
                  : "bg-white border-gray-300 hover:bg-gray-50"
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
  );
};

export default DesignSelector;
"use client";

import React, { useState, useEffect } from "react";
import { Save, X, Check } from "lucide-react";
import api from "@/lib/axios";

const ProductBasicInfo = ({ 
  product, 
  onUpdate, 
  selectedColors,
  onColorSelect,
  onSizeSelect 
}) => {
  const [loading, setLoading] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    description: "",
    unit_price: "",
    quantity: "",
    meta_title: "",
    meta_description: "",
    hot_sale: false,
  });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedProductColors, setSelectedProductColors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch sizes and categories on mount
  useEffect(() => {
    fetchSizes();
    fetchCategories();
  }, []);

  // Set form data when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category_id: product.category?.id || "",
        description: product.description || "",
        unit_price: product.unit_price || "",
        quantity: product.quantity || "",
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
        hot_sale: product.hot_sale || false,
      });

      // Set selected sizes
      if (product.sizes) {
        setSelectedSizes(product.sizes.map(s => s.id));
      }

      // Set selected colors from product
      if (product.colors) {
        setSelectedProductColors(product.colors.map(c => c.id));
      }
    }
  }, [product]);

  // Fetch all sizes
  const fetchSizes = async () => {
    try {
      const response = await api.get("/api/sizes/get-all-sizes/");
      setSizes(response.data.data || []);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories/get-all-categories/");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle size selection
  const handleSizeToggle = (sizeId) => {
    setSelectedSizes(prev => {
      const newSizes = prev.includes(sizeId)
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId];
      
      // Call parent callback
      if (onSizeSelect) {
        onSizeSelect(newSizes);
      }
      
      return newSizes;
    });
  };

  // Handle color selection from parent
  const handleColorToggle = (colorId) => {
    setSelectedProductColors(prev => {
      const newColors = prev.includes(colorId)
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId];
      
      // Call parent callback
      if (onColorSelect) {
        onColorSelect(newColors);
      }
      
      return newColors;
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || !formData.unit_price || !formData.quantity) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData for submission
      const submitData = new FormData();
      
      // Append all basic fields
      submitData.append("name", formData.name);
      submitData.append("category_id", formData.category_id);
      submitData.append("description", formData.description || "");
      submitData.append("unit_price", formData.unit_price);
      submitData.append("quantity", formData.quantity);
      submitData.append("hot_sale", formData.hot_sale ? "True" : "False");
      submitData.append("meta_title", formData.meta_title || "");
      submitData.append("meta_description", formData.meta_description || "");
      
      // Append sizes as individual entries
      if (selectedSizes.length > 0) {
        selectedSizes.forEach(sizeId => {
          submitData.append("size_ids", sizeId.toString());
        });
      }
      
      // Append colors as individual entries
      if (selectedProductColors.length > 0) {
        selectedProductColors.forEach(colorId => {
          submitData.append("color_ids", colorId.toString());
        });
      }
      
      // Call parent update function
      await onUpdate(submitData);
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Reset to original values
    if (product) {
      setFormData({
        name: product.name || "",
        category_id: product.category?.id || "",
        description: product.description || "",
        unit_price: product.unit_price || "",
        quantity: product.quantity || "",
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
        hot_sale: product.hot_sale || false,
      });
      
      if (product.sizes) {
        setSelectedSizes(product.sizes.map(s => s.id));
      }
      
      if (product.colors) {
        setSelectedProductColors(product.colors.map(c => c.id));
      }
    }
    setIsEditing(false);
  };

  // Get color name by ID
  const getColorName = (colorId) => {
    if (!product?.colors) return "";
    const color = product.colors.find(c => c.id === colorId);
    return color ? color.name : "";
  };

  // Get size name by ID
  const getSizeName = (sizeId) => {
    if (!product?.sizes) return "";
    const size = product.sizes.find(s => s.id === sizeId);
    return size ? size.name : "";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-black">Product Basic Information</h2>
          <p className="text-sm text-gray-600">Edit your product details below</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            Edit Information
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium flex items-center gap-2 disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {!isEditing ? (
          /* View Mode */
          <div className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Product Name</label>
                <p className="font-medium text-black">{formData.name}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <p className="font-medium text-black">
                  {product?.category?.name || `ID: ${formData.category_id}`}
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                <p className="font-medium text-black">${formData.unit_price}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                <p className="font-medium text-black">{formData.quantity}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hot Sale</label>
                <p className="font-medium text-black">
                  {formData.hot_sale ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {/* Description */}
            {formData.description && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <p className="text-gray-700">{formData.description}</p>
              </div>
            )}

            {/* Sizes */}
            {selectedSizes.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {selectedSizes.map(sizeId => (
                    <span
                      key={sizeId}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {getSizeName(sizeId) || `Size ${sizeId}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {selectedProductColors.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-2">Colors</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProductColors.map(colorId => {
                    const color = product?.colors?.find(c => c.id === colorId);
                    return (
                      <span
                        key={colorId}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                      >
                        {color?.hex_code && (
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color.hex_code }}
                          />
                        )}
                        {color?.name || `Color ${colorId}`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meta Info */}
            {(formData.meta_title || formData.meta_description) && (
              <div className="border-t pt-4">
                <label className="block text-xs text-gray-500 mb-2">SEO Information</label>
                {formData.meta_title && (
                  <p className="text-sm mb-1"><span className="font-medium">Meta Title:</span> {formData.meta_title}</p>
                )}
                {formData.meta_description && (
                  <p className="text-sm"><span className="font-medium">Meta Description:</span> {formData.meta_description}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.parent_name ? `(${cat.parent_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Product description..."
              />
            </div>

            {/* Sizes Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleSizeToggle(size.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSizes.includes(size.id)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
              <div className="flex flex-wrap gap-2">
                {product?.colors?.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleColorToggle(color.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${selectedProductColors.includes(color.id)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {color.hex_code && (
                      <span 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color.hex_code }}
                      />
                    )}
                    {color.name}
                    {selectedProductColors.includes(color.id) && (
                      <Check size={14} className="ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Hot Sale Checkbox */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hot_sale"
                  checked={formData.hot_sale}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">Hot Sale</span>
              </label>
            </div>

            {/* Meta Information */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">SEO Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="SEO title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <input
                    type="text"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="SEO description"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium flex items-center gap-2 disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductBasicInfo;
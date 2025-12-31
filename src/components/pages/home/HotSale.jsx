"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import ProductCard from "@/components/card/ProductCard";

/* ------------------ UI COMPONENTS ------------------ */
const Loader = () => (
  <div className="flex justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
  </div>
);

const CategoryTab = ({ category, isActive, onClick }) => {
  const formattedName =
    category.name.charAt(0).toUpperCase() +
    category.name.slice(1).toLowerCase();

  return (
    <button
      onClick={onClick}
      className={`pb-1 text-lg md:text-xl transition-colors ${
        isActive
          ? "border-b-2 border-black text-black font-bold"
          : "text-gray-600 hover:text-black"
      }`}
    >
      {formattedName}
    </button>
  );
};

const SeeMoreButton = ({ onClick, isLoading }) => {
  return (
    <div className="flex justify-center md:mt-5">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="px-8 py-3 bg-black text-white font-semibold  "
      >
        {isLoading ? "Loading..." : "See More"}
      </button>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */
const HotSale = () => {
  const PRODUCTS_PER_LOAD = 8;
  const INITIAL_DISPLAY_COUNT = 8;

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [currentDisplayCount, setCurrentDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Check sessionStorage only for client-side navigation
        const isHardReload =
          performance.getEntriesByType("navigation")[0]?.type === "reload";

        if (!isHardReload) {
          const cached = sessionStorage.getItem("hot_sale_products");
          if (cached) {
            const parsed = JSON.parse(cached);
            setAllProducts(parsed.allProducts || []);
            setCategories(parsed.categories || []);
            setActiveCategory(parsed.activeCategory || null);
            setFilteredProducts(parsed.filteredProducts || []);
            setDisplayedProducts(parsed.displayedProducts || []);
            setCurrentDisplayCount(parsed.currentDisplayCount || INITIAL_DISPLAY_COUNT);
            setLoading(false);
            return;
          }
        }

        // Always fetch fresh data on full reload
        const res = await api.get("/api/products/get-hot-sale-products/");
        const products = res.data.data || [];

        // Extract unique parent categories
        const categoryMap = new Map();
        products.forEach((product) => {
          if (product.category?.parent) {
            categoryMap.set(product.category.parent, {
              id: product.category.parent,
              name: product.category.parent_name,
            });
          }
        });

        let parentCategories = Array.from(categoryMap.values());

        // Sort: Men, Women, Accessories first
        const priorityOrder = ["men", "women", "accessories"];
        parentCategories.sort((a, b) => {
          const aIndex = priorityOrder.indexOf(a.name.toLowerCase());
          const bIndex = priorityOrder.indexOf(b.name.toLowerCase());
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });

        const initialCategory = parentCategories[0]?.id || null;
        const initialFiltered = initialCategory
          ? products.filter((p) => p.category?.parent === initialCategory)
          : products;

        const initialDisplayed = initialFiltered.slice(0, INITIAL_DISPLAY_COUNT);

        setAllProducts(products);
        setCategories(parentCategories);
        setActiveCategory(initialCategory);
        setFilteredProducts(initialFiltered);
        setDisplayedProducts(initialDisplayed);
        setCurrentDisplayCount(INITIAL_DISPLAY_COUNT);

        // Cache for client-side navigation
        sessionStorage.setItem(
          "hot_sale_products",
          JSON.stringify({
            allProducts: products,
            categories: parentCategories,
            activeCategory: initialCategory,
            filteredProducts: initialFiltered,
            displayedProducts: initialDisplayed,
            currentDisplayCount: INITIAL_DISPLAY_COUNT,
          })
        );
      } catch (error) {
        console.error("Failed to fetch hot sale products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* -------- FILTER PRODUCTS BY CATEGORY -------- */
  useEffect(() => {
    if (!activeCategory) return;

    const filtered = allProducts.filter(
      (product) => product.category?.parent === activeCategory
    );
    
    setFilteredProducts(filtered);
    setCurrentDisplayCount(INITIAL_DISPLAY_COUNT);
    
    // Update displayed products
    const newDisplayed = filtered.slice(0, INITIAL_DISPLAY_COUNT);
    setDisplayedProducts(newDisplayed);
    
    // Update cache
    const cached = sessionStorage.getItem("hot_sale_products");
    if (cached) {
      const parsed = JSON.parse(cached);
      sessionStorage.setItem(
        "hot_sale_products",
        JSON.stringify({
          ...parsed,
          activeCategory,
          filteredProducts: filtered,
          displayedProducts: newDisplayed,
          currentDisplayCount: INITIAL_DISPLAY_COUNT,
        })
      );
    }
  }, [activeCategory, allProducts]);

  /* -------- HANDLE SEE MORE CLICK -------- */
  const handleSeeMoreClick = () => {
    setLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const newDisplayCount = currentDisplayCount + PRODUCTS_PER_LOAD;
      const newDisplayedProducts = filteredProducts.slice(0, newDisplayCount);
      
      setCurrentDisplayCount(newDisplayCount);
      setDisplayedProducts(newDisplayedProducts);
      setLoadingMore(false);
      
      // Update cache
      const cached = sessionStorage.getItem("hot_sale_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        sessionStorage.setItem(
          "hot_sale_products",
          JSON.stringify({
            ...parsed,
            displayedProducts: newDisplayedProducts,
            currentDisplayCount: newDisplayCount,
          })
        );
      }
    }, 500); // 500ms delay for loading effect
  };

  /* -------- CHECK IF MORE PRODUCTS ARE AVAILABLE -------- */
  const hasMoreProducts = displayedProducts.length < filteredProducts.length;
  
  // Check if we can show exactly 8 more products
  const canShowNext8 = filteredProducts.length - displayedProducts.length >= PRODUCTS_PER_LOAD;
  
  // Determine how many products would be loaded next
  const nextLoadCount = Math.min(
    PRODUCTS_PER_LOAD,
    filteredProducts.length - displayedProducts.length
  );

  return (
    <div className="mt-12.5 mb-12.5 xl:mb-25">
      <div className="px-4 lg:px-12">
        <h1 className="text-center text-3xl font-bold text-black">Hot Sale</h1>

        {/* CATEGORY TABS */}
        <nav className="mt-8">
          <div className="flex justify-center flex-wrap gap-6">
            {categories.map((category) => (
              <CategoryTab
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </nav>

        {/* PRODUCTS */}
        {loading ? (
          <Loader />
        ) : displayedProducts.length === 0 ? (
          <p className="text-center mt-12 text-gray-500">No products found</p>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* SEE MORE BUTTON - Only show if there are more products */}
            {hasMoreProducts && (
              <SeeMoreButton
                onClick={handleSeeMoreClick}
                isLoading={loadingMore}
              />
            )}

           
          </>
        )}
      </div>
    </div>
  );
};

export default HotSale;
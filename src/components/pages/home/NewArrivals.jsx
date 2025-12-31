"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import ProductCard from "@/components/card/ProductCard";
import { useRouter } from "next/navigation";

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

const SeeMoreButton = ({ categoryName, onClick }) => {
  return (
    <div className="flex justify-center items-center md:mt-5 mb-12.5 ">
      <button
        onClick={onClick}
        className="px-8 py-3 bg-black text-white font-semibold  cursor-pointer"
      >
        See More {categoryName}
      </button>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */
const NewArrivals = () => {
  const MAX_PRODUCTS = 8;
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------- FETCH PRODUCTS WITH CACHING -------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Detect full page reload
        const isHardReload =
          performance.getEntriesByType("navigation")[0]?.type === "reload";

        if (!isHardReload) {
          // Use cached data for client-side navigation
          const cached = sessionStorage.getItem("new_arrivals_products");
          if (cached) {
            const parsed = JSON.parse(cached);
            setAllProducts(parsed.allProducts || []);
            setCategories(parsed.categories || []);
            setActiveCategory(parsed.activeCategory || null);
            setActiveCategoryName(parsed.activeCategoryName || "");
            setFilteredProducts(parsed.filteredProducts || []);
            setDisplayedProducts(parsed.displayedProducts || []);
            setLoading(false);
            return;
          }
        }

        const res = await api.get("/api/products/get-all-products/");
        let products = res.data.data || [];

        // Sort products by created_at descending (latest first)
        products.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

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
        const initialCategoryName = parentCategories[0]?.name || "";

        const initialFiltered = initialCategory
          ? products
              .filter((p) => p.category?.parent === initialCategory)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : products;

        const initialDisplayed = initialFiltered.slice(0, MAX_PRODUCTS);

        setAllProducts(products);
        setCategories(parentCategories);
        setActiveCategory(initialCategory);
        setActiveCategoryName(initialCategoryName);
        setFilteredProducts(initialFiltered);
        setDisplayedProducts(initialDisplayed);

        // Save to sessionStorage for client-side navigation
        sessionStorage.setItem(
          "new_arrivals_products",
          JSON.stringify({
            allProducts: products,
            categories: parentCategories,
            activeCategory: initialCategory,
            activeCategoryName: initialCategoryName,
            filteredProducts: initialFiltered,
            displayedProducts: initialDisplayed,
          })
        );
      } catch (error) {
        console.error("Failed to fetch products", error);
        setDisplayedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* -------- FILTER PRODUCTS BY CATEGORY -------- */
  useEffect(() => {
    if (!activeCategory) {
      // If no active category, show empty arrays
      setFilteredProducts([]);
      setDisplayedProducts([]);
      return;
    }

    const filtered = allProducts
      .filter((product) => product.category?.parent === activeCategory)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredProducts(filtered);
    setDisplayedProducts(filtered.slice(0, MAX_PRODUCTS));

    // Update active category name
    const currentCategory = categories.find((cat) => cat.id === activeCategory);
    if (currentCategory) {
      setActiveCategoryName(currentCategory.name);
    }
  }, [activeCategory, allProducts, categories]);

  /* -------- HANDLE SEE MORE NAVIGATION -------- */
  const handleSeeMoreClick = () => {
    // Generate navigation path based on active category
    let categoryPath = "";
    
    switch (activeCategoryName.toLowerCase()) {
      case "men":
        categoryPath = "/men/men-collection";
        break;
      case "women":
        categoryPath = "/women/women-collection";
        break;
      case "accessories":
        categoryPath = "/accessories";
        break;
      default:
        // For other categories, create a slug from the category name
        categoryPath = `/products/${activeCategoryName.toLowerCase().replace(/\s+/g, "-")}`;
    }
    
    router.push(categoryPath);
  };

  return (
    <div className="mt-12 mb-12">
      <div className="px-4 lg:px-12">
        <h1 className="text-center text-3xl font-bold text-black">
          New Arrivals
        </h1>

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
            {/* All 8 products in one grid */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* See More Button below all products */}
            <SeeMoreButton
              categoryName={activeCategoryName}
              onClick={handleSeeMoreClick}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
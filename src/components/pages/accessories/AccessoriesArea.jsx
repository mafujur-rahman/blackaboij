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
    category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase();

  return (
    <button
      onClick={onClick}
      className={`pb-1 text-lg md:text-xl transition-colors ${isActive
          ? "border-b-2 border-black text-black font-bold"
          : "text-gray-600 hover:text-black"
        }`}
    >
      {formattedName}
    </button>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */
const AccessoriesArea = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // safe default
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Detect hard reload
        const isHardReload =
          performance.getEntriesByType("navigation")[0]?.type === "reload";

        // Use cache only for client-side navigation
        if (!isHardReload) {
          const cached = sessionStorage.getItem("accessories_products");
          if (cached) {
            const parsed = JSON.parse(cached);
            setAllProducts(parsed.allProducts || []);
            setCategories(parsed.categories || []);
            setActiveCategory(parsed.activeCategory || null);
            setFilteredProducts(parsed.filteredProducts || []);
            setLoading(false);
            return;
          }
        }

        const res = await api.get("/api/products/get-all-products/");
        const products = res.data.data || [];

        // Filter accessories products
        const accessoriesProducts = products.filter(
          (p) => p.category?.parent_name?.toLowerCase() === "accessories"
        );

        // Get unique categories inside accessories
        const categoryMap = new Map();
        accessoriesProducts.forEach((p) => {
          if (p.category?.id) {
            categoryMap.set(p.category.id, {
              id: p.category.id,
              name: p.category.name || p.category.parent_name,
            });
          }
        });

        const parentCategories = Array.from(categoryMap.values());
        const initialCategory = parentCategories[0]?.id || null;

        const initialFiltered = initialCategory
          ? accessoriesProducts.filter((p) => p.category?.id === initialCategory)
          : accessoriesProducts;

        setAllProducts(accessoriesProducts);
        setCategories(parentCategories);
        setActiveCategory(initialCategory);
        setFilteredProducts(initialFiltered);

        // Cache for client-side navigation
        sessionStorage.setItem(
          "accessories_products",
          JSON.stringify({
            allProducts: accessoriesProducts,
            categories: parentCategories,
            activeCategory: initialCategory,
            filteredProducts: initialFiltered,
          })
        );
      } catch (error) {
        console.error("Failed to fetch accessories products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  // Filter products by active category
  useEffect(() => {
    if (!activeCategory) return;
    const filtered = allProducts.filter(
      (p) => p.category?.id === activeCategory
    );
    setFilteredProducts(filtered || []);
    setCurrentPage(1);
  }, [activeCategory, allProducts]);

  // safe fallback if filteredProducts is undefined
  const safeFiltered = filteredProducts || [];
  const totalPages = Math.ceil(safeFiltered.length / itemsPerPage);
  const displayedProducts = safeFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="my-12.5">
      <div className="px-4 lg:px-12">
        <h1 className="text-center text-3xl font-bold text-black">
          Accessories
        </h1>

        {/* CATEGORY TABS */}
        <nav className="mt-8 flex justify-center flex-wrap gap-6">
          {categories.map((category) => (
            <CategoryTab
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
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

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded ${currentPage === i + 1
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AccessoriesArea;

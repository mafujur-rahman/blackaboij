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

/* ------------------ MAIN COMPONENT ------------------ */
const NewArrivals = () => {
  const PRODUCTS_PER_PAGE = 8;

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  /* -------- FETCH PRODUCTS WITH CACHING -------- */
  useEffect(() => {
    const fetchProducts = async () => {
      // Check sessionStorage cache
      const cached = sessionStorage.getItem("new_arrivals_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        setAllProducts(parsed.allProducts);
        setCategories(parsed.categories);
        setActiveCategory(parsed.activeCategory);
        setFilteredProducts(parsed.filteredProducts);
        setLoading(false);
        return; // stop, use cached data
      }

      try {
        setLoading(true);
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

        const initialFiltered = initialCategory
          ? products
              .filter((p) => p.category?.parent === initialCategory)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : products;

        setAllProducts(products);
        setCategories(parentCategories);
        setActiveCategory(initialCategory);
        setFilteredProducts(initialFiltered);

        // Save to sessionStorage for future navigation
        sessionStorage.setItem(
          "new_arrivals_products",
          JSON.stringify({
            allProducts: products,
            categories: parentCategories,
            activeCategory: initialCategory,
            filteredProducts: initialFiltered,
          })
        );
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* -------- FILTER PRODUCTS BY CATEGORY -------- */
  useEffect(() => {
    if (!activeCategory) return;

    const filtered = allProducts
      .filter((product) => product.category?.parent === activeCategory)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [activeCategory, allProducts]);

  /* -------- PAGINATION -------- */
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

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
        ) : paginatedProducts.length === 0 ? (
          <p className="text-center mt-12 text-gray-500">
            No products found
          </p>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 border disabled:opacity-50"
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 border ${
                      currentPage === i + 1 ? "bg-black text-white" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;

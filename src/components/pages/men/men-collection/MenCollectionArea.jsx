"use client";

import React, { useEffect, useState } from "react";

import api from "@/lib/axios";
import ProductCard from "@/components/card/ProductCard";

const organizeProductsByType = (products) => {
  const tees = [];
  const hats = [];
  const pants = [];
  const others = [];

  // Helper: get all category names for a product (multi-category aware)
  const getCategoryNames = (product) => {
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories.map((c) => c?.name?.toLowerCase() || "");
    }
    return product.category?.name
      ? [product.category.name.toLowerCase()]
      : [];
  };

  products.forEach((product) => {
    const names = getCategoryNames(product);

    const matches = (keywords) =>
      names.some((name) => keywords.some((kw) => name.includes(kw)));

    if (
      matches(["tee", "t-shirt", "tshirt", "t shirt"]) ||
      names.includes("tees")
    ) {
      tees.push(product);
    } else if (matches(["hat", "cap"])) {
      hats.push(product);
    } else if (matches(["pant", "jeans", "trouser"])) {
      pants.push(product);
    } else {
      others.push(product);
    }
  });

  const sortByDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);

  tees.sort(sortByDate);
  hats.sort(sortByDate);
  pants.sort(sortByDate);
  others.sort(sortByDate);

  return [...tees, ...hats, ...pants, ...others];
};

const isInMenBranch = (product) => {
  const allCategories = [];

  if (Array.isArray(product.categories) && product.categories.length > 0) {
    allCategories.push(...product.categories);
  }
  if (product.category) {
    allCategories.push(product.category);
  }

  return allCategories.some((cat) => {
    if (!cat) return false;
    // `parent_name` is the top-level category name (e.g. "Men", "Women")
    const parentName = cat.parent_name?.toLowerCase?.() || "";
    if (parentName === "men") return true;

    // Fallback: category name itself is "Men" (top-level assignment)
    const catName = cat.name?.toLowerCase?.() || "";
    if (catName === "men") return true;

    return false;
  });
};

/* ------------------ MAIN COMPONENT ------------------ */
const MenCollectionArea = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const isHardReload =
          performance.getEntriesByType("navigation")[0]?.type === "reload";

        if (!isHardReload) {
          const cached = sessionStorage.getItem("men_products");
          if (cached) {
            setProducts(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }

        // ---------------------------------------------------------------
        // OPTION A (client-side multi-category filter) — CURRENT APPROACH
        // ---------------------------------------------------------------
        const res = await api.get("/api/products/get-all-products/");

        let menProducts = (res.data.data || [])
          .filter(isInMenBranch)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 20);

        menProducts = organizeProductsByType(menProducts);

        setProducts(menProducts);
        sessionStorage.setItem("men_products", JSON.stringify(menProducts));

      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="my-12.5">
      <div className="px-4 lg:px-12 xl:px-24 2xl:px-48">
        <>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
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
      </div>
    </div>
  );
};

export default MenCollectionArea;
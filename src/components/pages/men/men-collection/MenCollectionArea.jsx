"use client";

import React, { useEffect, useState } from "react";

import api from "@/lib/axios";
import ProductCard from "@/components/card/ProductCard";

/* ------------------------------------------------------------------
   PRIORITY ORDER (matched against product.meta_title)
   First match wins — order = display order
------------------------------------------------------------------ */
const PRIORITY_KEYWORDS = [
  
  "crowned b",
  "classic b",
  "texture b",
  "crown a",
  "blackaboij straight",
  "blackaboij curve",
  "smiley",
  "emoji",
  "ape",
  "distressed",
  "sleeveless",
  "tank top",
  "tanktop",
  "short",
  "cap",
];

/* Extract lowercase meta_title (handles a few possible key variants) */
const getMetaTitle = (product) => {
  const raw =
    product?.meta_title ??
    product?.metaTitle ??
    product?.meta_data?.meta_title ??
    product?.metaData?.meta_title ??
    "";
  return String(raw).toLowerCase().trim();
};

/* Return the priority index for a product (lower = shown first).
   Products with no match go to the end. */
const getPriorityIndex = (product) => {
  const title = getMetaTitle(product);
  if (!title) return PRIORITY_KEYWORDS.length;

  for (let i = 0; i < PRIORITY_KEYWORDS.length; i++) {
    if (title.includes(PRIORITY_KEYWORDS[i])) return i;
  }
  return PRIORITY_KEYWORDS.length; // unmatched → end
};

/* Sort products by priority, then by newest within same priority */
const sortByPriority = (products) => {
  return [...products].sort((a, b) => {
    const pa = getPriorityIndex(a);
    const pb = getPriorityIndex(b);
    if (pa !== pb) return pa - pb;
    // same priority → newest first
    return new Date(b.created_at) - new Date(a.created_at);
  });
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
    const parentName = cat.parent_name?.toLowerCase?.() || "";
    if (parentName === "men") return true;

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

        const res = await api.get("/api/products/get-all-products/");

        // 1. Filter to Men's products only
        const menProducts = (res.data.data || []).filter(isInMenBranch);

        // 2. Sort by meta_title priority
        const sorted = sortByPriority(menProducts);

        setProducts(sorted);
        sessionStorage.setItem("men_products", JSON.stringify(sorted));

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
      </div>
    </div>
  );
};

export default MenCollectionArea;
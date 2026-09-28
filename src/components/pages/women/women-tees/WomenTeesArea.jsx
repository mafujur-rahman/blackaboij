"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import ProductCard from "@/components/card/ProductCard";
import api from "@/lib/axios";
import { matchesProductCategory } from "@/components/utils/productCategory";

/* ------------------------------------------------------------------
   PRIORITY ORDER (matched against product.meta_title)
   For Tees subcategory — only up to "sleeveless"
------------------------------------------------------------------ */
const PRIORITY_KEYWORDS = [
  "crown a",
  "crowned b",
  "classic b",
  "texture b",
  "blackaboij straight",
  "blackaboij curve",
  "smiley",
  "emoji",
  "ape",
  "distressed",
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

/* ------------------ MAIN COMPONENT ------------------ */
const WomenTeesArea = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------ FETCH PRODUCTS ------------------ */
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Detect hard reload
      const isHardReload =
        performance.getEntriesByType("navigation")[0]?.type === "reload";

      // Use cache only for client-side navigation
      if (!isHardReload) {
        const cached = sessionStorage.getItem("women_tees_products_v3");
        if (cached) {
          setProducts(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      const res = await api.get(
        "/api/products/get-all-products/"
      );

      if (res.data?.success) {
        const womenTees = res.data.data.filter((product) =>
          matchesProductCategory(product, "women", ["tees", "tee"])
        );

        // Apply priority sorting
        const sorted = sortByPriority(womenTees);

        setProducts(sorted);

        // Cache for client-side navigation
        sessionStorage.setItem(
          "women_tees_products_v3",
          JSON.stringify(sorted)
        );
      } else {
        console.warn("API did not return success:", res.data);
      }
    } catch (error) {
      console.error("API fetch error:", error);
      Swal.fire("Error", "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);

  /* ------------------ INLINE LOADER ------------------ */
  const Loader = () => (
    <div className="flex justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
    </div>
  );

  return (
    <div className="my-12.5">
      <div className="px-4 lg:px-12 xl:px-24 2xl:px-48">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center col-span-full">No products found</p>
        )}
      </div>
    </div>
  );
};

export default WomenTeesArea;
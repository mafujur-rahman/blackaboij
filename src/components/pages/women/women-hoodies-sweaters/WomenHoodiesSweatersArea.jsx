"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import ProductCard from "@/components/card/ProductCard";

/* ------------------ MAIN COMPONENT ------------------ */
const WomenHoodiesSweatersArea = () => {
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
      const cached = sessionStorage.getItem("women_hoodies_products");
      if (cached) {
        setProducts(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }

    const res = await api.get("/api/products/get-all-products/");
    const womenHoodies = res.data.data.filter(
      (p) =>
        p.category?.parent_name?.toLowerCase() === "women" &&
        p.category?.name?.toLowerCase() === "hoodies & sweaters"
    );

    setProducts(womenHoodies);

    // Cache for client-side navigation
    sessionStorage.setItem(
      "women_hoodies_products",
      JSON.stringify(womenHoodies)
    );
  } catch (error) {
    console.error("API fetch error:", error);
    Swal.fire("Error", "Failed to load products", "error");
  } finally {
    setLoading(false);
  }
};


  React.useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="my-12.5">
      <div className="px-4 lg:px-12">
        {loading ? (
          <div className="flex justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
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

export default WomenHoodiesSweatersArea;

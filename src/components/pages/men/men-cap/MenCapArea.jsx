"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import ProductCard from "@/components/card/ProductCard";
import api from "@/lib/axios";


const MenCapArea = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ------------------ FETCH PRODUCTS ------------------ */
    const fetchProducts = async () => {
  try {
    setLoading(true);

    // Detect full page reload
    const isHardReload =
      performance.getEntriesByType("navigation")[0]?.type === "reload";

    // Use cache only for client-side navigation
    if (!isHardReload) {
      const cached = sessionStorage.getItem("men_cap_products");
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
      const menCap = res.data.data.filter(
        (p) =>
          p.category?.parent_name?.toLowerCase() === "men" &&
          p.category?.name?.toLowerCase() === "cap"
      );

      setProducts(menCap);

      // Cache for client-side navigation
      sessionStorage.setItem(
        "men_cap_products",
        JSON.stringify(menCap)
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

    return (
        <div className="my-12.5">
            <div className="px-4 lg:px-12">
                {loading ? (
                    <div className="flex justify-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
                    </div>
                ) : products.length > 0 ? (
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

export default MenCapArea;

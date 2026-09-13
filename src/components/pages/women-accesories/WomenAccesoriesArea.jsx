"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/card/ProductCard";
import { matchesProductCategory } from "@/components/utils/productCategory";
import api from "@/lib/axios";

const WomenAccesoriesArea = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const isHardReload =
          performance.getEntriesByType("navigation")[0]?.type === "reload";
        const cached = !isHardReload && sessionStorage.getItem("women_accessories_products");

        if (cached) {
          setProducts(JSON.parse(cached));
          return;
        }

        const response = await api.get("/api/products/get-all-products/");
        const accessories = (response.data?.data || []).filter((product) =>
          matchesProductCategory(product, "women", ["accessories", "accessory"])
        );

        setProducts(accessories);
        sessionStorage.setItem("women_accessories_products", JSON.stringify(accessories));
      } catch (error) {
        console.error("Failed to load women's accessories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="my-12.5">
      <div className="px-4 lg:px-12 xl:px-24 2xl:px-48">
        {loading ? (
          <div className="flex min-h-[30vh] justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent" /></div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : <p className="text-center">No products found</p>}
      </div>
    </div>
  );
};

export default WomenAccesoriesArea;

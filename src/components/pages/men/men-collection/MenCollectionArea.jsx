"use client";

import React, { useEffect, useState } from "react";

import api from "@/lib/axios";
import ProductCard from "@/components/card/ProductCard";

/* -------- FUNCTION TO ORGANIZE PRODUCTS BY TYPE -------- */
const organizeProductsByType = (products) => {
  // Separate products by type
  const tees = [];
  const hats = [];
  const pants = [];
  const others = [];

  products.forEach((product) => {
    const subcategoryName = product.category?.name?.toLowerCase() || "";
    
    // Categorize based on subcategory name
    if (subcategoryName.includes('tee') || 
        subcategoryName.includes('t-shirt') || 
        subcategoryName.includes('tshirt') || 
        subcategoryName.includes('t shirt') ||
        subcategoryName === 'tees') {
      tees.push(product);
    } else if (subcategoryName.includes('hat') || 
               subcategoryName.includes('cap')) {
      hats.push(product);
    } else if (subcategoryName.includes('pant') || 
               subcategoryName.includes('pants') || 
               subcategoryName.includes('jeans') || 
               subcategoryName.includes('trouser')) {
      pants.push(product);
    } else {
      others.push(product);
    }
  });

  // Sort each category by date (latest first)
  const sortByDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);
  
  tees.sort(sortByDate);
  hats.sort(sortByDate);
  pants.sort(sortByDate);
  others.sort(sortByDate);

  // Combine in desired order: Tees -> Hats -> Pants -> Others
  return [...tees, ...hats, ...pants, ...others];
};

/* ------------------ MAIN COMPONENT ------------------ */
const MenCollectionArea = () => {
  const [products, setProducts] = useState([]);
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

      // Use cache only on client-side navigation
      if (!isHardReload) {
        const cached = sessionStorage.getItem("men_products");
        if (cached) {
          setProducts(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      const res = await api.get("/api/products/get-all-products/");
      let menProducts = res.data.data
        .filter((p) => p.category?.parent_name?.toLowerCase() === "men")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);

      // Organize products by type (Tees first, then Hats, then Pants)
      menProducts = organizeProductsByType(menProducts);

      setProducts(menProducts);

      // Cache for client-side navigation
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
      <div className="px-4 lg:px-12">
        {loading ? (
          <div className="flex justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default MenCollectionArea;
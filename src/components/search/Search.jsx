"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import api from "@/lib/axios";
import ProductCard from "../card/ProductCard";


/* ------------------ SEARCH CONTENT (uses useSearchParams) ------------------ */
function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/products/get-all-products/");
                const allProducts = res.data?.data || [];

                const filteredProducts = allProducts.filter((product) =>
                    product.name.toLowerCase().includes(query.toLowerCase())
                );

                setProducts(filteredProducts);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    return (
        <div className="px-4 lg:px-12 xl:px-24 2xl:px-48 py-12.5">
            <h1 className="text-2xl font-semibold mb-6">
                Search results for:{" "}
                <span className="italic text-gray-600">{query}</span>
            </h1>

            {loading ? (
                <div className="flex justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-black"></div>
                </div>
            ) : products.length === 0 ? (
                <p className="text-gray-500">No products found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------ MAIN SEARCH PAGE ------------------ */
export default function SearchHome() {
    return (
        <Suspense
            fallback={
                <div className="px-4 lg:px-12 xl:px-24 2xl:px-48 py-12.5">
                    <div className="flex justify-center min-h-[50vh] items-center">
                        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-black"></div>
                    </div>
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}
